import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { useProductStore } from '@/stores/productStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User, 
  Menu, 
  X,
  LogOut,
  Settings,
  Package,
  Mic,
  Camera
} from 'lucide-react'
import { cn, debounce } from '@/lib/utils'

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const userMenuRef = useRef<HTMLDivElement>(null)
  
  const { user, isAuthenticated, logout } = useAuthStore()
  const { summary, toggleCart } = useCartStore()
  const { searchProducts, searchSuggestions, getSearchSuggestions, categories } = useProductStore()

  // Debounced search suggestions
  const debouncedGetSuggestions = debounce(getSearchSuggestions, 300)

  useEffect(() => {
    if (searchQuery.length > 1) {
      debouncedGetSuggestions(searchQuery)
    }
  }, [searchQuery, debouncedGetSuggestions])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  const handleVoiceSearch = () => {
    // TODO: Implement voice search
    console.log('Voice search clicked')
  }

  const handleImageSearch = () => {
    // TODO: Implement image search
    console.log('Image search clicked')
  }

  const handleLogout = () => {
    logout()
    setIsUserMenuOpen(false)
    navigate('/')
  }

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  // Handle click outside user dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isUserMenuOpen])

  // Main categories for navigation
  const mainCategories = [
    { name: 'Formal', path: '/products?category=formal' },
    { name: 'Shirts', path: '/products?category=shirts' },
    { name: 'T-Shirts', path: '/products?category=tshirts' },
    { name: 'Jeans', path: '/products?category=jeans' },
    { name: 'Kurtas', path: '/products?category=kurtas' },
    { name: 'Shoes', path: '/products?category=shoes' },
    { name: 'Accessories', path: '/products?category=accessories' },
    { name: 'All Products', path: '/products' }
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-gray-900 via-blue-900 to-black text-white text-sm py-2">
        <div className="container mx-auto px-4 text-center">
          <span className="font-medium">Free shipping on orders above £50 | Express Delivery Available</span>
        </div>
      </div>

      {/* Main navbar */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
              ManVue
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {mainCategories.map((category) => (
              <Link
                key={category.name}
                to={category.path}
                className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium text-sm relative group"
              >
                {category.name}
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Search for men's fashion..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-24 h-12 pl-4 border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={handleVoiceSearch}
                    className="h-8 w-8 hover:bg-blue-100 rounded-lg"
                  >
                    <Mic className="h-4 w-4 text-gray-600" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={handleImageSearch}
                    className="h-8 w-8 hover:bg-blue-100 rounded-lg"
                  >
                    <Camera className="h-4 w-4 text-gray-600" />
                  </Button>
                  <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:bg-blue-100 rounded-lg"
                  >
                    <Search className="h-4 w-4 text-gray-600" />
                  </Button>
                </div>
              </form>

              {/* Search Suggestions */}
              {searchQuery.length > 1 && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg mt-1 z-10">
                  {searchSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSearchQuery(suggestion)
                        navigate(`/search?q=${encodeURIComponent(suggestion)}`)
                        setSearchQuery('')
                      }}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-10 w-10 hover:bg-blue-100 rounded-lg"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-5 w-5 text-gray-600" />
            </Button>

            {/* Wishlist */}
            {isAuthenticated && (
              <Link to="/wishlist">
                <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-red-100 rounded-lg relative group">
                  <Heart className="h-5 w-5 text-gray-600 group-hover:text-red-500 transition-colors duration-200" />
                </Button>
              </Link>
            )}

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCart}
              className="relative h-10 w-10 hover:bg-blue-100 rounded-lg group"
            >
              <ShoppingBag className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors duration-200" />
              {summary.totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-lg">
                  {summary.totalItems}
                </span>
              )}
            </Button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="h-10 w-10 rounded-full hover:bg-blue-100 transition-all duration-200"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-gray-200 hover:ring-blue-300 transition-all duration-200"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </Button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div 
                    className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 backdrop-blur-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="py-2">
                      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-xl">
                        <p className="font-semibold text-sm text-gray-900">{user?.name}</p>
                        <p className="text-gray-600 text-xs">{user?.email}</p>
                      </div>
                      
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-3 text-sm hover:bg-blue-50 cursor-pointer transition-colors duration-200 group"
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsUserMenuOpen(false)
                        }}
                      >
                        <Settings className="h-4 w-4 mr-3 text-gray-600 group-hover:text-blue-600" />
                        <span className="group-hover:text-blue-600">Profile & Settings</span>
                      </Link>
                      
                      <Link
                        to="/orders"
                        className="flex items-center px-4 py-3 text-sm hover:bg-blue-50 cursor-pointer transition-colors duration-200 group"
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsUserMenuOpen(false)
                        }}
                      >
                        <Package className="h-4 w-4 mr-3 text-gray-600 group-hover:text-blue-600" />
                        <span className="group-hover:text-blue-600">My Orders</span>
                      </Link>
                      
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="flex items-center px-4 py-3 text-sm hover:bg-purple-50 cursor-pointer transition-colors duration-200 group"
                          onClick={(e) => {
                            e.stopPropagation()
                            setIsUserMenuOpen(false)
                          }}
                        >
                          <Settings className="h-4 w-4 mr-3 text-gray-600 group-hover:text-purple-600" />
                          <span className="group-hover:text-purple-600">Admin Dashboard</span>
                        </Link>
                      )}
                      
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLogout()
                        }}
                        className="flex items-center w-full px-4 py-3 text-sm hover:bg-red-50 text-red-600 cursor-pointer transition-colors duration-200 group rounded-b-xl"
                      >
                        <LogOut className="h-4 w-4 mr-3 group-hover:text-red-700" />
                        <span className="group-hover:text-red-700">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-10 w-10 hover:bg-blue-100 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 text-gray-600" />
              ) : (
                <Menu className="h-5 w-5 text-gray-600" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-gray-50">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search for men's fashion..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-12 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                autoFocus
              />
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-blue-100 rounded-lg"
              >
                <Search className="h-4 w-4 text-gray-600" />
              </Button>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 bg-gradient-to-b from-white to-gray-50">
            <div className="space-y-1">
              {mainCategories.map((category) => (
                <Link
                  key={category.name}
                  to={category.path}
                  className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200 font-medium"
                >
                  {category.name}
                </Link>
              ))}
              
              <div className="border-t border-gray-200 pt-2 mt-2">
                <Link
                  to="/vr-gallery"
                  className="block px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all duration-200 font-medium"
                >
                  VR Gallery
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close menus */}
      {(isUserMenuOpen || isMobileMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsUserMenuOpen(false)
            setIsMobileMenuOpen(false)
          }}
        />
      )}
    </nav>
  )
}
