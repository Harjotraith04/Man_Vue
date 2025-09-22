import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, ShoppingCart, Eye, X, Package } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import axios from 'axios'
import toast from 'react-hot-toast'

interface WishlistProduct {
  _id: string
  title: string
  slug: string
  price: {
    selling: number
    original?: number
  }
  discount?: number
  primaryImage: string
  rating: {
    average: number
    count: number
  }
  category: string
  brand: {
    name: string
  }
  variants?: Array<{
    color: string
    colorCode: string
    sizes: Array<{
      size: string
      stock: number
    }>
  }>
  isInStock?: boolean
}

export default function WishlistPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { addItem } = useCartStore()
  const [wishlistItems, setWishlistItems] = useState<WishlistProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchWishlist()
    } else {
      setIsLoading(false)
    }
  }, [user])

  const fetchWishlist = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get('/users/wishlist')
      setWishlistItems(response.data.data.wishlist)
    } catch (error: any) {
      console.error('Failed to fetch wishlist:', error)
      toast.error('Failed to load wishlist')
      setWishlistItems([])
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromWishlist = async (productId: string) => {
    try {
      await axios.post(`/products/${productId}/wishlist`)
      toast.success('Removed from wishlist')
      fetchWishlist() // Refresh wishlist
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to remove from wishlist'
      toast.error(message)
    }
  }

  const addToCart = async (product: WishlistProduct) => {
    try {
      if (!product.variants || product.variants.length === 0) {
        toast.error('Product variants not available')
        return
      }

      const firstVariant = product.variants[0]
      const firstSize = firstVariant.sizes.find(s => s.stock > 0)

      if (!firstSize) {
        toast.error('Product is out of stock')
        return
      }

      await addItem(product._id, 1, firstSize.size, firstVariant.color)
      // Remove from wishlist after adding to cart
      await removeFromWishlist(product._id)
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to add to cart'
      toast.error(message)
    }
  }

  const viewProduct = (slug: string) => {
    navigate(`/products/${slug}`)
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Heart className="h-24 w-24 text-gray-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Sign In Required</h1>
          <p className="text-gray-600 mb-8 text-lg">
            Please sign in to view your wishlist and save your favorite items.
          </p>
          <Button onClick={() => navigate('/auth')} size="lg">
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-gray-200 h-80 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-600 mt-2">
            {wishlistItems.length > 0 
              ? `${wishlistItems.length} item${wishlistItems.length > 1 ? 's' : ''} in your wishlist`
              : 'Your wishlist is empty'
            }
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Wishlist is Empty</h2>
            <p className="text-gray-600 mb-8 text-lg">
              Start browsing and add items you love to your wishlist.
            </p>
            <Button onClick={() => navigate('/products')} size="lg">
              <Package className="mr-2 h-4 w-4" />
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((product) => (
              <Card key={product._id} className="group hover:shadow-lg transition-shadow duration-300">
                <div className="relative">
                  <img
                    src={product.primaryImage || '/placeholder.jpg'}
                    alt={product.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  
                  {/* Remove from wishlist button */}
                  <button
                    onClick={() => removeFromWishlist(product._id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                  >
                    <X className="h-4 w-4 text-gray-600" />
                  </button>

                  {/* Discount badge */}
                  {product.discount && product.discount > 0 && (
                    <Badge className="absolute top-2 left-2 bg-red-500">
                      -{product.discount}%
                    </Badge>
                  )}

                  {/* Quick actions overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2 rounded-t-lg">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => viewProduct(product.slug)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => addToCart(product)}
                      disabled={!product.variants?.some(v => v.sizes.some(s => s.stock > 0))}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 
                      className="font-semibold text-gray-900 line-clamp-2 cursor-pointer hover:text-blue-600"
                      onClick={() => viewProduct(product.slug)}
                    >
                      {product.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600">{product.brand.name}</p>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(product.price.selling)}
                      </span>
                      {product.price.original && product.price.original > product.price.selling && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.price.original)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < Math.floor(product.rating.average) ? 'text-yellow-400' : 'text-gray-300'}>
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          ({product.rating.count})
                        </span>
                      </div>
                      
                      <Badge variant={product.variants?.some(v => v.sizes.some(s => s.stock > 0)) ? 'default' : 'secondary'}>
                        {product.variants?.some(v => v.sizes.some(s => s.stock > 0)) ? 'In Stock' : 'Out of Stock'}
                      </Badge>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => viewProduct(product.slug)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => addToCart(product)}
                        disabled={!product.variants?.some(v => v.sizes.some(s => s.stock > 0))}
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
