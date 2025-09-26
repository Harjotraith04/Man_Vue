const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

async function fixProductVariants() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/manvue');
    console.log('✅ Connected to MongoDB');

    // Find all products with malformed variants
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products to check`);

    let fixedCount = 0;

    for (const product of products) {
      let needsFix = false;
      
      // Check if variants need fixing
      for (const variant of product.variants) {
        if (typeof variant.sizes === 'string' || !Array.isArray(variant.sizes)) {
          needsFix = true;
          break;
        }
      }

      if (needsFix) {
        // Fix the variant structure
        product.variants = product.variants.map(variant => ({
          color: variant.color || 'Default',
          colorCode: variant.colorCode || '#000000',
          images: Array.isArray(variant.images) ? variant.images : [
            {
              url: product.primaryImage || '',
              alt: product.title,
              isPrimary: true
            }
          ],
          sizes: [
            { size: 'S', stock: 50, price: product.price.selling },
            { size: 'M', stock: 100, price: product.price.selling },
            { size: 'L', stock: 75, price: product.price.selling },
            { size: 'XL', stock: 25, price: product.price.selling },
            { size: 'XXL', stock: 10, price: product.price.selling }
          ]
        }));

        // Also add common colors if only has Default
        if (product.variants.length === 1 && product.variants[0].color === 'Default') {
          const colors = ['Black', 'White', 'Blue', 'Gray'];
          const colorCodes = ['#000000', '#FFFFFF', '#0066CC', '#666666'];
          
          // Keep the existing Default variant and add others
          const baseVariant = product.variants[0];
          product.variants = [
            baseVariant,
            ...colors.map((color, index) => ({
              color: color,
              colorCode: colorCodes[index],
              images: baseVariant.images,
              sizes: baseVariant.sizes.map(size => ({ ...size })) // Copy sizes
            }))
          ];
        }

        await product.save();
        fixedCount++;
        console.log(`🔧 Fixed product: ${product.title} (${product._id})`);
      }
    }

    console.log(`✅ Fixed ${fixedCount} products with malformed variants`);

    // Verify the fixes
    const sampleProduct = await Product.findOne({}).lean();
    console.log('\n📋 Sample product variant structure:');
    console.log(JSON.stringify(sampleProduct.variants[0], null, 2));

  } catch (error) {
    console.error('❌ Error fixing product variants:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  fixProductVariants()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = fixProductVariants;
