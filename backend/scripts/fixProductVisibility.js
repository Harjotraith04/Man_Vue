const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

async function fixProductVisibility() {
  try {
    // Connect to database
    const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/manvue';
    await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check current status of products
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const inactiveProducts = await Product.countDocuments({ isActive: false });

    console.log(`📊 Product Status:`);
    console.log(`   Total products: ${totalProducts}`);
    console.log(`   Active products: ${activeProducts}`);
    console.log(`   Inactive products: ${inactiveProducts}`);

    if (inactiveProducts > 0) {
      console.log('\n🔧 Fixing inactive products...');
      
      // Update all products to be active
      const result = await Product.updateMany(
        { isActive: { $ne: true } }, 
        { $set: { isActive: true } }
      );
      
      console.log(`✅ Updated ${result.modifiedCount} products to active status`);
    } else {
      console.log('\n✅ All products are already active');
    }

    // Show some sample products
    console.log('\n📋 Sample products:');
    const sampleProducts = await Product.find()
      .limit(5)
      .select('title isActive createdAt')
      .sort({ createdAt: -1 });

    sampleProducts.forEach(product => {
      console.log(`   - ${product.title} (Active: ${product.isActive}, Created: ${product.createdAt})`);
    });

    console.log('\n✅ Product visibility fix completed');
  } catch (error) {
    console.error('❌ Error fixing product visibility:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

if (require.main === module) {
  fixProductVisibility();
}

module.exports = fixProductVisibility;
