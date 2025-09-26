# 📊 Dataset Setup Guide

This guide will help you set up and import datasets for the ManVue e-commerce platform.

## 🎯 Overview

The ManVue platform supports importing product datasets from various sources:
- **Kaggle Datasets** - Fashion product datasets
- **Manual Import** - Custom product data
- **CSV Import** - Bulk product import
- **API Integration** - External data sources

## 🚀 Quick Start

### 1. Prerequisites
- **Python 3.7+** installed
- **Node.js** (v18 or higher)
- **MongoDB** running
- **Cloudinary** account for image storage

### 2. Install Python Dependencies
```bash
# Install Kaggle API
pip install kaggle

# Or using pip3
pip3 install kaggle
```

### 3. Set Up Kaggle Credentials

#### Option A: Environment Variables (Recommended)
Add to your backend `.env` file:
```env
KAGGLE_USERNAME=your_kaggle_username
KAGGLE_KEY=your_kaggle_api_key
```

#### Option B: Kaggle JSON File
1. Go to [Kaggle Account Settings](https://www.kaggle.com/account)
2. Click "Create New API Token"
3. Download `kaggle.json`
4. Place it in your home directory:
   - **Windows**: `C:\Users\YourUsername\.kaggle\kaggle.json`
   - **Mac/Linux**: `~/.kaggle/kaggle.json`

### 4. Test Your Setup
```bash
cd backend
npm run test-kaggle
```

## 📥 Kaggle Dataset Import

### Available Datasets
The platform is configured to work with these popular fashion datasets:

1. **Men's Fashion Dataset**
   - Dataset ID: `men-fashion-dataset`
   - Categories: Shirts, T-Shirts, Jeans, Shoes, Accessories
   - Images: ~44,000 product images

2. **Fashion Product Images**
   - Dataset ID: `fashion-product-images`
   - Categories: Multiple fashion categories
   - Images: High-quality product photos

### Import Process

#### Method 1: Automated Import (Recommended)
```bash
cd backend
npm run import-kaggle
```

#### Method 2: Manual Import
```bash
# 1. Test setup
npm run test-kaggle

# 2. Run import script
node scripts/importKaggleData.js
```

#### Method 3: Admin Panel Import
1. Start the backend server: `npm run dev`
2. Open admin panel: `http://localhost:5173/admin`
3. Navigate to "Dataset Import"
4. Click "Import Kaggle Dataset"

### What Happens During Import

1. **Dataset Download**: Downloads the Kaggle dataset
2. **Image Processing**: Processes and optimizes images
3. **Cloudinary Upload**: Uploads images to Cloudinary
4. **Database Creation**: Creates product records in MongoDB
5. **Category Mapping**: Maps dataset categories to platform categories
6. **SEO Optimization**: Generates meta data and SEO content

### Import Statistics
- **Processing Time**: 30-60 minutes (depending on dataset size)
- **Images Processed**: ~44,000 product images
- **Products Created**: ~44,000 product records
- **Categories**: 6 main categories (Shirts, T-Shirts, Jeans, Shoes, Accessories, Formal)

## 📁 Manual Dataset Import

### Folder Structure
Organize your images in the following structure:
```
backend/Kaggle_Data/Kaggle_Data/
├── Accessories/
│   ├── image1.jpg
│   ├── image2.jpg
│   └── ...
├── Ethnic/
│   ├── image1.jpg
│   └── ...
├── Formal/
│   ├── image1.jpg
│   └── ...
├── Jeans/
│   ├── image1.jpg
│   └── ...
├── Shirts/
│   ├── image1.jpg
│   └── ...
├── Shoes/
│   ├── image1.jpg
│   └── ...
└── T-Shirts/
    ├── image1.jpg
    └── ...
```

### Category Mapping
The import script maps folder names to platform categories:

| Folder Name | Platform Category | Description |
|-------------|------------------|--------------|
| Accessories | `accessories` | Belts, watches, bags, etc. |
| Ethnic | `kurtas` | Traditional ethnic wear |
| Formal | `shirts` | Formal shirts and dress shirts |
| Jeans | `jeans` | Denim jeans and pants |
| Shirts | `shirts` | Casual shirts |
| Shoes | `shoes` | Footwear |
| T-Shirts | `tshirts` | T-shirts and casual tops |

### Import Your Custom Dataset
1. **Prepare Images**: Place images in the correct folder structure
2. **Run Import**: Execute the import script
3. **Verify Results**: Check the admin panel for imported products

```bash
# Import custom dataset
cd backend
node scripts/importKaggleData.js
```

## 📊 CSV Dataset Import

### CSV Format
Create a CSV file with the following columns:

```csv
name,description,price,originalPrice,category,subcategory,brand,imageUrl,stock,rating
"Men's Cotton T-Shirt","Comfortable cotton t-shirt",29.99,39.99,"tshirts","casual","BrandName","https://example.com/image.jpg",100,4.5
```

### Required Columns
- `name` - Product name
- `description` - Product description
- `price` - Current price
- `originalPrice` - Original price (for discounts)
- `category` - Product category
- `subcategory` - Product subcategory
- `brand` - Brand name
- `imageUrl` - Image URL or path
- `stock` - Stock quantity
- `rating` - Product rating (1-5)

### Optional Columns
- `sizes` - Available sizes (comma-separated)
- `colors` - Available colors (comma-separated)
- `tags` - Product tags (comma-separated)
- `specifications` - Product specifications (JSON string)
- `isActive` - Product status (true/false)

### Import CSV Data
```bash
# Create CSV import script
node scripts/importCSVData.js --file=path/to/your/data.csv
```

## 🔧 Configuration

### Environment Variables
Add these to your backend `.env` file:

```env
# Kaggle Configuration
KAGGLE_USERNAME=your_kaggle_username
KAGGLE_KEY=your_kaggle_api_key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/manvue

# Import Configuration
IMPORT_BATCH_SIZE=100
IMPORT_DELAY_MS=1000
IMPORT_MAX_RETRIES=3
```

### Import Settings
Configure import behavior in `scripts/importKaggleData.js`:

```javascript
const importConfig = {
  batchSize: 100,           // Process products in batches
  delayMs: 1000,            // Delay between batches
  maxRetries: 3,            // Max retry attempts
  imageQuality: 'auto',     // Image quality setting
  imageFormat: 'webp',      // Image format
  generateVariants: true,   // Generate color/size variants
  createSEO: true,          // Generate SEO content
};
```

## 🛠️ Available Scripts

### Import Scripts
```bash
# Kaggle dataset import
npm run import-kaggle

# Test Kaggle setup
npm run test-kaggle

# Seed database with sample data
npm run seed

# Fix product visibility
npm run fix-products

# Generate analytics data
npm run generate-analytics
```

### Utility Scripts
```bash
# Check user data
npm run check-user

# Create admin user
npm run create-admin

# Update product variants
node scripts/updateColorImages.js

# Fix product stock
node scripts/fixProductStock.js
```

## 📈 Post-Import Actions

### 1. Verify Import
- Check admin panel for imported products
- Verify image uploads to Cloudinary
- Test product search and filtering

### 2. Activate Products
```bash
# Activate all imported products
node scripts/fixProductVisibility.js
```

### 3. Generate Analytics
```bash
# Generate sample analytics data
npm run generate-analytics
```

### 4. Test Features
- Test product search
- Test category filtering
- Test AI chatbot recommendations
- Test image search functionality

## 🔍 Troubleshooting

### Common Issues

#### 1. Kaggle Authentication Failed
```bash
# Check credentials
echo $KAGGLE_USERNAME
echo $KAGGLE_KEY

# Or check kaggle.json file
cat ~/.kaggle/kaggle.json
```

#### 2. Python Not Found
```bash
# Check Python installation
python --version
python3 --version

# Install Python if needed
# Windows: Download from python.org
# Mac: brew install python3
# Linux: sudo apt install python3
```

#### 3. Memory Issues
```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 scripts/importKaggleData.js
```

#### 4. Cloudinary Upload Failed
- Check Cloudinary credentials
- Verify API key permissions
- Check image file formats

#### 5. MongoDB Connection Error
```bash
# Check MongoDB status
mongod --version

# Check connection string
echo $MONGODB_URI
```

### Debug Mode
Enable debug mode for detailed logging:

```bash
# Set debug environment variable
export DEBUG_MODE=true

# Run import with debug logging
node scripts/importKaggleData.js
```

## 📊 Import Results

### Expected Output
```
🧪 Testing Kaggle Dataset Setup...
✅ All required environment variables are set
✅ MongoDB connection successful
✅ Cloudinary connection successful
✅ Kaggle credentials found
✅ All dependencies are installed

Starting Kaggle dataset import...
📥 Downloading dataset: men-fashion-dataset
✅ Dataset downloaded successfully
📊 Processing CSV data...
✅ Processed 44,000 products from CSV
🖼️ Processing images...
✅ Processed 44,000 images
☁️ Uploading to Cloudinary...
✅ All images uploaded successfully
💾 Saving to database...
✅ All products saved to MongoDB
🎉 Import completed successfully!

📈 Import Summary:
- Total Products: 44,000
- Categories: 6
- Images Uploaded: 44,000
- Processing Time: 45 minutes
- Success Rate: 100%
```

### Database Verification
```bash
# Check imported products
mongo manvue --eval "db.products.countDocuments()"

# Check categories
mongo manvue --eval "db.products.distinct('category')"

# Check active products
mongo manvue --eval "db.products.countDocuments({isActive: true})"
```

## 🚀 Advanced Configuration

### Custom Dataset Sources
To add support for new dataset sources:

1. **Create Import Script**: `scripts/importCustomData.js`
2. **Configure Mapping**: Define category and field mappings
3. **Add Route**: Create API endpoint for custom import
4. **Update Admin Panel**: Add import option to admin interface

### Batch Processing
For large datasets, use batch processing:

```javascript
// Process in batches to avoid memory issues
const batchSize = 100;
for (let i = 0; i < products.length; i += batchSize) {
  const batch = products.slice(i, i + batchSize);
  await processBatch(batch);
  await delay(1000); // Wait 1 second between batches
}
```

### Error Handling
Implement robust error handling:

```javascript
try {
  await importDataset();
} catch (error) {
  console.error('Import failed:', error.message);
  // Log error details
  // Send notification
  // Clean up partial data
}
```

## 📚 Additional Resources

- [Kaggle API Documentation](https://www.kaggle.com/docs/api)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [MongoDB Import/Export](https://docs.mongodb.com/manual/reference/program/mongoimport/)
- [Node.js File System](https://nodejs.org/api/fs.html)

---

**Happy Importing! 🎉**
