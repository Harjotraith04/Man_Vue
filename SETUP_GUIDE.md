# ManVue E-Commerce Setup Guide

This guide will help you set up and test the complete ManVue e-commerce platform with separate admin and customer authentication.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Git

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Backend setup
cd backend
npm install

# Frontend setup
cd ../frontend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the `backend` directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/manvue

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# API URLs
FRONTEND_URL=http://localhost:5173
PORT=4000

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret

# Environment
NODE_ENV=development
```

### 3. Database Setup

Start MongoDB and create the admin user:

```bash
# In the backend directory
npm run create-admin
```

This will create an admin user with:
- **Email**: `admin@manvue.com`
- **Password**: `Admin123!`

### 4. Start the Application

```bash
# Terminal 1: Start backend server
cd backend
npm run dev

# Terminal 2: Start frontend development server
cd frontend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000

## Testing the Features

### 1. Admin Authentication & Dashboard

1. **Access Admin Login**:
   - Go to http://localhost:5173/admin/auth
   - Or click "Access Admin Panel" from the customer login page
   - Login with: `admin@manvue.com` / `Admin123!`

2. **Admin Dashboard Features**:
   - View comprehensive analytics and statistics
   - Monitor orders, users, and products
   - Access quick actions and reports

### 2. Product Management (Admin Only)

1. **Add Products**:
   - Navigate to Products section in admin dashboard
   - Click "Add Product"
   - Fill in product details:
     - Basic information (title, description, category)
     - Pricing and discounts
     - Product images (upload up to 10)
     - Variants (colors and sizes with stock)
     - Specifications and features
   - Save the product

2. **Manage Products**:
   - View all products in a filterable table
   - Edit product details
   - Activate/deactivate products
   - Bulk operations
   - Delete products

### 3. Customer Experience

1. **Customer Registration/Login**:
   - Go to http://localhost:5173/auth
   - Register as a new customer or login
   - Use the customer authentication form

2. **Product Browsing**:
   - Browse products added by admin
   - Filter by category, price, rating
   - Search products
   - View product details
   - Add to cart and wishlist

3. **Shopping Features**:
   - Add products to cart
   - Proceed to checkout
   - View order history
   - Manage profile

### 4. Role-Based Access Control

1. **Admin Access**:
   - Admins can access `/admin/*` routes
   - Admin dashboard shows additional navigation items
   - Admin users see "Admin Dashboard" in user menu

2. **Customer Restrictions**:
   - Regular users cannot access admin routes
   - Redirected to home page if attempting admin access
   - Separate login interfaces maintain security

### 5. User Management (Admin Only)

1. **View Users**:
   - Access Users section in admin dashboard
   - View all registered customers and admins
   - Filter and search users

2. **Manage Roles**:
   - Change user roles (customer ↔ admin)
   - Activate/deactivate accounts
   - View user statistics

### 6. Order Management (Admin Only)

1. **View Orders**:
   - Monitor all customer orders
   - Track order status and progress
   - View order details and customer information

2. **Update Orders**:
   - Change order status
   - Process payments
   - Handle order fulfillment

### 7. Analytics & Reporting (Admin Only)

1. **Dashboard Analytics**:
   - Revenue tracking
   - Order statistics
   - User growth metrics
   - Product performance

2. **Advanced Analytics**:
   - Date range filtering
   - Export capabilities
   - Real-time updates

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (both admin & customer)
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Products (Customer)
- `GET /api/products` - List products with filters
- `GET /api/products/:slug` - Get single product
- `POST /api/products/:id/reviews` - Add review
- `POST /api/products/:id/wishlist` - Toggle wishlist

### Products (Admin)
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Admin Routes
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - List users
- `PUT /api/admin/users/:id/role` - Update user role
- `GET /api/admin/products` - Admin product list
- `GET /api/admin/analytics` - Analytics data

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
   - Ensure MongoDB is running
   - Check connection string in `.env`

2. **JWT Token Issues**:
   - Verify JWT_SECRET is set in `.env`
   - Clear browser localStorage if needed

3. **Image Upload Problems**:
   - Configure Cloudinary credentials
   - Check file size limits (5MB max)

4. **CORS Issues**:
   - Verify FRONTEND_URL in backend `.env`
   - Check port numbers match

### Development Tips

1. **Database Reset**:
   ```bash
   # Drop database and recreate admin
   npm run create-admin
   ```

2. **Clear Auth State**:
   - Clear browser localStorage
   - Restart development servers

3. **API Testing**:
   - Use Postman or similar tools
   - Check browser developer tools
   - Monitor server logs

## Security Features

- **Role-based access control**
- **JWT token authentication**
- **Password hashing with bcrypt**
- **Input validation and sanitization**
- **CORS protection**
- **Rate limiting**
- **Helmet security headers**

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Configure production database
4. Set up proper CORS origins
5. Use HTTPS for all communications
6. Configure environment-specific settings

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check server and browser console logs
4. Verify environment configuration

---

**Happy coding with ManVue! 🚀**
