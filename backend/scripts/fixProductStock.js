const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

async function fixProductStock() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/manvue');
    console.log('✅ Connected to MongoDB');

    // Find products with variants that have no stock
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products to check`);

    let fixedCount = 0;

    for (const product of products) {
      let needsUpdate = false;
      
      // Fix variants with zero or missing stock
      product.variants = product.variants.map(variant => {
        const fixedSizes = variant.sizes.map(size => {
          if (!size.stock || size.stock === 0) {
            needsUpdate = true;
            return {
              ...size,
              stock: Math.floor(Math.random() * 50) + 10 // Random stock between 10-60
            };
          }
          return size;
        });
        
        return {
          ...variant,
          sizes: fixedSizes
        };
      });

      // Update total inventory count
      if (needsUpdate) {
        const totalStock = product.variants.reduce((total, variant) => {
          return total + variant.sizes.reduce((variantTotal, size) => variantTotal + size.stock, 0);
        }, 0);

        product.inventory.totalStock = totalStock;
        
        await product.save();
        fixedCount++;
        console.log(`🔧 Fixed stock for: ${product.title}`);
      }
    }

    console.log(`✅ Fixed stock for ${fixedCount} products`);

    // Get a few sample products to show they're working
    const sampleProducts = await Product.find({}).limit(3);
    console.log('\n📋 Sample products with stock:');
    sampleProducts.forEach(product => {
      const firstVariant = product.variants[0];
      if (firstVariant && firstVariant.sizes.length > 0) {
        const firstSize = firstVariant.sizes[0];
        console.log(`- ${product.title}: ${firstVariant.color}/${firstSize.size} (Stock: ${firstSize.stock})`);
      }
    });

  } catch (error) {
    console.error('❌ Error fixing product stock:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\n📤 Disconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  fixProductStock()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = fixProductStock;
