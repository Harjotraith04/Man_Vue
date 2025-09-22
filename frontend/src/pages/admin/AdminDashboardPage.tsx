import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  BarChart3, 
  Settings,
  Plus,
  DollarSign,
  Eye,
  Download
} from 'lucide-react'
import axios from 'axios'
import { formatPrice } from '@/lib/utils'
import AdminProducts from '@/components/admin/AdminProducts'
import AdminUsers from '@/components/admin/AdminUsers'
import AdminOrders from '@/components/admin/AdminOrders'
import AdminAnalytics from '@/components/admin/AdminAnalytics'
import AdminSettings from '@/components/admin/AdminSettings'

interface DashboardStats {
  orders: {
    totalOrders: number
    totalRevenue: number
    averageOrderValue: number
    pendingOrders: number
    processingOrders: number
    shippedOrders: number
    deliveredOrders: number
    cancelledOrders: number
  }
  users: {
    totalUsers: number
    activeUsers: number
    newUsers: number
    adminUsers: number
  }
  products: {
    totalProducts: number
    activeProducts: number
    featuredProducts: number
    newArrivals: number
    lowStockProducts: number
  }
  revenue: Array<{
    _id: string
    revenue: number
    orders: number
  }>
  topProducts: Array<{
    _id: string
    title: string
    soldCount: number
    category: string
    price: { selling: number }
    rating: { average: number }
  }>
  topCategories: Array<{
    _id: string
    totalSold: number
    totalProducts: number
    averagePrice: number
  }>
  recentOrders: Array<{
    _id: string
    orderNumber: string
    status: string
    pricing: { total: number }
    createdAt: string
    user: { name: string; email: string }
    shippingAddress: { name: string }
  }>
  growth?: {
    revenue: number
    orders: number
    users: number
    products: number
  }
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user, token, isAuthenticated, initialize } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    // Initialize auth store first to ensure token is set in axios headers
    initialize()
  }, [initialize])

  useEffect(() => {
    // Only fetch stats if authenticated
    if (isAuthenticated && token) {
      fetchDashboardStats()
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated, token])

  const fetchDashboardStats = async () => {
    try {
      // Ensure token is set in axios headers
      if (token && !axios.defaults.headers.common['Authorization']) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
      
      // Get current period stats
      const currentResponse = await axios.get('/admin/dashboard?period=30')
      // Get previous period stats for growth calculation
      const previousResponse = await axios.get('/admin/dashboard?period=30&offset=30')
      
      const currentStats = currentResponse.data.data
      const previousStats = previousResponse.data.data
      
      // Calculate growth percentages
      const calculateGrowth = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0
        return ((current - previous) / previous) * 100
      }
      
      const statsWithGrowth = {
        ...currentStats,
        growth: {
          revenue: calculateGrowth(currentStats.orders.totalRevenue, previousStats.orders.totalRevenue),
          orders: calculateGrowth(currentStats.orders.totalOrders, previousStats.orders.totalOrders),
          users: calculateGrowth(currentStats.users.activeUsers, previousStats.users.activeUsers),
          products: calculateGrowth(currentStats.products.activeProducts, previousStats.products.activeProducts)
        }
      }
      
      setStats(statsWithGrowth)
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
      // Fallback to current period only if previous period fails
      try {
        const response = await axios.get('/admin/dashboard')
        setStats(response.data.data)
      } catch (fallbackError) {
        console.error('Fallback request also failed:', fallbackError)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin', exact: true },
    { icon: Package, label: 'Products', path: '/admin/products' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' }
  ]

  const isActivePath = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
          <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActivePath(item.path, item.exact)
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route index element={<DashboardOverview stats={stats} />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
        </Routes>
      </div>
    </div>
  )
}

function DashboardOverview({ stats }: { stats: DashboardStats | null }) {
  if (!stats) return null

  const formatGrowth = (growth: number) => {
    const sign = growth >= 0 ? '+' : ''
    return `${sign}${growth.toFixed(1)}%`
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatPrice(stats.orders.totalRevenue),
      change: stats.growth ? formatGrowth(stats.growth.revenue) : 'N/A',
      changeType: stats.growth && stats.growth.revenue >= 0 ? 'positive' as const : 'negative' as const,
      icon: DollarSign
    },
    {
      title: 'Total Orders',
      value: stats.orders.totalOrders.toString(),
      change: stats.growth ? formatGrowth(stats.growth.orders) : 'N/A',
      changeType: stats.growth && stats.growth.orders >= 0 ? 'positive' as const : 'negative' as const,
      icon: ShoppingCart
    },
    {
      title: 'Active Users',
      value: stats.users.activeUsers.toString(),
      change: stats.growth ? formatGrowth(stats.growth.users) : 'N/A',
      changeType: stats.growth && stats.growth.users >= 0 ? 'positive' as const : 'negative' as const,
      icon: Users
    },
    {
      title: 'Active Products',
      value: stats.products.activeProducts.toString(),
      change: stats.growth ? formatGrowth(stats.growth.products) : 'N/A',
      changeType: stats.growth && stats.growth.products >= 0 ? 'positive' as const : 'negative' as const,
      icon: Package
    }
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} from last period
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Order Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Pending</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${stats.orders.totalOrders > 0 ? (stats.orders.pendingOrders / stats.orders.totalOrders) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{stats.orders.pendingOrders}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Processing</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${stats.orders.totalOrders > 0 ? (stats.orders.processingOrders / stats.orders.totalOrders) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{stats.orders.processingOrders}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Shipped</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ width: `${stats.orders.totalOrders > 0 ? (stats.orders.shippedOrders / stats.orders.totalOrders) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{stats.orders.shippedOrders}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Delivered</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${stats.orders.totalOrders > 0 ? (stats.orders.deliveredOrders / stats.orders.totalOrders) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{stats.orders.deliveredOrders}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/admin/products">
                <Button className="w-full h-16 flex flex-col items-center justify-center">
                  <Plus className="h-5 w-5 mb-1" />
                  Add Product
                </Button>
              </Link>
              <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center">
                <Download className="h-5 w-5 mb-1" />
                Export Data
              </Button>
              <Link to="/admin/orders">
                <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center">
                  <Eye className="h-5 w-5 mb-1" />
                  View Orders
                </Button>
              </Link>
              <Link to="/admin/analytics">
                <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center">
                  <BarChart3 className="h-5 w-5 mb-1" />
                  Analytics
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topProducts.slice(0, 5).map((product, index) => (
                <div key={product._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{product.title}</p>
                      <p className="text-xs text-gray-600">{product.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{product.soldCount} sold</p>
                    <p className="text-xs text-gray-600">{formatPrice(product.price.selling)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentOrders.slice(0, 5).map((order) => (
                <div key={order._id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">#{order.orderNumber}</p>
                    <p className="text-xs text-gray-600">{order.user.name}</p>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={
                        order.status === 'delivered' ? 'success' :
                        order.status === 'shipped' ? 'info' :
                        order.status === 'cancelled' ? 'destructive' :
                        'warning'
                      }
                    >
                      {order.status}
                    </Badge>
                    <p className="text-xs text-gray-600 mt-1">{formatPrice(order.pricing.total)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
