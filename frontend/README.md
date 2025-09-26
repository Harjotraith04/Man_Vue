# 🎨 ManVue Frontend

A modern React frontend for the ManVue men's fashion e-commerce platform, built with TypeScript, Vite, and Tailwind CSS.

## 🌟 Features

### 🛍️ E-Commerce Features
- **Product Catalog**: Browse and search men's fashion items
- **Product Details**: Detailed product pages with image galleries
- **Shopping Cart**: Add/remove items with quantity management
- **Wishlist**: Save favorite products for later
- **User Authentication**: Login/register with Google OAuth
- **Order Management**: View order history and tracking

### 🤖 AI-Powered Features
- **AI Chatbot**: Intelligent product recommendations
- **Image Search**: Upload images to find similar products
- **Voice Search**: Voice-activated product search
- **Web Scanner**: Scan fashion websites for inspiration

### 🎨 Advanced UI/UX
- **AR Preview**: Augmented reality product visualization
- **VR Gallery**: Virtual reality shopping experience
- **Responsive Design**: Mobile-first responsive interface
- **Dark/Light Mode**: Theme switching capability
- **Smooth Animations**: Framer Motion animations

### 👨‍💼 Admin Dashboard
- **Product Management**: Add, edit, and manage products
- **Order Management**: Track and manage customer orders
- **User Management**: Admin user management
- **Analytics Dashboard**: Sales and performance metrics
- **Dataset Import**: Import products from Kaggle datasets

## 🏗️ Tech Stack

### Core Technologies
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework

### UI Components
- **Radix UI** - Accessible, unstyled UI components
- **Lucide React** - Beautiful icon library
- **Framer Motion** - Animation library
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation

### 3D/AR/VR
- **Three.js** - 3D graphics library
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for R3F
- **@google/model-viewer** - Web-based 3D model viewer

### AI/ML
- **TensorFlow.js** - Machine learning in the browser
- **@tensorflow-models/coco-ssd** - Object detection
- **@tensorflow-models/mobilenet** - Image classification

### State Management
- **Zustand** - Lightweight state management
- **React Query** - Server state management
- **React Router DOM** - Client-side routing

### Additional Libraries
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications
- **React Speech Kit** - Voice recognition
- **Embla Carousel** - Carousel component

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd ManVue/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment setup**:
   ```bash
   cp .env.template .env
   ```

   Edit `.env` with your configuration:
   ```env
   VITE_API_URL=http://localhost:4000/api
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   VITE_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/           # Reusable components
│   │   ├── admin/           # Admin-specific components
│   │   ├── ai/              # AI feature components
│   │   ├── ar/              # AR/VR components
│   │   ├── auth/            # Authentication components
│   │   ├── layout/          # Layout components
│   │   ├── payments/        # Payment components
│   │   └── ui/              # UI components
│   ├── pages/               # Page components
│   │   ├── admin/           # Admin pages
│   │   └── ...              # Other pages
│   ├── stores/              # State management
│   ├── utils/               # Utility functions
│   ├── lib/                 # Library configurations
│   ├── App.tsx              # Main App component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── dist/                    # Production build
├── package.json             # Dependencies and scripts
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── .env.template            # Environment template
```

## 🎨 Component Architecture

### UI Components (`src/components/ui/`)
- **Button** - Customizable button component
- **Input** - Form input component
- **Card** - Card container component
- **Dialog** - Modal dialog component
- **Toast** - Notification component
- **Tabs** - Tab navigation component
- **Slider** - Range slider component
- **Select** - Dropdown select component

### Page Components (`src/pages/`)
- **HomePage** - Landing page with featured products
- **ProductsPage** - Product listing and filtering
- **ProductDetailPage** - Individual product details
- **CartPage** - Shopping cart management
- **CheckoutPage** - Order checkout process
- **AuthPage** - User authentication
- **ProfilePage** - User profile management
- **OrdersPage** - Order history
- **AIFeaturesPage** - AI-powered features
- **VRGalleryPage** - VR shopping experience

### Admin Components (`src/components/admin/`)
- **AdminDashboard** - Main admin dashboard
- **AdminProducts** - Product management
- **AdminOrders** - Order management
- **AdminUsers** - User management
- **AdminAnalytics** - Analytics dashboard
- **AddProduct** - Product creation form
- **DatasetImport** - Dataset import interface

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint

# Type checking
npm run type-check       # Check TypeScript types
```

## 🎨 Styling

### Tailwind CSS Configuration
The project uses Tailwind CSS with custom configuration:

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
        // Custom color palette
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
```

### CSS Architecture
- **Global Styles**: `src/index.css` - Base styles and Tailwind imports
- **Component Styles**: Inline Tailwind classes
- **Custom CSS**: For complex animations and 3D effects

## 🧩 State Management

### Zustand Stores
- **authStore** - User authentication state
- **cartStore** - Shopping cart state
- **productStore** - Product data and filters

### React Query
- **Server State**: API data fetching and caching
- **Mutations**: Data updates and optimistic updates
- **Background Refetching**: Automatic data synchronization

## 🔌 API Integration

### API Client Configuration
```typescript
// src/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

// Request interceptor for auth tokens
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### API Endpoints Used
- **Products**: `/api/products`
- **Authentication**: `/api/auth`
- **Orders**: `/api/orders`
- **AI Features**: `/api/ai`
- **Admin**: `/api/admin`

## 🎮 3D/AR/VR Features

### Three.js Integration
```typescript
// Example AR component
import { Canvas } from '@react-three/fiber';
import { ARButton, XR } from '@react-three/xr';

function ARProductView() {
  return (
    <ARButton>
      <Canvas>
        <XR>
          {/* 3D product model */}
        </XR>
      </Canvas>
    </ARButton>
  );
}
```

### Model Viewer
```typescript
// Web-based 3D model viewing
import { ModelViewer } from '@google/model-viewer';

<ModelViewer
  src="/models/product.glb"
  alt="Product 3D Model"
  auto-rotate
  camera-controls
/>
```

## 🤖 AI Features

### Image Search
```typescript
// TensorFlow.js object detection
import * as cocoSsd from '@tensorflow-models/coco-ssd';

const detectObjects = async (imageElement) => {
  const model = await cocoSsd.load();
  const predictions = await model.detect(imageElement);
  return predictions;
};
```

### Voice Search
```typescript
// Speech recognition
import { useSpeechRecognition } from 'react-speech-kit';

const { listen, listening, stop } = useSpeechRecognition({
  onResult: (result) => {
    // Handle voice input
  },
});
```

## 🔐 Authentication

### Google OAuth Integration
```typescript
// Google OAuth flow
const handleGoogleLogin = () => {
  window.location.href = `${API_URL}/auth/google`;
};
```

### Protected Routes
```typescript
// Route protection
import { ProtectedRoute } from './components/auth/ProtectedRoute';

<Route
  path="/profile"
  element={
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  }
/>
```

## 💳 Payment Integration

### Stripe Integration
```typescript
// Stripe payment processing
import { loadStripe } from '@stripe/stripe-js';

const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: `< 768px`
- **Tablet**: `768px - 1024px`
- **Desktop**: `> 1024px`

### Mobile-First Approach
```css
/* Mobile first, then larger screens */
.product-grid {
  @apply grid grid-cols-1 gap-4;
  
  @screen md {
    @apply grid-cols-2 gap-6;
  }
  
  @screen lg {
    @apply grid-cols-3 gap-8;
  }
}
```

## 🧪 Testing

### Testing Setup
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Run tests
npm run test
```

### Component Testing
```typescript
// Example test
import { render, screen } from '@testing-library/react';
import { ProductCard } from './ProductCard';

test('renders product card', () => {
  render(<ProductCard product={mockProduct} />);
  expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
});
```

## 🚀 Deployment

### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables for Production
```env
VITE_API_URL=https://api.manvue.com/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_CLOUDINARY_CLOUD_NAME=production-cloud-name
```

### Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

## 🔧 Development Tips

### Hot Reloading
- Vite provides instant hot module replacement
- Changes to components update immediately
- State is preserved during development

### TypeScript Tips
- Use strict type checking
- Define interfaces for API responses
- Use generic types for reusable components

### Performance Optimization
- Use React.memo for expensive components
- Implement lazy loading for routes
- Optimize images with proper formats and sizes

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**:
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **TypeScript Errors**:
   ```bash
   # Check TypeScript configuration
   npm run type-check
   ```

3. **Styling Issues**:
   ```bash
   # Rebuild Tailwind CSS
   npm run build
   ```

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Three.js Documentation](https://threejs.org/)
- [TensorFlow.js Documentation](https://www.tensorflow.org/js)

---

**Built with ❤️ using React, TypeScript, and modern web technologies**
