const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  passwordHash: {
    type: String,
    required: function() {
      return !this.googleId; // Required only if not a Google user
    },
    minlength: [6, 'Password must be at least 6 characters']
  },
  googleId: {
    type: String,
    sparse: true // Allows multiple null values but unique non-null values
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    country: { type: String, default: 'UK' }
  },
  preferences: {
    newsletter: { type: Boolean, default: true },
    notifications: { type: Boolean, default: true },
    favoriteCategories: [{ type: String }],
    sizePreferences: {
      shirt: { type: String, default: '' },
      pants: { type: String, default: '' },
      shoes: { type: String, default: '' }
    }
  },
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  cart: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    size: {
      type: String,
      required: true
    },
    color: {
      type: String,
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  orderHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash') || !this.passwordHash) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Generate user-friendly display name
userSchema.virtual('displayName').get(function() {
  return this.name || this.email.split('@')[0];
});

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.passwordHash;
  delete user.emailVerificationToken;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  return user;
};

// Static method to find user by email or googleId
userSchema.statics.findByEmailOrGoogleId = function(email, googleId) {
  const query = {};
  if (email) query.email = email;
  if (googleId) query.googleId = googleId;
  
  return this.findOne({
    $or: [
      ...(email ? [{ email }] : []),
      ...(googleId ? [{ googleId }] : [])
    ]
  });
};

// Add item to cart
userSchema.methods.addToCart = function(productId, quantity, size, color) {
  const existingItemIndex = this.cart.findIndex(item => 
    item.product.toString() === productId.toString() && 
    item.size === size && 
    item.color === color
  );

  if (existingItemIndex > -1) {
    this.cart[existingItemIndex].quantity += quantity;
  } else {
    this.cart.push({
      product: productId,
      quantity,
      size,
      color
    });
  }

  return this.save();
};

// Remove item from cart
userSchema.methods.removeFromCart = function(productId, size, color) {
  this.cart = this.cart.filter(item => 
    !(item.product.toString() === productId.toString() && 
      item.size === size && 
      item.color === color)
  );
  return this.save();
};

// Clear cart
userSchema.methods.clearCart = function() {
  this.cart = [];
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
