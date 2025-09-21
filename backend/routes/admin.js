const express = require('express');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Dashboard overview stats
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);
    const endDate = new Date();

    // Get stats for the period
    const [orderStats, userStats, productStats, revenueStats] = await Promise.all([
      // Order statistics
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$pricing.total' },
            averageOrderValue: { $avg: '$pricing.total' },
            pendingOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            },
            processingOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
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
      ]),

      // User statistics
      User.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            activeUsers: {
              $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
            },
            newUsers: {
              $sum: {
                $cond: [
                  { $gte: ['$createdAt', startDate] },
                  1, 0
                ]
              }
            },
            adminUsers: {
              $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
            }
          }
        }
      ]),

      // Product statistics
      Product.aggregate([
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            activeProducts: {
              $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
            },
            featuredProducts: {
              $sum: { $cond: [{ $eq: ['$isFeatured', true] }, 1, 0] }
            },
            newArrivals: {
              $sum: { $cond: [{ $eq: ['$isNewArrival', true] }, 1, 0] }
            },
            lowStockProducts: {
              $sum: {
                $cond: [
                  { $lte: ['$inventory.totalStock', '$inventory.lowStockThreshold'] },
                  1, 0
                ]
              }
            }
          }
        }
      ]),

      // Revenue by day
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: { $ne: 'cancelled' }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            revenue: { $sum: '$pricing.total' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ])
    ]);

    // Top selling products
    const topProducts = await Product.aggregate([
      { $match: { isActive: true } },
      { $sort: { soldCount: -1 } },
      { $limit: 5 },
      {
        $project: {
          title: 1,
          soldCount: 1,
          category: 1,
          'price.selling': 1,
          'rating.average': 1
        }
      }
    ]);

    // Top categories by sales
    const topCategories = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          totalSold: { $sum: '$soldCount' },
          totalProducts: { $sum: 1 },
          averagePrice: { $avg: '$price.selling' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    // Recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('orderNumber status pricing.total createdAt user shippingAddress.name');

    // Default values for statistics
    const defaultOrderStats = {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      pendingOrders: 0,
      processingOrders: 0,
      shippedOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0
    };

    const defaultUserStats = {
      totalUsers: 0,
      activeUsers: 0,
      newUsers: 0,
      adminUsers: 0
    };

    const defaultProductStats = {
      totalProducts: 0,
      activeProducts: 0,
      featuredProducts: 0,
      newArrivals: 0,
      lowStockProducts: 0
    };

    res.json({
      success: true,
      data: {
        orders: { ...defaultOrderStats, ...(orderStats[0] || {}) },
        users: { ...defaultUserStats, ...(userStats[0] || {}) },
        products: { ...defaultProductStats, ...(productStats[0] || {}) },
        revenue: revenueStats || [],
        topProducts: topProducts || [],
        topCategories: topCategories || [],
        recentOrders: recentOrders || [],
        period: parseInt(period)
      }
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// User management
router.get('/users', [
  adminAuth,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('role').optional().isIn(['user', 'admin']),
  query('isActive').optional().isBoolean()
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
      page = 1,
      limit = 20,
      role,
      isActive,
      search
    } = req.query;

    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update user role
router.put('/users/:userId/role', [
  adminAuth,
  body('role').isIn(['user', 'admin']).withMessage('Invalid role')
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

    const { userId } = req.params;
    const { role } = req.body;

    // Prevent admin from changing their own role
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own role'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      data: { user }
    });

  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Deactivate/activate user
router.put('/users/:userId/status', [
  adminAuth,
  body('isActive').isBoolean().withMessage('isActive must be boolean')
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

    const { userId } = req.params;
    const { isActive } = req.body;

    // Prevent admin from deactivating themselves
    if (userId === req.user.id && !isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user }
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Product management - get all products
router.get('/products', [
  adminAuth,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      isActive,
      search
    } = req.query;

    const query = {};
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { 'brand.name': new RegExp(search, 'i') }
      ];
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-embeddings -reviews');

    const total = await Product.countDocuments(query);

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
    console.error('Get admin products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Bulk update products
router.put('/products/bulk', [
  adminAuth,
  body('productIds').isArray({ min: 1 }).withMessage('Product IDs array is required'),
  body('updates').isObject().withMessage('Updates object is required')
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

    const { productIds, updates } = req.body;

    // Only allow specific fields to be bulk updated
    const allowedUpdates = {
      ...(updates.isActive !== undefined && { isActive: updates.isActive }),
      ...(updates.isFeatured !== undefined && { isFeatured: updates.isFeatured }),
      ...(updates.isNewArrival !== undefined && { isNewArrival: updates.isNewArrival }),
      ...(updates.isBestSeller !== undefined && { isBestSeller: updates.isBestSeller }),
      ...(updates.category && { category: updates.category }),
      updatedBy: req.user.id
    };

    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: allowedUpdates }
    );

    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} products`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      }
    });

  } catch (error) {
    console.error('Bulk update products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Analytics endpoint
router.get('/analytics', [
  adminAuth,
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('metric').optional().isIn(['revenue', 'orders', 'products', 'users'])
], async (req, res) => {
  try {
    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate = new Date().toISOString(),
      metric = 'revenue'
    } = req.query;

    const start = new Date(startDate);
    const end = new Date(endDate);

    let analytics;

    switch (metric) {
      case 'revenue':
        analytics = await Order.aggregate([
          {
            $match: {
              createdAt: { $gte: start, $lte: end },
              status: { $ne: 'cancelled' }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
              },
              revenue: { $sum: '$pricing.total' },
              orders: { $sum: 1 },
              averageOrderValue: { $avg: '$pricing.total' }
            }
          },
          { $sort: { '_id': 1 } }
        ]);
        break;

      case 'orders':
        analytics = await Order.aggregate([
          {
            $match: {
              createdAt: { $gte: start, $lte: end }
            }
          },
          {
            $group: {
              _id: {
                date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                status: '$status'
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id.date': 1 } }
        ]);
        break;

      case 'products':
        analytics = await Product.aggregate([
          {
            $match: {
              createdAt: { $gte: start, $lte: end }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
              },
              newProducts: { $sum: 1 },
              totalViews: { $sum: '$viewCount' },
              totalSales: { $sum: '$soldCount' }
            }
          },
          { $sort: { '_id': 1 } }
        ]);
        break;

      case 'users':
        analytics = await User.aggregate([
          {
            $match: {
              createdAt: { $gte: start, $lte: end }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
              },
              newUsers: { $sum: 1 },
              activeUsers: {
                $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
              }
            }
          },
          { $sort: { '_id': 1 } }
        ]);
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid metric'
        });
    }

    res.json({
      success: true,
      data: {
        analytics,
        metric,
        dateRange: { startDate, endDate }
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// System health check
router.get('/health', adminAuth, async (req, res) => {
  try {
    const [dbStatus, productCount, userCount, orderCount] = await Promise.all([
      // Database connection check
      Product.findOne().lean(),
      
      // Collection counts
      Product.countDocuments(),
      User.countDocuments(),
      Order.countDocuments()
    ]);

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: !!dbStatus,
        collections: {
          products: productCount,
          users: userCount,
          orders: orderCount
        }
      },
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };

    res.json({
      success: true,
      data: health
    });

  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      message: 'System health check failed',
      data: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      }
    });
  }
});

// Export data (CSV format)
router.get('/export/:type', [
  adminAuth,
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], async (req, res) => {
  try {
    const { type } = req.params;
    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate = new Date().toISOString()
    } = req.query;

    const start = new Date(startDate);
    const end = new Date(endDate);

    let data, headers;

    switch (type) {
      case 'orders':
        const orders = await Order.find({
          createdAt: { $gte: start, $lte: end }
        })
        .populate('user', 'name email')
        .select('orderNumber status pricing createdAt user shippingAddress');

        headers = ['Order Number', 'Customer Name', 'Email', 'Status', 'Total', 'Date'];
        data = orders.map(order => [
          order.orderNumber,
          order.user?.name || 'N/A',
          order.user?.email || 'N/A',
          order.status,
          order.pricing.total,
          order.createdAt.toISOString().split('T')[0]
        ]);
        break;

      case 'products':
        const products = await Product.find({
          createdAt: { $gte: start, $lte: end }
        }).select('title category brand.name price.selling soldCount rating.average createdAt');

        headers = ['Title', 'Category', 'Brand', 'Price', 'Sales', 'Rating', 'Date Added'];
        data = products.map(product => [
          product.title,
          product.category,
          product.brand.name,
          product.price.selling,
          product.soldCount,
          product.rating.average,
          product.createdAt.toISOString().split('T')[0]
        ]);
        break;

      case 'users':
        const users = await User.find({
          createdAt: { $gte: start, $lte: end }
        }).select('name email role isActive createdAt lastLogin');

        headers = ['Name', 'Email', 'Role', 'Status', 'Joined', 'Last Login'];
        data = users.map(user => [
          user.name,
          user.email,
          user.role,
          user.isActive ? 'Active' : 'Inactive',
          user.createdAt.toISOString().split('T')[0],
          user.lastLogin ? user.lastLogin.toISOString().split('T')[0] : 'Never'
        ]);
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type'
        });
    }

    // Convert to CSV
    const csvContent = [headers, ...data]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${type}_export_${Date.now()}.csv"`);
    res.send(csvContent);

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      message: 'Export failed'
    });
  }
});

module.exports = router;
