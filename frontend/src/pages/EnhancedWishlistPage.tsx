import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, ShoppingCart, Star, Trash2, ShoppingBag } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import axios from 'axios'
import toast from 'react-hot-toast'

interface WishlistProduct {
  id: string
  title: string
  slug: string
  primaryImage: string
  price: {
    selling: number
    original: number
  }
  discount: number
  rating: {
    average: number
    count: number
  }
  category: string
  brand: {
    name: string
  }
  variants: Array<{
    color: string
    sizes: Array<{
      size: string
      stock: number
    }>
  }>
}

export default function EnhancedWishlistPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated, token } = useAuthStore()
  const { addItem } = useCartStore()
  const [wishlistItems, setWishlistItems] = useState<WishlistProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log('💝 Enhanced WishlistPage effect - Auth:', isAuthenticated, 'User:', !!user, 'Token:', !!token)
    
    if (isAuthenticated && user && token) {
      console.log('💝 Fetching wishlist...')
      fetchWishlist()
    } else {
      console.log('💝 Not authenticated, skipping wishlist load')
      setIsLoading(false)
    }
  }, [isAuthenticated, user, token])

  const fetchWishlist = async () => {
    setIsLoading(true)
    try {
      console.log('📡 Making wishlist API request...')
      console.log('📡 Auth header:', axios.defaults.headers.common['Authorization'])
      const response = await axios.get('/users/wishlist')
      console.log('✅ Wishlist loaded:', response.data)
      setWishlistItems(response.data.data.wishlist)
    } catch (error: any) {
      console.error('❌ Failed to fetch wishlist:', error.response?.data || error.message)
      toast.error('Failed to load wishlist')
      setWishlistItems([])
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromWishlist = async (productId: string) => {
    try {
      await axios.delete(`/products/${productId}/wishlist`)
      setWishlistItems(prev => prev.filter(item => item.id !== productId))
      toast.success('Removed from wishlist')
    } catch (error: any) {
      console.error('Failed to remove from wishlist:', error.response?.data || error.message)
      toast.error('Failed to remove from wishlist')
    }
  }

  const handleAddToCart = async (product: WishlistProduct) => {
    if (!product.variants || product.variants.length === 0) {
      toast.error('Product not available')
      return
    }

    const defaultVariant = product.variants[0]
    const defaultSize = defaultVariant.sizes?.[0]?.size || 'M'
    const defaultColor = defaultVariant.color || 'Default'

    try {
      await addItem(product.id, 1, defaultSize, defaultColor)
      toast.success(`Added ${product.title} to cart!`)
    } catch (error) {
      toast.error('Failed to add to cart')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-md rounded-3xl p-12 border border-gray-700/50">
          <Heart className="h-24 w-24 text-red-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Please Login</h2>
          <p className="text-xl text-gray-300 mb-8">You need to be logged in to view your wishlist</p>
          <Button 
            onClick={() => navigate('/auth')}
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 rounded-xl text-xl"
          >
            Login to Continue
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading your wishlist...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="bg-gradient-to-r from-pink-600/20 to-red-600/20 backdrop-blur-md rounded-3xl p-8 border border-pink-500/20">
              <div className="text-center">
                <h1 className="text-5xl font-bold holographic mb-4">💖 My Wishlist</h1>
                <p className="text-xl text-pink-200">
                  {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} you love
                </p>
              </div>
            </div>
          </div>

          {wishlistItems.length === 0 ? (
            // Empty Wishlist State
            <div className="text-center py-20">
              <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-md rounded-3xl p-12 border border-gray-700/50">
                <Heart className="h-24 w-24 text-pink-400 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-white mb-4">Your Wishlist is Empty</h2>
                <p className="text-xl text-gray-300 mb-8">Start browsing and add items you love to your wishlist!</p>
                <Link to="/products">
                  <Button size="lg" className="bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 px-8 py-4 rounded-xl text-xl">
                    <ShoppingBag className="mr-3 h-6 w-6" />
                    Start Shopping
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            // Wishlist Items Grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {wishlistItems.map((product, index) => (
                <div 
                  key={product.id} 
                  className="group bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-md rounded-3xl p-6 border border-gray-700/50 hover:border-pink-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/20"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Product Image */}
                  <div className="relative mb-6">
                    <Link to={`/product/${product.slug}`}>
                      <div className="aspect-square bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden group-hover:scale-105 transition-transform duration-300">
                        <img
                          src={product.primaryImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop'}
                          alt={product.title}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop';
                          }}
                        />
                      </div>
                    </Link>
                    
                    {/* Remove from wishlist button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromWishlist(product.id)}
                      className="absolute top-2 right-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full p-2 backdrop-blur-sm bg-gray-900/50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    {/* Discount Badge */}
                    {product.discount > 0 && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        -{product.discount}%
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="space-y-4">
                    {/* Title and Brand */}
                    <div>
                      <Link 
                        to={`/product/${product.slug}`}
                        className="text-xl font-bold text-white hover:text-pink-400 transition-colors block line-clamp-2 holographic"
                      >
                        {product.title}
                      </Link>
                      <p className="text-pink-300 font-medium">
                        {product.brand?.name || 'ManVue'}
                      </p>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating?.average || 0)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-300">
                        ({product.rating?.count || 0})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-pink-400">
                          {formatPrice(product.price?.selling || 0)}
                        </span>
                        {product.price?.original && product.price.original > product.price.selling && (
                          <span className="text-lg text-gray-500 line-through">
                            {formatPrice(product.price.original)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Available Colors */}
                    {product.variants && product.variants.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {product.variants.slice(0, 3).map((variant, idx) => (
                          <div
                            key={idx}
                            className="bg-purple-500/20 border border-purple-400/30 rounded-lg px-3 py-1 text-sm text-purple-300"
                          >
                            {variant.color}
                          </div>
                        ))}
                        {product.variants.length > 3 && (
                          <div className="bg-gray-500/20 border border-gray-400/30 rounded-lg px-3 py-1 text-sm text-gray-300">
                            +{product.variants.length - 3} more
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-3">
                      <Button 
                        onClick={() => handleAddToCart(product)}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-3 rounded-xl font-bold shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
                      >
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Add to Cart
                      </Button>
                      
                      <Link to={`/product/${product.slug}`} className="block">
                        <Button 
                          variant="outline" 
                          className="w-full border-pink-400 text-pink-400 hover:bg-pink-500/20 py-3 rounded-xl"
                        >
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
