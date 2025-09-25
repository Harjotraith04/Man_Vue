#!/usr/bin/env python3
"""
Python script to download Kaggle dataset
This script downloads the fashion dataset from Kaggle and extracts it
"""

import os
import sys
import json
import subprocess
from pathlib import Path

def check_kaggle_installed():
    """Check if kaggle is installed"""
    try:
        import kaggle
        return True
    except ImportError:
        return False

def install_kaggle():
    """Install kaggle package"""
    print("Installing kaggle package...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "kaggle"])

def setup_kaggle_credentials():
    """Setup Kaggle credentials from environment variables"""
    kaggle_dir = Path.home() / '.kaggle'
    kaggle_dir.mkdir(exist_ok=True)
    
    kaggle_file = kaggle_dir / 'kaggle.json'
    
    # Check if credentials exist
    if kaggle_file.exists():
        print("Kaggle credentials already exist")
        return True
    
    # Try to get credentials from environment variables
    username = os.getenv('KAGGLE_USERNAME')
    key = os.getenv('KAGGLE_KEY')
    
    if not username or not key:
        print("Error: KAGGLE_USERNAME and KAGGLE_KEY environment variables are required")
        print("Please set them in your .env file or create a kaggle.json file manually")
        return False
    
    # Create kaggle.json file
    credentials = {
        "username": username,
        "key": key
    }
    
    with open(kaggle_file, 'w') as f:
        json.dump(credentials, f)
    
    # Set proper permissions
    kaggle_file.chmod(0o600)
    print("Kaggle credentials created successfully")
    return True

def download_dataset():
    """Download the fashion dataset from Kaggle"""
    try:
        import kaggle
        from kaggle.api.kaggle_api_extended import KaggleApi
        
        # Initialize Kaggle API
        api = KaggleApi()
        api.authenticate()
        
        # Dataset details
        dataset = 'nirmalsankalana/fashion-product-text-images-dataset'
        download_path = './kaggle_dataset'
        
        print(f"Downloading dataset: {dataset}")
        print(f"Download path: {download_path}")
        
        # Create download directory
        os.makedirs(download_path, exist_ok=True)
        
        # Download dataset
        api.dataset_download_files(
            dataset, 
            path=download_path, 
            unzip=True,
            quiet=False
        )
        
        print("Dataset downloaded successfully!")
        return download_path
        
    except Exception as e:
        print(f"Error downloading dataset: {e}")
        return None

def main():
    """Main function"""
    print("🚀 Starting Kaggle dataset download...")
    
    # Check if kaggle is installed
    if not check_kaggle_installed():
        print("Kaggle package not found. Installing...")
        install_kaggle()
    
    # Setup credentials
    if not setup_kaggle_credentials():
        sys.exit(1)
    
    # Download dataset
    download_path = download_dataset()
    
    if download_path:
        print(f"✅ Dataset downloaded to: {os.path.abspath(download_path)}")
        print("You can now run the Node.js import script")
    else:
        print("❌ Failed to download dataset")
        sys.exit(1)

if __name__ == "__main__":
    main()


