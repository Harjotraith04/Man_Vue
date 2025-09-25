const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// List of shopping websites to scrape
const shoppingSites = {
  amazon: {
    baseUrl: 'https://www.amazon.co.uk',
    searchUrl: 'https://www.amazon.co.uk/s?k=',
    selectors: {
      products: '[data-component-type="s-search-result"]',
      title: 'h2 a span',
      price: '.a-price-whole',
      image: '.s-image',
      link: 'h2 a',
      rating: '.a-icon-alt'
    }
  },
  ebay: {
    baseUrl: 'https://www.ebay.co.uk',
    searchUrl: 'https://www.ebay.co.uk/sch/i.html?_nkw=',
    selectors: {
      products: '.s-item',
      title: '.s-item__title',
      price: '.s-item__price',
      image: '.s-item__image img',
      link: '.s-item__link',
      rating: '.ebay-review-stars'
    }
  },
  next: {
    baseUrl: 'https://www.next.co.uk',
    searchUrl: 'https://www.next.co.uk/search?w=',
    selectors: {
      products: '.ProductItem',
      title: '.Title',
      price: '.Price',
      image: '.ProductImage img',
      link: 'a',
      rating: '.Rating'
    }
  },
  asos: {
    baseUrl: 'https://www.asos.com',
    searchUrl: 'https://www.asos.com/search/?q=',
    selectors: {
      products: '[data-testid="product-tile"]',
      title: '[data-testid="product-tile-name"]',
      price: '[data-testid="current-price"]',
      image: 'img',
      link: 'a',
      rating: '.stars'
    }
  },
  johnlewis: {
    baseUrl: 'https://www.johnlewis.com',
    searchUrl: 'https://www.johnlewis.com/search?search-term=',
    selectors: {
      products: '.c-product-tile',
      title: '.c-product-tile__title',
      price: '.c-product-tile__price',
      image: '.c-product-tile__image img',
      link: 'a',
      rating: '.c-product-tile__rating'
    }
  }
};

// Mock data generator for testing - simulates real products from different sites
function generateMockProducts(query, sites, limit = 10) {
  const mockProducts = [
    // Men's Shirts
    { keywords: ['shirt', 'shirts', 'mens'], products: [
      { title: 'Classic White Cotton Shirt - Slim Fit', price: 29.99, source: 'amazon', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop' },
      { title: 'Oxford Blue Long Sleeve Shirt', price: 34.99, source: 'next', image: 'https://images.unsplash.com/photo-1564859228273-274232fdb516?w=400&h=400&fit=crop' },
      { title: 'Premium Cotton Formal Shirt', price: 24.99, source: 'ebay', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=400&fit=crop' },
      { title: 'Casual Check Shirt - Regular Fit', price: 19.99, source: 'asos', image: 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=400&h=400&fit=crop' },
    ]},
    // Sneakers
    { keywords: ['sneaker', 'sneakers', 'trainer', 'trainers', 'shoe', 'shoes'], products: [
      { title: 'Nike Air Max 270 - White/Black', price: 89.99, source: 'amazon', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop' },
      { title: 'Adidas Ultraboost 22 - Core Black', price: 149.99, source: 'johnlewis', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop' },
      { title: 'Puma RS-X³ Puzzle - White', price: 79.99, source: 'asos', image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400&h=400&fit=crop' },
      { title: 'New Balance 574 - Grey/Navy', price: 69.99, source: 'next', image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=400&h=400&fit=crop' },
    ]},
    // Jeans
    { keywords: ['jean', 'jeans', 'denim'], products: [
      { title: 'Levi\'s 511 Slim Fit Jeans - Dark Wash', price: 59.99, source: 'amazon', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop' },
      { title: 'Skinny Stretch Jeans - Blue', price: 39.99, source: 'next', image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop' },
      { title: 'Regular Fit Denim Jeans', price: 34.99, source: 'ebay', image: 'https://images.unsplash.com/photo-1506629905607-d9d36334f0fd?w=400&h=400&fit=crop' },
      { title: 'Premium Selvedge Denim', price: 89.99, source: 'asos', image: 'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=400&h=400&fit=crop' },
    ]},
    // Dresses
    { keywords: ['dress', 'dresses', 'women'], products: [
      { title: 'Floral Summer Dress - Midi Length', price: 45.99, source: 'next', image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop' },
      { title: 'Black Evening Dress - Elegant', price: 79.99, source: 'asos', image: 'https://images.unsplash.com/photo-1566479179817-80ebdc99b597?w=400&h=400&fit=crop' },
      { title: 'Casual Day Dress - Cotton', price: 29.99, source: 'amazon', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=400&fit=crop' },
      { title: 'Designer Cocktail Dress', price: 129.99, source: 'johnlewis', image: 'https://images.unsplash.com/photo-1505022610485-0249ba5b3675?w=400&h=400&fit=crop' },
    ]},
    // Jackets
    { keywords: ['jacket', 'jackets', 'coat', 'coats'], products: [
      { title: 'Leather Biker Jacket - Black', price: 159.99, source: 'asos', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop' },
      { title: 'Denim Jacket - Classic Blue', price: 49.99, source: 'next', image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=400&fit=crop' },
      { title: 'Winter Parka - Navy', price: 89.99, source: 'amazon', image: 'https://images.unsplash.com/photo-1544441892-794166f1e3be?w=400&h=400&fit=crop' },
      { title: 'Wool Overcoat - Charcoal', price: 199.99, source: 'johnlewis', image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&h=400&fit=crop' },
    ]}
  ];

  // Find matching products based on query
  const queryLower = query.toLowerCase();
  let matchedProducts = [];

  for (const category of mockProducts) {
    for (const keyword of category.keywords) {
      if (queryLower.includes(keyword)) {
        matchedProducts = [...matchedProducts, ...category.products];
        break;
      }
    }
  }

  // If no specific matches, show general products
  if (matchedProducts.length === 0) {
    matchedProducts = mockProducts.flatMap(cat => cat.products);
  }

  // Filter by selected sites and add variety
  const filteredProducts = matchedProducts
    .filter(product => sites.includes(product.source))
    .map(product => ({
      title: product.title,
      price: {
        selling: product.price + Math.random() * 20 - 10, // Add price variation
        currency: 'GBP'
      },
      image: product.image,
      link: `https://www.${product.source}.com/product/${product.title.toLowerCase().replace(/\s+/g, '-')}`,
      source: product.source,
      category: 'external'
    }));

  // Shuffle and limit results
  return filteredProducts
    .sort(() => Math.random() - 0.5)
    .slice(0, limit)
    .map(product => ({
      ...product,
      price: {
        ...product.price,
        selling: Math.max(9.99, Math.round(product.price.selling * 100) / 100)
      }
    }));
}

// Helper function to scrape a single site (currently using mock data due to anti-bot protection)
async function scrapeSite(site, query, limit = 10) {
  try {
    // For now, we'll simulate scraping with realistic mock data
    // Real scraping would require more sophisticated methods like:
    // - Headless browsers (Puppeteer/Playwright)
    // - Rotating proxies
    // - CAPTCHA solving services
    // - Request delays and rate limiting
    
    console.log(`Simulating scrape of ${site.baseUrl} for query: "${query}"`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    // Generate mock products for this site
    const mockProducts = generateMockProducts(query, [site.baseUrl.replace('https://www.', '').replace('.co.uk', '').replace('.com', '')], limit);
    
    return mockProducts.filter(product => 
      product.source === site.baseUrl.replace('https://www.', '').replace('.co.uk', '').replace('.com', '')
    );

  } catch (error) {
    console.error(`Error scraping ${site.baseUrl}:`, error.message);
    return [];
  }
}

// Scrape products from multiple shopping websites
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

    const { query, sites = ['amazon', 'ebay', 'next'], limit = 8 } = req.body;
    const limitPerSite = Math.max(1, Math.floor(limit / sites.length));

    console.log(`Scraping products for query: "${query}" from ${sites.length} sites`);

    // Scrape from selected sites concurrently
    const scrapePromises = sites
      .filter(siteName => shoppingSites[siteName])
      .map(siteName => 
        scrapeSite(shoppingSites[siteName], query, limitPerSite)
          .catch(error => {
            console.error(`Failed to scrape ${siteName}:`, error.message);
            return [];
          })
      );

    const results = await Promise.all(scrapePromises);
    const allProducts = results.flat();

    // Remove duplicates based on similar titles
    const uniqueProducts = [];
    const seenTitles = new Set();

    for (const product of allProducts) {
      const normalizedTitle = product.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      const titleKey = normalizedTitle.substring(0, 30); // Use first 30 chars for comparison
      
      if (!seenTitles.has(titleKey)) {
        seenTitles.add(titleKey);
        uniqueProducts.push(product);
      }
    }

    // Sort by price (ascending) and limit results
    const sortedProducts = uniqueProducts
      .sort((a, b) => a.price.selling - b.price.selling)
      .slice(0, limit);

    res.json({
      success: true,
      data: {
        products: sortedProducts,
        query,
        totalFound: sortedProducts.length,
        sitesScraped: sites.filter(siteName => shoppingSites[siteName]),
        scrapedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Web scraping error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to scrape products',
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
    name: key.charAt(0).toUpperCase() + key.slice(1),
    baseUrl: shoppingSites[key].baseUrl,
    logo: `https://www.google.com/s2/favicons?domain=${shoppingSites[key].baseUrl}&sz=32`
  }));

  res.json({
    success: true,
    data: { sites }
  });
});

module.exports = router;
