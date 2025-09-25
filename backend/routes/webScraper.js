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

// Compare ManVue database products with external shopping websites
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

    const { query, sites = ['amazon', 'ebay', 'next'], limit = 12 } = req.body;

    console.log(`Comparing ManVue products with external sites for query: "${query}"`);

    // Step 1: Search ManVue database for matching products
    let dbProducts = [];
    
    // Check if query matches any specific category
    const queryLower = query.toLowerCase();
    let matchedCategory = null;
    
    if (queryLower.includes('shirt')) {
      matchedCategory = queryLower.includes('t-shirt') || queryLower.includes('tshirt') ? 'tshirts' : 'shirts';
    } else if (queryLower.includes('jean')) {
      matchedCategory = 'jeans';
    } else if (queryLower.includes('shoe') || queryLower.includes('sneaker')) {
      matchedCategory = 'shoes';
    } else if (queryLower.includes('accessorie')) {
      matchedCategory = 'accessories';
    } else if (queryLower.includes('kurta') || queryLower.includes('ethnic')) {
      matchedCategory = 'kurtas';
    } else if (queryLower.includes('formal')) {
      matchedCategory = 'formal';
    }
    
    if (matchedCategory) {
      dbProducts = await Product.find({
        category: matchedCategory,
        isActive: true
      }).select('title price category brand variants slug').lean().limit(8);
    } else {
      // General search across all products
      dbProducts = await Product.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } },
          { tags: { $regex: query, $options: 'i' } }
        ],
        isActive: true
      }).select('title price category brand variants slug').lean().limit(8);
    }

    console.log(`Found ${dbProducts.length} matching products in ManVue database`);

    // Step 2: Create external shopping comparisons with real ManVue products
    const externalComparisons = [];
    
    if (dbProducts.length > 0) {
      for (const dbProduct of dbProducts.slice(0, 6)) {
        // Generate search terms for this specific product
        const searchTerms = [
          `${dbProduct.title.split(' ').slice(0, 3).join(' ')}`, // First 3 words
          `${dbProduct.brand?.name || ''} ${dbProduct.category}`,
          `${dbProduct.category} ${dbProduct.title.split(' ')[0]}`
        ].filter(term => term.trim().length > 0);

        // Create external site links for each search term
        for (const searchTerm of searchTerms.slice(0, 1)) { // Limit to 1 search term per product
          sites.forEach(siteName => {
            const site = shoppingSites[siteName];
            if (site) {
              const searchUrl = site.searchUrl + encodeURIComponent(searchTerm);
              
              externalComparisons.push({
                title: `${dbProduct.title} - Compare on ${site.baseUrl.replace('https://www.', '').replace('.co.uk', '').replace('.com', '')}`,
                price: {
                  selling: dbProduct.price?.selling || 0,
                  currency: 'GBP'
                },
                image: dbProduct.variants?.[0]?.images?.[0]?.url || '/placeholder-image.jpg',
                link: searchUrl, // Real working search URL
                source: siteName,
                category: 'comparison',
                manvueProduct: {
                  title: dbProduct.title,
                  price: dbProduct.price?.selling || 0,
                  slug: dbProduct.slug,
                  internalLink: `/product/${dbProduct.slug}`
                },
                searchTerm,
                isComparison: true
              });
            }
          });
        }
      }
    } else {
      // If no ManVue products found, create general category searches
      const generalSearches = [
        { term: query, description: `Search for "${query}"` },
        { term: `${query} UK`, description: `UK ${query}` }
      ];

      generalSearches.forEach(search => {
        sites.forEach(siteName => {
          const site = shoppingSites[siteName];
          if (site) {
            const searchUrl = site.searchUrl + encodeURIComponent(search.term);
            
            externalComparisons.push({
              title: `${search.description} on ${site.baseUrl.replace('https://www.', '').replace('.co.uk', '').replace('.com', '')}`,
              price: {
                selling: 0,
                currency: 'GBP'
              },
              image: '/placeholder-image.jpg',
              link: searchUrl,
              source: siteName,
              category: 'search',
              searchTerm: search.term,
              isSearch: true
            });
          }
        });
      });
    }

    // Step 3: Limit and randomize results
    const finalResults = externalComparisons
      .sort(() => Math.random() - 0.5) // Randomize
      .slice(0, limit);

    res.json({
      success: true,
      data: {
        products: finalResults,
        query,
        totalFound: finalResults.length,
        sitesScraped: sites.filter(siteName => shoppingSites[siteName]),
        manvueMatches: dbProducts.length,
        scrapedAt: new Date().toISOString(),
        isComparison: true
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
