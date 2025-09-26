const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
require('dotenv').config();

async function checkUser() {
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

    console.log('👤 User found:', {
      id: user._id,
      email: user.email,
      wishlistLength: user.wishlist?.length || 0,
      cartLength: user.cart?.length || 0
    });

    // Check wishlist
    console.log('\n📋 Raw wishlist:', user.wishlist);
    
    // Try to populate wishlist manually
    try {
      const userWithWishlist = await User.findById(user._id).populate({
        path: 'wishlist',
        match: { isActive: true },
        select: 'title slug price.selling discount primaryImage rating.average category brand.name'
      });
      
      console.log('✅ Populated wishlist:', userWithWishlist.wishlist);
    } catch (popError) {
      console.error('❌ Populate wishlist error:', popError.message);
      
      // Try without match condition
      const userWithWishlistSimple = await User.findById(user._id).populate('wishlist');
      console.log('📋 Simple populated wishlist:', userWithWishlistSimple.wishlist);
    }

    // Check cart
    console.log('\n🛒 Raw cart:', user.cart);

    // Get a sample product to test with
    const sampleProduct = await Product.findOne({ isActive: true });
    console.log('\n📦 Sample product for testing:', sampleProduct ? {
      id: sampleProduct._id,
      title: sampleProduct.title,
      isActive: sampleProduct.isActive
    } : 'No products found');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
  }
}

checkUser();
