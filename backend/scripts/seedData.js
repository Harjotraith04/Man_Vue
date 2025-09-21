require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');

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
    price: { original: 2499, selling: 1999, currency: 'INR' },
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
          { size: 'S', stock: 15, price: 1999 },
          { size: 'M', stock: 20, price: 1999 },
          { size: 'L', stock: 18, price: 1999 },
          { size: 'XL', stock: 12, price: 1999 }
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
      origin: 'India'
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
    price: { original: 3999, selling: 2999, currency: 'INR' },
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
          { size: '30', stock: 8, price: 2999 },
          { size: '32', stock: 15, price: 2999 },
          { size: '34', stock: 12, price: 2999 },
          { size: '36', stock: 10, price: 2999 }
        ]
      }
    ],
    specifications: {
      material: '98% Cotton, 2% Elastane',
      care: 'Machine wash cold inside out, hang dry',
      fit: 'slim',
      pattern: 'solid',
      origin: 'India'
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
    price: { original: 12999, selling: 9999, currency: 'INR' },
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
          { size: 'S', stock: 5, price: 9999 },
          { size: 'M', stock: 8, price: 9999 },
          { size: 'L', stock: 6, price: 9999 },
          { size: 'XL', stock: 4, price: 9999 }
        ]
      }
    ],
    specifications: {
      material: 'Genuine Leather',
      care: 'Professional leather cleaning only',
      fit: 'regular',
      pattern: 'solid',
      origin: 'India'
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
    price: { original: 899, selling: 699, currency: 'INR' },
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
          { size: 'S', stock: 25, price: 699 },
          { size: 'M', stock: 30, price: 699 },
          { size: 'L', stock: 28, price: 699 },
          { size: 'XL', stock: 20, price: 699 }
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
      origin: 'India'
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
    price: { original: 4999, selling: 3999, currency: 'INR' },
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
          { size: '7', stock: 6, price: 3999 },
          { size: '8', stock: 10, price: 3999 },
          { size: '9', stock: 12, price: 3999 },
          { size: '10', stock: 8, price: 3999 },
          { size: '11', stock: 5, price: 3999 }
        ]
      }
    ],
    specifications: {
      material: 'Genuine Leather',
      care: 'Wipe with dry cloth, use leather conditioner',
      fit: 'regular',
      pattern: 'solid',
      origin: 'India'
    },
    tags: ['shoes', 'formal', 'leather', 'oxford', 'office'],
    features: ['Genuine leather upper', 'Cushioned insole', 'Non-slip sole', 'Classic design'],
    isActive: true,
    isFeatured: true,
    rating: { average: 4.4, count: 67 },
    soldCount: 45
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/manvue');
    console.log('📦 Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Seed Users
    const users = [];
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.passwordHash, 12);
      users.push({
        ...userData,
        passwordHash: hashedPassword
      });
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

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📊 Sample Data Summary:');
    console.log(`   👤 Admin User: admin@manvue.com (password: admin123)`);
    console.log(`   👤 Test User: john@example.com (password: password123)`);
    console.log(`   🛍️ Products: ${createdProducts.length} sample products`);
    console.log(`   💰 Price Range: ₹699 - ₹9,999`);
    console.log(`   🏷️ Categories: shirts, jeans, jackets, tshirts, formal-shoes`);
    
    console.log('\n🚀 You can now start shopping on Manvue!');

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

module.exports = { seedDatabase, sampleUsers, sampleProducts };
