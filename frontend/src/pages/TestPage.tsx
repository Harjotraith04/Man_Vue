import React, { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { useProductStore } from '@/stores/productStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import toast from 'react-hot-toast'

export default function TestPage() {
  const { user, isAuthenticated, login, logout } = useAuthStore()
  const { addItem: addToCart, items: cartItems } = useCartStore()
  const { products, fetchProducts, addToWishlist } = useProductStore()
  const [testResults, setTestResults] = useState<string[]>([])

  useEffect(() => {
    fetchProducts({ limit: 3 })
  }, [fetchProducts])

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const testLogin = async () => {
    try {
      await login('admin@manvue.com', 'admin123')
      addTestResult('✅ Login successful')
    } catch (error) {
      addTestResult('❌ Login failed: ' + (error as any).message)
    }
  }

  const testAddToCart = async () => {
    if (!products.length) {
      addTestResult('❌ No products available for cart test')
      return
    }

    try {
      const product = products[0]
      await addToCart(product._id, 1, 'M', 'Default')
      addTestResult('✅ Add to cart successful')
    } catch (error) {
      addTestResult('❌ Add to cart failed: ' + (error as any).message)
    }
  }

  const testAddToWishlist = async () => {
    if (!products.length) {
      addTestResult('❌ No products available for wishlist test')
      return
    }

    try {
      const product = products[0]
      await addToWishlist(product)
      addTestResult('✅ Add to wishlist successful')
    } catch (error) {
      addTestResult('❌ Add to wishlist failed: ' + (error as any).message)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">ManVue Test Page</h1>
      
      {/* Auth Status */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <p>Status: {isAuthenticated ? '✅ Authenticated' : '❌ Not authenticated'}</p>
          {user && (
            <div className="mt-2">
              <p>User: {user.name} ({user.email})</p>
              <p>Role: {user.role}</p>
            </div>
          )}
          <div className="mt-4 space-x-2">
            <Button onClick={testLogin} disabled={isAuthenticated}>
              Test Login
            </Button>
            <Button onClick={logout} disabled={!isAuthenticated} variant="outline">
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Products ({products.length})</h2>
          {products.length > 0 ? (
            <div className="space-y-2">
              {products.map(product => (
                <div key={product._id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">{product.title}</p>
                    <p className="text-sm text-gray-600">ID: {product._id}</p>
                    <p className="text-sm text-gray-600">Variants: {product.variants?.length || 0}</p>
                  </div>
                  <div className="space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => addToCart(product._id, 1, 'M', 'Default')}
                      disabled={!isAuthenticated}
                    >
                      Add to Cart
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => addToWishlist(product)}
                      disabled={!isAuthenticated}
                    >
                      Wishlist
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No products loaded</p>
          )}
        </CardContent>
      </Card>

      {/* Cart */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Cart ({cartItems.length} items)</h2>
          {cartItems.length > 0 ? (
            <div className="space-y-2">
              {cartItems.map((item, index) => (
                <div key={index} className="p-2 border rounded">
                  <p>Product: {item.product}</p>
                  <p>Quantity: {item.quantity}</p>
                  <p>Size: {item.size}</p>
                  <p>Color: {item.color}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>Cart is empty</p>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Test Results</h2>
            <Button onClick={clearResults} variant="outline" size="sm">
              Clear
            </Button>
          </div>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500">No test results yet</p>
            ) : (
              testResults.map((result, index) => (
                <p key={index} className="text-sm font-mono">{result}</p>
              ))
            )}
          </div>
          <div className="mt-4 space-x-2">
            <Button onClick={testAddToCart} disabled={!isAuthenticated || !products.length}>
              Test Add to Cart
            </Button>
            <Button onClick={testAddToWishlist} disabled={!isAuthenticated || !products.length} variant="outline">
              Test Add to Wishlist
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
