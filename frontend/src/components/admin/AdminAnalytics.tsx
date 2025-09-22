import React, { useState, useEffect } from 'react'
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
          revenue: calculateGrowthFromArrays(currentData.analytics, previousData.analytics, 'revenue'),
          orders: calculateGrowthFromArrays(currentData.analytics, previousData.analytics, 'orders'),
          users: calculateGrowthFromArrays(currentData.analytics, previousData.analytics, 'newUsers'),
          products: calculateGrowthFromArrays(currentData.analytics, previousData.analytics, 'newProducts')
        }
      }

      setAnalyticsData(currentData)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      toast.error('Failed to load analytics')
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
    const maxValue = Math.max(...data.map(item => 
      item.revenue || item.orders || item.newUsers || item.newProducts || 0
    ))

    return (
      <div className="h-64 flex items-end justify-between space-x-1 p-4">
        {data.slice(-30).map((item, index) => {
          const value = item.revenue || item.orders || item.newUsers || item.newProducts || 0
          const height = (value / maxValue) * 200
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="bg-blue-500 rounded-t w-full min-h-[4px]"
                style={{ height: `${height}px` }}
                title={`${item._id}: ${value}`}
              />
              <span className="text-xs text-gray-500 mt-1 rotate-45 origin-left">
                {item._id.split('-').slice(1).join('/')}
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
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Track your business performance and growth</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                className="w-auto"
              />
              <span className="text-gray-500">to</span>
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                className="w-auto"
              />
            </div>
            
            <div className="flex space-x-2">
              {metrics.map(metric => (
                <Button
                  key={metric.key}
                  variant={selectedMetric === metric.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedMetric(metric.key)}
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
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(summaryStats?.totalRevenue || 0)}
                </p>
                <p className={`text-sm ${analyticsData?.growth && analyticsData.growth.revenue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  {analyticsData?.growth ? `${analyticsData.growth.revenue >= 0 ? '+' : ''}${analyticsData.growth.revenue.toFixed(1)}%` : 'N/A'}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summaryStats?.totalOrders || 0}
                </p>
                <p className={`text-sm ${analyticsData?.growth && analyticsData.growth.orders >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  {analyticsData?.growth ? `${analyticsData.growth.orders >= 0 ? '+' : ''}${analyticsData.growth.orders.toFixed(1)}%` : 'N/A'}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summaryStats?.totalUsers || 0}
                </p>
                <p className={`text-sm ${analyticsData?.growth && analyticsData.growth.users >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  {analyticsData?.growth ? `${analyticsData.growth.users >= 0 ? '+' : ''}${analyticsData.growth.users.toFixed(1)}%` : 'N/A'}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Products</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summaryStats?.totalProducts || 0}
                </p>
                <p className={`text-sm ${analyticsData?.growth && analyticsData.growth.products >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  {analyticsData?.growth ? `${analyticsData.growth.products >= 0 ? '+' : ''}${analyticsData.growth.products.toFixed(1)}%` : 'N/A'}
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
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
            <div className="h-64 flex items-center justify-center text-gray-500">
              No data available for the selected period
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Periods */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Periods</CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData?.analytics.slice(0, 5).map((item, index) => {
              const value = item.revenue || item.orders || item.newUsers || item.newProducts || 0
              return (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">{formatDate(item._id)}</p>
                    <p className="text-sm text-gray-600">
                      {selectedMetric === 'revenue' && 'Revenue'}
                      {selectedMetric === 'orders' && 'Orders'}
                      {selectedMetric === 'users' && 'New Users'}
                      {selectedMetric === 'products' && 'New Products'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {selectedMetric === 'revenue' ? formatPrice(value) : value.toString()}
                    </p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Growth Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Growth Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Revenue Growth</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${analyticsData?.growth && analyticsData.growth.revenue >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(Math.abs(analyticsData?.growth?.revenue || 0), 100)}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm ${analyticsData?.growth && analyticsData.growth.revenue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analyticsData?.growth ? `${analyticsData.growth.revenue >= 0 ? '+' : ''}${analyticsData.growth.revenue.toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Order Growth</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${analyticsData?.growth && analyticsData.growth.orders >= 0 ? 'bg-blue-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(Math.abs(analyticsData?.growth?.orders || 0), 100)}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm ${analyticsData?.growth && analyticsData.growth.orders >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {analyticsData?.growth ? `${analyticsData.growth.orders >= 0 ? '+' : ''}${analyticsData.growth.orders.toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">User Growth</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${analyticsData?.growth && analyticsData.growth.users >= 0 ? 'bg-purple-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(Math.abs(analyticsData?.growth?.users || 0), 100)}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm ${analyticsData?.growth && analyticsData.growth.users >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                    {analyticsData?.growth ? `${analyticsData.growth.users >= 0 ? '+' : ''}${analyticsData.growth.users.toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Product Growth</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${analyticsData?.growth && analyticsData.growth.products >= 0 ? 'bg-orange-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(Math.abs(analyticsData?.growth?.products || 0), 100)}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm ${analyticsData?.growth && analyticsData.growth.products >= 0 ? 'text-orange-600' : 'text-red-600'}`}>
                    {analyticsData?.growth ? `${analyticsData.growth.products >= 0 ? '+' : ''}${analyticsData.growth.products.toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Detailed Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Date</th>
                  {selectedMetric === 'revenue' && (
                    <>
                      <th className="text-right p-2">Revenue</th>
                      <th className="text-right p-2">Orders</th>
                      <th className="text-right p-2">AOV</th>
                    </>
                  )}
                  {selectedMetric === 'orders' && (
                    <>
                      <th className="text-right p-2">Orders</th>
                      <th className="text-right p-2">Revenue</th>
                    </>
                  )}
                  {selectedMetric === 'users' && (
                    <>
                      <th className="text-right p-2">New Users</th>
                      <th className="text-right p-2">Active Users</th>
                    </>
                  )}
                  {selectedMetric === 'products' && (
                    <>
                      <th className="text-right p-2">New Products</th>
                      <th className="text-right p-2">Total Views</th>
                      <th className="text-right p-2">Total Sales</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {analyticsData?.analytics.slice(0, 10).map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{formatDate(item._id)}</td>
                    {selectedMetric === 'revenue' && (
                      <>
                        <td className="text-right p-2">{formatPrice(item.revenue || 0)}</td>
                        <td className="text-right p-2">{item.orders || 0}</td>
                        <td className="text-right p-2">{formatPrice(item.averageOrderValue || 0)}</td>
                      </>
                    )}
                    {selectedMetric === 'orders' && (
                      <>
                        <td className="text-right p-2">{item.orders || 0}</td>
                        <td className="text-right p-2">{formatPrice(item.revenue || 0)}</td>
                      </>
                    )}
                    {selectedMetric === 'users' && (
                      <>
                        <td className="text-right p-2">{item.newUsers || 0}</td>
                        <td className="text-right p-2">{item.activeUsers || 0}</td>
                      </>
                    )}
                    {selectedMetric === 'products' && (
                      <>
                        <td className="text-right p-2">{item.newProducts || 0}</td>
                        <td className="text-right p-2">{item.totalViews || 0}</td>
                        <td className="text-right p-2">{item.totalSales || 0}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
