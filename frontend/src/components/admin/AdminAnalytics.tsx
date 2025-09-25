import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Package,
  Download,
  Calendar
} from 'lucide-react'
import axios from 'axios'
import { formatPrice, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface AnalyticsData {
  analytics: Array<{
    _id: string
    revenue?: number
    orders?: number
    averageOrderValue?: number
    newProducts?: number
    totalViews?: number
    totalSales?: number
    newUsers?: number
    activeUsers?: number
  }>
  metric: string
  dateRange: {
    startDate: string
    endDate: string
  }
  growth?: {
    revenue: number
    orders: number
    users: number
    products: number
  }
}

export default function AdminAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [selectedMetric, setSelectedMetric] = useState('revenue')
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [selectedMetric, dateRange])

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        metric: selectedMetric,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      })

      // Get current period data
      const currentResponse = await axios.get(`/admin/analytics?${params}`)
      
      // Calculate previous period for comparison
      const startDateObj = new Date(dateRange.startDate)
      const endDateObj = new Date(dateRange.endDate)
      const periodLength = endDateObj.getTime() - startDateObj.getTime()
      
      const previousEndDate = new Date(startDateObj.getTime())
      const previousStartDate = new Date(startDateObj.getTime() - periodLength)
      
      const previousParams = new URLSearchParams({
        metric: selectedMetric,
        startDate: previousStartDate.toISOString().split('T')[0],
        endDate: previousEndDate.toISOString().split('T')[0]
      })

      // Get previous period data for growth calculation
      let previousResponse = null
      try {
        previousResponse = await axios.get(`/admin/analytics?${previousParams}`)
      } catch (prevError) {
        console.log('Previous period data not available')
      }

      const currentData = currentResponse.data.data
      
      console.log('Analytics response:', {
        metric: selectedMetric,
        data: currentData,
        analyticsLength: currentData.analytics?.length,
        sampleAnalytics: currentData.analytics?.slice(0, 3)
      });
      
      // Ensure analytics array exists and is properly formatted
      if (!currentData.analytics || !Array.isArray(currentData.analytics)) {
        currentData.analytics = []
      }

      // Calculate growth if previous data is available
      if (previousResponse) {
        const previousData = previousResponse.data.data
        
        const calculateGrowthFromArrays = (current: any[], previous: any[], field: string) => {
          const currentSum = current.reduce((sum, item) => sum + (item[field] || 0), 0)
          const previousSum = previous.reduce((sum, item) => sum + (item[field] || 0), 0)
          
          if (previousSum === 0) return currentSum > 0 ? 100 : 0
          return ((currentSum - previousSum) / previousSum) * 100
        }

        currentData.growth = {
          revenue: calculateGrowthFromArrays(currentData.analytics, previousData.analytics || [], 'revenue'),
          orders: calculateGrowthFromArrays(currentData.analytics, previousData.analytics || [], 'orders'),
          users: calculateGrowthFromArrays(currentData.analytics, previousData.analytics || [], 'newUsers'),
          products: calculateGrowthFromArrays(currentData.analytics, previousData.analytics || [], 'newProducts')
        }
      } else {
        // Set default growth values if no previous data
        currentData.growth = {
          revenue: 0,
          orders: 0,
          users: 0,
          products: 0
        }
      }

      setAnalyticsData(currentData)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      toast.error('Failed to load analytics')
      // Set empty data structure on error
      setAnalyticsData({
        analytics: [],
        metric: selectedMetric,
        dateRange: { startDate: dateRange.startDate, endDate: dateRange.endDate },
        growth: { revenue: 0, orders: 0, users: 0, products: 0 }
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateRangeChange = (field: string, value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }))
  }

  const handleExportData = () => {
    // In a real app, this would trigger a CSV/Excel export
    toast.success('Analytics data exported successfully')
  }

  const metrics = [
    { key: 'revenue', label: 'Revenue', icon: DollarSign },
    { key: 'orders', label: 'Orders', icon: BarChart3 },
    { key: 'products', label: 'Products', icon: Package },
    { key: 'users', label: 'Users', icon: Users }
  ]

  // Calculate summary statistics
  const summaryStats = analyticsData?.analytics.reduce((acc, item) => {
    return {
      totalRevenue: acc.totalRevenue + (item.revenue || 0),
      totalOrders: acc.totalOrders + (item.orders || 0),
      totalUsers: acc.totalUsers + (item.newUsers || 0),
      totalProducts: acc.totalProducts + (item.newProducts || 0)
    }
  }, { totalRevenue: 0, totalOrders: 0, totalUsers: 0, totalProducts: 0 })

  // Simple chart component (in a real app, you'd use a proper charting library like Chart.js or Recharts)
  const SimpleChart = ({ data }: { data: any[] }) => {
    if (!data || data.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-gray-400">
          No data available
        </div>
      )
    }

    const maxValue = Math.max(...data.map(item => 
      item.revenue || item.orders || item.newUsers || item.newProducts || 0
    ))

    if (maxValue === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-gray-400">
          No data points with values
        </div>
      )
    }

    return (
      <div className="h-64 flex items-end justify-between space-x-1 p-4">
        {data.slice(-30).map((item, index) => {
          const value = item.revenue || item.orders || item.newUsers || item.newProducts || 0
          const height = Math.max((value / maxValue) * 200, 4) // Minimum height of 4px
          
          // Safely handle the _id field - it might be a string, number, or object
          const itemId = item._id
          let displayId = 'N/A'
          
          if (typeof itemId === 'string') {
            // Handle date strings like "2025-01-26"
            if (itemId.includes('-')) {
              const parts = itemId.split('-')
              if (parts.length >= 3) {
                displayId = `${parts[2]}/${parts[1]}` // DD/MM format
              } else {
                displayId = itemId
              }
            } else {
              displayId = itemId
            }
          } else if (typeof itemId === 'number') {
            displayId = itemId.toString()
          } else if (itemId && typeof itemId === 'object' && itemId.date) {
            // Handle MongoDB aggregation _id objects with date field
            displayId = itemId.date.split('-').slice(1).join('/')
          }
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center group">
              <div 
                className="bg-gradient-to-t from-blue-600 to-blue-500 rounded-t w-full min-h-[4px] transition-all duration-300 hover:from-blue-500 hover:to-blue-400"
                style={{ height: `${height}px` }}
                title={`${displayId}: ${selectedMetric === 'revenue' ? formatPrice(value) : value}`}
              />
              <span className="text-xs text-gray-400 mt-1 rotate-45 origin-left group-hover:text-white transition-colors">
                {displayId}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-gray-300">Track your business performance and growth</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleExportData} className="border-gray-600 text-gray-300 hover:bg-gray-700">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card className="mb-6 bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                className="w-auto bg-gray-700 border-gray-600 text-white"
              />
              <span className="text-gray-400">to</span>
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                className="w-auto bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <div className="flex space-x-2">
              {metrics.map(metric => (
                <Button
                  key={metric.key}
                  variant={selectedMetric === metric.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedMetric(metric.key)}
                  className={selectedMetric === metric.key 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  }
                >
                  <metric.icon className="h-4 w-4 mr-2" />
                  {metric.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Total Revenue</p>
                <p className="text-2xl font-bold text-white">
                  {formatPrice(summaryStats?.totalRevenue || 0)}
                </p>
                <p className={`text-sm ${analyticsData?.growth && analyticsData.growth.revenue >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  {analyticsData?.growth ? `${analyticsData.growth.revenue >= 0 ? '+' : ''}${analyticsData.growth.revenue.toFixed(1)}%` : 'N/A'}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Total Orders</p>
                <p className="text-2xl font-bold text-white">
                  {summaryStats?.totalOrders || 0}
                </p>
                <p className={`text-sm ${analyticsData?.growth && analyticsData.growth.orders >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  {analyticsData?.growth ? `${analyticsData.growth.orders >= 0 ? '+' : ''}${analyticsData.growth.orders.toFixed(1)}%` : 'N/A'}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">New Users</p>
                <p className="text-2xl font-bold text-white">
                  {summaryStats?.totalUsers || 0}
                </p>
                <p className={`text-sm ${analyticsData?.growth && analyticsData.growth.users >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  {analyticsData?.growth ? `${analyticsData.growth.users >= 0 ? '+' : ''}${analyticsData.growth.users.toFixed(1)}%` : 'N/A'}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">New Products</p>
                <p className="text-2xl font-bold text-white">
                  {summaryStats?.totalProducts || 0}
                </p>
                <p className={`text-sm ${analyticsData?.growth && analyticsData.growth.products >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  {analyticsData?.growth ? `${analyticsData.growth.products >= 0 ? '+' : ''}${analyticsData.growth.products.toFixed(1)}%` : 'N/A'}
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-600 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card className="mb-6 bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <BarChart3 className="h-5 w-5 mr-2" />
            {metrics.find(m => m.key === selectedMetric)?.label} Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="spinner mb-4"></div>
            </div>
          ) : analyticsData?.analytics ? (
            <SimpleChart data={analyticsData.analytics} />
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No data available for the selected period
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Periods */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Top Performing Periods</CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData?.analytics.slice(0, 5).map((item, index) => {
              const value = item.revenue || item.orders || item.newUsers || item.newProducts || 0
              const itemId = item._id
              const displayDate = typeof itemId === 'string' 
                ? formatDate(itemId)
                : typeof itemId === 'number'
                ? new Date(itemId).toLocaleDateString()
                : 'N/A'
              
              return (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
                  <div>
                    <p className="font-medium text-white">{displayDate}</p>
                    <p className="text-sm text-gray-400">
                      {selectedMetric === 'revenue' && 'Revenue'}
                      {selectedMetric === 'orders' && 'Orders'}
                      {selectedMetric === 'users' && 'New Users'}
                      {selectedMetric === 'products' && 'New Products'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">
                      {selectedMetric === 'revenue' ? formatPrice(value) : value.toString()}
                    </p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Growth Metrics */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Growth Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-300">Revenue Growth</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${analyticsData?.growth && analyticsData.growth.revenue >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(Math.abs(analyticsData?.growth?.revenue || 0), 100)}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm ${analyticsData?.growth && analyticsData.growth.revenue >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {analyticsData?.growth ? `${analyticsData.growth.revenue >= 0 ? '+' : ''}${analyticsData.growth.revenue.toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-300">Order Growth</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${analyticsData?.growth && analyticsData.growth.orders >= 0 ? 'bg-blue-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(Math.abs(analyticsData?.growth?.orders || 0), 100)}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm ${analyticsData?.growth && analyticsData.growth.orders >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                    {analyticsData?.growth ? `${analyticsData.growth.orders >= 0 ? '+' : ''}${analyticsData.growth.orders.toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-300">User Growth</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${analyticsData?.growth && analyticsData.growth.users >= 0 ? 'bg-purple-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(Math.abs(analyticsData?.growth?.users || 0), 100)}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm ${analyticsData?.growth && analyticsData.growth.users >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
                    {analyticsData?.growth ? `${analyticsData.growth.users >= 0 ? '+' : ''}${analyticsData.growth.users.toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-300">Product Growth</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${analyticsData?.growth && analyticsData.growth.products >= 0 ? 'bg-orange-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(Math.abs(analyticsData?.growth?.products || 0), 100)}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm ${analyticsData?.growth && analyticsData.growth.products >= 0 ? 'text-orange-400' : 'text-red-400'}`}>
                    {analyticsData?.growth ? `${analyticsData.growth.products >= 0 ? '+' : ''}${analyticsData.growth.products.toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="mt-6 bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Detailed Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-2 text-gray-300">Date</th>
                  {selectedMetric === 'revenue' && (
                    <>
                      <th className="text-right p-2 text-gray-300">Revenue</th>
                      <th className="text-right p-2 text-gray-300">Orders</th>
                      <th className="text-right p-2 text-gray-300">AOV</th>
                    </>
                  )}
                  {selectedMetric === 'orders' && (
                    <>
                      <th className="text-right p-2 text-gray-300">Orders</th>
                      <th className="text-right p-2 text-gray-300">Revenue</th>
                    </>
                  )}
                  {selectedMetric === 'users' && (
                    <>
                      <th className="text-right p-2 text-gray-300">New Users</th>
                      <th className="text-right p-2 text-gray-300">Active Users</th>
                    </>
                  )}
                  {selectedMetric === 'products' && (
                    <>
                      <th className="text-right p-2 text-gray-300">New Products</th>
                      <th className="text-right p-2 text-gray-300">Total Views</th>
                      <th className="text-right p-2 text-gray-300">Total Sales</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {analyticsData?.analytics.slice(0, 10).map((item, index) => {
                  const itemId = item._id
                  const displayDate = typeof itemId === 'string' 
                    ? formatDate(itemId)
                    : typeof itemId === 'number'
                    ? new Date(itemId).toLocaleDateString()
                    : 'N/A'
                  
                  return (
                    <tr key={index} className="border-b border-gray-700 hover:bg-gray-700">
                      <td className="p-2 text-white">{displayDate}</td>
                    {selectedMetric === 'revenue' && (
                      <>
                        <td className="text-right p-2 text-white">{formatPrice(item.revenue || 0)}</td>
                        <td className="text-right p-2 text-white">{item.orders || 0}</td>
                        <td className="text-right p-2 text-white">{formatPrice(item.averageOrderValue || 0)}</td>
                      </>
                    )}
                    {selectedMetric === 'orders' && (
                      <>
                        <td className="text-right p-2 text-white">{item.orders || 0}</td>
                        <td className="text-right p-2 text-white">{formatPrice(item.revenue || 0)}</td>
                      </>
                    )}
                    {selectedMetric === 'users' && (
                      <>
                        <td className="text-right p-2 text-white">{item.newUsers || 0}</td>
                        <td className="text-right p-2 text-white">{item.activeUsers || 0}</td>
                      </>
                    )}
                    {selectedMetric === 'products' && (
                      <>
                        <td className="text-right p-2 text-white">{item.newProducts || 0}</td>
                        <td className="text-right p-2 text-white">{item.totalViews || 0}</td>
                        <td className="text-right p-2 text-white">{item.totalSales || 0}</td>
                      </>
                    )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
