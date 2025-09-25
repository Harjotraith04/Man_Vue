require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Function to generate additional analytics data
async function generateAnalyticsData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/manvue');
    console.log('📦 Connected to MongoDB');

    // Get existing users and products
    const users = await User.find({ role: 'user' });
    const products = await Product.find({ isActive: true });
    
    if (users.length === 0 || products.length === 0) {
      console.log('❌ No users or products found. Please run seedData.js first.');
      return;
    }

    console.log(`👥 Found ${users.length} users and ${products.length} products`);

    // Generate additional orders for better analytics
    const additionalOrders = [];
    const now = new Date();
    
    // Generate orders for the last 90 days with more variety
    for (let i = 0; i < 50; i++) {
      const daysAgo = Math.floor(Math.random() * 90);
      const orderDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      
      // Randomly select 1-4 products for each order
      const numItems = Math.floor(Math.random() * 4) + 1;
      const selectedProducts = [];
      const usedProducts = new Set();
      
      for (let j = 0; j < numItems; j++) {
        let product;
        do {
          product = products[Math.floor(Math.random() * products.length)];
        } while (usedProducts.has(product._id.toString()));
        
        usedProducts.add(product._id.toString());
        const variant = product.variants[0];
        const size = variant.sizes[Math.floor(Math.random() * variant.sizes.length)];
        
        selectedProducts.push({
          product: product._id,
          title: product.title,
          image: variant.images[0].url,
          quantity: Math.floor(Math.random() * 3) + 1,
          size: size.size,
          color: variant.color,
          price: size.price,
          totalPrice: size.price * (Math.floor(Math.random() * 3) + 1)
        });
      }
      
      const subtotal = selectedProducts.reduce((sum, item) => sum + item.totalPrice, 0);
      const tax = Math.round(subtotal * 0.18);
      const shipping = subtotal > 50 ? 0 : 5;
      const total = subtotal + tax + shipping;
      
      // Assign status based on order age with more realistic distribution
      let status;
      if (daysAgo < 1) status = 'pending';
      else if (daysAgo < 2) status = 'confirmed';
      else if (daysAgo < 5) status = 'processing';
      else if (daysAgo < 10) status = 'shipped';
      else if (daysAgo < 30) status = 'delivered';
      else status = Math.random() > 0.95 ? 'cancelled' : 'delivered';
      
      const orderNumber = `ORD${Date.now().toString().slice(-6)}${(i + 1000).toString().padStart(3, '0')}`;
      const randomUser = users[Math.floor(Math.random() * users.length)];
      
      additionalOrders.push({
        orderNumber,
        user: randomUser._id,
        items: selectedProducts,
        pricing: {
          subtotal,
          discount: 0,
          tax,
          shipping,
          total
        },
        shippingAddress: {
          name: randomUser.name,
          phone: '+44 07741855104',
          email: randomUser.email,
          street: `${Math.floor(Math.random() * 999) + 1} Sample Street`,
          city: ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Leeds'][Math.floor(Math.random() * 5)],
          state: ['England', 'Scotland', 'Wales', 'Northern Ireland'][Math.floor(Math.random() * 4)],
          zipCode: `${Math.floor(Math.random() * 900000) + 100000}`,
          country: 'UK'
        },
        billingAddress: {
          name: randomUser.name,
          phone: '+44 07741855104',
          email: randomUser.email,
          street: `${Math.floor(Math.random() * 999) + 1} Sample Street`,
          city: ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Leeds'][Math.floor(Math.random() * 5)],
          state: ['England', 'Scotland', 'Wales', 'Northern Ireland'][Math.floor(Math.random() * 4)],
          zipCode: `${Math.floor(Math.random() * 900000) + 100000}`,
          country: 'UK'
        },
        payment: {
          method: ['card', 'upi', 'netbanking'][Math.floor(Math.random() * 3)],
          status: status === 'cancelled' ? 'failed' : 'completed',
          transactionId: `TXN${Date.now().toString().slice(-8)}`,
          paymentGateway: 'razorpay',
          amountPaid: total,
          currency: 'GBP',
          paidAt: status !== 'cancelled' ? orderDate : undefined
        },
        shipping: {
          method: 'standard',
          provider: 'royal_mail',
          trackingNumber: status === 'shipped' || status === 'delivered' ? `RM${Date.now().toString().slice(-8)}` : '',
          estimatedDelivery: new Date(orderDate.getTime() + 5 * 24 * 60 * 60 * 1000),
          actualDelivery: status === 'delivered' ? new Date(orderDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined,
          cost: shipping
        },
        status,
        tracking: [
          {
            status: 'order_placed',
            message: 'Order has been placed successfully',
            timestamp: orderDate
          },
          ...(status !== 'pending' ? [{
            status: 'confirmed',
            message: 'Order confirmed and being processed',
            timestamp: new Date(orderDate.getTime() + 2 * 60 * 60 * 1000)
          }] : []),
          ...(status === 'shipped' || status === 'delivered' ? [{
            status: 'shipped',
            message: 'Order has been shipped',
            timestamp: new Date(orderDate.getTime() + 3 * 24 * 60 * 60 * 1000)
          }] : []),
          ...(status === 'delivered' ? [{
            status: 'delivered',
            message: 'Order delivered successfully',
            timestamp: new Date(orderDate.getTime() + 5 * 24 * 60 * 60 * 1000)
          }] : [])
        ],
        notes: {
          customer: '',
          admin: ''
        },
        createdAt: orderDate,
        updatedAt: orderDate
      });
    }

    // Insert additional orders
    const createdOrders = await Order.insertMany(additionalOrders);
    console.log(`📦 Created ${createdOrders.length} additional orders`);

    // Generate additional users for better user analytics
    const additionalUsers = [];
    for (let i = 0; i < 20; i++) {
      const daysAgo = Math.floor(Math.random() * 60);
      const userDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      
      additionalUsers.push({
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        passwordHash: '$2a$12$dummy.hash.for.testing',
        role: 'user',
        isEmailVerified: true,
        isActive: Math.random() > 0.1, // 90% active users
        preferences: {
          favoriteCategories: ['shirts', 'jeans', 'jackets'],
          sizePreferences: {
            shirt: ['S', 'M', 'L', 'XL'][Math.floor(Math.random() * 4)],
            pants: ['30', '32', '34', '36'][Math.floor(Math.random() * 4)],
            shoes: ['7', '8', '9', '10'][Math.floor(Math.random() * 4)]
          }
        },
        createdAt: userDate,
        updatedAt: userDate
      });
    }

    const createdUsers = await User.insertMany(additionalUsers);
    console.log(`👥 Created ${createdUsers.length} additional users`);

    // Generate additional products for better product analytics
    const additionalProducts = [];
    const categories = ['shirts', 'jeans', 'jackets', 'tshirts', 'formal-shoes'];
    const brands = ['Manvue Essentials', 'Manvue Denim', 'Manvue Leather', 'Manvue Basics', 'Manvue Footwear'];
    
    for (let i = 0; i < 15; i++) {
      const daysAgo = Math.floor(Math.random() * 45);
      const productDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const category = categories[Math.floor(Math.random() * categories.length)];
      const brand = brands[Math.floor(Math.random() * brands.length)];
      
      additionalProducts.push({
        title: `Sample ${category.charAt(0).toUpperCase() + category.slice(1)} ${i + 1}`,
        description: `A sample ${category} product for testing analytics.`,
        shortDescription: `Sample ${category} product`,
        category: category,
        subCategory: 'casual',
        brand: { name: brand },
        price: { 
          original: Math.floor(Math.random() * 50) + 20, 
          selling: Math.floor(Math.random() * 40) + 15, 
          currency: 'GBP' 
        },
        discount: { 
          percentage: Math.floor(Math.random() * 30) + 10, 
          isActive: true 
        },
        variants: [{
          color: ['Black', 'White', 'Blue', 'Gray', 'Navy'][Math.floor(Math.random() * 5)],
          colorCode: '#000000',
          images: [{
            url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop',
            alt: `Sample ${category}`,
            isPrimary: true
          }],
          sizes: [
            { size: 'S', stock: Math.floor(Math.random() * 20) + 5, price: Math.floor(Math.random() * 40) + 15 },
            { size: 'M', stock: Math.floor(Math.random() * 25) + 10, price: Math.floor(Math.random() * 40) + 15 },
            { size: 'L', stock: Math.floor(Math.random() * 20) + 8, price: Math.floor(Math.random() * 40) + 15 },
            { size: 'XL', stock: Math.floor(Math.random() * 15) + 5, price: Math.floor(Math.random() * 40) + 15 }
          ]
        }],
        specifications: {
          material: '100% Cotton',
          care: 'Machine wash cold',
          fit: 'regular',
          pattern: 'solid',
          origin: 'UK'
        },
        tags: [category, 'sample', 'test'],
        features: ['Quality material', 'Comfortable fit'],
        isActive: true,
        isFeatured: Math.random() > 0.7,
        isNewArrival: daysAgo < 7,
        rating: { 
          average: Math.random() * 2 + 3, // 3-5 stars
          count: Math.floor(Math.random() * 100) + 10 
        },
        soldCount: Math.floor(Math.random() * 50) + 5,
        viewCount: Math.floor(Math.random() * 200) + 20,
        createdBy: (await User.findOne({ role: 'admin' }))._id,
        slug: `sample-${category}-${i + 1}`,
        createdAt: productDate,
        updatedAt: productDate
      });
    }

    const createdProducts = await Product.insertMany(additionalProducts);
    console.log(`🛍️ Created ${createdProducts.length} additional products`);

    // Calculate totals
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]);

    console.log('\n✅ Analytics data generated successfully!');
    console.log('\n📊 Updated Data Summary:');
    console.log(`   👤 Total Users: ${totalUsers}`);
    console.log(`   🛍️ Total Products: ${totalProducts}`);
    console.log(`   📦 Total Orders: ${totalOrders}`);
    console.log(`   💰 Total Revenue: £${totalRevenue[0]?.total?.toLocaleString('en-GB') || 0}`);
    console.log('\n🚀 Analytics charts should now show meaningful data!');

  } catch (error) {
    console.error('❌ Analytics data generation failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the function
if (require.main === module) {
  generateAnalyticsData();
}

module.exports = { generateAnalyticsData };
