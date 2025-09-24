const mongoose = require('mongoose');
const { cloudinary } = require('../config/cloudinary');
const fs = require('fs-extra');
const path = require('path');
require('dotenv').config();

async function testSetup() {
  console.log('🧪 Testing Kaggle Dataset Setup...\n');

  // Test 1: Environment Variables
  console.log('1. Testing Environment Variables...');
  const requiredEnvVars = [
    'MONGODB_URI',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log('❌ Missing environment variables:', missingVars.join(', '));
    console.log('Please check your .env file\n');
  } else {
    console.log('✅ All required environment variables are set\n');
  }

  // Test 2: MongoDB Connection
  console.log('2. Testing MongoDB Connection...');
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/manvue');
    console.log('✅ MongoDB connection successful\n');
    await mongoose.disconnect();
  } catch (error) {
    console.log('❌ MongoDB connection failed:', error.message, '\n');
  }

  // Test 3: Cloudinary Connection
  console.log('3. Testing Cloudinary Connection...');
  try {
    // Test Cloudinary configuration by checking if credentials are loaded
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    if (!cloudName || !apiKey || !apiSecret) {
      console.log('❌ Cloudinary credentials not found in environment variables\n');
    } else {
      console.log('✅ Cloudinary credentials found');
      console.log('Cloud Name:', cloudName);
      console.log('API Key:', apiKey.substring(0, 8) + '...');
      console.log('API Secret:', apiSecret.substring(0, 8) + '...\n');
    }
  } catch (error) {
    console.log('❌ Cloudinary connection failed:', error.message, '\n');
  }

  // Test 4: Kaggle Credentials
  console.log('4. Testing Kaggle Credentials...');
  try {
    const username = process.env.KAGGLE_USERNAME;
    const key = process.env.KAGGLE_KEY;
    
    if (!username || !key) {
      console.log('❌ KAGGLE_USERNAME and KAGGLE_KEY environment variables are required');
      console.log('Please set them in your .env file\n');
    } else {
      console.log('✅ Kaggle credentials found in environment variables');
      console.log('Username:', username);
      console.log('Key:', key.substring(0, 8) + '...', '\n');
    }
  } catch (error) {
    console.log('❌ Error checking Kaggle credentials:', error.message, '\n');
  }

  // Test 5: Dependencies
  console.log('5. Testing Dependencies...');
  const dependencies = [
    'csv-parser',
    'fs-extra',
    'sharp',
    'axios'
  ];

  const missingDeps = [];
  for (const dep of dependencies) {
    try {
      require(dep);
    } catch (error) {
      missingDeps.push(dep);
    }
  }

  if (missingDeps.length > 0) {
    console.log('❌ Missing dependencies:', missingDeps.join(', '));
    console.log('Run: npm install', missingDeps.join(' '), '\n');
  } else {
    console.log('✅ All dependencies are installed\n');
  }

  // Test 6: Python Installation
  console.log('6. Testing Python Installation...');
  try {
    const { execSync } = require('child_process');
    const pythonVersion = execSync('python --version', { encoding: 'utf8' });
    console.log('✅ Python found:', pythonVersion.trim());
    
    // Test if kaggle package is installed
    try {
      execSync('python -c "import kaggle"', { encoding: 'utf8' });
      console.log('✅ Kaggle Python package is installed\n');
    } catch (error) {
      console.log('⚠️  Kaggle Python package not found. Run: pip install kaggle\n');
    }
  } catch (error) {
    console.log('❌ Python not found. Please install Python 3.7+\n');
  }

  console.log('🎉 Setup test completed!');
  console.log('\nNext steps:');
  console.log('1. Fix any issues found above');
  console.log('2. Install Python kaggle package: pip install kaggle');
  console.log('3. Start your backend server: npm run dev');
  console.log('4. Go to /admin/dataset in your frontend');
  console.log('5. Click "Import Dataset" to start the import process');
}

// Run the test
testSetup().catch(console.error);
