require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
const fs = require('fs').promises;
const path = require('path');
const { cloudinary } = require('../config/cloudinary');

// Category mapping from folder names to proper product categories
const CATEGORY_MAPPING = {
  'Accessories': {
    category: 'accessories',
    subCategory: 'casual',
    basePrice: { original: 1499, selling: 999 }
  },
  'Ethnic': {
    category: 'kurtas',
    subCategory: 'formal',
    basePrice: { original: 2999, selling: 2199 }
  },
  'Formal': {
    category: 'shirts',
    subCategory: 'formal',
    basePrice: { original: 2499, selling: 1899 }
  },
  'Jeans': {
    category: 'jeans',
    subCategory: 'casual',
    basePrice: { original: 3499, selling: 2599 }
  },
  'Shirts': {
    category: 'shirts',
    subCategory: 'casual',
    basePrice: { original: 1999, selling: 1499 }
  },
  'Shoes': {
    category: 'shoes',
    subCategory: 'casual',
    basePrice: { original: 4999, selling: 3499 }
  },
  'T-Shirts': {
    category: 'tshirts',
    subCategory: 'casual',
    basePrice: { original: 899, selling: 699 }
  }
};

// Brand names based on category
const BRAND_MAPPING = {
  'accessories': 'ManVue Accessories',
  'kurtas': 'ManVue Ethnic',
  'shirts': 'ManVue Formals',
  'jeans': 'ManVue Denim',
  'shoes': 'ManVue Footwear',
  'tshirts': 'ManVue Basics'
};

// Generate product specifications based on category
function generateSpecifications(categoryInfo, folderName) {
  const baseSpecs = {
    origin: 'India',
    care: 'Follow care label instructions'
  };

  switch (categoryInfo.category) {
    case 'accessories':
      return {
        ...baseSpecs,
        material: 'Mixed Materials',
        fit: 'regular',
        care: 'Wipe clean with soft cloth'
      };
    case 'kurtas':
      return {
        ...baseSpecs,
        material: '100% Cotton',
        fit: 'regular',
        pattern: 'ethnic',
        sleeve: 'long sleeve',
        neckType: 'traditional collar',
        care: 'Machine wash cold, iron on medium heat'
      };
    case 'shirts':
      return {
        ...baseSpecs,
        material: folderName === 'Formal' ? '65% Cotton, 35% Polyester' : '100% Cotton',
        fit: 'regular',
        pattern: 'solid',
        sleeve: 'long sleeve',
        neckType: folderName === 'Formal' ? 'spread collar' : 'button-down collar',
        care: 'Machine wash cold, iron on medium heat'
      };
    case 'jeans':
      return {
        ...baseSpecs,
        material: '98% Cotton, 2% Elastane',
        fit: 'slim',
        pattern: 'solid',
        care: 'Machine wash cold inside out, hang dry'
      };
    case 'shoes':
      return {
        ...baseSpecs,
        material: 'Synthetic Leather',
        fit: 'regular',
        pattern: 'solid',
        care: 'Wipe with dry cloth, use appropriate shoe care products'
      };
    case 'tshirts':
      return {
        ...baseSpecs,
        material: '100% Cotton',
        fit: 'regular',
        pattern: 'solid',
        sleeve: 'short sleeve',
        neckType: 'crew neck',
        care: 'Machine wash cold, tumble dry low'
      };
    default:
      return baseSpecs;
  }
}

// Generate sizes based on category
function generateSizes(categoryInfo) {
  const baseStock = Math.floor(Math.random() * 20) + 10; // 10-30 items
  
  switch (categoryInfo.category) {
    case 'shoes':
      return [
        { size: '7', stock: baseStock, price: categoryInfo.basePrice.selling },
        { size: '8', stock: baseStock + 5, price: categoryInfo.basePrice.selling },
        { size: '9', stock: baseStock + 8, price: categoryInfo.basePrice.selling },
        { size: '10', stock: baseStock + 3, price: categoryInfo.basePrice.selling },
        { size: '11', stock: baseStock, price: categoryInfo.basePrice.selling }
      ];
    case 'jeans':
      return [
        { size: '30', stock: baseStock, price: categoryInfo.basePrice.selling },
        { size: '32', stock: baseStock + 5, price: categoryInfo.basePrice.selling },
        { size: '34', stock: baseStock + 3, price: categoryInfo.basePrice.selling },
        { size: '36', stock: baseStock, price: categoryInfo.basePrice.selling },
        { size: '38', stock: baseStock - 2, price: categoryInfo.basePrice.selling }
      ];
    case 'accessories':
      return [
        { size: 'One Size', stock: baseStock + 10, price: categoryInfo.basePrice.selling }
      ];
    default: // shirts, kurtas, tshirts
      return [
        { size: 'S', stock: baseStock, price: categoryInfo.basePrice.selling },
        { size: 'M', stock: baseStock + 8, price: categoryInfo.basePrice.selling },
        { size: 'L', stock: baseStock + 5, price: categoryInfo.basePrice.selling },
        { size: 'XL', stock: baseStock + 2, price: categoryInfo.basePrice.selling },
        { size: 'XXL', stock: baseStock - 3, price: categoryInfo.basePrice.selling }
      ];
  }
}

// Generate tags based on category
function generateTags(categoryInfo, folderName) {
  const baseTags = [categoryInfo.category, categoryInfo.subCategory, 'manvue'];
  
  switch (categoryInfo.category) {
    case 'accessories':
      return [...baseTags, 'fashion', 'style', 'trendy'];
    case 'kurtas':
      return [...baseTags, 'ethnic', 'traditional', 'festival', 'cotton'];
    case 'shirts':
      return folderName === 'Formal' 
        ? [...baseTags, 'office', 'business', 'professional', 'formal']
        : [...baseTags, 'casual', 'everyday', 'cotton', 'comfortable'];
    case 'jeans':
      return [...baseTags, 'denim', 'casual', 'everyday', 'stretch', 'comfortable'];
    case 'shoes':
      return [...baseTags, 'footwear', 'comfortable', 'durable', 'style'];
    case 'tshirts':
      return [...baseTags, 'casual', 'cotton', 'basic', 'everyday', 'comfortable'];
    default:
      return baseTags;
  }
}

// Generate features based on category
function generateFeatures(categoryInfo, folderName) {
  switch (categoryInfo.category) {
    case 'accessories':
      return ['Premium quality', 'Versatile design', 'Perfect for any occasion'];
    case 'kurtas':
      return ['Traditional craftsmanship', 'Comfortable fit', 'Perfect for festivals'];
    case 'shirts':
      return folderName === 'Formal' 
        ? ['Wrinkle resistant', 'Professional look', 'All-day comfort']
        : ['Soft cotton fabric', 'Breathable', 'Easy care'];
    case 'jeans':
      return ['Stretch comfort', 'Fade resistant', 'Classic 5-pocket design'];
    case 'shoes':
      return ['Comfortable fit', 'Durable construction', 'Stylish design'];
    case 'tshirts':
      return ['Soft cotton fabric', 'Pre-shrunk', 'Comfortable fit'];
    default:
      return ['High quality', 'Great value', 'Comfortable fit'];
  }
}

// Upload image to Cloudinary
async function uploadImageToCloudinary(imagePath, productTitle) {
  try {
    console.log(`Uploading ${imagePath} to Cloudinary...`);
    
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: 'manvue/kaggle-products',
      transformation: [
        { width: 800, height: 800, crop: 'fill', quality: 'auto' }
      ],
      resource_type: 'image'
    });
    
    return {
      url: result.secure_url,
      alt: productTitle,
      isPrimary: true
    };
  } catch (error) {
    console.error(`Failed to upload ${imagePath}:`, error.message);
    return null;
  }
}

// Generate product title based on image name and category
function generateProductTitle(imageName, categoryInfo, folderName) {
  const baseNumber = imageName.replace('.jpg', '');
  const categoryName = folderName === 'T-Shirts' ? 'T-Shirt' : folderName.slice(0, -1); // Remove 's' from plural
  
  const adjectives = {
    'Accessories': ['Stylish', 'Premium', 'Classic', 'Modern', 'Trendy'],
    'Ethnic': ['Traditional', 'Elegant', 'Premium', 'Festive', 'Classic'],
    'Formal': ['Professional', 'Business', 'Executive', 'Premium', 'Classic'],
    'Jeans': ['Slim Fit', 'Classic', 'Modern', 'Comfortable', 'Stylish'],
    'Shirts': ['Casual', 'Premium', 'Classic', 'Modern', 'Comfortable'],
    'Shoes': ['Comfortable', 'Stylish', 'Premium', 'Classic', 'Durable'],
    'T-Shirts': ['Casual', 'Premium', 'Basic', 'Comfortable', 'Classic']
  };
  
  const randomAdjective = adjectives[folderName][Math.floor(Math.random() * adjectives[folderName].length)];
  
  return `${randomAdjective} ${categoryName} - Style ${baseNumber}`;
}

// Generate product description based on category
function generateProductDescription(title, categoryInfo, folderName) {
  const descriptions = {
    'Accessories': `${title} - A perfect accessory to complement your style. Made with attention to detail and quality materials for long-lasting use.`,
    'Ethnic': `${title} - Traditional ethnic wear crafted with premium materials. Perfect for festivals, celebrations, and special occasions.`,
    'Formal': `${title} - Professional formal wear designed for the modern workplace. Combines comfort with sophisticated style.`,
    'Jeans': `${title} - Premium denim with perfect fit and comfort. Made from high-quality fabric with stretch for all-day comfort.`,
    'Shirts': `${title} - Comfortable and stylish shirt perfect for casual wear. Made from quality materials for durability and comfort.`,
    'Shoes': `${title} - Comfortable and stylish footwear designed for everyday wear. Combines durability with modern design.`,
    'T-Shirts': `${title} - Essential casual wear made from soft, breathable cotton. Perfect for everyday comfort and style.`
  };
  
  return descriptions[folderName] || `${title} - High-quality ${categoryInfo.category} for modern lifestyle.`;
}

// Main import function
async function importKaggleData() {
  try {
    console.log('🚀 Starting Kaggle Data Import...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/manvue');
    console.log('📦 Connected to MongoDB');
    
    // Get admin user for product creation
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      throw new Error('Admin user not found. Please run seedData.js first to create admin user.');
    }
    
    const kaggleDataPath = path.join(__dirname, '..', 'Kaggle_Data', 'Kaggle_Data');
    console.log(`📁 Reading from: ${kaggleDataPath}`);
    
    // Get all category folders
    const folders = await fs.readdir(kaggleDataPath);
    console.log(`📂 Found categories: ${folders.join(', ')}`);
    
    let totalImported = 0;
    const importResults = {};
    
    for (const folder of folders) {
      console.log(`\n🔄 Processing category: ${folder}`);
      
      if (!CATEGORY_MAPPING[folder]) {
        console.log(`⚠️ Skipping unknown category: ${folder}`);
        continue;
      }
      
      const categoryInfo = CATEGORY_MAPPING[folder];
      const folderPath = path.join(kaggleDataPath, folder);
      
      // Get all images in the folder
      const imageFiles = await fs.readdir(folderPath);
      const jpgFiles = imageFiles.filter(file => file.toLowerCase().endsWith('.jpg'));
      
      console.log(`📷 Found ${jpgFiles.length} images in ${folder}`);
      
      let categoryImported = 0;
      
      for (const imageFile of jpgFiles) {
        try {
          const imagePath = path.join(folderPath, imageFile);
          const productTitle = generateProductTitle(imageFile, categoryInfo, folder);
          
          console.log(`📤 Processing: ${productTitle}`);
          
          // Upload image to Cloudinary
          const uploadedImage = await uploadImageToCloudinary(imagePath, productTitle);
          
          if (!uploadedImage) {
            console.log(`❌ Failed to upload image for: ${productTitle}`);
            continue;
          }
          
          // Generate product data
          const productData = {
            title: productTitle,
            slug: productTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
            description: generateProductDescription(productTitle, categoryInfo, folder),
            shortDescription: `${productTitle} - Premium quality ${categoryInfo.category}`,
            category: categoryInfo.category,
            subCategory: categoryInfo.subCategory,
            brand: { 
              name: BRAND_MAPPING[categoryInfo.category] || 'ManVue',
              logo: ''
            },
            price: {
              original: categoryInfo.basePrice.original,
              selling: categoryInfo.basePrice.selling,
              currency: 'INR'
            },
            discount: {
              percentage: Math.round(((categoryInfo.basePrice.original - categoryInfo.basePrice.selling) / categoryInfo.basePrice.original) * 100),
              isActive: true,
              validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
            },
            variants: [{
              color: 'Default',
              colorCode: '#000000',
              images: [uploadedImage],
              sizes: generateSizes(categoryInfo)
            }],
            defaultVariant: {
              color: 'Default',
              size: categoryInfo.category === 'shoes' ? '9' : 
                    categoryInfo.category === 'jeans' ? '32' : 
                    categoryInfo.category === 'accessories' ? 'One Size' : 'M'
            },
            specifications: generateSpecifications(categoryInfo, folder),
            tags: generateTags(categoryInfo, folder),
            features: generateFeatures(categoryInfo, folder),
            isActive: true,
            isFeatured: Math.random() > 0.7, // 30% chance to be featured
            isNewArrival: true,
            isBestSeller: Math.random() > 0.8, // 20% chance to be best seller
            inventory: {
              totalStock: generateSizes(categoryInfo).reduce((total, size) => total + size.stock, 0),
              lowStockThreshold: 5,
              trackQuantity: true
            },
            rating: {
              average: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 to 5.0 rating
              count: Math.floor(Math.random() * 100) + 10 // 10-110 reviews
            },
            viewCount: Math.floor(Math.random() * 500),
            soldCount: Math.floor(Math.random() * 100),
            createdBy: adminUser._id,
            seo: {
              metaTitle: productTitle,
              metaDescription: generateProductDescription(productTitle, categoryInfo, folder).substring(0, 160),
              keywords: generateTags(categoryInfo, folder)
            }
          };
          
          // Create product in database
          const product = new Product(productData);
          await product.save();
          
          categoryImported++;
          totalImported++;
          
          console.log(`✅ Imported: ${productTitle} (${categoryImported}/${jpgFiles.length})`);
          
        } catch (error) {
          console.error(`❌ Failed to import ${imageFile}:`, error.message);
        }
      }
      
      importResults[folder] = {
        total: jpgFiles.length,
        imported: categoryImported,
        success: categoryImported === jpgFiles.length
      };
      
      console.log(`📊 ${folder}: ${categoryImported}/${jpgFiles.length} products imported`);
    }
    
    console.log('\n🎉 Kaggle Data Import Completed!');
    console.log(`📈 Total products imported: ${totalImported}`);
    console.log('\n📊 Import Summary:');
    
    Object.entries(importResults).forEach(([category, result]) => {
      const status = result.success ? '✅' : '⚠️';
      console.log(`   ${status} ${category}: ${result.imported}/${result.total} products`);
    });
    
    // Get final counts by category
    console.log('\n📦 Products by Category:');
    for (const [folderName, categoryInfo] of Object.entries(CATEGORY_MAPPING)) {
      const count = await Product.countDocuments({ category: categoryInfo.category });
      console.log(`   📁 ${folderName} (${categoryInfo.category}): ${count} products`);
    }
    
    console.log('\n🚀 All products are now available in both admin and customer interfaces!');
    console.log('💡 Access admin panel to manage products');
    console.log('🛍️ Visit the shop to browse imported products');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the import function
if (require.main === module) {
  importKaggleData();
}

module.exports = { importKaggleData };
