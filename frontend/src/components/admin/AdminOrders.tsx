import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Search, 
  Edit, 
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Download,
  Filter
} from 'lucide-react'
import axios from 'axios'
import { formatPrice, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Order {
  _id: string
  orderNumber: string
  user: {
    name: string
    email: string
  }
  items: Array<{
    product: {
      title: string
    }
    quantity: number
    size: string
    color: string
    totalPrice: number
  }>
  pricing: {
    total: number
    subtotal: number
    tax: number
    shipping: number
  }
  status: string
  createdAt: string
  shippingAddress: {
    name: string
    city: string
    state: string
  }
  tracking?: Array<{
    status: string
    message: string
    timestamp: string
  }>
}

interface OrderFilters {
  search: string
  status: string
  startDate: string
  endDate: string
  page: number
  limit: number
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

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNext: false,
    hasPrev: false
  })
  const [filters, setFilters] = useState<OrderFilters>({
    search: '',
    status: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [filters])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString())
      })

      const response = await axios.get(`/admin/orders?${params}`)
      const data: OrdersResponse = response.data.data
      
      setOrders(data.orders)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }))
  }

  const handleFilterChange = (key: keyof OrderFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleUpdateOrderStatus = async (orderNumber: string, status: string) => {
    try {
      await axios.put(`/orders/${orderNumber}/status`, { 
        status,
        notes: `Status updated to ${status} by admin`
      })
      toast.success('Order status updated successfully')
      fetchOrders()
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update order status'
      toast.error(message)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'confirmed': return 'info'
      case 'processing': return 'info'
      case 'shipped': return 'info'
      case 'delivered': return 'success'
      case 'cancelled': return 'destructive'
      case 'returned': return 'destructive'
      default: return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Package
      case 'confirmed': return CheckCircle
      case 'processing': return Package
      case 'shipped': return Truck
      case 'delivered': return CheckCircle
      case 'cancelled': return XCircle
      case 'returned': return XCircle
      default: return Package
    }
  }

  const orderStatuses = [
    'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Orders</h1>
          <p className="text-gray-300">Manage customer orders and fulfillment</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
            <Download className="h-4 w-4 mr-2" />
            Export Orders
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6 bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by order number, customer name..."
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
            </div>
            
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-600 rounded-md text-sm bg-gray-700 text-white"
            >
              <option value="">All Status</option>
              {orderStatuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>

            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-auto bg-gray-700 border-gray-600 text-white"
            />

            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-auto bg-gray-700 border-gray-600 text-white"
            />

            <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Order Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{pagination.totalOrders}</div>
            <div className="text-sm text-gray-300">Total Orders</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-400">
              {orders.filter(o => o.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-300">Pending</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-400">
              {orders.filter(o => o.status === 'shipped').length}
            </div>
            <div className="text-sm text-gray-300">Shipped</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-400">
              {orders.filter(o => o.status === 'delivered').length}
            </div>
            <div className="text-sm text-gray-300">Delivered</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-white">Loading orders...</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Order</TableHead>
                    <TableHead className="text-gray-300">Customer</TableHead>
                    <TableHead className="text-gray-300">Items</TableHead>
                    <TableHead className="text-gray-300">Total</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Date</TableHead>
                    <TableHead className="w-32 text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const StatusIcon = getStatusIcon(order.status)
                    return (
                      <TableRow key={order._id} className="border-gray-700 hover:bg-gray-700">
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm text-white">#{order.orderNumber}</p>
                            <p className="text-xs text-gray-400">
                              {order.shippingAddress.city}, {order.shippingAddress.state}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm text-white">{order.user.name}</p>
                            <p className="text-xs text-gray-400">{order.user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm text-white">{order.items.length} items</p>
                            <p className="text-xs text-gray-400">
                              {order.items.slice(0, 2).map(item => item.product.title).join(', ')}
                              {order.items.length > 2 && '...'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-white">{formatPrice(order.pricing.total)}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <StatusIcon className="h-4 w-4 text-gray-400" />
                            <Badge variant={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-400">
                            {formatDate(order.createdAt)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => setSelectedOrder(order)}
                              title="View Details"
                              className="text-gray-400 hover:text-white hover:bg-gray-600"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            {order.status === 'pending' && (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleUpdateOrderStatus(order.orderNumber, 'confirmed')}
                                title="Confirm Order"
                                className="text-gray-400 hover:text-green-400 hover:bg-gray-600"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            
                            {order.status === 'confirmed' && (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleUpdateOrderStatus(order.orderNumber, 'shipped')}
                                title="Mark as Shipped"
                                className="text-gray-400 hover:text-blue-400 hover:bg-gray-600"
                              >
                                <Truck className="h-4 w-4" />
                              </Button>
                            )}
                            
                            <Button 
                              size="sm" 
                              variant="ghost"
                              title="Edit Order"
                              className="text-gray-400 hover:text-white hover:bg-gray-600"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="p-4 border-t border-gray-700 flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Showing {(pagination.currentPage - 1) * filters.limit + 1} to{' '}
                    {Math.min(pagination.currentPage * filters.limit, pagination.totalOrders)} of{' '}
                    {pagination.totalOrders} orders
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!pagination.hasPrev}
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!pagination.hasNext}
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Order Details</h2>
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  ×
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-semibold mb-2 text-white">Order Information</h3>
                  <p className="text-gray-300"><strong className="text-white">Order #:</strong> {selectedOrder.orderNumber}</p>
                  <p className="text-gray-300"><strong className="text-white">Status:</strong> {selectedOrder.status}</p>
                  <p className="text-gray-300"><strong className="text-white">Date:</strong> {formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-white">Customer</h3>
                  <p className="text-gray-300"><strong className="text-white">Name:</strong> {selectedOrder.user.name}</p>
                  <p className="text-gray-300"><strong className="text-white">Email:</strong> {selectedOrder.user.email}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2 text-white">Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                      <div>
                        <p className="font-medium text-white">{item.product.title}</p>
                        <p className="text-sm text-gray-400">
                          {item.color} - {item.size} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium text-white">{formatPrice(item.totalPrice)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2 text-white">Pricing</h3>
                <div className="space-y-1">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal:</span>
                    <span>{formatPrice(selectedOrder.pricing.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Tax:</span>
                    <span>{formatPrice(selectedOrder.pricing.tax)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Shipping:</span>
                    <span>{formatPrice(selectedOrder.pricing.shipping)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-gray-700 pt-1 text-white">
                    <span>Total:</span>
                    <span>{formatPrice(selectedOrder.pricing.total)}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <select 
                  className="flex-1 px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                  onChange={(e) => {
                    if (e.target.value) {
                      handleUpdateOrderStatus(selectedOrder.orderNumber, e.target.value)
                      setSelectedOrder(null)
                    }
                  }}
                  defaultValue=""
                >
                  <option value="">Update Status</option>
                  {orderStatuses.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">Print</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
