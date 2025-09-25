const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    maxlength: [500, 'Review comment cannot exceed 500 characters']
  },
  helpful: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const variantSchema = new mongoose.Schema({
  color: {
    type: String,
    required: true
  },
  colorCode: {
    type: String,
    required: true
  },
  images: [{
    url: { type: String, required: true },
    alt: { type: String, default: '' },
    isPrimary: { type: Boolean, default: false }
  }],
  sizes: [{
    size: { type: String, required: true },
    stock: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 }
  }]
});

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    maxlength: [100, 'Product title cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'shirts', 'tshirts', 'jeans', 'trousers', 'chinos', 'shorts',
      'jackets', 'blazers', 'suits', 'sweaters', 'hoodies',
      'formal', 'kurtas', 'sherwanis', 'ethnic-wear',
      'shoes', 'sneakers', 'formal-shoes', 'boots', 'sandals',
      'watches', 'belts', 'wallets', 'sunglasses', 'ties', 'bags',
      'accessories', 'underwear', 'socks', 'caps', 'perfumes'
    ]
  },
  subCategory: {
    type: String,
    enum: [
      'casual', 'formal', 'sport', 'party', 'wedding', 'office',
      'summer', 'winter', 'monsoon', 'festival', 'daily-wear'
    ]
  },
  brand: {
    name: { type: String, required: true },
    logo: { type: String, default: '' }
  },
  price: {
    original: { type: Number, required: true, min: 0 },
    selling: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'GBP' }
  },
  discount: {
    percentage: { type: Number, min: 0, max: 100, default: 0 },
    isActive: { type: Boolean, default: false },
    validUntil: { type: Date }
  },
  variants: [variantSchema],
  defaultVariant: {
    color: { type: String, default: '' },
    size: { type: String, default: '' }
  },
  specifications: {
    material: { type: String, default: '' },
    care: { type: String, default: '' },
    fit: { 
      type: String, 
      enum: ['slim', 'regular', 'loose', 'tight', 'relaxed', 'oversized'],
      default: 'regular'
    },
    pattern: { type: String, default: '' },
    sleeve: { type: String, default: '' },
    neckType: { type: String, default: '' },
    origin: { type: String, default: '' },
    weight: { type: String, default: '' },
    dimensions: {
      length: { type: String, default: '' },
      width: { type: String, default: '' },
      height: { type: String, default: '' }
    }
  },
  sizeChart: {
    type: String, // URL to size chart image
    default: ''
  },
  glbModelUrl: {
    type: String, // 3D model for AR preview
    default: ''
  },
  tags: [{ type: String }],
  features: [{ type: String }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isNewArrival: {
    type: Boolean,
    default: false
  },
  isBestSeller: {
    type: Boolean,
    default: false
  },
  inventory: {
    totalStock: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    trackQuantity: { type: Boolean, default: true }
  },
  seo: {
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    keywords: [{ type: String }]
  },
  reviews: [reviewSchema],
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  viewCount: {
    type: Number,
    default: 0
  },
  soldCount: {
    type: Number,
    default: 0
  },
  wishlistedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  relatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  // AI-related fields
  embeddings: {
    type: [Number], // Vector embeddings for similarity search
    default: []
  },
  aiTags: [{ type: String }], // AI-generated tags
  colorAnalysis: {
    dominantColors: [{ type: String }],
    colorHarmony: { type: String }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }, // Include virtual fields in JSON output
  toObject: { virtuals: true }
});

// Indexes for better performance
productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, subCategory: 1 });
productSchema.index({ 'price.selling': 1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ isActive: 1, isFeatured: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ soldCount: -1 });

// Generate slug from title
productSchema.pre('save', function(next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
  }
  
  // Calculate total stock
  this.inventory.totalStock = this.variants.reduce((total, variant) => {
    return total + variant.sizes.reduce((sizeTotal, size) => sizeTotal + size.stock, 0);
  }, 0);
  
  next();
});

// Calculate average rating
productSchema.methods.calculateRating = function() {
  if (this.reviews.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
    return;
  }
  
  const sum = this.reviews.reduce((total, review) => total + review.rating, 0);
  this.rating.average = Math.round((sum / this.reviews.length) * 10) / 10;
  this.rating.count = this.reviews.length;
};

// Add review
productSchema.methods.addReview = function(userId, rating, comment) {
  this.reviews.push({
    user: userId,
    rating,
    comment
  });
  this.calculateRating();
  return this.save();
};

// Get available sizes for a specific color
productSchema.methods.getAvailableSizes = function(color) {
  const variant = this.variants.find(v => v.color === color);
  return variant ? variant.sizes.filter(s => s.stock > 0) : [];
};

// Check if product is in stock for specific variant
productSchema.methods.isInStock = function(color, size) {
  const variant = this.variants.find(v => v.color === color);
  if (!variant) return false;
  
  const sizeInfo = variant.sizes.find(s => s.size === size);
  return sizeInfo && sizeInfo.stock > 0;
};

// Get price for specific variant
productSchema.methods.getPrice = function(color, size) {
  const variant = this.variants.find(v => v.color === color);
  if (!variant) return this.price.selling;
  
  const sizeInfo = variant.sizes.find(s => s.size === size);
  return sizeInfo ? sizeInfo.price : this.price.selling;
};

// Virtual for discount amount
productSchema.virtual('discountAmount').get(function() {
  if (!this.discount.isActive) return 0;
  return this.price.original - this.price.selling;
});

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  if (this.variants.length === 0) return '';
  
  const defaultVariant = this.variants.find(v => v.color === this.defaultVariant.color) || this.variants[0];
  const primaryImg = defaultVariant.images.find(img => img.isPrimary);
  return primaryImg ? primaryImg.url : (defaultVariant.images[0]?.url || '');
});

// Static method for search with filters
productSchema.statics.searchProducts = function(filters = {}) {
  const query = { isActive: true };
  
  if (filters.category) query.category = filters.category;
  if (filters.subCategory) query.subCategory = filters.subCategory;
  if (filters.minPrice || filters.maxPrice) {
    query['price.selling'] = {};
    if (filters.minPrice) query['price.selling']['$gte'] = filters.minPrice;
    if (filters.maxPrice) query['price.selling']['$lte'] = filters.maxPrice;
  }
  if (filters.rating) query['rating.average'] = { $gte: filters.rating };
  if (filters.inStock) query['inventory.totalStock'] = { $gt: 0 };
  if (filters.featured) query.isFeatured = true;
  if (filters.newArrival) query.isNewArrival = true;
  if (filters.bestSeller) query.isBestSeller = true;
  if (filters.search) {
    query.$text = { $search: filters.search };
  }
  
  let queryBuilder = this.find(query);
  
  // Sorting
  if (filters.sortBy) {
    const sortOptions = {
      'price-low': { 'price.selling': 1 },
      'price-high': { 'price.selling': -1 },
      'rating': { 'rating.average': -1 },
      'newest': { createdAt: -1 },
      'popularity': { soldCount: -1, viewCount: -1 }
    };
    queryBuilder = queryBuilder.sort(sortOptions[filters.sortBy] || { createdAt: -1 });
  }
  
  // Pagination
  if (filters.page && filters.limit) {
    const skip = (filters.page - 1) * filters.limit;
    queryBuilder = queryBuilder.skip(skip).limit(filters.limit);
  }
  
  return queryBuilder;
};

module.exports = mongoose.model('Product', productSchema);
