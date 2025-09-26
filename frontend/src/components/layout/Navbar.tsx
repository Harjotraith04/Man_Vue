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
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        console.log('Voice search started...')
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setSearchQuery(transcript)
        if (transcript.trim()) {
          navigate(`/search?q=${encodeURIComponent(transcript.trim())}`)
        }
      }

      recognition.onerror = (event: any) => {
        console.error('Voice search error:', event.error)
      }

      recognition.start()
    } else {
      alert('Voice search is not supported in your browser')
    }
  }

  const handleImageSearch = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e: any) => {
      const file = e.target.files[0]
      if (file) {
        // For demo purposes, navigate to image search page
        navigate('/ai-features?tab=image-search')
        console.log('Image search with file:', file.name)
      }
    }
    input.click()
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
    <nav className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-blue-500/20 shadow-2xl hover-neon">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-purple-900 via-blue-900 to-black text-white text-sm py-3 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 animate-pulse opacity-50" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <span className="font-medium holographic">✨ Free shipping on orders above £50 | Express Delivery Available ✨</span>
        </div>
      </div>

      {/* Main navbar */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center neon-border liquid-shape shadow-2xl">
              <span className="text-white font-bold text-xl glitch-effect">M</span>
            </div>
            <div className="text-3xl font-bold holographic group-hover:animate-bounce-glow transition-all duration-300">
              ManVue
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {mainCategories.map((category) => (
              <Link
                key={category.name}
                to={category.path}
                className="px-4 py-2 text-gray-300 hover:text-blue-400 hover:bg-blue-900/20 rounded-xl transition-all duration-200 font-medium text-sm relative group morph-button hover-neon"
              >
                {category.name}
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="🔍 Search for men's fashion..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-24 h-12 pl-4 bg-gray-900/50 border-2 border-blue-500/30 focus:border-blue-400 rounded-xl shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 text-white placeholder-gray-400 backdrop-blur-sm hover-neon"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={handleVoiceSearch}
                    className="h-8 w-8 hover:bg-purple-600/30 rounded-lg hover-neon-purple transition-all duration-300"
                    title="Voice Search"
                  >
                    <Mic className="h-4 w-4 text-purple-400 hover:text-purple-300" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={handleImageSearch}
                    className="h-8 w-8 hover:bg-blue-600/30 rounded-lg hover-neon transition-all duration-300"
                    title="Image Search"
                  >
                    <Camera className="h-4 w-4 text-blue-400 hover:text-blue-300" />
                  </Button>
                  <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:bg-green-600/30 rounded-lg hover-neon transition-all duration-300"
                    title="Search"
                  >
                    <Search className="h-4 w-4 text-green-400 hover:text-green-300" />
                  </Button>
                </div>
              </form>

              {/* Search Suggestions */}
              {searchQuery.length > 1 && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-gray-900/95 border border-blue-500/30 rounded-xl shadow-2xl mt-2 z-10 backdrop-blur-md">
                  {searchSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 hover:bg-blue-600/20 cursor-pointer text-gray-200 hover:text-blue-300 transition-all duration-200 first:rounded-t-xl last:rounded-b-xl"
                      onClick={() => {
                        setSearchQuery(suggestion)
                        navigate(`/search?q=${encodeURIComponent(suggestion)}`)
                        setSearchQuery('')
                      }}
                    >
                      🔍 {suggestion}
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
              className="md:hidden h-10 w-10 hover:bg-blue-600/30 rounded-xl hover-neon morph-button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-5 w-5 text-blue-400" />
            </Button>

            {/* Wishlist */}
            {isAuthenticated && (
              <Link to="/wishlist">
                <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-red-600/30 rounded-xl relative group hover-neon-purple morph-button">
                  <Heart className="h-5 w-5 text-red-400 group-hover:text-red-300 transition-colors duration-200 animate-bounce-glow" />
                </Button>
              </Link>
            )}

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/cart')}
              className="relative h-10 w-10 hover:bg-blue-600/30 rounded-xl group hover-neon morph-button"
            >
              <ShoppingBag className="h-5 w-5 text-blue-400 group-hover:text-blue-300 transition-colors duration-200" />
              {summary.totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-2xl animate-bounce-glow neon-border">
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
                  className="h-10 w-10 rounded-full hover:bg-blue-600/30 transition-all duration-200 hover-neon morph-button"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-blue-400 hover:ring-purple-400 transition-all duration-200 neon-border animate-bounce-glow"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center neon-border animate-bounce-glow">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </Button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div 
                    className="absolute right-0 top-full mt-2 w-64 bg-gray-900/95 border border-blue-500/30 rounded-xl shadow-2xl z-50 backdrop-blur-md hover-neon animate-slide-in-glow"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="py-2">
                      <div className="px-4 py-4 border-b border-blue-500/20 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-t-xl">
                        <p className="font-bold text-sm text-white holographic">{user?.name}</p>
                        <p className="text-gray-300 text-xs">{user?.email}</p>
                      </div>
                      
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-3 text-sm hover:bg-blue-600/20 cursor-pointer transition-colors duration-200 group text-gray-200"
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsUserMenuOpen(false)
                        }}
                      >
                        <Settings className="h-4 w-4 mr-3 text-blue-400 group-hover:text-blue-300" />
                        <span className="group-hover:text-blue-300">⚙️ Profile & Settings</span>
                      </Link>
                      
                      <Link
                        to="/orders"
                        className="flex items-center px-4 py-3 text-sm hover:bg-green-600/20 cursor-pointer transition-colors duration-200 group text-gray-200"
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsUserMenuOpen(false)
                        }}
                      >
                        <Package className="h-4 w-4 mr-3 text-green-400 group-hover:text-green-300" />
                        <span className="group-hover:text-green-300">📦 My Orders</span>
                      </Link>
                      
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="flex items-center px-4 py-3 text-sm hover:bg-purple-600/20 cursor-pointer transition-colors duration-200 group text-gray-200"
                          onClick={(e) => {
                            e.stopPropagation()
                            setIsUserMenuOpen(false)
                          }}
                        >
                          <Settings className="h-4 w-4 mr-3 text-purple-400 group-hover:text-purple-300" />
                          <span className="group-hover:text-purple-300">👑 Admin Dashboard</span>
                        </Link>
                      )}
                      
                      <div className="border-t border-blue-500/20 my-2"></div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLogout()
                        }}
                        className="flex items-center w-full px-4 py-3 text-sm hover:bg-red-600/20 text-red-400 cursor-pointer transition-colors duration-200 group rounded-b-xl"
                      >
                        <LogOut className="h-4 w-4 mr-3 group-hover:text-red-300" />
                        <span className="group-hover:text-red-300">🚪 Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-bold shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105 morph-button neon-border">
                  ✨ Sign In
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-10 w-10 hover:bg-blue-600/30 rounded-xl hover-neon morph-button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 text-red-400" />
              ) : (
                <Menu className="h-5 w-5 text-blue-400" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="md:hidden py-4 border-t border-blue-500/20 bg-gray-900/90 backdrop-blur-md">
            <form onSubmit={handleSearch} className="relative px-4">
              <Input
                type="text"
                placeholder="🔍 Search for men's fashion..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-12 h-12 bg-gray-800/50 border-2 border-blue-500/30 focus:border-blue-400 rounded-xl text-white placeholder-gray-400 hover-neon"
                autoFocus
              />
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                className="absolute right-6 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-blue-600/30 rounded-lg hover-neon"
              >
                <Search className="h-4 w-4 text-blue-400" />
              </Button>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-blue-500/20 bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-md animate-slide-in-glow">
            <div className="space-y-1 px-4">
              {mainCategories.map((category) => (
                <Link
                  key={category.name}
                  to={category.path}
                  className="block px-4 py-3 text-gray-300 hover:bg-blue-600/20 hover:text-blue-300 rounded-xl transition-all duration-200 font-medium hover-neon morph-button"
                >
                  ✨ {category.name}
                </Link>
              ))}
              
              <div className="border-t border-blue-500/20 pt-2 mt-4">
                <Link
                  to="/vr-gallery"
                  className="block px-4 py-3 text-gray-300 hover:bg-purple-600/20 hover:text-purple-300 rounded-xl transition-all duration-200 font-medium hover-neon-purple morph-button"
                >
                  🥽 VR Gallery
                </Link>
                <Link
                  to="/ai-features"
                  className="block px-4 py-3 text-gray-300 hover:bg-green-600/20 hover:text-green-300 rounded-xl transition-all duration-200 font-medium hover-neon morph-button"
                >
                  🤖 AI Features
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
