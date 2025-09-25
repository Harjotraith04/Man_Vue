const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user's wishlist
router.get('/wishlist', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'wishlist',
        match: { isActive: true },
        select: 'title slug price.selling discount primaryImage rating.average category brand.name'
      });

    res.json({
      success: true,
      data: {
        wishlist: user.wishlist
      }
    });

  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user's cart
router.get('/cart', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'cart.product',
        match: { isActive: true },
        select: 'title slug price.selling discount variants primaryImage'
      });

    // Filter out inactive products
    user.cart = user.cart.filter(item => item.product);

    // Calculate cart totals
    let subtotal = 0;
    const cartItems = user.cart.map(item => {
      const itemPrice = item.product.getPrice(item.color, item.size);
      const itemTotal = itemPrice * item.quantity;
      subtotal += itemTotal;

      return {
        ...item.toObject(),
        unitPrice: itemPrice,
        totalPrice: itemTotal
      };
    });

    const tax = subtotal * 0.18; // 18% GST
    const shipping = subtotal > 50 ? 0 : 5; // Free shipping above £50
    const total = subtotal + tax + shipping;

    res.json({
      success: true,
      data: {
        items: cartItems,
        summary: {
          subtotal,
          tax,
          shipping,
          total,
          itemCount: cartItems.length,
          totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0)
        }
      }
    });

  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add item to cart
router.post('/cart', [
  auth,
  body('productId').isMongoId().withMessage('Valid product ID is required'),
  body('quantity').isInt({ min: 1, max: 10 }).withMessage('Quantity must be between 1 and 10'),
  body('size').notEmpty().withMessage('Size is required'),
  body('color').notEmpty().withMessage('Color is required')
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

    const { productId, quantity, size, color } = req.body;

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if product variant is available
    if (!product.isInStock(color, size)) {
      return res.status(400).json({
        success: false,
        message: 'Product variant is out of stock'
      });
    }

    // Add to cart
    await req.user.addToCart(productId, quantity, size, color);

    res.json({
      success: true,
      message: 'Item added to cart successfully'
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update cart item quantity
router.put('/cart/:productId', [
  auth,
  body('quantity').isInt({ min: 0, max: 10 }).withMessage('Quantity must be between 0 and 10'),
  body('size').notEmpty().withMessage('Size is required'),
  body('color').notEmpty().withMessage('Color is required')
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

    const { productId } = req.params;
    const { quantity, size, color } = req.body;

    const user = req.user;
    const cartItemIndex = user.cart.findIndex(item => 
      item.product.toString() === productId && 
      item.size === size && 
      item.color === color
    );

    if (cartItemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    if (quantity === 0) {
      // Remove item from cart
      user.cart.splice(cartItemIndex, 1);
    } else {
      // Update quantity
      user.cart[cartItemIndex].quantity = quantity;
    }

    await user.save();

    res.json({
      success: true,
      message: quantity === 0 ? 'Item removed from cart' : 'Cart updated successfully'
    });

  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Remove item from cart
router.delete('/cart/:productId', [
  auth,
  body('size').notEmpty().withMessage('Size is required'),
  body('color').notEmpty().withMessage('Color is required')
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

    const { productId } = req.params;
    const { size, color } = req.body;

    await req.user.removeFromCart(productId, size, color);

    res.json({
      success: true,
      message: 'Item removed from cart successfully'
    });

  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Clear cart
router.delete('/cart', auth, async (req, res) => {
  try {
    await req.user.clearCart();

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });

  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user's order history
router.get('/orders', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'title slug primaryImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments({ user: req.user.id });

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

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-passwordHash -cart')
      .populate('orderHistory', 'orderNumber status pricing.total createdAt');

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update user preferences
router.put('/preferences', [
  auth,
  body('newsletter').optional().isBoolean(),
  body('notifications').optional().isBoolean(),
  body('favoriteCategories').optional().isArray(),
  body('sizePreferences').optional().isObject()
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

    const user = await User.findById(req.user.id);
    
    if (req.body.newsletter !== undefined) {
      user.preferences.newsletter = req.body.newsletter;
    }
    if (req.body.notifications !== undefined) {
      user.preferences.notifications = req.body.notifications;
    }
    if (req.body.favoriteCategories) {
      user.preferences.favoriteCategories = req.body.favoriteCategories;
    }
    if (req.body.sizePreferences) {
      user.preferences.sizePreferences = {
        ...user.preferences.sizePreferences,
        ...req.body.sizePreferences
      };
    }

    await user.save();

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: { preferences: user.preferences }
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get personalized recommendations
router.get('/recommendations', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    
    // Get user's favorite categories
    const favoriteCategories = user.preferences.favoriteCategories || [];
    const wishlistedCategories = user.wishlist.map(product => product.category);
    const allCategories = [...favoriteCategories, ...wishlistedCategories];

    // Build recommendation query
    const query = {
      isActive: true,
      _id: { $nin: user.wishlist.map(p => p._id) } // Exclude wishlisted items
    };

    if (allCategories.length > 0) {
      query.category = { $in: allCategories };
    }

    // Get recommendations based on preferences
    const recommendations = await Product.find(query)
      .select('title slug price.selling discount primaryImage rating.average category brand.name')
      .sort({ 'rating.average': -1, soldCount: -1 })
      .limit(12);

    res.json({
      success: true,
      data: { recommendations }
    });

  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
