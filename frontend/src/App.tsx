import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './stores/authStore'
import { useCartStore } from './stores/cartStore'

// Layout Components
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

// Page Components
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import AuthPage from './pages/AuthPage'
import ProfilePage from './pages/ProfilePage'
import WishlistPage from './pages/WishlistPage'
import OrdersPage from './pages/OrdersPage'
import SearchPage from './pages/SearchPage'
import VRGalleryPage from './pages/VRGalleryPage'
import AIFeaturesPage from './pages/AIFeaturesPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminAuthPage from './pages/AdminAuthPage'
import NotFoundPage from './pages/NotFoundPage'

// Auth Components
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'
import AuthCallback from './components/auth/AuthCallback'

// AI Components
import ChatBot from './components/ai/ChatBot'

function App() {
  const { initialize, isAuthenticated } = useAuthStore()
  const { loadCart } = useCartStore()

  useEffect(() => {
    // Initialize auth state from localStorage
    initialize()
  }, [initialize])

  useEffect(() => {
    // Load cart data when user is authenticated
    if (isAuthenticated) {
      loadCart()
    }
  }, [isAuthenticated, loadCart])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:category" element={<ProductsPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/vr-gallery" element={<VRGalleryPage />} />
          <Route path="/ai-features" element={<AIFeaturesPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/admin/auth" element={<AdminAuthPage />} />
          
          {/* Protected Routes */}
          <Route path="/cart" element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/wishlist" element={
            <ProtectedRoute>
              <WishlistPage />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          } />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      
      <Footer />
      
      {/* AI Chatbot */}
      <ChatBot />
    </div>
  )
}

export default App
