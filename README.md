# ManVue - Men's Fashion E-commerce Platform

A modern, full-stack e-commerce platform built with React, Node.js, and MongoDB, featuring AI-powered search, AR/VR capabilities, and comprehensive admin management.

## 🚀 Features

### Core E-commerce
- **Product Management**: Complete CRUD operations with variants, sizes, colors
- **Shopping Cart**: Persistent cart with real-time updates
- **Wishlist**: Save favorite products for later
- **Order Management**: Complete order processing and tracking
- **User Authentication**: Secure JWT-based authentication
- **Admin Dashboard**: Comprehensive admin panel for managing products, users, and orders

### AI-Powered Features
- **Smart Search**: AI-powered product search and recommendations
- **Image Search**: Upload images to find similar products
- **Voice Search**: Voice-activated product search
- **Web Scanner**: Scan external websites for product information
- **ChatBot**: AI assistant for customer support

### Advanced Features
- **AR Preview**: Augmented Reality product preview
- **VR Gallery**: Virtual Reality shopping experience
- **Real-time Analytics**: Sales and user analytics
- **Responsive Design**: Mobile-first, modern UI/UX
- **Payment Integration**: Stripe payment processing

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Router** for navigation
- **Axios** for API calls
- **React Hot Toast** for notifications

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Cloudinary** for image management
- **Stripe** for payments
- **Bcrypt** for password hashing

### AI/ML
- **Google Generative AI** for AI features
- **Vector embeddings** for similarity search
- **Image processing** for visual search

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB
- Cloudinary account (for image storage)
- Stripe account (for payments)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Man_Vue
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp backend/env.example backend/.env
   
   # Edit backend/.env with your configuration:
   # MONGODB_URI=mongodb://localhost:27017/manvue
   # JWT_SECRET=your-jwt-secret
   # CLOUDINARY_CLOUD_NAME=your-cloudinary-name
   # CLOUDINARY_API_KEY=your-cloudinary-key
   # CLOUDINARY_API_SECRET=your-cloudinary-secret
   # STRIPE_SECRET_KEY=your-stripe-secret-key
   # GOOGLE_AI_API_KEY=your-google-ai-key
   ```

4. **Initialize Database**
   ```bash
   # Create admin user
   npm run create-admin
   
   # Import sample products (optional)
   npm run import-kaggle
   ```

5. **Start Development Servers**
   ```bash
   npm run dev
   ```

## 🎯 Usage

### Admin Access
- **URL**: `http://localhost:5173/admin/auth`
- **Email**: `admin@manvue.com`
- **Password**: `admin123`

### Test Page
- **URL**: `http://localhost:5173/test`
- Test all functionality including cart, wishlist, and authentication

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh token

#### Products
- `GET /api/products` - Get products with filters
- `GET /api/products/:slug` - Get single product
- `POST /api/products/:id/wishlist` - Add/remove from wishlist

#### Cart
- `GET /api/users/cart` - Get user cart
- `POST /api/users/cart` - Add item to cart
- `PUT /api/users/cart/:productId` - Update cart item
- `DELETE /api/users/cart/:productId` - Remove from cart

#### Admin
- `GET /api/admin/products` - Admin product management
- `GET /api/admin/users` - User management
- `GET /api/admin/orders` - Order management

## 🔧 Development

### Project Structure
```
Man_Vue/
├── backend/                 # Node.js API server
│   ├── config/            # Configuration files
│   ├── middleware/         # Custom middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── scripts/           # Utility scripts
│   └── server.js          # Main server file
├── frontend/              # React application
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── stores/       # Zustand stores
│   │   └── lib/          # Utility functions
│   └── public/           # Static assets
└── scripts/              # Database scripts
```

### Available Scripts
- `npm run dev` - Start both frontend and backend
- `npm run dev:frontend` - Start frontend only
- `npm run dev:backend` - Start backend only
- `npm run build` - Build for production
- `npm run create-admin` - Create admin user
- `npm run import-kaggle` - Import sample products

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Manual Deployment
1. Build the frontend: `npm run build`
2. Set production environment variables
3. Start the backend server: `npm start`
4. Serve the frontend build files

## 🐛 Troubleshooting

### Common Issues

1. **Cart/Wishlist Validation Errors**
   - Ensure user is logged in
   - Check that size and color parameters are provided
   - Verify product variants exist

2. **Product Description Not Showing**
   - Check if product data is properly loaded
   - Verify API endpoints are working
   - Check browser console for errors

3. **Authentication Issues**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Ensure MongoDB connection is working

### Debug Mode
Visit `/test` page to test all functionality and see detailed error messages.

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions, please open an issue in the repository.