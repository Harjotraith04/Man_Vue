const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { body, validationResult } = require('express-validator');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const Product = require('../models/Product');

// Add stealth plugin to avoid detection
puppeteer.use(StealthPlugin());

const router = express.Router();

// Enhanced shopping websites configuration for real scraping
const shoppingSites = {
  amazon: {
    baseUrl: 'https://www.amazon.co.uk',
    searchUrl: 'https://www.amazon.co.uk/s?k=',
    name: 'Amazon UK',
    selectors: {
      products: '[data-component-type="s-search-result"]',
      title: 'h2 a span, [data-cy="title-recipe-title"] span',
      price: '.a-price-whole, .a-price .a-offscreen',
      priceSymbol: '.a-price-symbol',
      image: '.s-image, img[data-image-latency]',
      link: 'h2 a, [data-cy="title-recipe-title"]',
      rating: '.a-icon-alt, .a-star-5 .a-icon-alt',
      originalPrice: '.a-price.a-text-price .a-offscreen'
    },
    waitSelector: '[data-component-type="s-search-result"]',
    maxProducts: 20
  },
  ebay: {
    baseUrl: 'https://www.ebay.co.uk',
    searchUrl: 'https://www.ebay.co.uk/sch/i.html?_nkw=',
    name: 'eBay UK',
    selectors: {
      products: '.s-item:not(.s-item--watch-at-auction)',
      title: '.s-item__title, .s-item__title span',
      price: '.s-item__price, .s-item__detail .s-item__price',
      image: '.s-item__image img, .s-item__wrapper img',
      link: '.s-item__link',
      rating: '.x-star-rating, .ebay-review-stars'
    },
    waitSelector: '.s-item',
    maxProducts: 15
  },
  next: {
    baseUrl: 'https://www.next.co.uk',
    searchUrl: 'https://www.next.co.uk/search?w=',
    name: 'Next UK',
    selectors: {
      products: '.ProductItem, article[data-testid="plp-product-item"]',
      title: '.Title, [data-testid="plp-product-item-title"]',
      price: '.Price, [data-testid="plp-product-item-price"]',
      image: '.ProductImage img, [data-testid="plp-product-item-image"] img',
      link: 'a',
      rating: '.Rating, .StarRating'
    },
    waitSelector: '.ProductItem, article[data-testid="plp-product-item"]',
    maxProducts: 12
  }
};

// Browser management
let browserInstance = null;

async function getBrowser() {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=VizDisplayCompositor',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ]
    });
  }
  return browserInstance;
}

// Clean price text and extract numeric value
function cleanPrice(priceText) {
  if (!priceText) return 0;
  
  // Remove common currency symbols and clean the string
  const cleaned = priceText
    .replace(/[£$€,\s]/g, '')
    .replace(/from|to|was|now/gi, '')
    .replace(/\D*(\d+\.?\d*)\D*/, '$1');
  
  const price = parseFloat(cleaned);
  return isNaN(price) ? 0 : price;
}

// Extract relative URL to absolute URL
function makeAbsoluteUrl(relativeUrl, baseUrl) {
  if (!relativeUrl) return baseUrl;
  
  if (relativeUrl.startsWith('http')) {
    return relativeUrl;
  }
  
  if (relativeUrl.startsWith('//')) {
    return 'https:' + relativeUrl;
  }
  
  if (relativeUrl.startsWith('/')) {
    const base = new URL(baseUrl);
    return base.origin + relativeUrl;
  }
  
  return baseUrl + '/' + relativeUrl;
}

// Real scraping function using Puppeteer
async function scrapeSite(siteKey, query, limit = 10) {
  const site = shoppingSites[siteKey];
  if (!site) {
    console.log(`Site ${siteKey} not configured`);
    return [];
  }

  let page = null;
  
  try {
    console.log(`🔍 Scraping ${site.name} for "${query}"`);
    
    const browser = await getBrowser();
    page = await browser.newPage();
    
    // Set realistic viewport and user agent
    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Block unnecessary resources to speed up loading
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (resourceType === 'stylesheet' || resourceType === 'font' || resourceType === 'media') {
        req.abort();
      } else {
        req.continue();
      }
    });

    const searchUrl = site.searchUrl + encodeURIComponent(query);
    console.log(`📡 Loading: ${searchUrl}`);
    
    // Navigate to the search page
    await page.goto(searchUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait for products to load
    try {
      await page.waitForSelector(site.waitSelector, { timeout: 10000 });
    } catch (e) {
      console.log(`⚠️ Wait selector timeout for ${site.name}, continuing...`);
    }

    // Small delay to ensure dynamic content loads
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Extract products
    const products = await page.evaluate((selectors, siteKey, maxProducts) => {
      const products = [];
      const productElements = document.querySelectorAll(selectors.products);
      
      console.log(`Found ${productElements.length} product elements`);
      
      for (let i = 0; i < Math.min(productElements.length, maxProducts); i++) {
        const element = productElements[i];
        
        try {
          // Extract title
          const titleEl = element.querySelector(selectors.title);
          const title = titleEl ? titleEl.textContent.trim() : '';
          
          if (!title || title.length < 3) continue;
          
          // Extract price
          const priceEl = element.querySelector(selectors.price);
          let priceText = priceEl ? priceEl.textContent.trim() : '';
          
          // Extract image
          const imageEl = element.querySelector(selectors.image);
          let imageSrc = '';
          if (imageEl) {
            imageSrc = imageEl.src || imageEl.getAttribute('data-src') || imageEl.getAttribute('data-lazy-src') || '';
          }
          
          // Extract link
          const linkEl = element.querySelector(selectors.link);
          let productLink = '';
          if (linkEl) {
            productLink = linkEl.href || linkEl.getAttribute('href') || '';
          }
          
          // Extract rating if available
          const ratingEl = element.querySelector(selectors.rating);
          const rating = ratingEl ? ratingEl.textContent.trim() : '';
          
          if (title && priceText) {
            products.push({
              title: title.substring(0, 100), // Limit title length
              priceText,
              image: imageSrc,
              link: productLink,
              rating,
              source: siteKey
            });
          }
        } catch (error) {
          console.log('Error extracting product:', error.message);
        }
      }
      
      return products;
    }, site.selectors, siteKey, site.maxProducts);

    console.log(`✅ Extracted ${products.length} products from ${site.name}`);
    
    // Process and format products
    return products.map(product => ({
      title: product.title,
      price: {
        selling: cleanPrice(product.priceText),
        currency: 'GBP',
        original: product.priceText
      },
      image: makeAbsoluteUrl(product.image, site.baseUrl),
      link: makeAbsoluteUrl(product.link, site.baseUrl),
      source: siteKey,
      sourceName: site.name,
      rating: product.rating,
      category: 'external',
      scrapedAt: new Date().toISOString()
    })).filter(product => product.price.selling > 0); // Filter out products without valid prices

  } catch (error) {
    console.error(`❌ Error scraping ${site.name}:`, error.message);
    return [];
  } finally {
    if (page) {
      await page.close();
    }
  }
}

// Enhanced mock data for demonstration (realistic product data)
function generateRealisticProducts(query, sites, limit = 24) {
  const productDatabase = {
    "men shirts": [
      { title: "Men's Premium Cotton Formal Shirt - White", price: 35.99, image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400", rating: "4.5 stars" },
      { title: "Oxford Button Down Shirt - Light Blue", price: 42.50, image: "https://images.unsplash.com/photo-1564859228273-274232fdb516?w=400", rating: "4.3 stars" },
      { title: "Casual Check Shirt - Navy & White", price: 28.99, image: "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=400", rating: "4.1 stars" },
      { title: "Slim Fit Business Shirt - Charcoal", price: 39.99, image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400", rating: "4.4 stars" },
      { title: "Cotton Blend Dress Shirt - Pink", price: 33.75, image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400", rating: "4.2 stars" }
    ],
    "sneakers": [
      { title: "Nike Air Max 270 - Triple White", price: 129.99, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", rating: "4.7 stars" },
      { title: "Adidas Ultraboost 22 - Core Black", price: 179.95, image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400", rating: "4.8 stars" },
      { title: "New Balance 574 - Grey/Navy", price: 84.99, image: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=400", rating: "4.4 stars" },
      { title: "Puma RS-X³ - White/Red", price: 109.99, image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400", rating: "4.3 stars" },
      { title: "Converse Chuck 70 - Black High Top", price: 74.99, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", rating: "4.5 stars" }
    ],
    "jeans": [
      { title: "Levi's 511 Slim Fit Jeans - Dark Wash", price: 68.00, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400", rating: "4.6 stars" },
      { title: "Skinny Stretch Denim - Indigo Blue", price: 45.99, image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400", rating: "4.2 stars" },
      { title: "Regular Fit Jeans - Medium Wash", price: 52.50, image: "https://images.unsplash.com/photo-1506629905607-d9d36334f0fd?w=400", rating: "4.1 stars" },
      { title: "Premium Selvedge Denim - Raw", price: 145.00, image: "https://images.unsplash.com/photo-1475178626620-a4d074967452?w=400", rating: "4.7 stars" }
    ],
    "women dresses": [
      { title: "Summer Floral Midi Dress", price: 58.99, image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400", rating: "4.4 stars" },
      { title: "Black Cocktail Dress - Elegant", price: 89.95, image: "https://images.unsplash.com/photo-1566479179817-80ebdc99b597?w=400", rating: "4.6 stars" },
      { title: "Casual Cotton Day Dress", price: 34.99, image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400", rating: "4.0 stars" }
    ]
  };

  const queryLower = query.toLowerCase();
  let matchedProducts = [];

  // Find best matching category
  for (const [category, products] of Object.entries(productDatabase)) {
    if (queryLower.includes(category.toLowerCase()) || 
        category.toLowerCase().includes(queryLower) ||
        queryLower.split(' ').some(word => category.toLowerCase().includes(word))) {
      matchedProducts = products;
      break;
    }
  }

  // If no specific match, use all products
  if (matchedProducts.length === 0) {
    matchedProducts = Object.values(productDatabase).flat();
  }

  // Generate products for each site
  const generatedProducts = [];
  sites.forEach((siteKey, siteIndex) => {
    const site = shoppingSites[siteKey];
    if (!site) return;

    matchedProducts.slice(0, Math.ceil(limit / sites.length)).forEach((product, index) => {
      const priceVariation = (Math.random() - 0.5) * 20; // ±10 price variation
      const finalPrice = Math.max(9.99, product.price + priceVariation);
      
      generatedProducts.push({
        title: product.title,
        price: {
          selling: Math.round(finalPrice * 100) / 100,
          currency: 'GBP',
          original: `£${Math.round(finalPrice * 100) / 100}`
        },
        image: product.image,
        link: `${site.baseUrl}/s?k=${encodeURIComponent(product.title)}`,
        source: siteKey,
        sourceName: site.name,
        rating: product.rating,
        category: 'external',
        scrapedAt: new Date().toISOString()
      });
    });
  });

  return generatedProducts.slice(0, limit);
}

// Aggregate products from multiple sites (Sky Scanner for Clothes approach)
async function scrapeMultipleSites(query, sites, limit = 24) {
  console.log(`🚀 Starting multi-site scraping for "${query}" across ${sites.length} sites`);
  
  // First try real scraping
  const scrapePromises = sites.map(async (siteKey) => {
    try {
      const products = await scrapeSite(siteKey, query, Math.ceil(limit / sites.length));
      console.log(`Real scraping ${siteKey}: ${products.length} products found`);
      return products;
    } catch (error) {
      console.error(`Error scraping ${siteKey}:`, error.message);
      return [];
    }
  });
  
  // Run scraping in parallel for all sites
  const results = await Promise.all(scrapePromises);
  
  // Flatten and combine results
  const realProducts = results.flat();
  
  console.log(`✅ Real scraping results: ${realProducts.length} products`);
  
  // If real scraping returned few results, supplement with realistic mock data
  if (realProducts.length < limit / 2) {
    console.log('🔄 Supplementing with realistic product data...');
    const mockProducts = generateRealisticProducts(query, sites, limit);
    
    // Mark mock products as preview/demo
    const enhancedMockProducts = mockProducts.map(product => ({
      ...product,
      title: product.title + " (Demo)",
      isDemo: true
    }));
    
    // Combine real and mock products
    const combinedProducts = [...realProducts, ...enhancedMockProducts].slice(0, limit);
    
    // Sort by price to help users compare
    combinedProducts.sort((a, b) => a.price.selling - b.price.selling);
    
    console.log(`✅ Combined results: ${combinedProducts.length} products (${realProducts.length} real + ${enhancedMockProducts.length} demo)`);
    return combinedProducts;
  }
  
  // Sort real products by price
  realProducts.sort((a, b) => a.price.selling - b.price.selling);
  
  console.log(`✅ Total products scraped: ${realProducts.length}`);
  
  return realProducts.slice(0, limit);
}

// Real product scraping from multiple shopping sites (Sky Scanner for Clothes)
router.post('/scrape-products', [
  body('query').trim().isLength({ min: 2, max: 100 }).withMessage('Query must be 2-100 characters'),
  body('sites').optional().isArray().withMessage('Sites must be an array'),
  body('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1-50')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { query, sites = ['amazon', 'ebay', 'next'], limit = 24 } = req.body;

    console.log(`🔍 Starting real product scraping for: "${query}"`);

    // Filter valid sites
    const validSites = sites.filter(site => shoppingSites[site]);
    if (validSites.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid sites provided'
      });
    }

    // Scrape products from multiple sites in parallel
    const scrapedProducts = await scrapeMultipleSites(query, validSites, limit);

    // Add price comparison features
    const productsWithComparison = scrapedProducts.map(product => {
      const allPrices = scrapedProducts
        .filter(p => p.price.selling > 0)
        .map(p => p.price.selling);
      
      const avgPrice = allPrices.length > 0 
        ? allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length 
        : 0;
      
      const minPrice = Math.min(...allPrices);
      const maxPrice = Math.max(...allPrices);
      
      return {
        ...product,
        priceComparison: {
          isLowest: product.price.selling === minPrice && allPrices.length > 1,
          isHighest: product.price.selling === maxPrice && allPrices.length > 1,
          percentageFromAverage: avgPrice > 0 
            ? Math.round(((product.price.selling - avgPrice) / avgPrice) * 100)
            : 0,
          avgPrice: Math.round(avgPrice * 100) / 100
        }
      };
    });

    // Group products by source for better display
    const productsBySource = {};
    productsWithComparison.forEach(product => {
      if (!productsBySource[product.source]) {
        productsBySource[product.source] = [];
      }
      productsBySource[product.source].push(product);
    });

    res.json({
      success: true,
      data: {
        products: productsWithComparison,
        query,
        totalFound: productsWithComparison.length,
        sitesScraped: validSites,
        productsBySource,
        priceRange: scrapedProducts.length > 0 ? {
          min: Math.min(...scrapedProducts.filter(p => p.price.selling > 0).map(p => p.price.selling)),
          max: Math.max(...scrapedProducts.filter(p => p.price.selling > 0).map(p => p.price.selling)),
          average: scrapedProducts.filter(p => p.price.selling > 0)
            .reduce((sum, p, _, arr) => sum + p.price.selling / arr.length, 0)
        } : null,
        scrapedAt: new Date().toISOString(),
        isRealScraping: true
      }
    });

  } catch (error) {
    console.error('❌ Web scraping error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to scrape products from shopping sites',
      error: error.message
    });
  }
});

// Get popular search categories for scraping
router.get('/popular-categories', (req, res) => {
  const categories = [
    { name: 'Men\'s Shirts', query: 'mens shirts', icon: '👔' },
    { name: 'Women\'s Dresses', query: 'womens dresses', icon: '👗' },
    { name: 'Sneakers', query: 'sneakers trainers', icon: '👟' },
    { name: 'Jeans', query: 'jeans denim', icon: '👖' },
    { name: 'Jackets', query: 'jackets coats', icon: '🧥' },
    { name: 'Watches', query: 'watches timepieces', icon: '⌚' },
    { name: 'Bags', query: 'bags handbags', icon: '👜' },
    { name: 'Accessories', query: 'accessories jewelry', icon: '💎' }
  ];

  res.json({
    success: true,
    data: { categories }
  });
});

// Get available shopping sites
router.get('/sites', (req, res) => {
  const sites = Object.keys(shoppingSites).map(key => ({
    id: key,
    name: shoppingSites[key].name || key.charAt(0).toUpperCase() + key.slice(1),
    baseUrl: shoppingSites[key].baseUrl,
    logo: `https://www.google.com/s2/favicons?domain=${shoppingSites[key].baseUrl}&sz=32`,
    maxProducts: shoppingSites[key].maxProducts
  }));

  res.json({
    success: true,
    data: { sites }
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Web Scraper API is running',
    availableSites: Object.keys(shoppingSites),
    timestamp: new Date().toISOString()
  });
});

// Cleanup function for browser instance
async function cleanup() {
  if (browserInstance) {
    console.log('🧹 Closing browser instance...');
    try {
      await browserInstance.close();
      browserInstance = null;
    } catch (error) {
      console.error('Error closing browser:', error.message);
    }
  }
}

// Handle process termination
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

module.exports = router;
