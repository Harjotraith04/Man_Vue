require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Sample data
const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@manvue.com',
    passwordHash: 'admin123',
    role: 'admin',
    isEmailVerified: true
  },
  {
    name: 'Sagar Jadhav',
    email: 'sagar.jadhav@gmail.com',
    googleId: 'google_sagar_123',
    role: 'user',
    isEmailVerified: true,
    preferences: {
      favoriteCategories: ['shirts', 'jeans', 'jackets'],
      sizePreferences: {
        shirt: 'L',
        pants: '32',
        shoes: '9'
      }
    }
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    passwordHash: 'password123',
    role: 'user',
    isEmailVerified: true,
    preferences: {
      favoriteCategories: ['shirts', 'jeans'],
      sizePreferences: {
        shirt: 'L',
        pants: '32',
        shoes: '9'
      }
    }
  }
];

const sampleProducts = [
  {
    title: 'Classic White Oxford Shirt',
    description: 'A timeless white oxford shirt perfect for both formal and casual occasions. Made from premium 100% cotton with a comfortable regular fit.',
    shortDescription: 'Classic white oxford shirt in premium cotton',
    category: 'shirts',
    subCategory: 'formal',
    brand: { name: 'Manvue Essentials' },
    price: { original: 25, selling: 20, currency: 'GBP' },
    discount: { percentage: 20, isActive: true },
    variants: [
      {
        color: 'White',
        colorCode: '#FFFFFF',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop',
            alt: 'White Oxford Shirt',
            isPrimary: true
          }
        ],
        sizes: [
          { size: 'S', stock: 15, price: 20 },
          { size: 'M', stock: 20, price: 20 },
          { size: 'L', stock: 18, price: 20 },
          { size: 'XL', stock: 12, price: 20 }
        ]
      }
    ],
    specifications: {
      material: '100% Cotton',
      care: 'Machine wash cold, tumble dry low',
      fit: 'regular',
      pattern: 'solid',
      sleeve: 'long sleeve',
      neckType: 'spread collar',
      origin: 'UK'
    },
    tags: ['formal', 'office', 'classic', 'cotton', 'white'],
    features: ['Wrinkle resistant', 'Breathable fabric', 'Professional look'],
    isActive: true,
    isFeatured: true,
    isNewArrival: true,
    rating: { average: 4.5, count: 127 },
    soldCount: 89
  },
  {
    title: 'Slim Fit Dark Blue Jeans',
    description: 'Premium slim-fit jeans in dark blue wash. Crafted from stretch denim for comfort and style. Perfect for casual and smart-casual occasions.',
    shortDescription: 'Slim fit dark blue stretch jeans',
    category: 'jeans',
    subCategory: 'casual',
    brand: { name: 'Manvue Denim' },
    price: { original: 40, selling: 30, currency: 'GBP' },
    discount: { percentage: 25, isActive: true },
    variants: [
      {
        color: 'Dark Blue',
        colorCode: '#1e3a8a',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop',
            alt: 'Dark Blue Jeans',
            isPrimary: true
          }
        ],
        sizes: [
          { size: '30', stock: 8, price: 30 },
          { size: '32', stock: 15, price: 30 },
          { size: '34', stock: 12, price: 30 },
          { size: '36', stock: 10, price: 30 }
        ]
      }
    ],
    specifications: {
      material: '98% Cotton, 2% Elastane',
      care: 'Machine wash cold inside out, hang dry',
      fit: 'slim',
      pattern: 'solid',
      origin: 'UK'
    },
    tags: ['casual', 'denim', 'slim fit', 'stretch', 'everyday'],
    features: ['Stretch comfort', 'Fade resistant', 'Classic 5-pocket design'],
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    rating: { average: 4.3, count: 203 },
    soldCount: 156
  },
  {
    title: 'Premium Black Leather Jacket',
    description: 'Genuine leather jacket in classic black. Features asymmetrical zip closure, multiple pockets, and quilted shoulder detailing. A timeless piece for your wardrobe.',
    shortDescription: 'Genuine black leather jacket with asymmetrical zip',
    category: 'jackets',
    subCategory: 'casual',
    brand: { name: 'Manvue Leather' },
    price: { original: 130, selling: 100, currency: 'GBP' },
    discount: { percentage: 23, isActive: true },
    variants: [
      {
        color: 'Black',
        colorCode: '#000000',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop',
            alt: 'Black Leather Jacket',
            isPrimary: true
          }
        ],
        sizes: [
          { size: 'S', stock: 5, price: 100 },
          { size: 'M', stock: 8, price: 100 },
          { size: 'L', stock: 6, price: 100 },
          { size: 'XL', stock: 4, price: 100 }
        ]
      }
    ],
    specifications: {
      material: 'Genuine Leather',
      care: 'Professional leather cleaning only',
      fit: 'regular',
      pattern: 'solid',
      origin: 'UK'
    },
    tags: ['jacket', 'leather', 'biker', 'edgy', 'premium'],
    features: ['Genuine leather', 'YKK zippers', 'Quilted shoulders', 'Multiple pockets'],
    isActive: true,
    isFeatured: true,
    rating: { average: 4.7, count: 45 },
    soldCount: 23
  },
  {
    title: 'Cotton Casual T-Shirt - Navy Blue',
    description: 'Comfortable cotton t-shirt in navy blue. Features crew neck design and relaxed fit. Perfect for everyday casual wear.',
    shortDescription: 'Navy blue cotton crew neck t-shirt',
    category: 'tshirts',
    subCategory: 'casual',
    brand: { name: 'Manvue Basics' },
    price: { original: 9, selling: 7, currency: 'GBP' },
    discount: { percentage: 22, isActive: true },
    variants: [
      {
        color: 'Navy Blue',
        colorCode: '#1e40af',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
            alt: 'Navy Blue T-Shirt',
            isPrimary: true
          }
        ],
        sizes: [
          { size: 'S', stock: 25, price: 7 },
          { size: 'M', stock: 30, price: 7 },
          { size: 'L', stock: 28, price: 7 },
          { size: 'XL', stock: 20, price: 7 }
        ]
      }
    ],
    specifications: {
      material: '100% Cotton',
      care: 'Machine wash cold, tumble dry low',
      fit: 'regular',
      pattern: 'solid',
      sleeve: 'short sleeve',
      neckType: 'crew neck',
      origin: 'UK'
    },
    tags: ['tshirt', 'casual', 'cotton', 'basic', 'everyday'],
    features: ['Soft cotton fabric', 'Pre-shrunk', 'Comfortable fit'],
    isActive: true,
    isNewArrival: true,
    rating: { average: 4.2, count: 89 },
    soldCount: 234
  },
  {
    title: 'Formal Black Leather Shoes',
    description: 'Classic oxford-style formal shoes in genuine black leather. Perfect for office wear and formal occasions. Features comfortable cushioned insole.',
    shortDescription: 'Classic black leather oxford formal shoes',
    category: 'formal-shoes',
    subCategory: 'formal',
    brand: { name: 'Manvue Footwear' },
    price: { original: 50, selling: 40, currency: 'GBP' },
    discount: { percentage: 20, isActive: true },
    variants: [
      {
        color: 'Black',
        colorCode: '#000000',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
            alt: 'Black Formal Shoes',
            isPrimary: true
          }
        ],
        sizes: [
          { size: '7', stock: 6, price: 40 },
          { size: '8', stock: 10, price: 40 },
          { size: '9', stock: 12, price: 40 },
          { size: '10', stock: 8, price: 40 },
          { size: '11', stock: 5, price: 40 }
        ]
      }
    ],
    specifications: {
      material: 'Genuine Leather',
      care: 'Wipe with dry cloth, use leather conditioner',
      fit: 'regular',
      pattern: 'solid',
      origin: 'UK'
    },
    tags: ['shoes', 'formal', 'leather', 'oxford', 'office'],
    features: ['Genuine leather upper', 'Cushioned insole', 'Non-slip sole', 'Classic design'],
    isActive: true,
    isFeatured: true,
    rating: { average: 4.4, count: 67 },
    soldCount: 45
  }
];

// Function to generate sample orders
function generateSampleOrders(users, products) {
  const customerUser = users.find(u => u.role === 'user');
  const sampleOrders = [];
  
  // Generate orders for the last 60 days
  const now = new Date();
  for (let i = 0; i < 25; i++) {
    const daysAgo = Math.floor(Math.random() * 60);
    const orderDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    // Randomly select 1-3 products for each order
    const numItems = Math.floor(Math.random() * 3) + 1;
    const selectedProducts = [];
    for (let j = 0; j < numItems; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const variant = product.variants[0];
      const size = variant.sizes[Math.floor(Math.random() * variant.sizes.length)];
      
      selectedProducts.push({
        product: product._id,
        title: product.title,
        image: variant.images[0].url,
        quantity: Math.floor(Math.random() * 2) + 1,
        size: size.size,
        color: variant.color,
        price: size.price,
        totalPrice: size.price * (Math.floor(Math.random() * 2) + 1)
      });
    }
    
    const subtotal = selectedProducts.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = Math.round(subtotal * 0.18); // 18% GST
    const shipping = subtotal > 50 ? 0 : 5; // Free shipping above £50
    const total = subtotal + tax + shipping;
    
    // Assign random status based on order age
    let status;
    if (daysAgo < 1) status = 'pending';
    else if (daysAgo < 3) status = 'confirmed';
    else if (daysAgo < 7) status = 'processing';
    else if (daysAgo < 14) status = 'shipped';
    else if (daysAgo < 45) status = 'delivered';
    else status = Math.random() > 0.9 ? 'cancelled' : 'delivered';
    
    const orderNumber = `ORD${Date.now().toString().slice(-6)}${i.toString().padStart(3, '0')}`;
    
    sampleOrders.push({
      orderNumber,
      user: customerUser._id,
      items: selectedProducts,
      pricing: {
        subtotal,
        discount: 0,
        tax,
        shipping,
        total
      },
      shippingAddress: {
        name: customerUser.name,
        phone: '+44 07741855104',
        email: customerUser.email,
        street: '123 Sample Street',
        city: 'London',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'UK'
      },
      billingAddress: {
        name: customerUser.name,
        phone: '+44 07741855104',
        email: customerUser.email,
        street: '123 Sample Street',
        city: 'London',
        state: 'Maharashtra',
        zipCode: '400001',
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
        provider: 'bluedart',
        trackingNumber: status === 'shipped' || status === 'delivered' ? `BLU${Date.now().toString().slice(-8)}` : '',
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
  
  return sampleOrders;
}

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/manvue');
    console.log('📦 Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Seed Users
    const users = [];
    for (const userData of sampleUsers) {
      if (userData.passwordHash) {
        const hashedPassword = await bcrypt.hash(userData.passwordHash, 12);
        users.push({
          ...userData,
          passwordHash: hashedPassword
        });
      } else {
        // For users without password (like Google users)
        users.push({
          ...userData
        });
      }
    }
    
    const createdUsers = await User.insertMany(users);
    console.log(`👥 Created ${createdUsers.length} users`);

    // Get admin user for product creation
    const adminUser = createdUsers.find(user => user.role === 'admin');

    // Seed Products
    const products = sampleProducts.map(product => ({
      ...product,
      createdBy: adminUser._id,
      slug: product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    }));

    const createdProducts = await Product.insertMany(products);
    console.log(`🛍️ Created ${createdProducts.length} products`);

    // Seed Orders
    const sampleOrdersData = generateSampleOrders(createdUsers, createdProducts);
    const createdOrders = await Order.insertMany(sampleOrdersData);
    console.log(`📦 Created ${createdOrders.length} orders`);

    // Calculate total revenue for summary
    const totalRevenue = createdOrders.reduce((sum, order) => sum + order.pricing.total, 0);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📊 Sample Data Summary:');
    console.log(`   👤 Admin User: admin@manvue.com (password: admin123)`);
    console.log(`   👤 Test User: john@example.com (password: password123)`);
    console.log(`   🛍️ Products: ${createdProducts.length} sample products`);
    console.log(`   📦 Orders: ${createdOrders.length} sample orders`);
    console.log(`   💰 Total Revenue: £${totalRevenue.toLocaleString('en-GB')}`);
    console.log(`   🏷️ Categories: shirts, jeans, jackets, tshirts, formal-shoes`);
    console.log(`   📈 Order Statuses: pending, confirmed, processing, shipped, delivered`);
    
    console.log('\n🚀 You can now start using the admin dashboard with real data!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seed function
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, sampleUsers, sampleProducts, generateSampleOrders };
