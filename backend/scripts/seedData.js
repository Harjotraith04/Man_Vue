require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Sample data
const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@manvue.com',
    passwordHash: 'admin123',
    role: 'admin',
    isEmailVerified: true
  },
  {
    name: 'Sagar Jadhav',
    email: 'sagar.jadhav@gmail.com',
    googleId: 'google_sagar_123',
    role: 'user',
    isEmailVerified: true,
    preferences: {
      favoriteCategories: ['shirts', 'jeans', 'jackets'],
      sizePreferences: {
        shirt: 'L',
        pants: '32',
        shoes: '9'
      }
    }
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    passwordHash: 'password123',
    role: 'user',
    isEmailVerified: true,
    preferences: {
      favoriteCategories: ['shirts', 'jeans'],
      sizePreferences: {
        shirt: 'L',
        pants: '32',
        shoes: '9'
      }
    }
  }
];

const sampleProducts = [
  {
    title: 'Classic White Oxford Shirt',
    description: 'Discover the epitome of men\'s wardrobe essentials with this pristine white Oxford shirt. Crafted from premium 100% cotton in a crisp white that exudes sophistication and versatility. The classic Oxford weave creates a distinctive basket-weave texture that\'s both refined and durable, perfect for the modern gentleman who appreciates quality craftsmanship. This regular fit shirt features a meticulously designed spread collar that frames the face beautifully, whether worn with a tie for boardroom meetings or unbuttoned for weekend brunches. The long sleeves with button cuffs offer professional polish, while the breathable cotton construction ensures all-day comfort in any season. The clean, minimalist aesthetic makes this shirt incredibly versatile - pair it with charcoal trousers and leather oxfords for business formal, or wear it unbuttoned over a white tee with dark jeans and sneakers for smart-casual elegance. The wrinkle-resistant finish means you\'ll always look put-together, whether you\'re rushing to morning meetings or traveling for business. Available in sizes S through XL, this shirt accommodates various body types with its flattering regular cut that\'s neither too slim nor too loose. The brilliant white color photography beautifully under both natural and artificial lighting, making it perfect for video calls and professional photography. Ideal for professionals, university students, special occasions, date nights, and anyone who appreciates timeless style. Machine washable for easy care.',
    shortDescription: 'Premium white Oxford shirt with spread collar - versatile, wrinkle-resistant, and effortlessly sophisticated',
    category: 'shirts',
    subCategory: 'formal',
    brand: { name: 'Manvue Essentials' },
    price: { original: 25, selling: 20, currency: 'GBP' },
    discount: { percentage: 20, isActive: true },
    variants: [
      {
        color: 'White',
        colorCode: '#FFFFFF',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop',
            alt: 'White Oxford Shirt',
            isPrimary: true
          }
        ],
        sizes: [
          { size: 'S', stock: 15, price: 20 },
          { size: 'M', stock: 20, price: 20 },
          { size: 'L', stock: 18, price: 20 },
          { size: 'XL', stock: 12, price: 20 }
        ]
      }
    ],
    specifications: {
      material: '100% Cotton',
      care: 'Machine wash cold, tumble dry low',
      fit: 'regular',
      pattern: 'solid',
      sleeve: 'long sleeve',
      neckType: 'spread collar',
      origin: 'UK'
    },
    tags: ['formal', 'office', 'classic', 'cotton', 'white'],
    features: ['Wrinkle resistant', 'Breathable fabric', 'Professional look'],
    isActive: true,
    isFeatured: true,
    isNewArrival: true,
    rating: { average: 4.5, count: 127 },
    soldCount: 89
  },
  {
    title: 'Slim Fit Dark Blue Jeans',
    description: 'Elevate your casual wardrobe with these exceptional slim-fit jeans in a rich, deep indigo blue that never goes out of style. The sophisticated dark blue wash features subtle fading and whiskering that adds character while maintaining a clean, polished appearance suitable for both casual outings and smart-casual environments. Crafted from a premium 98% cotton and 2% elastane blend, these jeans offer the perfect balance of authentic denim texture with modern stretch comfort that moves with your body throughout the day. The slim fit silhouette is expertly tailored to follow your natural leg line without being restrictive, creating a flattering profile that works well for various body types. The mid-rise waist sits comfortably at the hip, while the tapered leg opening creates a modern, streamlined look that pairs beautifully with both sneakers and dress shoes. Classic 5-pocket styling includes functional front and back pockets with authentic orange contrast stitching that adds a premium touch. The fade-resistant dark blue color maintains its richness wash after wash, making these jeans a reliable wardrobe staple. Style them with a white button-down and blazer for smart-casual office days, pair with graphic tees and sneakers for weekend adventures, or dress them up with a henley and leather boots for date nights. The versatile dark blue shade complements every color in your wardrobe - from bright whites and greys to earth tones and bold colors. Perfect for men who appreciate quality denim that doesn\'t sacrifice comfort for style. Available in waist sizes 30-36 with a 32-inch inseam.',
    shortDescription: 'Premium dark indigo slim-fit jeans with stretch comfort - versatile, fade-resistant, and impeccably tailored',
    category: 'jeans',
    subCategory: 'casual',
    brand: { name: 'Manvue Denim' },
    price: { original: 40, selling: 30, currency: 'GBP' },
    discount: { percentage: 25, isActive: true },
    variants: [
      {
        color: 'Dark Blue',
        colorCode: '#1e3a8a',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop',
            alt: 'Dark Blue Jeans',
            isPrimary: true
          }
        ],
        sizes: [
          { size: '30', stock: 8, price: 30 },
          { size: '32', stock: 15, price: 30 },
          { size: '34', stock: 12, price: 30 },
          { size: '36', stock: 10, price: 30 }
        ]
      }
    ],
    specifications: {
      material: '98% Cotton, 2% Elastane',
      care: 'Machine wash cold inside out, hang dry',
      fit: 'slim',
      pattern: 'solid',
      origin: 'UK'
    },
    tags: ['casual', 'denim', 'slim fit', 'stretch', 'everyday'],
    features: ['Stretch comfort', 'Fade resistant', 'Classic 5-pocket design'],
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    rating: { average: 4.3, count: 203 },
    soldCount: 156
  },
  {
    title: 'Premium Black Leather Jacket',
    description: 'Command attention and exude confidence with this stunning premium black leather jacket that embodies timeless rebellion and sophisticated edge. Crafted from supple, full-grain genuine leather in a rich, deep black that develops a beautiful patina over time, this jacket is designed to be your signature piece for years to come. The leather features a smooth, luxurious finish with natural grain patterns that make each jacket unique, while the substantial weight and buttery-soft texture speak to its premium quality. The iconic asymmetrical zip closure creates a dynamic diagonal line across the torso, adding visual interest and modern biker-inspired style. Expertly tailored quilted shoulder panels provide both aesthetic appeal and enhanced durability, while subtly reinforced elbow patches ensure longevity without compromising the sleek silhouette. Multiple functional pockets include two zippered chest pockets, two side entry pockets, and an interior security pocket for your essentials. The jacket features premium YKK zippers throughout that glide smoothly and withstand daily wear. The regular fit allows for comfortable layering over sweaters and hoodies while maintaining a fitted, masculine profile. The versatile black color pairs effortlessly with everything in your wardrobe - layer over a white t-shirt and black jeans for classic rock-inspired looks, wear with grey chinos and boots for edgy smart-casual style, or throw over a hoodie for contemporary streetwear vibes. Perfect for motorcycle rides, concerts, date nights, weekend adventures, or any occasion where you want to make a statement. The jacket\'s timeless design transcends trends, making it a worthy investment piece. Professional leather cleaning recommended to maintain the jacket\'s pristine appearance and extend its lifespan. Available in sizes S-XL to accommodate various builds.',
    shortDescription: 'Luxurious black genuine leather jacket with quilted details - timeless, rebellious, and effortlessly cool',
    category: 'jackets',
    subCategory: 'casual',
    brand: { name: 'Manvue Leather' },
    price: { original: 130, selling: 100, currency: 'GBP' },
    discount: { percentage: 23, isActive: true },
    variants: [
      {
        color: 'Black',
        colorCode: '#000000',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop',
            alt: 'Black Leather Jacket',
            isPrimary: true
          }
        ],
        sizes: [
          { size: 'S', stock: 5, price: 100 },
          { size: 'M', stock: 8, price: 100 },
          { size: 'L', stock: 6, price: 100 },
          { size: 'XL', stock: 4, price: 100 }
        ]
      }
    ],
    specifications: {
      material: 'Genuine Leather',
      care: 'Professional leather cleaning only',
      fit: 'regular',
      pattern: 'solid',
      origin: 'UK'
    },
    tags: ['jacket', 'leather', 'biker', 'edgy', 'premium'],
    features: ['Genuine leather', 'YKK zippers', 'Quilted shoulders', 'Multiple pockets'],
    isActive: true,
    isFeatured: true,
    rating: { average: 4.7, count: 45 },
    soldCount: 23
  },
  {
    title: 'Cotton Casual T-Shirt - Navy Blue',
    description: 'Discover the perfect foundation for your casual wardrobe with this essential navy blue t-shirt that combines superior comfort with effortless style. The rich, deep navy color is carefully selected for its versatility and sophistication - darker than royal blue yet lighter than midnight, this shade complements every skin tone and coordinates beautifully with any color palette in your wardrobe. Crafted from premium 100% ring-spun cotton that\'s been pre-shrunk for lasting fit, the fabric offers exceptional softness against your skin while maintaining its shape and color through countless washes. The classic crew neck design features a perfectly proportioned collar that lies flat without stretching, creating a clean, polished appearance whether worn alone or layered under jackets and cardigans. The regular fit provides comfortable ease of movement without being baggy, with just the right amount of room through the chest and torso for a flattering silhouette on all body types. Short sleeves are expertly hemmed with double-needle stitching for durability, while the straight hem allows for versatile styling - tucked in for a neater appearance or worn untucked for relaxed casual vibes. This navy t-shirt serves as the ultimate wardrobe chameleon: pair with khaki chinos and white sneakers for weekend errands, layer under a denim jacket with dark jeans for casual cool, wear with grey sweatpants for comfortable loungewear, or dress it up with a blazer for smart-casual occasions. The timeless navy blue works beautifully with bright whites, warm greys, earth tones, and even bold accent colors. Perfect for gym sessions, coffee dates, casual Fridays, travel days, or simply lounging at home. The breathable cotton construction keeps you comfortable in warm weather while layering beautifully in cooler months. Available in sizes S through XL for the perfect fit.',
    shortDescription: 'Premium navy blue cotton t-shirt - soft, versatile, and timelessly comfortable for every occasion',
    category: 'tshirts',
    subCategory: 'casual',
    brand: { name: 'Manvue Basics' },
    price: { original: 9, selling: 7, currency: 'GBP' },
    discount: { percentage: 22, isActive: true },
    variants: [
      {
        color: 'Navy Blue',
        colorCode: '#1e40af',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
            alt: 'Navy Blue T-Shirt',
            isPrimary: true
          }
        ],
        sizes: [
          { size: 'S', stock: 25, price: 7 },
          { size: 'M', stock: 30, price: 7 },
          { size: 'L', stock: 28, price: 7 },
          { size: 'XL', stock: 20, price: 7 }
        ]
      }
    ],
    specifications: {
      material: '100% Cotton',
      care: 'Machine wash cold, tumble dry low',
      fit: 'regular',
      pattern: 'solid',
      sleeve: 'short sleeve',
      neckType: 'crew neck',
      origin: 'UK'
    },
    tags: ['tshirt', 'casual', 'cotton', 'basic', 'everyday'],
    features: ['Soft cotton fabric', 'Pre-shrunk', 'Comfortable fit'],
    isActive: true,
    isNewArrival: true,
    rating: { average: 4.2, count: 89 },
    soldCount: 234
  },
  {
    title: 'Formal Black Leather Shoes',
    description: 'Step into professional excellence with these meticulously crafted formal black leather shoes that embody timeless sophistication and superior comfort. Made from premium full-grain genuine leather in a deep, lustrous black that develops a beautiful shine with proper care, these classic Oxford-style shoes represent the pinnacle of men\'s formal footwear. The leather features a smooth, refined finish with subtle natural grain patterns that add character while maintaining the polished appearance expected in professional environments. The traditional Oxford construction with closed lacing system creates clean, streamlined lines that elongate the foot and complement formal attire beautifully. Expert craftsmanship is evident in every detail, from the precisely stitched seams to the perfectly balanced proportions that create a distinguished silhouette. The shoes feature a classic round toe that\'s neither too narrow nor too wide, providing comfortable space for your toes while maintaining an elegant profile. A comfortable cushioned insole with arch support ensures all-day comfort during long office days, important meetings, or special events. The durable rubber outsole provides reliable traction and is designed to withstand daily wear while maintaining a professional appearance. These versatile black formal shoes are essential for building a distinguished professional wardrobe - pair with charcoal or navy suits for business meetings, wear with dress trousers and button-down shirts for office environments, or complement formal wear for weddings, interviews, and special occasions. The timeless black color coordinates effortlessly with all colors in your formal wardrobe, from classic navy and grey suits to bold colors and patterns. Perfect for business professionals, law professionals, formal events, job interviews, weddings, and any occasion requiring polished footwear. The leather construction allows your feet to breathe while providing the structure and support needed for professional wear. Regular leather conditioning will maintain their pristine appearance and extend their lifespan significantly. Available in sizes 7-11 to ensure the perfect fit for optimal comfort and professional appearance.',
    shortDescription: 'Premium black leather Oxford dress shoes - expertly crafted for professional excellence and all-day comfort',
    category: 'formal-shoes',
    subCategory: 'formal',
    brand: { name: 'Manvue Footwear' },
    price: { original: 50, selling: 40, currency: 'GBP' },
    discount: { percentage: 20, isActive: true },
    variants: [
      {
        color: 'Black',
        colorCode: '#000000',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
            alt: 'Black Formal Shoes',
            isPrimary: true
          }
        ],
        sizes: [
          { size: '7', stock: 6, price: 40 },
          { size: '8', stock: 10, price: 40 },
          { size: '9', stock: 12, price: 40 },
          { size: '10', stock: 8, price: 40 },
          { size: '11', stock: 5, price: 40 }
        ]
      }
    ],
    specifications: {
      material: 'Genuine Leather',
      care: 'Wipe with dry cloth, use leather conditioner',
      fit: 'regular',
      pattern: 'solid',
      origin: 'UK'
    },
    tags: ['shoes', 'formal', 'leather', 'oxford', 'office'],
    features: ['Genuine leather upper', 'Cushioned insole', 'Non-slip sole', 'Classic design'],
    isActive: true,
    isFeatured: true,
    rating: { average: 4.4, count: 67 },
    soldCount: 45
  }
];

// Function to generate sample orders
function generateSampleOrders(users, products) {
  const customerUser = users.find(u => u.role === 'user');
  const sampleOrders = [];
  
  // Generate orders for the last 60 days
  const now = new Date();
  for (let i = 0; i < 25; i++) {
    const daysAgo = Math.floor(Math.random() * 60);
    const orderDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    // Randomly select 1-3 products for each order
    const numItems = Math.floor(Math.random() * 3) + 1;
    const selectedProducts = [];
    for (let j = 0; j < numItems; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const variant = product.variants[0];
      const size = variant.sizes[Math.floor(Math.random() * variant.sizes.length)];
      
      selectedProducts.push({
        product: product._id,
        title: product.title,
        image: variant.images[0].url,
        quantity: Math.floor(Math.random() * 2) + 1,
        size: size.size,
        color: variant.color,
        price: size.price,
        totalPrice: size.price * (Math.floor(Math.random() * 2) + 1)
      });
    }
    
    const subtotal = selectedProducts.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = Math.round(subtotal * 0.18); // 18% GST
    const shipping = subtotal > 50 ? 0 : 5; // Free shipping above £50
    const total = subtotal + tax + shipping;
    
    // Assign random status based on order age
    let status;
    if (daysAgo < 1) status = 'pending';
    else if (daysAgo < 3) status = 'confirmed';
    else if (daysAgo < 7) status = 'processing';
    else if (daysAgo < 14) status = 'shipped';
    else if (daysAgo < 45) status = 'delivered';
    else status = Math.random() > 0.9 ? 'cancelled' : 'delivered';
    
    const orderNumber = `ORD${Date.now().toString().slice(-6)}${i.toString().padStart(3, '0')}`;
    
    sampleOrders.push({
      orderNumber,
      user: customerUser._id,
      items: selectedProducts,
      pricing: {
        subtotal,
        discount: 0,
        tax,
        shipping,
        total
      },
      shippingAddress: {
        name: customerUser.name,
        phone: '+44 07741855104',
        email: customerUser.email,
        street: '123 Sample Street',
        city: 'London',
        state: 'England',
        zipCode: 'W1C 1JY',
        country: 'UK'
      },
      billingAddress: {
        name: customerUser.name,
        phone: '+44 07741855104',
        email: customerUser.email,
        street: '123 Sample Street',
        city: 'London',
        state: 'England',
        zipCode: 'W1C 1JY',
        country: 'UK'
      },
      payment: {
        method: ['card', 'apple-pay', 'netbanking'][Math.floor(Math.random() * 3)],
        status: status === 'cancelled' ? 'failed' : 'completed',
        transactionId: `TXN${Date.now().toString().slice(-8)}`,
        paymentGateway: 'stripe',
        amountPaid: total,
        currency: 'GBP',
        paidAt: status !== 'cancelled' ? orderDate : undefined
      },
      shipping: {
        method: 'standard',
        provider: 'royal_mail',
        trackingNumber: status === 'shipped' || status === 'delivered' ? `RM${Date.now().toString().slice(-8)}` : '',
        estimatedDelivery: new Date(orderDate.getTime() + 5 * 24 * 60 * 60 * 1000),
        actualDelivery: status === 'delivered' ? new Date(orderDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined,
        cost: shipping
      },
      status,
      tracking: [
        {
          status: 'order_placed',
          message: 'Order has been placed successfully',
          timestamp: orderDate
        },
        ...(status !== 'pending' ? [{
          status: 'confirmed',
          message: 'Order confirmed and being processed',
          timestamp: new Date(orderDate.getTime() + 2 * 60 * 60 * 1000)
        }] : []),
        ...(status === 'shipped' || status === 'delivered' ? [{
          status: 'shipped',
          message: 'Order has been shipped',
          timestamp: new Date(orderDate.getTime() + 3 * 24 * 60 * 60 * 1000)
        }] : []),
        ...(status === 'delivered' ? [{
          status: 'delivered',
          message: 'Order delivered successfully',
          timestamp: new Date(orderDate.getTime() + 5 * 24 * 60 * 60 * 1000)
        }] : [])
      ],
      notes: {
        customer: '',
        admin: ''
      },
      createdAt: orderDate,
      updatedAt: orderDate
    });
  }
  
  return sampleOrders;
}

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/manvue');
    console.log('📦 Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Seed Users
    const users = [];
    for (const userData of sampleUsers) {
      if (userData.passwordHash) {
        const hashedPassword = await bcrypt.hash(userData.passwordHash, 12);
        users.push({
          ...userData,
          passwordHash: hashedPassword
        });
      } else {
        // For users without password (like Google users)
        users.push({
          ...userData
        });
      }
    }
    
    const createdUsers = await User.insertMany(users);
    console.log(`👥 Created ${createdUsers.length} users`);

    // Get admin user for product creation
    const adminUser = createdUsers.find(user => user.role === 'admin');

    // Seed Products
    const products = sampleProducts.map(product => ({
      ...product,
      createdBy: adminUser._id,
      slug: product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    }));

    const createdProducts = await Product.insertMany(products);
    console.log(`🛍️ Created ${createdProducts.length} products`);

    // Seed Orders
    const sampleOrdersData = generateSampleOrders(createdUsers, createdProducts);
    const createdOrders = await Order.insertMany(sampleOrdersData);
    console.log(`📦 Created ${createdOrders.length} orders`);

    // Calculate total revenue for summary
    const totalRevenue = createdOrders.reduce((sum, order) => sum + order.pricing.total, 0);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📊 Sample Data Summary:');
    console.log(`   👤 Admin User: admin@manvue.com (password: admin123)`);
    console.log(`   👤 Test User: john@example.com (password: password123)`);
    console.log(`   🛍️ Products: ${createdProducts.length} sample products`);
    console.log(`   📦 Orders: ${createdOrders.length} sample orders`);
    console.log(`   💰 Total Revenue: £${totalRevenue.toLocaleString('en-GB')}`);
    console.log(`   🏷️ Categories: shirts, jeans, jackets, tshirts, formal-shoes`);
    console.log(`   📈 Order Statuses: pending, confirmed, processing, shipped, delivered`);
    
    console.log('\n🚀 You can now start using the admin dashboard with real data!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seed function
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, sampleUsers, sampleProducts, generateSampleOrders };
