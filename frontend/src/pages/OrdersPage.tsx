import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Package, CheckCircle, AlertCircle, Truck } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function OrdersPage() {
  const [searchParams] = useSearchParams()
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if redirected from successful order
    if (searchParams.get('success') === 'true') {
      toast.success('Your order has been placed successfully!')
    }

    // Simulate loading orders
    setTimeout(() => {
      setOrders([]) // No orders for now
      setIsLoading(false)
    }, 1000)
  }, [searchParams])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'default'
      case 'shipped':
        return 'secondary'
      case 'processing':
        return 'secondary'
      case 'cancelled':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return CheckCircle
      case 'shipped':
        return Truck
      case 'cancelled':
        return AlertCircle
      default:
        return Package
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-2">Track and manage your orders</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Orders Yet</h2>
            <p className="text-gray-600 mb-8 text-lg">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Button onClick={() => window.location.href = '/products'} size="lg">
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any) => {
              const StatusIcon = getStatusIcon(order.status)
              return (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          Order #{order.orderNumber}
                        </CardTitle>
                        <p className="text-gray-600">
                          Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(order.status)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Order Items */}
                      <div className="md:col-span-2">
                        <h4 className="font-medium mb-3">Items ({order.items.length})</h4>
                        <div className="space-y-3">
                          {order.items.slice(0, 3).map((item: any, index: number) => (
                            <div key={index} className="flex items-center space-x-3">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-sm">{item.title}</p>
                                <p className="text-gray-600 text-xs">
                                  {item.color} • {item.size} • Qty: {item.quantity}
                                </p>
                              </div>
                              <p className="text-sm font-medium">
                                {formatPrice(item.totalPrice)}
                              </p>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <p className="text-sm text-gray-600">
                              +{order.items.length - 3} more items
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div>
                        <h4 className="font-medium mb-3">Order Total</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span>{formatPrice(order.pricing.subtotal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Shipping</span>
                            <span>{formatPrice(order.pricing.shipping)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tax</span>
                            <span>{formatPrice(order.pricing.tax)}</span>
                          </div>
                          <div className="flex justify-between font-medium text-base pt-2 border-t">
                            <span>Total</span>
                            <span>{formatPrice(order.pricing.total)}</span>
                          </div>
                        </div>

                        <div className="mt-4 space-y-2">
                          <Button variant="outline" size="sm" className="w-full">
                            View Details
                          </Button>
                          {order.status === 'delivered' && (
                            <Button variant="outline" size="sm" className="w-full">
                              Leave Review
                            </Button>
                          )}
                          {(order.status === 'pending' || order.status === 'confirmed') && (
                            <Button variant="destructive" size="sm" className="w-full">
                              Cancel Order
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
