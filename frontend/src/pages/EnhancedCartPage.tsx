import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCartStore } from '@/stores/cartStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, Plus, Minus, Trash2, ArrowLeft, ShoppingCart, Heart } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function EnhancedCartPage() {
  const { 
    items, 
    isLoading, 
    summary,
    loadCart,
    updateQuantity,
    removeItem,
    clearCart
  } = useCartStore()

  // Extract summary values
  const { totalItems = 0, subtotal = 0, tax = 0, shipping = 0, total = 0 } = summary || {}

  useEffect(() => {
    console.log('🛒 Enhanced CartPage loading...')
    loadCart()
  }, [loadCart])

  const handleQuantityUpdate = async (productId: string, size: string, color: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await handleRemoveItem(productId, size, color)
      return
    }

    try {
      await updateQuantity(productId, size, color, newQuantity)
      toast.success('Cart updated successfully')
    } catch (error) {
      toast.error('Failed to update cart')
    }
  }

  const handleRemoveItem = async (productId: string, size: string, color: string) => {
    try {
      await removeItem(productId, size, color)
      toast.success('Item removed from cart')
    } catch (error) {
      toast.error('Failed to remove item')
    }
  }

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      try {
        await clearCart()
        toast.success('Cart cleared successfully')
      } catch (error) {
        toast.error('Failed to clear cart')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading your cart...</p>
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
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-md rounded-3xl p-8 border border-blue-500/20">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div>
                  <h1 className="text-5xl font-bold holographic mb-4">🛍️ Shopping Cart</h1>
                  <p className="text-xl text-blue-200">
                    {totalItems} {totalItems === 1 ? 'item' : 'items'} ready for checkout
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Link to="/products">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-xl">
                      <ArrowLeft className="mr-2 h-5 w-5" />
                      Continue Shopping
                    </Button>
                  </Link>
                  {items.length > 0 && (
                    <Button 
                      variant="outline" 
                      onClick={handleClearCart}
                      className="border-red-400 text-red-400 hover:bg-red-500/20 px-6 py-3 rounded-xl"
                    >
                      <Trash2 className="mr-2 h-5 w-5" />
                      Clear Cart
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {items.length === 0 ? (
            // Empty Cart State
            <div className="text-center py-20">
              <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-md rounded-3xl p-12 border border-gray-700/50">
                <ShoppingCart className="h-24 w-24 text-gray-400 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-white mb-4">Your Cart is Empty</h2>
                <p className="text-xl text-gray-300 mb-8">Add some awesome products to get started!</p>
                <Link to="/products">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 rounded-xl text-xl">
                    <ShoppingBag className="mr-3 h-6 w-6" />
                    Start Shopping
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6">
                {items.map((item, index) => (
                  <div 
                    key={`${item.product.id}-${item.size}-${item.color}`} 
                    className="group bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-md rounded-3xl p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Product Image */}
                      <div className="lg:w-64 w-full">
                        <Link to={`/product/${item.product.slug}`}>
                          <div className="aspect-square bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden group-hover:scale-105 transition-transform duration-300">
                            <img
                              src={item.product.primaryImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop'}
                              alt={item.product.title}
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop';
                              }}
                            />
                          </div>
                        </Link>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 space-y-4">
                        {/* Title and Brand */}
                        <div className="flex items-start justify-between">
                          <div>
                            <Link 
                              to={`/product/${item.product.slug}`}
                              className="text-2xl font-bold text-white hover:text-blue-400 transition-colors block holographic"
                            >
                              {item.product.title}
                            </Link>
                            <p className="text-lg text-blue-300 font-medium">
                              {item.product.brand?.name || 'ManVue'}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.product.id, item.size, item.color)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full p-3"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>

                        {/* Variant Info */}
                        <div className="flex flex-wrap gap-3">
                          <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl px-4 py-2">
                            <span className="text-blue-300 font-medium">Size: {item.size}</span>
                          </div>
                          <div className="bg-purple-500/20 border border-purple-400/30 rounded-xl px-4 py-2">
                            <span className="text-purple-300 font-medium">Color: {item.color}</span>
                          </div>
                        </div>

                        {/* Quantity and Price */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-4">
                            <span className="text-lg font-medium text-white">Quantity:</span>
                            <div className="flex items-center bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-600/50">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleQuantityUpdate(
                                  item.product.id, 
                                  item.size, 
                                  item.color, 
                                  item.quantity - 1
                                )}
                                disabled={item.quantity <= 1}
                                className="h-12 w-12 hover:bg-red-500/20 hover:text-red-300 rounded-l-xl"
                              >
                                <Minus className="h-5 w-5" />
                              </Button>
                              <span className="w-16 text-center font-bold text-xl text-white">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleQuantityUpdate(
                                  item.product.id, 
                                  item.size, 
                                  item.color, 
                                  item.quantity + 1
                                )}
                                className="h-12 w-12 hover:bg-green-500/20 hover:text-green-300 rounded-r-xl"
                              >
                                <Plus className="h-5 w-5" />
                              </Button>
                            </div>
                          </div>

                          {/* Price Info */}
                          <div className="text-right">
                            <p className="text-3xl font-bold text-blue-400">
                              {formatPrice(item.totalPrice)}
                            </p>
                            <p className="text-lg text-gray-300">
                              {formatPrice(item.unitPrice)} × {item.quantity}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-md rounded-3xl p-6 border border-gray-700/50 sticky top-8">
                  <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-lg">
                      <span className="text-gray-300">Subtotal</span>
                      <span className="text-white font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span className="text-gray-300">Shipping</span>
                      <span className="text-white font-medium">
                        {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span className="text-gray-300">Tax</span>
                      <span className="text-white font-medium">{formatPrice(tax)}</span>
                    </div>
                    <hr className="border-gray-600" />
                    <div className="flex justify-between text-2xl font-bold">
                      <span className="text-white">Total</span>
                      <span className="text-blue-400">{formatPrice(total)}</span>
                    </div>
                  </div>

                  <Button 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-4 rounded-xl text-lg font-bold shadow-2xl hover:shadow-blue-500/50 transition-all duration-300"
                  >
                    <ShoppingBag className="mr-3 h-6 w-6" />
                    Proceed to Checkout
                  </Button>

                  <div className="mt-4 text-center text-sm text-gray-400">
                    <p>Secure checkout powered by Stripe</p>
                    <p className="mt-2">🔒 Your payment information is safe</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
