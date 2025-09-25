require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

// Color-specific image URLs
const colorImages = {
  'Red': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop&auto=format&q=80&sat=-100&hue=0deg', // Red tinted
  'Blue': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop&auto=format&q=80&sat=-100&hue=240deg', // Blue tinted
  'Black': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop&auto=format&q=80&sat=-100&hue=0deg&brightness=-50', // Darker
  'White': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop&auto=format&q=80&sat=-100&hue=0deg&brightness=50', // Lighter
  'Green': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop&auto=format&q=80&sat=-100&hue=120deg', // Green tinted
  'Navy': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop&auto=format&q=80&sat=-100&hue=240deg&brightness=-30', // Navy
  'Gray': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop&auto=format&q=80&sat=-100&hue=0deg&brightness=-20', // Gray
  'Grey': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop&auto=format&q=80&sat=-100&hue=0deg&brightness=-20' // Grey
};

async function updateColorImages() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/manvue');
    console.log('📦 Connected to MongoDB');

    // Get products with color variants
    const products = await Product.find({ 
      'variants.color': { $ne: 'Default' },
      isActive: true 
    });

    console.log(`Found ${products.length} products with color variants`);

    for (const product of products) {
      let updated = false;
      
      for (const variant of product.variants) {
        if (variant.color !== 'Default' && colorImages[variant.color]) {
          // Update the image URL for this color variant
          if (variant.images && variant.images.length > 0) {
            variant.images[0].url = colorImages[variant.color];
            variant.images[0].alt = `${variant.color} ${product.title}`;
            updated = true;
          }
        }
      }
      
      if (updated) {
        await product.save();
        console.log(`✅ Updated color images for: ${product.title}`);
      }
    }

    console.log('\n✅ Color images updated successfully!');
    console.log('Now each color variant will have a distinct image');

  } catch (error) {
    console.error('❌ Error updating color images:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📦 Disconnected from MongoDB');
  }
}

updateColorImages();
