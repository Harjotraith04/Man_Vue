const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create mock payment intent
router.post('/create-mock-payment', [
  auth,
  body('orderId').isMongoId().withMessage('Valid order ID is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('cardDetails').isObject().withMessage('Card details are required'),
  body('cardDetails.cardNumber').isLength({ min: 13, max: 19 }).withMessage('Valid card number required'),
  body('cardDetails.cardHolder').isLength({ min: 2, max: 100 }).withMessage('Cardholder name required'),
  body('cardDetails.expiryMonth').isInt({ min: 1, max: 12 }).withMessage('Valid expiry month required'),
  body('cardDetails.expiryYear').isInt({ min: 24, max: 99 }).withMessage('Valid expiry year required'),
  body('cardDetails.cvv').isLength({ min: 3, max: 4 }).withMessage('Valid CVV required')
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

    const { orderId, amount, cardDetails } = req.body;

    // Validate order exists and belongs to user
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

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    // Mock payment logic - simulate failure for cards ending in 0000
    const cardNumber = cardDetails.cardNumber.replace(/\s/g, '');
    const shouldFail = cardNumber.endsWith('0000');

    if (shouldFail) {
      return res.status(400).json({
        success: false,
        message: 'Payment declined by bank. Please try a different card.',
        code: 'PAYMENT_DECLINED'
      });
    }

    // Generate mock transaction ID
    const transactionId = `MOCK_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1500 + 500));

    res.json({
      success: true,
      data: {
        transactionId,
        status: 'succeeded',
        amount,
        currency: 'GBP',
        orderId,
        gateway: 'mock-pay',
        timestamp: new Date().toISOString(),
        cardDetails: {
          last4: cardNumber.slice(-4),
          brand: detectCardBrand(cardNumber),
          expiryMonth: cardDetails.expiryMonth,
          expiryYear: cardDetails.expiryYear
        }
      }
    });

  } catch (error) {
    console.error('Mock payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment processing failed'
    });
  }
});

// Confirm mock payment
router.post('/confirm-mock-payment', [
  auth,
  body('transactionId').notEmpty().withMessage('Transaction ID is required'),
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

    const { transactionId, orderId } = req.body;

    // Validate order exists and belongs to user
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

    // Update order with payment information
    order.payment.status = 'completed';
    order.payment.transactionId = transactionId;
    order.payment.paymentGateway = 'mock-pay';
    order.payment.paidAt = new Date();
    order.payment.amountPaid = order.pricing.total;

    // Add tracking update
    order.addTracking('payment_confirmed', 'Payment confirmed successfully via MockPay Gateway');

    await order.save();

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: { 
        order,
        transactionId,
        status: 'completed'
      }
    });

  } catch (error) {
    console.error('Confirm mock payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment'
    });
  }
});

// Get mock payment methods
router.get('/mock-methods', auth, async (req, res) => {
  try {
    const methods = [
      {
        id: 'mock-card',
        name: 'MockPay Credit/Debit Card',
        type: 'card',
        description: 'Secure card payment via MockPay Gateway (Demo)',
        icon: 'credit-card',
        enabled: true,
        processingTime: '2-3 seconds',
        features: ['Instant Processing', 'Secure', 'No API Key Required', 'Demo Mode']
      }
    ];

    res.json({
      success: true,
      data: { methods }
    });

  } catch (error) {
    console.error('Get mock payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment methods'
    });
  }
});

// Helper function to detect card brand
function detectCardBrand(cardNumber) {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  
  if (/^4/.test(cleanNumber)) return 'visa';
  if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
  if (/^3[47]/.test(cleanNumber)) return 'amex';
  if (/^6(?:011|5)/.test(cleanNumber)) return 'discover';
  
  return 'unknown';
}

module.exports = router;
