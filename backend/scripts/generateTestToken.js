const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

async function generateTestToken() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/manvue');
    console.log('✅ Connected to MongoDB');

    // Find the test user
    const user = await User.findOne({ email: 'test@example.com' });
    
    if (!user) {
      console.log('❌ Test user not found');
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '30d' }
    );

    console.log('\n🎫 Test User Login Token:');
    console.log('📧 Email: test@example.com');
    console.log('🔐 Password: test123');
    console.log('🎯 User ID:', user._id.toString());
    console.log('🔑 Token:', token);
    console.log('\n📋 Use this token in your API requests:');
    console.log(`Authorization: Bearer ${token}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n📤 Disconnected from MongoDB');
  }
}

generateTestToken();
