import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCartStore } from '@/stores/cartStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, Plus, Minus, Trash2, ArrowLeft, ShoppingCart } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function CartPage() {
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
    console.log('🛒 CartPage loading...')
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
    if (window.confirm('Are you sure you want to clear your cart?')) {
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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-gray-200 h-32 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!items || items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-12 text-center border border-blue-200">
            <ShoppingCart className="h-32 w-32 text-blue-400 mx-auto mb-8" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">🛒 Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8 text-xl">
              Ready to find some amazing products? Let's start shopping! ✨
            </p>
            <Link to="/products">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 text-lg">
                <ShoppingBag className="mr-3 h-6 w-6" />
                Discover Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-8 border border-blue-200">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">🛍️ Shopping Cart</h1>
              <p className="text-xl text-gray-700">
                {totalItems} {totalItems === 1 ? 'amazing item' : 'amazing items'} ready for checkout
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link to="/products">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3">
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Continue Shopping
                </Button>
              </Link>
              {items.length > 0 && (
                <Button variant="outline" onClick={handleClearCart} className="border-red-200 text-red-600 hover:bg-red-50 px-6 py-3">
                  <Trash2 className="mr-2 h-5 w-5" />
                  Clear Cart
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={`${item.product.id}-${item.size}-${item.color}`} className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-blue-500 bg-gradient-to-r from-gray-800 to-gray-900">
                <CardContent className="p-8">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Product Image - Enhanced */}
                    <Link 
                      to={`/product/${item.product.slug}`}
                      className="w-full sm:w-48 h-48 flex-shrink-0"
                    >
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                        <img
                          src={item.product.primaryImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop'}
                          alt={item.product.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop';
                          }}
                        />
                      </div>
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Link 
                            to={`/product/${item.product.slug}`}
                            className="text-xl font-bold text-white hover:text-blue-300 transition-colors block mb-1"
                          >
                            {item.product.title}
                          </Link>
                          <p className="text-lg text-blue-300 font-medium">{item.product.brand?.name || 'ManVue'}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.product.id, item.size, item.color)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Variant Info */}
                      <div className="flex flex-wrap gap-3 mb-4">
                        <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg px-3 py-2">
                          <span className="text-sm font-medium text-blue-300">Size: {item.size}</span>
                        </div>
                        <div className="bg-purple-500/20 border border-purple-400/30 rounded-lg px-3 py-2">
                          <span className="text-sm font-medium text-purple-300">Color: {item.color}</span>
                        </div>
                      </div>

                      {/* Quantity and Price */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-white font-medium">Quantity:</span>
                          <div className="flex items-center bg-gray-700/50 backdrop-blur-sm rounded-lg border border-gray-600/50">
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
                              className="h-10 w-10 hover:bg-red-500/20 hover:text-red-300 text-white"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-16 text-center font-bold text-lg text-white">
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
                              disabled={item.quantity >= 10}
                              className="h-10 w-10 hover:bg-green-500/20 hover:text-green-300 text-white"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-bold text-white">
                            {formatPrice(item.totalPrice)}
                          </div>
                          <div className="text-sm text-gray-300 font-medium">
                            {formatPrice(item.unitPrice)} each
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? 'Free' : formatPrice(shipping)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (GST)</span>
                    <span className="font-medium">{formatPrice(tax)}</span>
                  </div>
                  
                  <hr className="my-4" />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                {shipping === 0 && subtotal > 0 && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      🎉 You've qualified for free shipping!
                    </p>
                  </div>
                )}

                {shipping > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Add {formatPrice(50 - subtotal)} more for free shipping
                    </p>
                  </div>
                )}

                <Link to="/checkout" className="block mt-6">
                  <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300" size="lg">
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Proceed to Checkout
                    <ArrowLeft className="ml-2 h-5 w-5 rotate-180" />
                  </Button>
                </Link>

                <div className="mt-4 text-center">
                  <Link to="/products" className="text-blue-600 hover:text-blue-800 text-sm">
                    Continue Shopping
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recently Viewed or Recommended Products */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold mb-6">You might also like</h3>
          <div className="text-center py-8 text-gray-600">
            <p>Recommended products will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  )
}