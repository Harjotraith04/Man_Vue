const express = require('express');
const { body, validationResult } = require('express-validator');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Product = require('../models/Product');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Vector similarity function (cosine similarity)
function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Generate embeddings for text using Gemini
async function generateEmbedding(text) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });
    const prompt = `Convert this text to a numerical vector representation for similarity search. Return only a JSON array of numbers: "${text}"`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();
    
    // Try to parse as JSON array
    try {
      return JSON.parse(textResponse);
    } catch (e) {
      // Fallback: generate simple hash-based vector
      return generateHashVector(text);
    }
  } catch (error) {
    console.warn('Gemini embedding failed, using hash vector:', error.message);
    return generateHashVector(text);
  }
}

// Generate hash-based vector as fallback
function generateHashVector(text) {
  const words = text.toLowerCase().split(/\s+/);
  const vector = new Array(50).fill(0);
  
  words.forEach(word => {
    const hash = word.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const index = Math.abs(hash) % 50;
    vector[index] += 1;
  });
  
  // Normalize vector
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map(val => val / magnitude);
}

// Enhanced product search with vector similarity
async function searchProductsWithVector(query, limit = 6) {
  try {
    const queryLower = query.toLowerCase();
    
    // Extract color and category from query
    const colors = ['red', 'blue', 'black', 'white', 'green', 'brown', 'navy', 'gray', 'grey', 'pink', 'purple', 'yellow', 'orange'];
    const categories = ['shirt', 'shirts', 'jean', 'jeans', 'shoe', 'shoes', 'jacket', 'jackets', 't-shirt', 'tshirt', 'accessory', 'accessories', 'kurta', 'kurtas'];
    
    const foundColors = colors.filter(color => queryLower.includes(color));
    const foundCategories = categories.filter(cat => queryLower.includes(cat));
    
    // Build search query with color and category filters
    let searchQuery = { isActive: true };
    
    // Add category filter if found
    if (foundCategories.length > 0) {
      const categoryMap = {
        'shirt': 'shirts',
        'shirts': 'shirts',
        'jean': 'jeans',
        'jeans': 'jeans',
        'shoe': 'shoes',
        'shoes': 'shoes',
        'jacket': 'jackets',
        'jackets': 'jackets',
        't-shirt': 'tshirts',
        'tshirt': 'tshirts',
        'accessory': 'accessories',
        'accessories': 'accessories',
        'kurta': 'kurtas',
        'kurtas': 'kurtas'
      };
      
      const targetCategories = foundCategories.map(cat => categoryMap[cat]).filter(Boolean);
      if (targetCategories.length > 0) {
        searchQuery.category = { $in: targetCategories };
      }
    }
    
    // Add color filter if found
    if (foundColors.length > 0) {
      searchQuery.$or = [
        { 'variants.color': { $in: foundColors } },
        { 'variants.colorCode': { $regex: new RegExp(foundColors.join('|'), 'i') } },
        { tags: { $in: foundColors } }
      ];
    }
    
    // Get products with filters
    let products = await Product.find(searchQuery)
      .select('title description category subCategory price.selling primaryImage rating.average brand.name variants tags features')
      .lean();
    
    // If no products found with color/category filters, try broader search
    if (products.length === 0) {
      products = await Product.find({ isActive: true })
        .select('title description category subCategory price.selling primaryImage rating.average brand.name variants tags features')
        .lean();
    }
    
    // Generate query embedding for similarity calculation
    const queryEmbedding = await generateEmbedding(query);
    
    // Calculate similarity scores with enhanced matching
    const productsWithSimilarity = products.map(product => {
      const productText = `${product.title} ${product.description} ${product.category} ${product.subCategory} ${product.tags.join(' ')} ${product.features.join(' ')}`;
      
      // Add color information from variants
      const variantColors = product.variants.map(v => v.color).join(' ');
      const enhancedProductText = `${productText} ${variantColors}`;
      
      const productEmbedding = generateHashVector(enhancedProductText);
      let similarity = cosineSimilarity(queryEmbedding, productEmbedding);
      
      // Boost similarity for exact color matches
      if (foundColors.length > 0) {
        const hasMatchingColor = foundColors.some(color => 
          product.variants.some(v => v.color.toLowerCase().includes(color)) ||
          product.tags.some(tag => tag.toLowerCase().includes(color))
        );
        if (hasMatchingColor) {
          similarity += 0.5; // Higher boost for color match
          
          // Additional boost if the color is the primary variant
          const hasPrimaryColorMatch = foundColors.some(color => 
            product.variants.some(v => 
              v.color.toLowerCase().includes(color) && 
              v.images && v.images.some(img => img.isPrimary)
            )
          );
          if (hasPrimaryColorMatch) {
            similarity += 0.2; // Extra boost for primary color match
          }
        }
      }
      
      // Boost similarity for exact category matches
      if (foundCategories.length > 0) {
        const hasMatchingCategory = foundCategories.some(cat => 
          product.category.toLowerCase().includes(cat) ||
          product.subCategory.toLowerCase().includes(cat)
        );
        if (hasMatchingCategory) {
          similarity += 0.2; // Boost for category match
        }
      }
      
      return {
        ...product,
        similarity,
        variants: product.variants // Ensure variants are preserved
      };
    });
    
    // Sort by similarity and return top results
    return productsWithSimilarity
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
      
  } catch (error) {
    console.error('Vector search error:', error);
    // Fallback to text search
    return await Product.find({
      isActive: true,
      $text: { $search: query }
    })
    .select('title description category subCategory price.selling primaryImage rating.average brand.name variants tags features')
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .lean();
  }
}

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
    let botMessage;
    let recommendedProducts = [];
    
    // Try Gemini AI first, fallback to rule-based responses
    try {
      if (process.env.GEMINI_API_KEY) {
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

        // Search for relevant products using exact database matching
        const searchQuery = message.toLowerCase();
        const isProductQuery = /\b(shirt|shirts|jean|jeans|shoe|shoes|jacket|jackets|t-shirt|tshirt|accessory|accessories|kurta|kurtas|formal|casual|red|blue|black|white|green|brown|navy|gray|grey|color|colors|price|budget|premium|cheap|expensive|maximum|minimum|max|min|show|give|want|need|looking|find)\b/.test(searchQuery);
        
        if (isProductQuery) {
          // Extract specific search criteria
          const colorKeywords = ['red', 'blue', 'black', 'white', 'green', 'brown', 'navy', 'gray', 'grey'];
          const categoryKeywords = ['shirt', 'shirts', 'jean', 'jeans', 'shoe', 'shoes', 'jacket', 'jackets', 't-shirt', 'tshirt', 'accessory', 'accessories', 'kurta', 'kurtas'];
          
          const foundColor = colorKeywords.find(color => searchQuery.includes(color));
          const foundCategory = categoryKeywords.find(cat => searchQuery.includes(cat));
          
          // Build exact database query
          let dbQuery = {};
          
          // Add category filter if found
          if (foundCategory) {
            if (foundCategory.includes('shirt') || foundCategory.includes('tshirt')) {
              dbQuery.category = 'shirts';
            } else if (foundCategory.includes('jean')) {
              dbQuery.category = 'jeans';
            } else if (foundCategory.includes('shoe')) {
              dbQuery.category = 'shoes';
            } else if (foundCategory.includes('jacket')) {
              dbQuery.category = 'jackets';
            } else if (foundCategory.includes('accessory')) {
              dbQuery.category = 'accessories';
            }
          }
          
          // Search products from database with exact criteria
          let products = await Product.find(dbQuery)
            .select('title description category subCategory price.selling primaryImage rating.average brand.name variants tags features')
            .lean();
          
          // Filter by color if specified
          if (foundColor) {
            products = products.filter(product => 
              product.variants && product.variants.some(v => 
                v.color.toLowerCase().includes(foundColor)
              )
            );
          }
          
          // Limit to top 6 products
          recommendedProducts = products.slice(0, 6);
        }

        // Create context-aware prompt with product information
        let productContext = '';
        if (recommendedProducts.length > 0) {
          // Check if user is asking for specific colors
          const colorKeywords = ['red', 'blue', 'black', 'white', 'green', 'brown', 'navy', 'gray', 'grey'];
          const foundColor = colorKeywords.find(color => searchQuery.includes(color));
          
          if (foundColor) {
            const productsWithColor = recommendedProducts.filter(product => 
              product.variants.some(v => v.color.toLowerCase().includes(foundColor))
            );
            
            if (productsWithColor.length > 0) {
              productContext = `
Available ${foundColor} products in our store:
${productsWithColor.map((product, index) => {
                const colorVariants = product.variants.filter(v => v.color.toLowerCase().includes(foundColor));
                return `${index + 1}. ${product.title} - ${product.category} - £${product.price.selling} - Available in: ${colorVariants.map(v => v.color).join(', ')}`;
              }).join('\n')}
`;
            }
          } else {
            productContext = `
Available products in our store:
${recommendedProducts.map((product, index) => 
  `${index + 1}. ${product.title} - ${product.category} - £${product.price.selling} - ${product.brand.name}`
).join('\n')}
`;
          }
        }

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
- If the user asks about specific products or colors, mention the available products from our store
- When showing color-specific products, be enthusiastic and highlight the color availability
- Always mention the available colors for each product when relevant

${userPreferences}

${productContext}

Previous conversation context:
${context.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Current user message: ${message}

Respond as Manvue's fashion assistant:
`;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });
        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        botMessage = response.text();
      } else {
        // Fallback to rule-based responses
        botMessage = generateRuleBasedResponse(message, req.user);
      }
    } catch (aiError) {
      console.warn('Gemini AI error, using fallback:', aiError.message);
      botMessage = generateRuleBasedResponse(message, req.user);
    }

    res.json({
      success: true,
      data: {
        message: botMessage,
        products: recommendedProducts,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'I apologize, but I am having trouble responding right now. Please try again in a moment.'
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

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });
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

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });
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

// Intelligent rule-based response generator for fallback
function generateRuleBasedResponse(message, user) {
  const messageLower = message.toLowerCase();
  
  // Normalize common typos and variations
  const normalizedMessage = messageLower
    .replace(/prize/g, 'price')  // Common typo
    .replace(/maximun/g, 'maximum')  // Common typo
    .replace(/minimun/g, 'minimum')  // Common typo
    .replace(/cloths/g, 'clothes')  // Common typo
    .replace(/shose/g, 'shoes')  // Common typo
    .replace(/jeens/g, 'jeans')  // Common typo
    .replace(/shirtt/g, 'shirt')  // Common typo
    .replace(/accesories/g, 'accessories')  // Common typo
    .replace(/\s+/g, ' ')  // Multiple spaces to single space
    .trim();
  
  // Formal wear queries
  if (normalizedMessage.includes('formal') || normalizedMessage.includes('office') || normalizedMessage.includes('work') || normalizedMessage.includes('business')) {
    return "For formal occasions, I recommend a crisp dress shirt from our formal collection paired with well-fitted trousers. Complete the look with formal leather shoes and elegant accessories. Our formal category includes professional shirts, business attire, and ethnic formal wear like kurtas. Would you like me to show you some specific formal wear options from our collection?";
  }
  
  // Casual wear queries
  if (normalizedMessage.includes('casual') || normalizedMessage.includes('everyday') || normalizedMessage.includes('relaxed')) {
    return "For casual wear, you can choose from our collection of comfortable jeans, casual shirts, or t-shirts. Add casual shoes or sneakers to complete the look. We also have great accessories like belts and watches to enhance your casual style. What's your preferred casual style - more relaxed or smart-casual?";
  }
  
  // Trending/fashion queries
  if (normalizedMessage.includes('trend') || normalizedMessage.includes('popular') || normalizedMessage.includes('style') || normalizedMessage.includes('fashion')) {
    return "Currently trending in men's fashion: oversized t-shirts, slim-fit jeans, minimalist sneakers, and classic leather jackets. Neutral colors like navy, white, black, and earth tones are very popular. What type of trending item interests you most?";
  }
  
  // Size guide queries
  if (normalizedMessage.includes('size') || normalizedMessage.includes('fit') || normalizedMessage.includes('measurement')) {
    return "Here's a quick size guide: For shirts, measure your chest and neck. For pants, you'll need waist and inseam measurements. For shoes, it's best to measure your foot length. Would you like detailed sizing help for a specific item category?";
  }
  
  // Color advice
  if (normalizedMessage.includes('color') || normalizedMessage.includes('match') || normalizedMessage.includes('coordinate')) {
    return "Great color combinations include: Navy with white or grey, black with almost any color, khaki with navy or white, and burgundy with grey. For a safe approach, stick to neutral base colors and add one accent color. What colors are you considering?";
  }
  
  // Color-specific responses
  if (normalizedMessage.includes('blue') && (normalizedMessage.includes('shirt') || normalizedMessage.includes('shirts'))) {
    return "Perfect! I have some great blue shirts in our collection. We have classic and premium blue shirts available in various styles - from casual everyday wear to more formal options. Each shirt comes in multiple color variants including blue, so you can choose the perfect shade that matches your style. Would you like me to show you the available blue shirt options?";
  }
  
  if (normalizedMessage.includes('red') && (normalizedMessage.includes('shirt') || normalizedMessage.includes('shirts'))) {
    return "Excellent choice! We have stylish red shirts in our collection. Our red shirts come in different styles and fits, perfect for making a bold fashion statement. Each shirt is available in multiple color variants including red, so you can find the perfect shade. Would you like me to show you our red shirt collection?";
  }
  
  if (normalizedMessage.includes('black') && (normalizedMessage.includes('shirt') || normalizedMessage.includes('shirts'))) {
    return "Great selection! Black shirts are always a classic choice. We have elegant black shirts in our collection, perfect for both formal and casual occasions. Our black shirts come in various styles and are available in multiple color variants. Would you like me to show you our black shirt options?";
  }

  // Specific product categories matching our actual inventory
  const categories = {
    'shirt': 'Check out our shirts collection! We have both casual and formal shirts in various styles. Our collection includes comfortable everyday shirts and professional formal options.',
    'shirts': 'Check out our shirts collection! We have both casual and formal shirts in various styles. Our collection includes comfortable everyday shirts and professional formal options.',
    'jean': 'Our jeans collection offers modern styles in comfortable fits. These are perfect for casual wear and can be paired with t-shirts or casual shirts.',
    'jeans': 'Our jeans collection offers modern styles in comfortable fits. These are perfect for casual wear and can be paired with t-shirts or casual shirts.',
    'shoe': 'Browse our shoes collection with both casual and formal options. We have comfortable everyday shoes and premium formal footwear.',
    'shoes': 'Browse our shoes collection with both casual and formal options. We have comfortable everyday shoes and premium formal footwear.',
    'formal': 'Our formal collection includes professional business attire, formal shirts, and elegant ethnic wear. Perfect for office, meetings, and formal events.',
    'jacket': 'Check out our jackets for stylish layering options that add sophistication to any outfit.',
    't-shirt': 'Our t-shirts are perfect for casual, comfortable wear. Great for everyday activities and casual outings.',
    'tshirt': 'Our t-shirts are perfect for casual, comfortable wear. Great for everyday activities and casual outings.',
    'accessory': 'Browse our accessories collection for the perfect finishing touches - from watches to belts and other stylish add-ons.',
    'accessories': 'Browse our accessories collection for the perfect finishing touches - from watches to belts and other stylish add-ons.',
    'kurta': 'Explore our kurtas collection for traditional and contemporary ethnic wear, perfect for festivals, weddings, and cultural events.',
    'kurtas': 'Explore our kurtas collection for traditional and contemporary ethnic wear, perfect for festivals, weddings, and cultural events.',
    'ethnic': 'Our ethnic collection features beautiful kurtas and traditional wear for special occasions and cultural celebrations.'
  };
  
  for (const [keyword, response] of Object.entries(categories)) {
    if (normalizedMessage.includes(keyword)) {
      return response + " Would you like me to show you some specific options?";
    }
  }
  
  // Intelligent context-aware responses
  if (normalizedMessage.includes('help') || normalizedMessage.includes('assist') || normalizedMessage.includes('need')) {
    return "I'm here to help you with all your fashion needs! I can assist with outfit recommendations, style advice, size guides, color coordination, and product suggestions. Here's what I can do:\n\n• Show you formal, casual, or ethnic wear\n• Find products by price range (budget to premium)\n• Provide styling tips for any occasion\n• Help with size and fit questions\n• Suggest color combinations\n\nWhat would you like help with today?";
  }
  
  // Shopping intent detection
  if (normalizedMessage.includes('buy') || normalizedMessage.includes('purchase') || normalizedMessage.includes('order') || normalizedMessage.includes('shop')) {
    return "Great! I'd love to help you find the perfect items to purchase. Our collection includes shirts (£15-£20), jeans (£26-£30), jackets (£100), shoes (£35-£40), t-shirts (£7), accessories (£10), and ethnic wear (£19-£22). What type of item are you looking to buy?";
  }
  
  // Occasion-based advice
  if (messageLower.includes('date') || messageLower.includes('dinner')) {
    return "For a date or dinner, smart-casual is usually perfect: nice chinos or dark jeans with a button-down shirt or polo, finished with clean shoes. Avoid being too formal or too casual. What's the venue like?";
  }
  
  if (messageLower.includes('wedding') || messageLower.includes('party')) {
    return "For weddings and parties, consider the dress code first. Generally, a well-fitted suit or blazer with trousers works well. Choose colors that complement the season and venue. Need help with a specific dress code?";
  }
  
  // Budget and price queries (with intelligent typo correction)
  if (normalizedMessage.includes('budget') || normalizedMessage.includes('cheap') || normalizedMessage.includes('affordable') || 
      normalizedMessage.includes('minimum price') || normalizedMessage.includes('lowest price')) {
    return "Looking for budget-friendly options? I can show you our most affordable pieces that offer great value. These include quality basics like t-shirts (starting at £7), casual shirts (£15), and stylish accessories (£10). Our budget range offers excellent value for money. What type of item are you looking for at a lower price point?";
  }
  
  if (normalizedMessage.includes('maximum price') || normalizedMessage.includes('highest price') || 
      normalizedMessage.includes('max price') ||
      normalizedMessage.includes('premium') || normalizedMessage.includes('expensive') || normalizedMessage.includes('luxury')) {
    return "Looking for premium, high-quality pieces? Our premium collection includes luxury items like our £100 leather jacket, £40 formal shoes, and high-end ethnic wear. These are investment pieces perfect for special occasions and long-term wardrobe building. What type of premium item interests you?";
  }
  
  // Default responses for common greetings and general questions
  if (normalizedMessage.includes('hello') || normalizedMessage.includes('hi') || normalizedMessage.includes('hey')) {
    const timeGreeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';
    return `${timeGreeting}! I'm your AI fashion advisor. I can help you with outfit recommendations, style advice, product information, and fashion trends. What can I help you find today?`;
  }
  
  // Thank you responses
  if (normalizedMessage.includes('thank') || normalizedMessage.includes('thanks')) {
    return "You're very welcome! I'm always here to help with your fashion questions. Is there anything else you'd like to know about our collection or styling advice?";
  }
  
  // Intelligent default response with context
  const hasQuestionWords = /\b(what|where|how|when|why|which|who)\b/.test(normalizedMessage);
  if (hasQuestionWords) {
    return "That's a great question! I specialize in men's fashion and can help with outfit recommendations, style tips, size guides, color coordination, and product suggestions. Could you tell me more specifically what you're looking for? For example:\n\n• Formal wear for office/events\n• Casual everyday clothes\n• Products by price range\n• Style advice for occasions\n• Size and fit guidance";
  }
  
  return "I'd be happy to help you with fashion advice! I can assist with outfit recommendations, style tips, size guides, color coordination, and product suggestions. Could you tell me more about what you're looking for? For example, are you shopping for a specific occasion, or do you need help with a particular item like shirts, jeans, or shoes?";
}

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

// Smart product recommendation endpoint for chatbot
router.post('/recommend-products', [
  optionalAuth,
  body('query').trim().isLength({ min: 1, max: 200 }).withMessage('Query must be between 1 and 200 characters'),
  body('category').optional().isString(),
  body('limit').optional().isInt({ min: 1, max: 12 }).withMessage('Limit must be between 1 and 12')
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

    const { query, category, limit = 6 } = req.body;
    
    // Use vector search for better semantic matching
    let products = await searchProductsWithVector(query, parseInt(limit));
    
    // If no products found with vector search, try traditional search
    if (products.length === 0) {
      const queryLower = query.toLowerCase();
      const searchQuery = { isActive: true };
      
      // Category mapping based on actual database categories
      const categoryMap = {
        'shirt': ['shirts'],
        'shirts': ['shirts'],
        'jeans': ['jeans'],
        'formal': ['shirts', 'formal-shoes', 'formal', 'kurtas'],
        'casual': ['tshirts', 'jeans', 'shirts', 'accessories', 'shoes'],
        'shoes': ['shoes', 'formal-shoes'],
        'shoe': ['shoes', 'formal-shoes'],
        'sneakers': ['shoes'],
        'jacket': ['jackets'],
        'jackets': ['jackets'],
        'ethnic': ['kurtas'],
        'kurtas': ['kurtas'],
        'kurta': ['kurtas'],
        'accessories': ['accessories'],
        'accessory': ['accessories'],
        'watch': ['accessories'],
        'belt': ['accessories'],
        'wallet': ['accessories'],
        'trousers': ['formal', 'jeans'],
        'pants': ['formal', 'jeans'],
        'tshirt': ['tshirts'],
        't-shirt': ['tshirts'],
        'red': ['shirts', 'tshirts', 'jackets', 'kurtas'],
        'blue': ['shirts', 'tshirts', 'jeans', 'jackets'],
        'black': ['shirts', 'tshirts', 'jeans', 'shoes', 'jackets'],
        'white': ['shirts', 'tshirts'],
        'green': ['shirts', 'tshirts', 'jackets'],
        'brown': ['shoes', 'jackets', 'belts'],
        'navy': ['shirts', 'tshirts', 'jackets'],
        'gray': ['shirts', 'tshirts', 'jackets'],
        'grey': ['shirts', 'tshirts', 'jackets']
      };

      // Find matching categories
      let targetCategories = [];
      if (category) {
        targetCategories = categoryMap[category] || [category];
      } else {
        // Auto-detect categories from query
        Object.entries(categoryMap).forEach(([key, categories]) => {
          if (queryLower.includes(key)) {
            targetCategories.push(...categories);
          }
        });
      }

      if (targetCategories.length > 0) {
        searchQuery.category = { $in: targetCategories };
      }

      // Text search for more specific matching
      if (query.length > 3) {
        searchQuery.$text = { $search: query };
      }

      // Price filters
      if (queryLower.includes('budget') || queryLower.includes('cheap') || queryLower.includes('affordable') || 
          queryLower.includes('minimum price') || queryLower.includes('lowest price')) {
        searchQuery['price.selling'] = { $lt: 30 };
      } else if (queryLower.includes('premium') || queryLower.includes('expensive') || queryLower.includes('luxury') || 
                 queryLower.includes('maximum price') || queryLower.includes('highest price')) {
        searchQuery['price.selling'] = { $gt: 30 };
      }

      products = await Product.find(searchQuery)
        .select('title slug price.selling discount primaryImage rating.average category brand.name variants tags features')
        .sort({ 'rating.average': -1, soldCount: -1 })
        .limit(parseInt(limit));
    }

    // Format products for chatbot
    const formattedProducts = products.map(product => ({
      id: product._id,
      title: product.title,
      slug: product.slug,
      price: product.price,
      primaryImage: product.variants?.[0]?.images?.[0]?.url || product.primaryImage,
      category: product.category,
      brand: product.brand,
      rating: product.rating,
      discount: product.discount,
      tags: product.tags || [],
      features: product.features || [],
      variants: product.variants || [],
      description: product.description,
      _id: product._id
    }));

    res.json({
      success: true,
      data: {
        products: formattedProducts,
        query,
        totalFound: products.length
      }
    });

  } catch (error) {
    console.error('Product recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product recommendations'
    });
  }
});

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
