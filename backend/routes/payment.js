const express = require('express');
const { body, validationResult } = require('express-validator');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create payment intent
router.post('/create-payment-intent', [
  auth,
  body('amount').isInt({ min: 1 }).withMessage('Amount must be a positive integer'),
  body('currency').optional().isIn(['gbp', 'usd']).withMessage('Invalid currency'),
  body('orderId').optional().isMongoId().withMessage('Invalid order ID')
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

    const { amount, currency = 'gbp', orderId, metadata = {} } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe expects amount in cents/paisa
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: req.user.id,
        orderId: orderId || '',
        ...metadata
      }
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent'
    });
  }
});

// Confirm payment
router.post('/confirm-payment', [
  auth,
  body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required'),
  body('orderId').isMongoId().withMessage('Valid order ID is required')
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

    const { paymentIntentId, orderId } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment not successful'
      });
    }

    // Update order with payment information
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to order'
      });
    }

    order.payment.status = 'completed';
    order.payment.transactionId = paymentIntent.id;
    order.payment.paymentGateway = 'stripe';
    order.payment.paidAt = new Date();
    order.payment.amountPaid = paymentIntent.amount / 100; // Convert back from cents

    await order.save();

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment'
    });
  }
});

// Webhook for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      
      // Update order status if needed
      try {
        const orderId = paymentIntent.metadata.orderId;
        if (orderId) {
          const order = await Order.findById(orderId);
          if (order && order.payment.status !== 'completed') {
            order.payment.status = 'completed';
            order.payment.transactionId = paymentIntent.id;
            order.payment.paidAt = new Date();
            await order.save();
          }
        }
      } catch (error) {
        console.error('Error updating order from webhook:', error);
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      
      try {
        const orderId = failedPayment.metadata.orderId;
        if (orderId) {
          const order = await Order.findById(orderId);
          if (order) {
            order.payment.status = 'failed';
            await order.save();
          }
        }
      } catch (error) {
        console.error('Error updating failed payment from webhook:', error);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Get payment methods
router.get('/methods', auth, async (req, res) => {
  try {
    const paymentMethods = [
      {
        id: 'card',
        name: 'Credit/Debit Card',
        description: 'Pay securely with your credit or debit card',
        enabled: true,
        currencies: ['gbp', 'usd']
      },
      {
        id: 'apple-pay',
        name: 'Apple Pay',
        description: 'Pay using Apple Pay',
        enabled: true,
        currencies: ['gbp']
      },
      {
        id: 'netbanking',
        name: 'Net Banking',
        description: 'Pay using your bank account',
        enabled: true,
        currencies: ['gbp']
      },
      {
        id: 'wallet',
        name: 'Digital Wallet',
        description: 'Pay using digital wallets like PayPal, Apple Pay',
        enabled: true,
        currencies: ['gbp']
      },
      {
        id: 'cod',
        name: 'Cash on Delivery',
        description: 'Pay when your order is delivered',
        enabled: true,
        currencies: ['gbp']
      }
    ];

    res.json({
      success: true,
      data: { paymentMethods }
    });

  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment methods'
    });
  }
});

// Process refund
router.post('/refund', [
  auth,
  body('orderId').isMongoId().withMessage('Valid order ID is required'),
  body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be non-negative'),
  body('reason').optional().isString().withMessage('Reason must be a string')
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

    const { orderId, amount, reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order or is admin
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to order'
      });
    }

    if (order.payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot refund payment that is not completed'
      });
    }

    if (!order.payment.transactionId) {
      return res.status(400).json({
        success: false,
        message: 'No transaction ID found for refund'
      });
    }

    // Calculate refund amount
    const refundAmount = amount || order.payment.amountPaid;

    if (refundAmount > order.payment.amountPaid) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount cannot exceed paid amount'
      });
    }

    // Create refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: order.payment.transactionId,
      amount: refundAmount * 100, // Convert to cents
      reason: 'requested_by_customer',
      metadata: {
        orderId: orderId,
        reason: reason || 'Customer requested refund'
      }
    });

    // Update order with refund information
    order.payment.status = 'refunded';
    order.payment.refundAmount = refundAmount;
    order.payment.refundReason = reason || 'Customer requested refund';
    order.payment.refundedAt = new Date();
    order.status = 'refunded';

    await order.save();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refundId: refund.id,
        amount: refundAmount,
        order
      }
    });

  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund'
    });
  }
});

module.exports = router;
