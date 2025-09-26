# 🛍️ ManVue - Men's Fashion E-Commerce Platform

A full-stack men's fashion e-commerce website built with React, Node.js, and MongoDB, featuring AI-powered search, AR/VR experiences, and comprehensive admin management.

## 🌟 Features

### 🛒 E-Commerce Core
- **Product Catalog**: Browse men's fashion items across multiple categories
- **Shopping Cart & Wishlist**: Add items to cart and save favorites
- **User Authentication**: Secure login/register with Google OAuth
- **Order Management**: Complete order tracking and history
- **Payment Integration**: Stripe payment gateway integration

### 🤖 AI-Powered Features
- **AI Chatbot**: Intelligent product recommendations and customer support
- **Image Search**: Upload images to find similar products
- **Voice Search**: Voice-activated product search
- **Web Scanner**: Scan fashion websites for product inspiration

### 🎨 Advanced UI/UX
- **AR Preview**: Augmented reality product visualization
- **VR Gallery**: Virtual reality shopping experience
- **Responsive Design**: Mobile-first responsive interface
- **Modern UI**: Built with Tailwind CSS and Radix UI components

### 👨‍💼 Admin Dashboard
- **Product Management**: Add, edit, and manage products
- **Order Management**: Track and manage customer orders
- **User Management**: Admin user management system
- **Analytics**: Sales and performance analytics
- **Dataset Import**: Import products from Kaggle datasets

## 🏗️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Framer Motion** for animations
- **Three.js** for 3D/AR/VR experiences
- **TensorFlow.js** for AI features

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Passport.js** for OAuth strategies
- **Cloudinary** for image management
- **Stripe** for payments
- **Google Gemini AI** for AI features

### DevOps
- **Docker** containerization
- **Docker Compose** for multi-container setup
- **Nginx** reverse proxy
- **Redis** for caching (optional)

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (local or cloud)
- **Python 3.7+** (for Kaggle dataset import)
- **Docker** (optional, for containerized setup)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ManVue
```

### 2. Install Dependencies
```bash
# Install all dependencies (root, backend, and frontend)
npm run install:all

# Or install individually
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 3. Environment Setup

#### Backend Environment
```bash
cd backend
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

#### Frontend Environment
```bash
cd frontend
cp .env.template .env
```

Edit `.env` with your configuration:
```env
VITE_API_URL=http://localhost:4000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
```

### 4. Start the Application

#### Development Mode
```bash
# Start both backend and frontend concurrently
npm run dev

# Or start individually
npm run dev:backend  # Backend on http://localhost:4000
npm run dev:frontend # Frontend on http://localhost:5173
```

#### Docker Mode
```bash
# Start all services with Docker Compose
npm run docker:up

# Stop all services
npm run docker:down
```

### 5. Create Admin User
```bash
cd backend
npm run create-admin
```

### 6. Import Sample Data (Optional)
```bash
cd backend
npm run seed
```

## 📊 Dataset Import

### Kaggle Dataset Setup
1. **Install Python dependencies**:
   ```bash
   pip install kaggle
   ```

2. **Set up Kaggle credentials**:
   - Get API key from [Kaggle Account Settings](https://www.kaggle.com/account)
   - Add to backend `.env`:
     ```env
     KAGGLE_USERNAME=your_kaggle_username
     KAGGLE_KEY=your_kaggle_api_key
     ```

3. **Import dataset**:
   ```bash
   cd backend
   npm run import-kaggle
   ```

### Manual Dataset Import
1. Place images in `backend/Kaggle_Data/Kaggle_Data/` folder
2. Organize by categories (Accessories, Ethnic, Formal, Jeans, Shirts, Shoes, T-Shirts)
3. Run import script: `npm run import-kaggle`

## 🐳 Docker Setup

### Using Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Services Included
- **MongoDB**: Database service
- **Redis**: Caching service (optional)
- **Backend**: API server
- **Frontend**: React application
- **Nginx**: Reverse proxy (optional)

## 📁 Project Structure

```
ManVue/
├── backend/                 # Node.js API server
│   ├── config/             # Configuration files
│   ├── middleware/          # Express middleware
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── scripts/            # Utility scripts
│   ├── Kaggle_Data/        # Dataset images
│   └── server.js           # Main server file
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── stores/         # State management
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── scripts/                # Root-level scripts
├── docker-compose.yml      # Docker configuration
└── nginx.conf              # Nginx configuration
```

## 🔧 Available Scripts

### Root Level
```bash
npm run dev              # Start both backend and frontend
npm run dev:backend      # Start backend only
npm run dev:frontend     # Start frontend only
npm run build            # Build frontend for production
npm run install:all      # Install all dependencies
npm run docker:up        # Start with Docker Compose
npm run docker:down      # Stop Docker Compose
```

### Backend Scripts
```bash
npm start                # Start production server
npm run dev              # Start development server
npm run seed             # Seed database with sample data
npm run create-admin     # Create admin user
npm run import-kaggle    # Import Kaggle dataset
npm run fix-products     # Fix product visibility
```

### Frontend Scripts
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Google OAuth
- `POST /api/auth/logout` - User logout

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:slug` - Get product by slug
- `GET /api/products/categories/list` - Get categories
- `POST /api/admin/products` - Create product (admin)
- `PUT /api/admin/products/:id` - Update product (admin)
- `DELETE /api/admin/products/:id` - Delete product (admin)

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order
- `GET /api/admin/orders` - Get all orders (admin)

### AI Features
- `POST /api/ai/chat` - AI chatbot
- `POST /api/ai/image-search` - Image search
- `POST /api/ai/voice-search` - Voice search
- `POST /api/ai/web-scanner` - Web scanner

## 🔐 Environment Variables

### Required Backend Variables
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `GEMINI_API_KEY` - Google Gemini AI API key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

### Required Frontend Variables
- `VITE_API_URL` - Backend API URL
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `VITE_CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# Start backend in production
cd backend
npm start
```

### Docker Production
```bash
# Build and start with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in each component folder
- Review the existing setup guides

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Advanced AI recommendations
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Social media integration
- [ ] Subscription service

---

**Built with ❤️ by the ManVue Team**