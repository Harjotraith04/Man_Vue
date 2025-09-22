const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Product = require('../models/Product');
const { auth, adminAuth, optionalAuth } = require('../middleware/auth');
const { cloudinary } = require('../config/cloudinary');
const multer = require('multer');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get all products with filters and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be non-negative'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be non-negative'),
  query('rating').optional().isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5')
], optionalAuth, async (req, res) => {
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
      page = 1,
      limit = 12,
      category,
      subCategory,
      minPrice,
      maxPrice,
      rating,
      sortBy = 'newest',
      search,
      inStock,
      featured,
      newArrival,
      bestSeller
    } = req.query;

    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      ...(category && { category }),
      ...(subCategory && { subCategory }),
      ...(minPrice && { minPrice: parseFloat(minPrice) }),
      ...(maxPrice && { maxPrice: parseFloat(maxPrice) }),
      ...(rating && { rating: parseFloat(rating) }),
      ...(search && { search }),
      ...(inStock === 'true' && { inStock: true }),
      ...(featured === 'true' && { featured: true }),
      ...(newArrival === 'true' && { newArrival: true }),
      ...(bestSeller === 'true' && { bestSeller: true }),
      sortBy
    };

    const products = await Product.searchProducts(filters)
      .select('-embeddings -reviews -relatedProducts')
      .populate('createdBy', 'name');

    // Get total count for pagination
    const totalQuery = Product.searchProducts({ ...filters, page: undefined, limit: undefined });
    const total = await Product.countDocuments(totalQuery.getQuery());

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalProducts: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get single product by slug
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const product = await Product.findOne({ 
      slug: req.params.slug, 
      isActive: true 
    })
      .populate('reviews.user', 'name avatar')
      .populate('relatedProducts', 'title slug price.selling primaryImage rating.average')
      .populate('createdBy', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment view count
    product.viewCount += 1;
    await product.save();

    // Check if user has wishlisted this product
    let isWishlisted = false;
    if (req.user) {
      isWishlisted = req.user.wishlist.includes(product._id);
    }

    res.json({
      success: true,
      data: {
        product,
        isWishlisted
      }
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new product (admin only)
router.post('/', [
  adminAuth,
  upload.array('images', 10),
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title is required and must be under 100 characters'),
  body('description').trim().isLength({ min: 1, max: 2000 }).withMessage('Description is required and must be under 2000 characters'),
  body('category').isIn([
    'shirts', 'tshirts', 'jeans', 'trousers', 'chinos', 'shorts',
    'jackets', 'blazers', 'suits', 'sweaters', 'hoodies',
    'kurtas', 'sherwanis', 'ethnic-wear',
    'shoes', 'sneakers', 'formal-shoes', 'boots', 'sandals',
    'watches', 'belts', 'wallets', 'sunglasses', 'ties', 'bags',
    'accessories', 'underwear', 'socks', 'caps', 'perfumes'
  ]).withMessage('Invalid category'),
  body('price.original').isFloat({ min: 0 }).withMessage('Original price must be non-negative'),
  body('price.selling').isFloat({ min: 0 }).withMessage('Selling price must be non-negative'),
  body('brand.name').trim().notEmpty().withMessage('Brand name is required')
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

    // Reconstruct nested objects from flat FormData fields
    const productData = {
      ...req.body,
      createdBy: req.user.id,
      isActive: true, // Explicitly ensure product is active when created by admin
      
      // Reconstruct price object from flat fields
      price: {
        original: parseFloat(req.body['price.original']) || 0,
        selling: parseFloat(req.body['price.selling']) || 0,
        currency: 'INR'
      },
      
      // Reconstruct brand object from flat fields  
      brand: {
        name: req.body['brand.name'] || '',
        logo: req.body['brand.logo'] || ''
      },
      
      // Reconstruct discount object from flat fields
      discount: {
        percentage: parseFloat(req.body['discount.percentage']) || 0,
        isActive: req.body['discount.isActive'] === 'true',
        validUntil: null
      },
      
      // Parse JSON fields
      variants: JSON.parse(req.body.variants || '[]'),
      specifications: JSON.parse(req.body.specifications || '{}'),
      tags: JSON.parse(req.body.tags || '[]'),
      features: JSON.parse(req.body.features || '[]')
    };
    
    // Remove the flat fields to avoid duplication
    delete productData['price.original'];
    delete productData['price.selling'];
    delete productData['brand.name'];
    delete productData['brand.logo'];
    delete productData['discount.percentage'];
    delete productData['discount.isActive'];

    // Upload images to Cloudinary
    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map(file => {
        return new Promise((resolve, reject) => {
          if (!file.buffer) {
            reject(new Error('File buffer is missing'));
            return;
          }

          cloudinary.uploader.upload_stream(
            {
              folder: 'manvue/products',
              transformation: [
                { width: 800, height: 800, crop: 'fill', quality: 'auto' }
              ]
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve({
                  url: result.secure_url,
                  alt: productData.title,
                  isPrimary: false
                });
              }
            }
          ).end(file.buffer);
        });
      });

      const uploadedImages = await Promise.all(imagePromises);
      
      // Set first image as primary
      if (uploadedImages.length > 0) {
        uploadedImages[0].isPrimary = true;
      }

      // Add images to first variant or create default variant
      if (productData.variants.length > 0) {
        productData.variants[0].images = uploadedImages;
        // Ensure variant sizes have proper prices if they're 0
        productData.variants.forEach(variant => {
          variant.sizes.forEach(size => {
            if (size.price === 0) {
              size.price = productData.price.selling;
            }
          });
        });
      } else {
        productData.variants = [{
          color: 'Default',
          colorCode: '#000000',
          images: uploadedImages,
          sizes: [
            { size: 'M', stock: 10, price: productData.price.selling }
          ]
        }];
      }
    } else {
      // No images uploaded, but still need to fix variant prices
      if (productData.variants.length > 0) {
        productData.variants.forEach(variant => {
          variant.sizes.forEach(size => {
            if (size.price === 0) {
              size.price = productData.price.selling;
            }
          });
        });
      }
    }


    // Generate slug from title if not provided
    if (!productData.slug) {
      productData.slug = productData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50);
    }

    const product = new Product(productData);
    await product.save();


    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update product (admin only)
router.put('/:id', [
  adminAuth,
  upload.array('images', 10),
  body('title').optional().trim().isLength({ min: 1, max: 100 }),
  body('description').optional().trim().isLength({ min: 1, max: 2000 }),
  body('price.original').optional().isFloat({ min: 0 }),
  body('price.selling').optional().isFloat({ min: 0 })
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

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'images' && req.body[key] !== undefined) {
        if (key === 'variants' || key === 'specifications' || key === 'tags' || key === 'features') {
          product[key] = JSON.parse(req.body[key]);
        } else {
          product[key] = req.body[key];
        }
      }
    });

    product.updatedBy = req.user.id;

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map(file => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              folder: 'manvue/products',
              transformation: [
                { width: 800, height: 800, crop: 'fill', quality: 'auto' }
              ]
            },
            (error, result) => {
              if (error) reject(error);
              else resolve({
                url: result.secure_url,
                alt: product.title,
                isPrimary: false
              });
            }
          ).end(file.buffer);
        });
      });

      const uploadedImages = await Promise.all(imagePromises);
      
      // Add new images to first variant
      if (product.variants.length > 0) {
        product.variants[0].images.push(...uploadedImages);
      }
    }

    await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete product (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Soft delete by marking as inactive
    product.isActive = false;
    await product.save();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add product to wishlist
router.post('/:id/wishlist', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const user = req.user;
    const productId = product._id;

    const isAlreadyWishlisted = user.wishlist.includes(productId);

    if (isAlreadyWishlisted) {
      // Remove from wishlist
      user.wishlist = user.wishlist.filter(id => !id.equals(productId));
      product.wishlistedBy = product.wishlistedBy.filter(id => !id.equals(user._id));
    } else {
      // Add to wishlist
      user.wishlist.push(productId);
      product.wishlistedBy.push(user._id);
    }

    await Promise.all([user.save(), product.save()]);

    res.json({
      success: true,
      message: isAlreadyWishlisted ? 'Removed from wishlist' : 'Added to wishlist',
      data: {
        isWishlisted: !isAlreadyWishlisted
      }
    });

  } catch (error) {
    console.error('Wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add product review
router.post('/:id/reviews', [
  auth,
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().isLength({ min: 1, max: 500 }).withMessage('Comment must be between 1 and 500 characters')
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

    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already reviewed this product
    const existingReview = product.reviews.find(review => 
      review.user.toString() === req.user.id
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Add review
    await product.addReview(req.user.id, rating, comment);

    // Populate the new review
    await product.populate('reviews.user', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: {
        review: product.reviews[product.reviews.length - 1],
        rating: product.rating
      }
    });

  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get product categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    const subCategories = await Product.distinct('subCategory', { isActive: true });

    res.json({
      success: true,
      data: {
        categories,
        subCategories
      }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
