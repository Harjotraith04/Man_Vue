import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Package, CheckCircle, AlertCircle, Truck, Eye, X, RotateCcw, MapPin, Clock, Phone } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Order {
  _id: string
  orderNumber: string
  status: string
  pricing: {
    subtotal: number
    shipping: number
    tax: number
    total: number
  }
  items: Array<{
    product: {
      _id: string
      title: string
      slug: string
      primaryImage: string
    }
    title: string
    image: string
    quantity: number
    size: string
    color: string
    price: number
    totalPrice: number
  }>
  createdAt: string
  shippingAddress: {
    name: string
    phone: string
    street: string
    city: string
    state: string
    zipCode: string
  }
  tracking?: Array<{
    status: string
    message: string
    timestamp: string
  }>
}

interface OrdersResponse {
  orders: Order[]
  pagination: {
    currentPage: number
    totalPages: number
    totalOrders: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export default function OrdersPage() {
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showTrackingModal, setShowTrackingModal] = useState(false)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNext: false,
    hasPrev: false
  })
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10
  })

  useEffect(() => {
    // Check if redirected from successful order
    if (searchParams.get('success') === 'true') {
      toast.success('Your order has been placed successfully!')
    }

    if (user) {
      fetchOrders()
    }
  }, [searchParams, user, filters])


  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString())
      })

      const response = await axios.get(`/users/orders?${params}`)
      const data: OrdersResponse = response.data.data
      
      setOrders(data.orders)
      setPagination(data.pagination)
    } catch (error: any) {
      console.error('Failed to fetch orders:', error)
      toast.error('Failed to load orders')
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelOrder = async (orderNumber: string) => {
    try {
      await axios.put(`/orders/${orderNumber}/cancel`, {
        reason: 'Customer requested cancellation'
      })
      toast.success('Order cancelled successfully')
      fetchOrders() // Refresh orders
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to cancel order'
      toast.error(message)
    }
  }

  const handleReturnRequest = async (orderNumber: string, reason: string) => {
    try {
      await axios.put(`/orders/${orderNumber}/return`, { reason })
      toast.success('Return request submitted successfully')
      fetchOrders() // Refresh orders
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to submit return request'
      toast.error(message)
    }
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

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

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Please Login</h1>
          <p className="text-gray-600 mb-8">You need to be logged in to view your orders.</p>
          <Button onClick={() => window.location.href = '/auth'}>
            Go to Login
          </Button>
        </div>
      </div>
    )
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
          
          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Orders</p>
                  <p className="text-2xl font-bold text-blue-900">{orders.length}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Delivered</p>
                  <p className="text-2xl font-bold text-green-900">
                    {orders.filter(o => o.status === 'delivered').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">In Transit</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {orders.filter(o => o.status === 'shipped').length}
                  </p>
                </div>
                <Truck className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Processing</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {orders.filter(o => o.status === 'processing').length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>
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
          <>
            <div className="space-y-6">
              {orders.map((order: Order) => {
                const StatusIcon = getStatusIcon(order.status)
                return (
                  <Card key={order._id}>
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
                            {order.items.slice(0, 3).map((item, index: number) => (
                              <div key={index} className="flex items-center space-x-3">
                                <img
                                  src={item.image || item.product?.primaryImage || '/placeholder.jpg'}
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
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View Details
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => {
                                setSelectedOrder(order)
                                setShowTrackingModal(true)
                              }}
                            >
                              <Truck className="h-3 w-3 mr-1" />
                              Track Order
                            </Button>
                            {order.status === 'delivered' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full"
                                onClick={() => handleReturnRequest(order.orderNumber, 'Customer wants to return')}
                              >
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Request Return
                              </Button>
                            )}
                            {(order.status === 'pending' || order.status === 'confirmed') && (
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                className="w-full"
                                onClick={() => handleCancelOrder(order.orderNumber)}
                              >
                                <X className="h-3 w-3 mr-1" />
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

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {/* Tracking Modal */}
        {showTrackingModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Track Order #{selectedOrder.orderNumber}</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTrackingModal(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Order Summary */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-3 text-gray-900">Order Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Order Date</p>
                      <p className="font-medium text-gray-900">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Amount</p>
                      <p className="font-medium text-gray-900">{formatPrice(selectedOrder.pricing.total)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Items</p>
                      <p className="font-medium text-gray-900">{selectedOrder.items.length} items</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Status</p>
                      <Badge variant={getStatusColor(selectedOrder.status)}>
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-3 flex items-center text-gray-900">
                    <MapPin className="h-4 w-4 mr-2" />
                    Shipping Address
                  </h3>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{selectedOrder.shippingAddress.name}</p>
                    <p className="text-gray-600">{selectedOrder.shippingAddress.street}</p>
                    <p className="text-gray-600">
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}
                    </p>
                    <p className="text-gray-600 flex items-center mt-1">
                      <Phone className="h-3 w-3 mr-1" />
                      {selectedOrder.shippingAddress.phone}
                    </p>
                  </div>
                </div>

                {/* Tracking Timeline */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-4 flex items-center text-gray-900">
                    <Clock className="h-4 w-4 mr-2" />
                    Tracking Timeline
                  </h3>
                  <div className="space-y-4">
                    {selectedOrder.tracking?.map((track, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className={`w-3 h-3 rounded-full mt-2 ${
                          index === 0 ? 'bg-green-500' : 
                          index === selectedOrder.tracking!.length - 1 ? 'bg-blue-500' : 
                          'bg-gray-300'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900">{track.status}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(track.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{track.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Estimated Delivery */}
                {selectedOrder.status !== 'delivered' && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Estimated Delivery</h3>
                    <p className="text-blue-700">
                      {selectedOrder.status === 'shipped' 
                        ? 'Your order is on the way! Expected delivery: 2-3 business days'
                        : selectedOrder.status === 'processing'
                        ? 'Your order is being prepared. Expected shipping: 1-2 business days'
                        : 'Processing your order...'
                      }
                    </p>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <Button onClick={() => setShowTrackingModal(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
