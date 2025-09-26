const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function createTestUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/manvue');
    console.log('✅ Connected to MongoDB');

    // Check if test user exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('✅ Test user already exists:', existingUser.email);
      return existingUser;
    }

    // Create test user
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: '$2b$10$rOWHLV8SJ9SgMPZvfY/RGuwKd1d1RjHv8jkwQNFjVL9QYDvf8Zn9e', // password: 'test123'
      role: 'user',
      isActive: true,
      preferences: {
        newsletter: false,
        notifications: true,
        favoriteCategories: [],
        sizePreferences: {
          shirt: 'M',
          pants: '32',
          shoes: '9'
        }
      },
      cart: [],
      wishlist: [],
      orderHistory: []
    });

    await testUser.save();
    console.log('✅ Test user created successfully!');
    console.log('Email: test@example.com');
    console.log('Password: test123');

    return testUser;
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  createTestUser()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = createTestUser;
