import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CreditCard, MapPin, ArrowLeft, Truck, IndianRupee, Smartphone, CreditCard as CreditCardIcon, Wallet } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import axios from 'axios'
import toast from 'react-hot-toast'

interface PaymentMethod {
  id: string
  name: string
  description: string
  enabled: boolean
  currencies: string[]
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { items, summary, loadCart, clearCart } = useCartStore()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cod')
  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: 'India'
  })
  const [billingAddress, setBillingAddress] = useState({
    ...shippingAddress
  })
  const [useSameAddress, setUseSameAddress] = useState(true)

  useEffect(() => {
    loadCart()
    fetchPaymentMethods()
  }, [loadCart])

  useEffect(() => {
    if (!items || items.length === 0) {
      navigate('/cart')
    }
  }, [items, navigate])

  useEffect(() => {
    if (useSameAddress) {
      setBillingAddress(shippingAddress)
    }
  }, [shippingAddress, useSameAddress])

  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get('/payment/methods')
      setPaymentMethods(response.data.data.paymentMethods)
    } catch (error) {
      console.error('Failed to fetch payment methods:', error)
      // Set fallback payment methods
      setPaymentMethods([
        { id: 'cod', name: 'Cash on Delivery', description: 'Pay when your order is delivered', enabled: true, currencies: ['inr'] },
        { id: 'card', name: 'Credit/Debit Card', description: 'Pay securely with your card', enabled: true, currencies: ['inr'] }
      ])
    }
  }

  const validateForm = () => {
    const required = ['name', 'email', 'phone', 'street', 'city', 'state', 'zipCode']
    
    for (const field of required) {
      if (!shippingAddress[field as keyof typeof shippingAddress]) {
        toast.error(`Please fill in ${field.charAt(0).toUpperCase() + field.slice(1)}`)
        return false
      }
    }

    if (!selectedPaymentMethod) {
      toast.error('Please select a payment method')
      return false
    }

    return true
  }

  const handlePlaceOrder = async () => {
    if (!validateForm()) return

    setIsProcessing(true)
    try {
      // Prepare order data
      const orderData = {
        items: items.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          size: item.size,
          color: item.color
        })),
        shippingAddress,
        billingAddress: useSameAddress ? shippingAddress : billingAddress,
        payment: {
          method: selectedPaymentMethod
        },
        shipping: {
          method: 'standard',
          cost: summary.shipping
        }
      }

      // Create order
      const response = await axios.post('/orders', orderData)
      const order = response.data.data.order

      // If payment method is not COD, handle payment
      if (selectedPaymentMethod !== 'cod') {
        await handlePayment(order._id, summary.total)
      }

      // Clear cart
      await clearCart()
      
      toast.success('Order placed successfully!')
      navigate(`/orders?success=true&orderNumber=${order.orderNumber}`)
    } catch (error: any) {
      console.error('Order placement error:', error)
      const message = error.response?.data?.message || 'Failed to place order. Please try again.'
      toast.error(message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePayment = async (orderId: string, amount: number) => {
    try {
      // Create payment intent
      const paymentResponse = await axios.post('/payment/create-payment-intent', {
        amount: Math.round(amount),
        currency: 'inr',
        orderId,
        metadata: {
          orderType: 'ecommerce'
        }
      })

      const { clientSecret } = paymentResponse.data.data

      // For now, we'll simulate payment success
      // In a real implementation, you would integrate with Stripe Elements or other payment UI
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Confirm payment
      await axios.post('/payment/confirm-payment', {
        paymentIntentId: clientSecret.split('_secret_')[0],
        orderId
      })

      toast.success('Payment processed successfully!')
    } catch (error: any) {
      console.error('Payment error:', error)
      throw new Error('Payment failed')
    }
  }

  const getPaymentIcon = (methodId: string) => {
    switch (methodId) {
      case 'card':
        return CreditCardIcon
      case 'upi':
        return Smartphone
      case 'cod':
        return IndianRupee
      case 'wallet':
        return Wallet
      default:
        return CreditCard
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <Button variant="outline" onClick={() => navigate('/cart')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    value={shippingAddress.name}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Full Name"
                  />
                  <Input
                    type="email"
                    value={shippingAddress.email}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Email"
                  />
                </div>
                <Input
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Phone Number"
                />
                <Input
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, street: e.target.value }))}
                  placeholder="Street Address"
                />
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                  />
                  <Input
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="State"
                  />
                  <Input
                    value={shippingAddress.zipCode}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                    placeholder="ZIP"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods.map((method) => {
                  const PaymentIcon = getPaymentIcon(method.id)
                  return (
                    <div
                      key={method.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedPaymentMethod === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${!method.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => method.enabled && setSelectedPaymentMethod(method.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            checked={selectedPaymentMethod === method.id}
                            onChange={() => method.enabled && setSelectedPaymentMethod(method.id)}
                            disabled={!method.enabled}
                            className="text-blue-600"
                          />
                          <PaymentIcon className="h-5 w-5" />
                          <div>
                            <p className="font-medium">{method.name}</p>
                            <p className="text-sm text-gray-600">{method.description}</p>
                          </div>
                        </div>
                        {!method.enabled && (
                          <Badge variant="secondary">Coming Soon</Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Billing Address */}
            {!useSameAddress && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    Billing Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      value={billingAddress.name}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Full Name"
                    />
                    <Input
                      type="email"
                      value={billingAddress.email}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Email"
                    />
                  </div>
                  <Input
                    value={billingAddress.phone}
                    onChange={(e) => setBillingAddress(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Phone Number"
                  />
                  <Input
                    value={billingAddress.street}
                    onChange={(e) => setBillingAddress(prev => ({ ...prev, street: e.target.value }))}
                    placeholder="Street Address"
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      value={billingAddress.city}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="City"
                    />
                    <Input
                      value={billingAddress.state}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="State"
                    />
                    <Input
                      value={billingAddress.zipCode}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                      placeholder="ZIP"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sameAddress"
                checked={useSameAddress}
                onChange={(e) => setUseSameAddress(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="sameAddress" className="text-sm">
                Billing address is the same as shipping address
              </label>
            </div>
          </div>

          {/* Order Summary */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Items */}
              <div className="space-y-3">
                <h4 className="font-medium">Order Items ({summary.totalItems})</h4>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <img
                        src={item.product?.primaryImage || '/placeholder.jpg'}
                        alt={item.product?.title}
                        className="w-8 h-8 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium truncate">{item.product?.title}</p>
                        <p className="text-gray-600 text-xs">
                          {item.color} • {item.size} • Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="font-medium">{formatPrice(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <hr />

              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal ({summary.totalItems} items)</span>
                  <span>{formatPrice(summary.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{summary.shipping === 0 ? 'Free' : formatPrice(summary.shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatPrice(summary.tax)}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(summary.total)}</span>
                </div>
              </div>

              {/* Payment Method Summary */}
              {selectedPaymentMethod && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    {React.createElement(getPaymentIcon(selectedPaymentMethod), { className: "h-4 w-4" })}
                    <span className="text-sm font-medium">
                      {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
                    </span>
                  </div>
                </div>
              )}
              
              <Button 
                onClick={handlePlaceOrder} 
                className="w-full"
                disabled={isProcessing || !items?.length}
              >
                {isProcessing ? 'Processing...' : `Place Order (${formatPrice(summary.total)})`}
              </Button>

              <p className="text-xs text-gray-600 text-center">
                By placing your order, you agree to our Terms of Service and Privacy Policy
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
