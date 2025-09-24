@echo off
echo 🚀 Starting Kaggle Data Import...
echo.
echo This will:
echo - Upload all images from Kaggle_Data folder to Cloudinary
echo - Create product records in MongoDB
echo - Make products available in both admin and customer interfaces
echo.
echo ⚠️  Make sure you have:
echo - MongoDB running
echo - Cloudinary credentials configured
echo - Admin user created (run npm run seed first if needed)
echo.
pause
echo.
node importKaggleData.js
echo.
echo ✅ Import process completed!
pause
