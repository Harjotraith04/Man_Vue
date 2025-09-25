# 🚀 Quick Start Guide - Kaggle Dataset Import

## Prerequisites

1. **Python 3.7+** installed on your system
2. **Node.js** (already installed)
3. **Kaggle API credentials**

## Step 1: Install Python Dependencies

```bash
# Install kaggle package
pip install kaggle

# Or if you have multiple Python versions
python3 -m pip install kaggle
```

## Step 2: Set Up Kaggle Credentials

### Option A: Using Environment Variables (Recommended)
Add to your `.env` file:
```env
KAGGLE_USERNAME=your_kaggle_username
KAGGLE_KEY=your_kaggle_api_key
```

### Option B: Using kaggle.json file
1. Go to [Kaggle Account Settings](https://www.kaggle.com/account)
2. Click "Create New API Token"
3. Download `kaggle.json`
4. Place it in `C:\Users\Sagar Jadhav\.kaggle\kaggle.json` (Windows)

## Step 3: Install Node.js Dependencies

```bash
cd backend
npm install
```

## Step 4: Test Your Setup

```bash
npm run test-kaggle
```

## Step 5: Run the Import

### Option A: Easy Way (Windows)
```bash
# Double-click this file or run in terminal
scripts\run-import.bat
```

### Option B: Manual Steps
```bash
# 1. Test setup
npm run test-kaggle

# 2. Install dependencies
npm install

# 3. Run import
npm run import-kaggle
```

### Option C: Via Admin Panel
1. Start your backend: `npm run dev`
2. Go to `/admin/dataset` in your frontend
3. Click "Import Dataset"

## What Happens During Import

1. **Downloads** ~44,000 fashion products from Kaggle
2. **Processes** images and uploads to Cloudinary
3. **Creates** product records in MongoDB
4. **Shows** progress in console

**Estimated time**: 30-60 minutes

## Troubleshooting

### Python Not Found
```bash
# Make sure Python is in your PATH
python --version
# or
python3 --version
```

### Kaggle Authentication Failed
- Check your credentials in `.env` file
- Or verify `kaggle.json` file location

### Memory Issues
- The script processes in batches to avoid memory problems
- If issues persist, restart your computer

## Expected Output

```
🧪 Testing Kaggle Dataset Setup...
✅ All required environment variables are set
✅ MongoDB connection successful
✅ Cloudinary connection successful
✅ Kaggle credentials found
✅ All dependencies are installed

Starting Kaggle dataset import...
Downloading Kaggle dataset...
Dataset downloaded to: ./kaggle_dataset
Processed 44000 products from CSV
Processing images...
✓ Processed: Product Name 1
✓ Processed: Product Name 2
...
✅ Import completed successfully!
```

## After Import

All products will be available on your website through:
- Product API endpoints
- Admin panel at `/admin/products`
- Frontend product pages

## Need Help?

1. Check console output for error messages
2. Verify all environment variables are set
3. Ensure Python and Node.js are installed
4. Check your internet connection

The import process is designed to be robust and will continue even if some products fail to process.


