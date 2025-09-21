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
    totalItems, 
    subtotal, 
    tax, 
    shipping, 
    total,
    fetchCart,
    updateQuantity,
    removeItem,
    clearCart
  } = useCartStore()

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <ShoppingCart className="h-24 w-24 text-gray-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8 text-lg">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link to="/products">
            <Button size="lg">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-600 mt-2">
              {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <div className="flex space-x-4">
            <Link to="/products">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continue Shopping
              </Button>
            </Link>
            {items.length > 0 && (
              <Button variant="destructive" onClick={handleClearCart}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Cart
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={`${item.product.id}-${item.size}-${item.color}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Product Image */}
                    <Link 
                      to={`/product/${item.product.slug}`}
                      className="w-full sm:w-32 h-32 flex-shrink-0"
                    >
                      <img
                        src={item.product.primaryImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop'}
                        alt={item.product.title}
                        className="w-full h-full object-cover rounded-lg hover:opacity-80 transition-opacity"
                      />
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Link 
                            to={`/product/${item.product.slug}`}
                            className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                          >
                            {item.product.title}
                          </Link>
                          <p className="text-gray-600">{item.product.brand?.name}</p>
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
                      <div className="flex space-x-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Size:</span>
                          <Badge variant="outline">{item.size}</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Color:</span>
                          <Badge variant="outline">{item.color}</Badge>
                        </div>
                      </div>

                      {/* Quantity and Price */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-600">Quantity:</span>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityUpdate(
                                item.product.id, 
                                item.size, 
                                item.color, 
                                item.quantity - 1
                              )}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-12 text-center font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityUpdate(
                                item.product.id, 
                                item.size, 
                                item.color, 
                                item.quantity + 1
                              )}
                              disabled={item.quantity >= 10}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {formatPrice(item.totalPrice)}
                          </div>
                          <div className="text-sm text-gray-600">
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
                      Add {formatPrice(1000 - subtotal)} more for free shipping
                    </p>
                  </div>
                )}

                <Link to="/checkout" className="block mt-6">
                  <Button className="w-full" size="lg">
                    Proceed to Checkout
                    <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
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