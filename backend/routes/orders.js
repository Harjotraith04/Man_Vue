const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Create new order
router.post('/', [
  auth,
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.product').isMongoId().withMessage('Valid product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.size').notEmpty().withMessage('Size is required'),
  body('items.*.color').notEmpty().withMessage('Color is required'),
  body('shippingAddress.name').notEmpty().withMessage('Shipping name is required'),
  body('shippingAddress.phone').notEmpty().withMessage('Shipping phone is required'),
  body('shippingAddress.email').isEmail().withMessage('Valid shipping email is required'),
  body('shippingAddress.street').notEmpty().withMessage('Shipping street is required'),
  body('shippingAddress.city').notEmpty().withMessage('Shipping city is required'),
  body('shippingAddress.state').notEmpty().withMessage('Shipping state is required'),
  body('shippingAddress.zipCode').notEmpty().withMessage('Shipping zip code is required'),
  body('payment.method').isIn(['card', 'upi', 'netbanking', 'wallet', 'cod', 'emi']).withMessage('Invalid payment method')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      items,
      shippingAddress,
      billingAddress = shippingAddress,
      payment,
      shipping = { method: 'standard', cost: 0 },
      coupon = {},
      gift = { isGift: false }
    } = req.body;

    // Validate and prepare order items
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.product} not found or inactive`
        });
      }

      if (!product.isInStock(item.color, item.size)) {
        return res.status(400).json({
          success: false,
          message: `Product "${product.title}" in ${item.color}/${item.size} is out of stock`
        });
      }

      const unitPrice = product.getPrice(item.color, item.size);
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      // Get primary image for the color variant
      const variant = product.variants.find(v => v.color === item.color);
      const primaryImage = variant?.images.find(img => img.isPrimary)?.url || 
                          variant?.images[0]?.url || 
                          product.primaryImage;

      orderItems.push({
        product: product._id,
        title: product.title,
        image: primaryImage,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: unitPrice,
        totalPrice
      });
    }

    // Calculate pricing
    let discount = 0;
    if (coupon.code && coupon.discount) {
      if (coupon.type === 'percentage') {
        discount = (subtotal * coupon.discount) / 100;
      } else {
        discount = coupon.discount;
      }
    }

    const tax = (subtotal - discount) * 0.18; // 18% GST
    const shippingCost = shipping.cost || (subtotal > 1000 ? 0 : 99);
    const giftWrapCost = gift.isGift ? (gift.wrapCost || 50) : 0;
    const total = subtotal - discount + tax + shippingCost + giftWrapCost;

    // Create order
    const order = new Order({
      user: req.user.id,
      items: orderItems,
      pricing: {
        subtotal,
        discount,
        tax,
        shipping: shippingCost,
        total
      },
      shippingAddress,
      billingAddress,
      payment: {
        method: payment.method,
        status: payment.method === 'cod' ? 'pending' : 'processing',
        amountPaid: payment.method === 'cod' ? 0 : 0, // Will be updated after payment
        currency: 'INR'
      },
      shipping: {
        method: shipping.method,
        provider: shipping.provider || 'bluedart',
        cost: shippingCost
      },
      coupon,
      gift: {
        ...gift,
        wrapCost: giftWrapCost
      }
    });

    // Calculate estimated delivery
    order.calculateEstimatedDelivery();

    // Add initial tracking
    order.addTracking('order_placed', 'Order has been placed successfully');

    await order.save();

    // Update product stock and sales count
    for (const item of items) {
      const product = await Product.findById(item.product);
      const variant = product.variants.find(v => v.color === item.color);
      const sizeInfo = variant.sizes.find(s => s.size === item.size);
      
      if (sizeInfo) {
        sizeInfo.stock -= item.quantity;
        product.soldCount += item.quantity;
      }
      
      await product.save();
    }

    // Clear user's cart
    await req.user.clearCart();

    // Add order to user's order history
    req.user.orderHistory.push(order._id);
    await req.user.save();

    // Populate order details for response
    await order.populate('items.product', 'title slug');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get single order
router.get('/:orderNumber', auth, async (req, res) => {
  try {
    const query = { orderNumber: req.params.orderNumber };
    
    // Non-admin users can only see their own orders
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    }

    const order = await Order.findOne(query)
      .populate('items.product', 'title slug primaryImage')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: { order }
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update order status (admin only)
router.put('/:orderNumber/status', [
  adminAuth,
  body('status').isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded'])
    .withMessage('Invalid status'),
  body('trackingNumber').optional().isString(),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status, trackingNumber, notes } = req.body;
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update tracking number if provided
    if (trackingNumber) {
      order.shipping.trackingNumber = trackingNumber;
    }

    // Add admin notes if provided
    if (notes) {
      order.notes.admin = notes;
    }

    // Add tracking update with appropriate message
    const statusMessages = {
      confirmed: 'Order has been confirmed and is being prepared',
      processing: 'Order is being processed',
      shipped: `Order has been shipped${trackingNumber ? ` with tracking number ${trackingNumber}` : ''}`,
      delivered: 'Order has been delivered successfully',
      cancelled: 'Order has been cancelled',
      returned: 'Order has been returned',
      refunded: 'Order has been refunded'
    };

    await order.addTracking(status, statusMessages[status] || `Order status updated to ${status}`);

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Cancel order
router.put('/:orderNumber/cancel', auth, async (req, res) => {
  try {
    const query = { orderNumber: req.params.orderNumber };
    
    // Non-admin users can only cancel their own orders
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    }

    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (!order.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    // Restore product stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        const variant = product.variants.find(v => v.color === item.color);
        const sizeInfo = variant?.sizes.find(s => s.size === item.size);
        
        if (sizeInfo) {
          sizeInfo.stock += item.quantity;
          product.soldCount -= item.quantity;
        }
        
        await product.save();
      }
    }

    await order.addTracking('cancelled', req.body.reason || 'Order cancelled by user');

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Request return
router.put('/:orderNumber/return', [
  auth,
  body('reason').notEmpty().withMessage('Return reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { reason } = req.body;
    const order = await Order.findOne({ 
      orderNumber: req.params.orderNumber,
      user: req.user.id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (!order.canBeReturned()) {
      return res.status(400).json({
        success: false,
        message: 'Order is not eligible for return'
      });
    }

    order.returns.returnReason = reason;
    order.returns.returnStatus = 'requested';
    order.returns.returnRequestedAt = new Date();

    await order.save();

    res.json({
      success: true,
      message: 'Return request submitted successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Return request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get order statistics (admin only)
router.get('/stats/overview', adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const stats = await Order.getOrderStats(start, end);

    res.json({
      success: true,
      data: { stats: stats[0] || {} }
    });

  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all orders (admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      startDate,
      endDate,
      search
    } = req.query;

    const query = {};
    
    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { orderNumber: new RegExp(search, 'i') },
        { 'shippingAddress.name': new RegExp(search, 'i') },
        { 'shippingAddress.email': new RegExp(search, 'i') }
      ];
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalOrders: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
