# 🔥 ManVue – Full-Stack Men's Fashion E-Commerce Platform

A production-ready, full-stack men's fashion e-commerce platform with AI-powered features, AR/VR capabilities, and modern web technologies.

## ✨ Features

### 🛍️ E-Commerce Core
- **Product Catalog**: Complete men's fashion categories (shirts, jeans, ethnic wear, shoes, accessories)
- **Smart Search**: AI-powered search with filters, sorting, and recommendations
- **Shopping Cart**: Advanced cart management with persistent state
- **Checkout**: Secure checkout process with multiple payment options
- **Order Management**: Complete order tracking and management system
- **User Profiles**: Comprehensive user management with preferences

### 🤖 AI-Powered Features
- **Fashion Chatbot**: AI advisor powered by Google Gemini for style recommendations
- **Voice Shopping**: Voice-activated product search and recommendations
- **Image Search**: Upload photos to find similar fashion items
- **Style Recommendations**: Personalized suggestions based on user preferences

### 🥽 AR/VR Experience
- **AR Product Preview**: 3D model try-on using model-viewer
- **VR Gallery**: Immersive virtual fashion showroom
- **360° Product Views**: Interactive product visualization

### 👑 Admin Dashboard
- **Analytics**: Comprehensive sales and user analytics
- **Product Management**: Full CRUD operations for products
- **User Management**: User roles and permissions
- **Order Processing**: Order status management and tracking

### 🔐 Authentication & Security
- **Multi-Auth**: Local authentication + Google OAuth
- **JWT Tokens**: Secure authentication with refresh tokens
- **Role-Based Access**: User and admin role management
- **Security**: Helmet, rate limiting, and input validation

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn/UI** for component library
- **Zustand** for state management
- **React Router** for navigation
- **React Query** for server state
- **Framer Motion** for animations
- **Three.js** for 3D/AR features

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** authentication
- **Passport.js** for OAuth
- **Cloudinary** for image storage
- **Google Gemini AI** for chatbot and recommendations
- **Redis** for caching (optional)

### DevOps & Deployment
- **Docker** & Docker Compose
- **Nginx** reverse proxy
- **ESLint** & Prettier
- **GitHub Actions** ready
- **Production optimized**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker and Docker Compose
- MongoDB (or use Docker)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/manvue.git
cd manvue
```

### 2. Environment Setup

#### Backend Environment
```bash
cp backend/env.example backend/.env
```

Edit `backend/.env` with your configuration:
```env
# Server Configuration
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/manvue

# JWT Secret (generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Cloudinary (get from Cloudinary dashboard)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Google Gemini AI (get from Google AI Studio)
GEMINI_API_KEY=your-gemini-api-key
```

#### Frontend Environment
```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:4000/api
```

### 3. Run with Docker (Recommended)

```bash
# Install root dependencies
npm install

# Start all services
npm run docker:up

# The application will be available at:
# Frontend: http://localhost:5173
# Backend API: http://localhost:4000
# MongoDB: localhost:27017
```

### 4. Or Run Locally

#### Install Dependencies
```bash
npm run install:all
```

#### Start Development Servers
```bash
# Start backend and frontend concurrently
npm run dev

# Or start individually:
npm run dev:backend
npm run dev:frontend
```

### 5. Seed Sample Data
```bash
cd backend
npm run seed
```

This creates:
- Admin user: `admin@manvue.com` (password: `admin123`)
- Test user: `john@example.com` (password: `password123`)
- Sample products across all categories

## 📖 API Documentation

### Authentication Endpoints
```
POST /api/auth/register          # User registration
POST /api/auth/login             # User login
GET  /api/auth/google            # Google OAuth
GET  /api/auth/me                # Get current user
PUT  /api/auth/profile           # Update profile
POST /api/auth/logout            # Logout
```

### Product Endpoints
```
GET    /api/products             # Get products with filters
GET    /api/products/:slug       # Get single product
POST   /api/products             # Create product (admin)
PUT    /api/products/:id         # Update product (admin)
DELETE /api/products/:id         # Delete product (admin)
POST   /api/products/:id/wishlist # Toggle wishlist
POST   /api/products/:id/reviews  # Add review
```

### AI Endpoints
```
POST /api/ai/chat                # Fashion chatbot
POST /api/ai/voice-recommend     # Voice recommendations
POST /api/ai/search-image        # Image-based search
POST /api/ai/style-advice        # Style advisor
```

### Cart & Orders
```
GET    /api/users/cart           # Get user cart
POST   /api/users/cart           # Add to cart
PUT    /api/users/cart/:id       # Update cart item
DELETE /api/users/cart/:id       # Remove from cart

POST   /api/orders               # Create order
GET    /api/orders/:orderNumber  # Get order details
PUT    /api/orders/:orderNumber/cancel # Cancel order
```

## 🏗️ Project Structure

```
manvue/
├── backend/
│   ├── config/           # Configuration files
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── scripts/          # Utility scripts
│   └── server.js         # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── stores/       # Zustand stores
│   │   ├── lib/          # Utilities
│   │   └── App.tsx       # Main app component
│   ├── public/           # Static assets
│   └── index.html        # HTML template
├── docker-compose.yml    # Docker services
├── nginx.conf           # Nginx configuration
└── README.md           # This file
```

## 🐳 Docker Services

The application runs with the following services:

- **frontend**: React app (port 5173)
- **backend**: Node.js API (port 4000)
- **mongodb**: Database (port 27017)
- **redis**: Caching (port 6379)
- **nginx**: Reverse proxy (port 80)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up --build -d
```

## 🎨 Key Features Guide

### AI Fashion Advisor
The AI chatbot provides personalized fashion advice:
- Style recommendations based on occasion
- Color coordination suggestions
- Size and fit guidance
- Trend insights

### Voice Shopping
Voice-activated shopping experience:
- "Show me casual shirts under ₹2000"
- "Find blue jeans in size 32"
- Natural language product search

### Image-Based Search
Upload fashion images to find similar products:
- Advanced computer vision
- Style and color matching
- Brand and category detection

### AR Product Preview
3D model visualization:
- 360° product rotation
- Zoom and inspect details
- Scale to real-world size

### VR Fashion Gallery
Immersive shopping experience:
- Virtual showroom navigation
- Interactive product displays
- WebXR compatibility

## 🔧 Configuration

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:4000/api/auth/google/callback`
   - Your production domain callback

### Cloudinary Setup
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your cloud name, API key, and secret
3. Add to environment variables

### Google Gemini AI Setup
1. Visit [Google AI Studio](https://makersuite.google.com/)
2. Create an API key
3. Add to environment variables

## 🚦 Development

### Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

### Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Building for Production
```bash
# Build frontend
npm run build

# Start production server
npm start
```

## 📈 Performance

### Frontend Optimizations
- Code splitting and lazy loading
- Image optimization with Cloudinary
- Caching strategies
- Bundle size optimization

### Backend Optimizations
- Database indexing
- Query optimization
- Redis caching
- Rate limiting
- Compression

### SEO & Accessibility
- Server-side rendering ready
- Meta tags optimization
- Semantic HTML
- ARIA labels
- Keyboard navigation

## 🔒 Security

### Implemented Security Measures
- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS configuration
- Helmet.js security headers
- XSS protection
- SQL injection prevention

## 🚀 Deployment

### Production Deployment
1. **Environment Setup**: Configure production environment variables
2. **Database**: Set up MongoDB Atlas or self-hosted MongoDB
3. **File Storage**: Configure Cloudinary for image storage
4. **SSL**: Set up SSL certificates for HTTPS
5. **CDN**: Configure CDN for static assets
6. **Monitoring**: Set up logging and monitoring

### Deployment Platforms
- **Frontend**: Vercel, Netlify, or AWS S3
- **Backend**: Heroku, Railway, DigitalOcean, or AWS
- **Database**: MongoDB Atlas, AWS DocumentDB
- **Full Stack**: Docker on VPS, AWS ECS, or Kubernetes

### CI/CD Pipeline
GitHub Actions workflow included for:
- Automated testing
- Code quality checks
- Build and deployment
- Security scanning

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Follow the existing code style

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

Created with ❤️ by the ManVue Team

## 🙏 Acknowledgments

- [Unsplash](https://unsplash.com/) for sample images
- [Lucide](https://lucide.dev/) for icons
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Shadcn/UI](https://ui.shadcn.com/) for components
- [Google Gemini](https://ai.google.dev/) for AI features

## 📞 Support

For support, email support@manvue.com or create an issue on GitHub.

---

**Happy Shopping! 🛍️**
