# 🚀 ManVue Backend API

A robust Node.js backend API for the ManVue men's fashion e-commerce platform, built with Express.js, MongoDB, and integrated AI features.

## 🌟 Features

### 🛒 E-Commerce Core
- **Product Management**: CRUD operations for products with image uploads
- **User Authentication**: JWT-based auth with Google OAuth integration
- **Order Processing**: Complete order lifecycle management
- **Payment Integration**: Stripe payment gateway integration
- **Inventory Management**: Stock tracking and management

### 🤖 AI-Powered Features
- **AI Chatbot**: Google Gemini AI integration for product recommendations
- **Image Analysis**: TensorFlow.js for image classification and search
- **Voice Processing**: Speech-to-text for voice search
- **Web Scraping**: Puppeteer-based fashion website scanning

### 📊 Admin Features
- **Admin Dashboard**: Complete admin management system
- **Analytics**: Sales and performance analytics
- **User Management**: Admin user management
- **Dataset Import**: Kaggle dataset import functionality
- **Bulk Operations**: Mass product operations

### 🔧 Technical Features
- **RESTful API**: Well-structured API endpoints
- **Image Management**: Cloudinary integration for image storage
- **Rate Limiting**: API rate limiting for security
- **CORS Support**: Cross-origin resource sharing
- **Security**: Helmet.js for security headers
- **Logging**: Morgan HTTP request logger

## 🏗️ Tech Stack

### Core Technologies
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling

### Authentication & Security
- **JWT** - JSON Web Tokens for authentication
- **Passport.js** - Authentication middleware
- **bcryptjs** - Password hashing
- **Helmet** - Security headers
- **Express Rate Limit** - Rate limiting

### AI & ML
- **Google Generative AI** - Gemini AI integration
- **TensorFlow.js** - Machine learning in Node.js
- **Puppeteer** - Web scraping and automation

### File & Media Management
- **Cloudinary** - Image and video management
- **Multer** - File upload middleware

### Payment Processing
- **Stripe** - Payment gateway integration

### Additional Libraries
- **Axios** - HTTP client
- **Cheerio** - Server-side jQuery
- **Compression** - Response compression
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger
- **Express Validator** - Input validation

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (local or cloud instance)
- **Python 3.7+** (for Kaggle dataset import)
- **Cloudinary Account** (for image storage)
- **Google Cloud Account** (for AI features)
- **Stripe Account** (for payments)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd ManVue/backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment setup**:
   ```bash
   cp env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   PORT=4000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/manvue
   JWT_SECRET=your-super-secret-jwt-key
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   GEMINI_API_KEY=your-gemini-api-key
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

4. **Start the server**:
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

   The API will be available at `http://localhost:4000`

## 📁 Project Structure

```
backend/
├── config/                 # Configuration files
│   ├── cloudinary.js       # Cloudinary configuration
│   └── passport.js         # Passport authentication config
├── middleware/             # Express middleware
│   └── auth.js             # Authentication middleware
├── models/                 # MongoDB models
│   ├── User.js             # User model
│   ├── Product.js          # Product model
│   └── Order.js            # Order model
├── routes/                 # API routes
│   ├── auth.js             # Authentication routes
│   ├── products.js         # Product routes
│   ├── orders.js           # Order routes
│   ├── users.js            # User routes
│   ├── admin.js            # Admin routes
│   ├── ai.js               # AI feature routes
│   ├── payment.js          # Payment routes
│   ├── dataset.js          # Dataset import routes
│   └── webScraper.js       # Web scraping routes
├── scripts/                # Utility scripts
│   ├── seedData.js         # Database seeding
│   ├── createAdmin.js      # Admin user creation
│   ├── importKaggleData.js # Kaggle dataset import
│   └── ...                 # Other utility scripts
├── Kaggle_Data/            # Dataset images
├── server.js               # Main server file
├── package.json            # Dependencies and scripts
└── .env                    # Environment variables
```

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)
```javascript
POST   /register              // User registration
POST   /login                 // User login
GET    /google                // Google OAuth
POST   /logout                // User logout
GET    /me                    // Get current user
PUT    /profile               // Update user profile
```

### Product Routes (`/api/products`)
```javascript
GET    /                      // Get all products
GET    /:slug                 // Get product by slug
GET    /categories/list       // Get product categories
GET    /search                // Search products
GET    /featured              // Get featured products
```

### Order Routes (`/api/orders`)
```javascript
GET    /                      // Get user orders
POST   /                      // Create new order
GET    /:id                   // Get order by ID
PUT    /:id/status            // Update order status
```

### Admin Routes (`/api/admin`)
```javascript
// Products
GET    /products              // Get all products (admin)
POST   /products              // Create product
PUT    /products/:id          // Update product
DELETE /products/:id          // Delete product

// Orders
GET    /orders                // Get all orders
PUT    /orders/:id/status     // Update order status

// Users
GET    /users                 // Get all users
PUT    /users/:id/role         // Update user role
DELETE /users/:id             // Delete user

// Analytics
GET    /analytics             // Get analytics data
GET    /analytics/sales       // Get sales analytics
```

### AI Routes (`/api/ai`)
```javascript
POST   /chat                  // AI chatbot
POST   /image-search          // Image-based search
POST   /voice-search          // Voice-based search
POST   /web-scanner           // Web scraping
```

### Payment Routes (`/api/payment`)
```javascript
POST   /create-intent         // Create payment intent
POST   /webhook               // Stripe webhook
GET    /success               // Payment success
GET    /cancel                // Payment cancel
```

## 🗄️ Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['user', 'admin']),
  avatar: String,
  googleId: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Product Model
```javascript
{
  name: String,
  slug: String (unique),
  description: String,
  price: Number,
  originalPrice: Number,
  images: [String],
  category: String,
  subcategory: String,
  brand: String,
  sizes: [String],
  colors: [String],
  stock: Number,
  isActive: Boolean,
  rating: Number,
  reviews: [Object],
  specifications: Object,
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Order Model
```javascript
{
  user: ObjectId (ref: 'User'),
  items: [{
    product: ObjectId (ref: 'Product'),
    quantity: Number,
    price: Number,
    size: String,
    color: String
  }],
  totalAmount: Number,
  status: String (enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  shippingAddress: Object,
  paymentMethod: String,
  paymentStatus: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Authentication & Security

### JWT Authentication
```javascript
// Generate JWT token
const token = jwt.sign(
  { userId: user._id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Verify JWT token
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

### Password Hashing
```javascript
// Hash password
const hashedPassword = await bcrypt.hash(password, 12);

// Compare password
const isValid = await bcrypt.compare(password, hashedPassword);
```

### Google OAuth
```javascript
// Passport Google strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  // Handle Google authentication
}));
```

## 🤖 AI Integration

### Google Gemini AI
```javascript
// Initialize Gemini AI
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate AI response
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
const result = await model.generateContent(prompt);
const response = await result.response;
const text = response.text();
```

### Image Analysis
```javascript
// TensorFlow.js image classification
const tf = require('@tensorflow/tfjs-node');
const mobilenet = require('@tensorflow-models/mobilenet');

const model = await mobilenet.load();
const predictions = await model.classify(imageBuffer);
```

## 📸 Image Management

### Cloudinary Integration
```javascript
// Upload image to Cloudinary
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const result = await cloudinary.uploader.upload(imagePath, {
  folder: 'manvue/products',
  transformation: [
    { width: 800, height: 800, crop: 'fill' },
    { quality: 'auto' }
  ]
});
```

### Multer Configuration
```javascript
// File upload middleware
const multer = require('multer');
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});
```

## 💳 Payment Processing

### Stripe Integration
```javascript
// Initialize Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create payment intent
const paymentIntent = await stripe.paymentIntents.create({
  amount: totalAmount * 100, // Convert to cents
  currency: 'usd',
  metadata: { orderId: order._id }
});

// Handle webhook
app.post('/api/payment/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  
  // Handle payment events
});
```

## 📊 Dataset Import

### Kaggle Dataset Import
```javascript
// Import Kaggle dataset
const kaggle = require('kaggle');

// Download dataset
await kaggle.datasets.download({
  dataset: 'dataset-name',
  unzip: true,
  path: './Kaggle_Data'
});

// Process and import data
const products = await processKaggleData();
await Product.insertMany(products);
```

### Data Processing Scripts
```bash
# Available scripts
npm run seed              # Seed database with sample data
npm run create-admin      # Create admin user
npm run import-kaggle     # Import Kaggle dataset
npm run fix-products      # Fix product visibility
npm run generate-analytics # Generate analytics data
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server with nodemon
npm start                # Start production server
npm test                 # Run tests

# Database
npm run seed              # Seed database with sample data
npm run create-admin      # Create admin user
npm run import-kaggle     # Import Kaggle dataset
npm run fix-products      # Fix product visibility

# Utilities
npm run generate-analytics # Generate analytics data
npm run check-user        # Check user data
npm run test-kaggle       # Test Kaggle setup
```

## 🛡️ Security Features

### Rate Limiting
```javascript
// API rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

### Security Headers
```javascript
// Security middleware
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

### Input Validation
```javascript
// Express validator
const { body, validationResult } = require('express-validator');

const validateProduct = [
  body('name').notEmpty().withMessage('Product name is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('category').notEmpty().withMessage('Category is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
```

## 📝 Logging & Monitoring

### Morgan Logger
```javascript
// HTTP request logging
const morgan = require('morgan');

app.use(morgan('combined'));
```

### Error Handling
```javascript
// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});
```

## 🧪 Testing

### Test Setup
```bash
# Install testing dependencies
npm install --save-dev jest supertest

# Run tests
npm test
```

### Example Test
```javascript
// Product API test
const request = require('supertest');
const app = require('../server');

describe('Product API', () => {
  test('GET /api/products', async () => {
    const response = await request(app)
      .get('/api/products')
      .expect(200);
    
    expect(response.body.products).toBeDefined();
  });
});
```

## 🚀 Deployment

### Production Configuration
```javascript
// Production environment variables
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/manvue
JWT_SECRET=strong-production-secret
```

### Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

### Environment Variables for Production
```env
# Required for production
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=strong-production-secret
GOOGLE_CLIENT_ID=production-client-id
GOOGLE_CLIENT_SECRET=production-client-secret
CLOUDINARY_CLOUD_NAME=production-cloud-name
CLOUDINARY_API_KEY=production-api-key
CLOUDINARY_API_SECRET=production-api-secret
GEMINI_API_KEY=production-gemini-key
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
```

## 🔧 Development Tips

### Database Connection
```javascript
// MongoDB connection with Mongoose
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));
```

### Middleware Usage
```javascript
// Custom middleware example
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
   ```bash
   # Check MongoDB is running
   mongod --version
   
   # Check connection string
   echo $MONGODB_URI
   ```

2. **Environment Variables**:
   ```bash
   # Check if .env file exists
   ls -la .env
   
   # Verify environment variables
   node -e "console.log(process.env.MONGODB_URI)"
   ```

3. **Port Already in Use**:
   ```bash
   # Kill process on port 4000
   lsof -ti:4000 | xargs kill -9
   ```

4. **Module Not Found**:
   ```bash
   # Clear npm cache and reinstall
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT Documentation](https://jwt.io/)
- [Stripe Documentation](https://stripe.com/docs)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

---

**Built with ❤️ using Node.js, Express.js, and MongoDB**
