const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  size: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  }
});

const addressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true, default: 'UK' },
  landmark: { type: String, default: '' },
  isDefault: { type: Boolean, default: false }
});

const paymentSchema = new mongoose.Schema({
  method: {
    type: String,
    required: true,
    enum: ['card', 'upi', 'netbanking', 'wallet', 'cod', 'emi']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    default: ''
  },
  paymentGateway: {
    type: String,
    enum: ['stripe', 'razorpay', 'paypal', 'paytm', 'phonepe', 'googlepay'],
    default: ''
  },
  amountPaid: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'GBP'
  },
  paidAt: {
    type: Date
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: {
    type: String,
    default: ''
  },
  refundedAt: {
    type: Date
  }
});

const trackingSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum: ['order_placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
    default: 'order_placed'
  },
  message: {
    type: String,
    required: true
  },
  location: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  pricing: {
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    shipping: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 }
  },
  shippingAddress: {
    type: addressSchema,
    required: true
  },
  billingAddress: {
    type: addressSchema,
    required: true
  },
  payment: paymentSchema,
  shipping: {
    method: {
      type: String,
      required: true,
      enum: ['standard', 'express', 'overnight', 'free'],
      default: 'standard'
    },
    provider: {
      type: String,
      enum: ['dhl', 'fedex', 'ups', 'royal_mail', 'dtdc', 'uk_post'],
      default: 'royal_mail'
    },
    trackingNumber: {
      type: String,
      default: ''
    },
    estimatedDelivery: {
      type: Date
    },
    actualDelivery: {
      type: Date
    },
    cost: {
      type: Number,
      required: true,
      min: 0
    }
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded'],
    default: 'pending'
  },
  tracking: [trackingSchema],
  notes: {
    customer: { type: String, default: '' },
    admin: { type: String, default: '' }
  },
  coupon: {
    code: { type: String, default: '' },
    discount: { type: Number, default: 0 },
    type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' }
  },
  gift: {
    isGift: { type: Boolean, default: false },
    message: { type: String, default: '' },
    wrapCost: { type: Number, default: 0 }
  },
  returns: {
    isReturnable: { type: Boolean, default: true },
    returnWindow: { type: Number, default: 30 }, // days
    returnReason: { type: String, default: '' },
    returnStatus: { 
      type: String, 
      enum: ['none', 'requested', 'approved', 'rejected', 'picked_up', 'received', 'refunded'],
      default: 'none'
    },
    returnRequestedAt: { type: Date },
    returnProcessedAt: { type: Date }
  },
  reviews: {
    hasReviewed: { type: Boolean, default: false },
    reviewedAt: { type: Date }
  },
  analytics: {
    source: { type: String, default: 'direct' }, // direct, google, facebook, etc.
    campaign: { type: String, default: '' },
    medium: { type: String, default: '' }
  }
}, {
  timestamps: true
});

// Indexes for better performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ createdAt: -1 });

// Generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Find the last order of the day
    const lastOrder = await this.constructor.findOne({
      orderNumber: new RegExp(`^MV${year}${month}${day}`)
    }).sort({ orderNumber: -1 });
    
    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
      sequence = lastSequence + 1;
    }
    
    this.orderNumber = `MV${year}${month}${day}${sequence.toString().padStart(4, '0')}`;
  }
  next();
});

// Add tracking update
orderSchema.methods.addTracking = function(status, message, location = '') {
  this.tracking.push({
    status,
    message,
    location,
    timestamp: new Date()
  });
  
  // Update order status
  this.status = status;
  
  // Set delivery date if delivered
  if (status === 'delivered') {
    this.shipping.actualDelivery = new Date();
  }
  
  return this.save();
};

// Calculate estimated delivery date
orderSchema.methods.calculateEstimatedDelivery = function() {
  const now = new Date();
  const deliveryDays = {
    'standard': 7,
    'express': 3,
    'overnight': 1,
    'free': 10
  };
  
  const days = deliveryDays[this.shipping.method] || 7;
  const estimatedDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
  
  this.shipping.estimatedDelivery = estimatedDate;
  return estimatedDate;
};

// Check if order can be cancelled
orderSchema.methods.canBeCancelled = function() {
  const cancellableStatuses = ['pending', 'confirmed'];
  return cancellableStatuses.includes(this.status);
};

// Check if order can be returned
orderSchema.methods.canBeReturned = function() {
  if (!this.returns.isReturnable || this.status !== 'delivered') return false;
  
  const deliveryDate = this.shipping.actualDelivery;
  if (!deliveryDate) return false;
  
  const returnWindowMs = this.returns.returnWindow * 24 * 60 * 60 * 1000;
  const deadline = new Date(deliveryDate.getTime() + returnWindowMs);
  
  return new Date() <= deadline;
};

// Virtual for formatted order number
orderSchema.virtual('formattedOrderNumber').get(function() {
  return `#${this.orderNumber}`;
});

// Virtual for total items count
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for current tracking status
orderSchema.virtual('currentTracking').get(function() {
  return this.tracking.length > 0 ? this.tracking[this.tracking.length - 1] : null;
});

// Static method to get order statistics
orderSchema.statics.getOrderStats = function(startDate, endDate) {
  const matchStage = {
    createdAt: {
      $gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Default 30 days
      $lte: endDate || new Date()
    }
  };

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$pricing.total' },
        averageOrderValue: { $avg: '$pricing.total' },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        confirmedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
        },
        shippedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] }
        },
        deliveredOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        }
      }
    }
  ]);
};

// Static method for user order history
orderSchema.statics.getUserOrderHistory = function(userId, limit = 10) {
  return this.find({ user: userId })
    .populate('items.product', 'title slug')
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model('Order', orderSchema);
