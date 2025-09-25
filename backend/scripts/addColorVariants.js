require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

// Color variants to add
const colorVariants = [
  {
    color: 'Red',
    colorCode: '#FF0000',
    images: [{
      url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop&auto=format&q=80',
      alt: 'Red Shirt',
      isPrimary: true
    }],
    sizes: [
      { size: 'S', stock: 15, price: 15 },
      { size: 'M', stock: 20, price: 15 },
      { size: 'L', stock: 18, price: 15 },
      { size: 'XL', stock: 12, price: 15 }
    ]
  },
  {
    color: 'Blue',
    colorCode: '#0000FF',
    images: [{
      url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop&auto=format&q=80',
      alt: 'Blue Shirt',
      isPrimary: true
    }],
    sizes: [
      { size: 'S', stock: 15, price: 15 },
      { size: 'M', stock: 20, price: 15 },
      { size: 'L', stock: 18, price: 15 },
      { size: 'XL', stock: 12, price: 15 }
    ]
  },
  {
    color: 'Black',
    colorCode: '#000000',
    images: [{
      url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop&auto=format&q=80',
      alt: 'Black Shirt',
      isPrimary: true
    }],
    sizes: [
      { size: 'S', stock: 15, price: 15 },
      { size: 'M', stock: 20, price: 15 },
      { size: 'L', stock: 18, price: 15 },
      { size: 'XL', stock: 12, price: 15 }
    ]
  }
];

async function addColorVariants() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/manvue');
    console.log('📦 Connected to MongoDB');

    // Get some shirt products
    const shirtProducts = await Product.find({ 
      category: 'shirts',
      isActive: true 
    }).limit(3);

    console.log(`Found ${shirtProducts.length} shirt products`);

    for (const product of shirtProducts) {
      console.log(`Adding color variants to: ${product.title}`);
      
      // Add color variants
      product.variants.push(...colorVariants);
      
      // Update tags to include colors
      const colorTags = colorVariants.map(v => v.color.toLowerCase());
      product.tags = [...new Set([...product.tags, ...colorTags])];
      
      await product.save();
      console.log(`✅ Added color variants to ${product.title}`);
    }

    console.log('\n✅ Color variants added successfully!');
    console.log('Now you can test color-specific searches like "red shirts" or "blue shirts"');

  } catch (error) {
    console.error('❌ Error adding color variants:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📦 Disconnected from MongoDB');
  }
}

addColorVariants();
