const express = require('express');
const { body, validationResult } = require('express-validator');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Product = require('../models/Product');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Fashion chatbot endpoint
router.post('/chat', [
  optionalAuth,
  body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be between 1 and 1000 characters'),
  body('context').optional().isArray()
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

    const { message, context = [] } = req.body;
    
    // Get user's preferences if authenticated
    let userPreferences = '';
    if (req.user) {
      const preferences = req.user.preferences;
      userPreferences = `
        User preferences:
        - Favorite categories: ${preferences.favoriteCategories?.join(', ') || 'None specified'}
        - Size preferences: Shirt: ${preferences.sizePreferences?.shirt || 'Not specified'}, Pants: ${preferences.sizePreferences?.pants || 'Not specified'}, Shoes: ${preferences.sizePreferences?.shoes || 'Not specified'}
      `;
    }

    // Create context-aware prompt
    const systemPrompt = `
You are Manvue's AI fashion assistant, an expert in men's fashion and style. You help customers with:

1. Style advice and outfit recommendations
2. Fashion trends and seasonal suggestions
3. Size and fit guidance
4. Product recommendations
5. Styling tips for different occasions
6. Color coordination and matching
7. Fashion care and maintenance

Guidelines:
- Be friendly, knowledgeable, and concise
- Focus on men's fashion exclusively
- Provide specific, actionable advice
- Ask clarifying questions when needed
- Recommend products from our categories: shirts, t-shirts, jeans, trousers, chinos, shorts, jackets, blazers, suits, sweaters, hoodies, kurtas, sherwanis, ethnic wear, shoes, sneakers, formal shoes, boots, sandals, watches, belts, wallets, sunglasses, ties, bags, accessories
- Consider occasions: casual, formal, sport, party, wedding, office, seasonal events
- Keep responses under 200 words unless detailed explanation is needed

${userPreferences}

Previous conversation context:
${context.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Current user message: ${message}

Respond as Manvue's fashion assistant:
`;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const botMessage = response.text();

    res.json({
      success: true,
      data: {
        message: botMessage,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'AI service temporarily unavailable'
    });
  }
});

// Voice recommendation endpoint
router.post('/voice-recommend', [
  optionalAuth,
  body('transcript').trim().isLength({ min: 1, max: 500 }).withMessage('Voice transcript must be between 1 and 500 characters'),
  body('occasion').optional().isString(),
  body('budget').optional().isNumeric()
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

    const { transcript, occasion, budget } = req.body;

    // Parse voice input using AI to extract fashion requirements
    const analysisPrompt = `
Analyze this voice request for men's fashion recommendations and extract:
1. Product categories mentioned
2. Style preferences (casual, formal, sporty, etc.)
3. Colors mentioned
4. Occasion/event
5. Size preferences (if any)
6. Budget range (if mentioned)

Voice request: "${transcript}"
Occasion: ${occasion || 'Not specified'}
Budget: ${budget || 'Not specified'}

Respond in JSON format:
{
  "categories": ["category1", "category2"],
  "style": "style_preference",
  "colors": ["color1", "color2"],
  "occasion": "extracted_occasion",
  "budget_range": "extracted_budget",
  "query_intent": "brief description of what user wants"
}
`;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const analysisResult = await model.generateContent(analysisPrompt);
    const analysisResponse = await analysisResult.response;
    let analysis;
    
    try {
      analysis = JSON.parse(analysisResponse.text());
    } catch (e) {
      // Fallback if AI doesn't return valid JSON
      analysis = {
        categories: ['shirts', 'trousers'],
        style: 'casual',
        colors: [],
        occasion: occasion || 'general',
        budget_range: budget || 'medium',
        query_intent: transcript
      };
    }

    // Build product search query based on AI analysis
    const searchQuery = {
      isActive: true
    };

    if (analysis.categories?.length > 0) {
      searchQuery.category = { $in: analysis.categories };
    }

    if (budget) {
      const budgetNum = parseFloat(budget);
      searchQuery['price.selling'] = { $lte: budgetNum };
    }

    // Search for matching products
    const recommendations = await Product.find(searchQuery)
      .select('title slug price.selling discount primaryImage rating.average category brand.name variants')
      .sort({ 'rating.average': -1, soldCount: -1 })
      .limit(8);

    // Generate personalized recommendation text
    const recommendationPrompt = `
Based on the user's voice request: "${transcript}"
And analysis: ${JSON.stringify(analysis)}

Generate a personalized recommendation message (2-3 sentences) explaining why these products match their request.
Be conversational and mention specific aspects like style, occasion, or colors if relevant.
`;

    const recommendationResult = await model.generateContent(recommendationPrompt);
    const recommendationResponse = await recommendationResult.response;
    const recommendationText = recommendationResponse.text();

    res.json({
      success: true,
      data: {
        analysis,
        recommendations,
        message: recommendationText,
        totalFound: recommendations.length
      }
    });

  } catch (error) {
    console.error('Voice recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Voice recommendation service temporarily unavailable'
    });
  }
});

// Image-based search endpoint
router.post('/search-image', [
  optionalAuth,
  body('imageUrl').isURL().withMessage('Valid image URL is required'),
  body('searchType').optional().isIn(['similar', 'color', 'style']).withMessage('Invalid search type')
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

    const { imageUrl, searchType = 'similar' } = req.body;

    // Use Gemini Vision to analyze the image
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    const analysisPrompt = `
Analyze this fashion image and identify:
1. Main clothing items/accessories visible
2. Colors (list primary and secondary colors)
3. Style category (casual, formal, sporty, ethnic, etc.)
4. Specific product categories (shirts, jeans, shoes, etc.)
5. Notable patterns or textures
6. Overall fashion aesthetic

Respond in JSON format:
{
  "items": ["item1", "item2"],
  "colors": ["color1", "color2"],
  "style": "style_category",
  "categories": ["category1", "category2"],
  "patterns": ["pattern1", "pattern2"],
  "aesthetic": "description",
  "search_keywords": ["keyword1", "keyword2"]
}
`;

    const imagePart = {
      inlineData: {
        data: imageUrl.split(',')[1] || imageUrl, // Handle base64 or URL
        mimeType: "image/jpeg"
      }
    };

    let analysis;
    try {
      const result = await model.generateContent([analysisPrompt, imagePart]);
      const response = await result.response;
      analysis = JSON.parse(response.text());
    } catch (e) {
      // Fallback analysis if vision API fails
      analysis = {
        items: ['clothing'],
        colors: ['black', 'blue'],
        style: 'casual',
        categories: ['shirts', 'trousers'],
        patterns: [],
        aesthetic: 'modern',
        search_keywords: ['fashion', 'style']
      };
    }

    // Build search query based on image analysis
    const searchQuery = {
      isActive: true
    };

    // Search based on type
    switch (searchType) {
      case 'color':
        if (analysis.colors?.length > 0) {
          searchQuery['variants.color'] = { 
            $regex: new RegExp(analysis.colors.join('|'), 'i') 
          };
        }
        break;
      
      case 'style':
        if (analysis.style) {
          searchQuery.subCategory = analysis.style;
        }
        break;
      
      case 'similar':
      default:
        if (analysis.categories?.length > 0) {
          searchQuery.category = { $in: analysis.categories };
        }
        
        // Use text search for additional matching
        if (analysis.search_keywords?.length > 0) {
          searchQuery.$text = { 
            $search: analysis.search_keywords.join(' ') 
          };
        }
        break;
    }

    // Find similar products
    const similarProducts = await Product.find(searchQuery)
      .select('title slug price.selling discount primaryImage rating.average category brand.name variants')
      .sort({ 'rating.average': -1, soldCount: -1 })
      .limit(12);

    res.json({
      success: true,
      data: {
        analysis,
        products: similarProducts,
        searchType,
        totalFound: similarProducts.length
      }
    });

  } catch (error) {
    console.error('Image search error:', error);
    res.status(500).json({
      success: false,
      message: 'Image search service temporarily unavailable'
    });
  }
});

// Style advisor endpoint
router.post('/style-advice', [
  optionalAuth,
  body('occasion').notEmpty().withMessage('Occasion is required'),
  body('budget').optional().isNumeric(),
  body('bodyType').optional().isString(),
  body('preferences').optional().isObject()
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

    const { occasion, budget, bodyType, preferences = {} } = req.body;

    // Get user's style preferences if authenticated
    let userContext = '';
    if (req.user) {
      userContext = `
        User's previous preferences:
        - Favorite categories: ${req.user.preferences.favoriteCategories?.join(', ') || 'None'}
        - Size preferences: ${JSON.stringify(req.user.preferences.sizePreferences)}
      `;
    }

    const stylePrompt = `
As Manvue's AI style advisor, provide comprehensive outfit recommendations for:

Occasion: ${occasion}
Budget: ${budget ? `£${budget}` : 'Flexible'}
Body type: ${bodyType || 'Not specified'}
Preferences: ${JSON.stringify(preferences)}
${userContext}

Provide:
1. 3 complete outfit suggestions with specific items
2. Color combinations that work well
3. Essential accessories to complete the look
4. Styling tips specific to the occasion
5. Alternatives for different budget ranges

Format as JSON:
{
  "outfits": [
    {
      "name": "Outfit 1 Name",
      "items": ["item1", "item2", "item3"],
      "colors": ["primary_color", "accent_color"],
      "accessories": ["accessory1", "accessory2"],
      "estimated_cost": "price_range",
      "styling_tip": "specific tip for this outfit"
    }
  ],
  "general_tips": ["tip1", "tip2"],
  "color_guide": "color recommendations",
  "budget_alternatives": "suggestions for different budgets"
}
`;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(stylePrompt);
    const response = await result.response;
    let styleAdvice;

    try {
      styleAdvice = JSON.parse(response.text());
    } catch (e) {
      // Fallback if AI doesn't return valid JSON
      styleAdvice = {
        outfits: [
          {
            name: "Classic Smart Casual",
            items: ["Button-down shirt", "Chinos", "Loafers"],
            colors: ["Navy", "White"],
            accessories: ["Leather belt", "Watch"],
            estimated_cost: "£30-50",
            styling_tip: "Keep it simple and well-fitted"
          }
        ],
        general_tips: ["Focus on fit over fashion", "Invest in quality basics"],
        color_guide: "Stick to neutral colors with one accent piece",
        budget_alternatives: "Mix high and low-end pieces strategically"
      };
    }

    // Find products that match the outfit suggestions
    const productCategories = [];
    styleAdvice.outfits?.forEach(outfit => {
      outfit.items?.forEach(item => {
        const category = mapItemToCategory(item);
        if (category) productCategories.push(category);
      });
    });

    let matchingProducts = [];
    if (productCategories.length > 0) {
      const query = {
        isActive: true,
        category: { $in: productCategories }
      };

      if (budget) {
        query['price.selling'] = { $lte: parseFloat(budget) };
      }

      matchingProducts = await Product.find(query)
        .select('title slug price.selling primaryImage category brand.name')
        .sort({ 'rating.average': -1 })
        .limit(6);
    }

    res.json({
      success: true,
      data: {
        advice: styleAdvice,
        matching_products: matchingProducts,
        occasion,
        budget
      }
    });

  } catch (error) {
    console.error('Style advice error:', error);
    res.status(500).json({
      success: false,
      message: 'Style advisor service temporarily unavailable'
    });
  }
});

// Helper function to map outfit items to product categories
function mapItemToCategory(item) {
  const itemLower = item.toLowerCase();
  
  const categoryMap = {
    'shirt': 'shirts',
    'button-down': 'shirts',
    'polo': 'shirts',
    't-shirt': 'tshirts',
    'tee': 'tshirts',
    'jeans': 'jeans',
    'trousers': 'trousers',
    'pants': 'trousers',
    'chinos': 'chinos',
    'shorts': 'shorts',
    'jacket': 'jackets',
    'blazer': 'blazers',
    'suit': 'suits',
    'sweater': 'sweaters',
    'hoodie': 'hoodies',
    'kurta': 'kurtas',
    'sherwani': 'sherwanis',
    'shoes': 'shoes',
    'sneakers': 'sneakers',
    'boots': 'boots',
    'loafers': 'formal-shoes',
    'watch': 'watches',
    'belt': 'belts',
    'wallet': 'wallets',
    'sunglasses': 'sunglasses',
    'tie': 'ties'
  };

  for (const [key, category] of Object.entries(categoryMap)) {
    if (itemLower.includes(key)) {
      return category;
    }
  }

  return null;
}

// Generate product embeddings (admin utility)
router.post('/generate-embeddings', async (req, res) => {
  try {
    // This is a utility endpoint to generate embeddings for existing products
    // In a real implementation, you'd use a proper embedding model
    
    const products = await Product.find({ isActive: true, embeddings: { $size: 0 } });
    let updated = 0;

    for (const product of products) {
      // Simple mock embedding based on product features
      // In production, use proper vector embedding models
      const embedding = generateMockEmbedding(product);
      product.embeddings = embedding;
      await product.save();
      updated++;
    }

    res.json({
      success: true,
      message: `Generated embeddings for ${updated} products`
    });

  } catch (error) {
    console.error('Generate embeddings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate embeddings'
    });
  }
});

// Mock embedding function (replace with actual embedding model in production)
function generateMockEmbedding(product) {
  // Create a simple numerical representation based on product features
  const features = [
    product.category.length,
    product.price.selling / 1000,
    product.rating.average,
    product.title.length,
    product.brand.name.length
  ];
  
  // Normalize and pad to create a consistent vector size
  const embedding = features.concat(Array(100 - features.length).fill(0));
  return embedding.slice(0, 100); // Ensure consistent size
}

module.exports = router;
