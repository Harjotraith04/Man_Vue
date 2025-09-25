import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings, 
  User, 
  Shield, 
  Bell,
  Mail,
  Database,
  Server,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import axios from 'axios'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'

interface SystemStats {
  totalUsers: number
  totalOrders: number
  totalProducts: number
  totalRevenue: number
  serverUptime: string
  databaseSize: string
  lastBackup: string
}

export default function AdminSettings() {
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  
  const [adminProfile, setAdminProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })

  const [systemSettings, setSystemSettings] = useState({
    siteName: 'ManVue',
    maintenanceMode: false,
    allowRegistration: true,
    emailNotifications: true,
    orderNotifications: true,
    maxProductsPerPage: 20,
    defaultShippingRate: 100,
    taxRate: 18
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    fetchSystemStats()
    fetchSystemSettings()
  }, [])

  const fetchSystemStats = async () => {
    try {
      const response = await axios.get('/admin/system/stats')
      setSystemStats(response.data.data)
    } catch (error) {
      console.error('Failed to fetch system stats:', error)
    }
  }

  const fetchSystemSettings = async () => {
    try {
      const response = await axios.get('/admin/system/settings')
      setSystemSettings(response.data.data)
    } catch (error) {
      console.error('Failed to fetch system settings:', error)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await axios.put('/auth/profile', adminProfile)
      toast.success('Profile updated successfully')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update profile'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    setIsLoading(true)
    
    try {
      await axios.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      toast.success('Password changed successfully')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to change password'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSystemSettingsUpdate = async () => {
    setIsLoading(true)
    
    try {
      await axios.put('/admin/system/settings', systemSettings)
      toast.success('System settings updated successfully')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update system settings'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackupDatabase = async () => {
    setIsLoading(true)
    
    try {
      const response = await axios.post('/admin/system/backup')
      toast.success('Database backup initiated successfully')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to initiate backup'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearCache = async () => {
    setIsLoading(true)
    
    try {
      await axios.post('/admin/system/clear-cache')
      toast.success('Cache cleared successfully')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to clear cache'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
        <p className="text-gray-600 mt-2">Manage system settings and administrator account</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">My Profile</TabsTrigger>
          <TabsTrigger value="system">System Settings</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Administrator Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <User className="h-8 w-8 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{user?.name}</h3>
                  <p className="text-gray-600">{user?.email}</p>
                  <Badge variant="default">Administrator</Badge>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <Input
                      value={adminProfile.name}
                      onChange={(e) => setAdminProfile(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <Input
                      type="email"
                      value={adminProfile.email}
                      onChange={(e) => setAdminProfile(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email"
                      disabled
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <Input
                    value={adminProfile.phone}
                    onChange={(e) => setAdminProfile(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Site Name</label>
                  <Input
                    value={systemSettings.siteName}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, siteName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Max Products Per Page</label>
                  <Input
                    type="number"
                    value={systemSettings.maxProductsPerPage}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, maxProductsPerPage: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Default Shipping Rate (£)</label>
                  <Input
                    type="number"
                    value={systemSettings.defaultShippingRate}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, defaultShippingRate: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tax Rate (%)</label>
                  <Input
                    type="number"
                    value={systemSettings.taxRate}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, taxRate: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">System Preferences</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="maintenance"
                      checked={systemSettings.maintenanceMode}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="maintenance" className="text-sm">Maintenance Mode</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="registration"
                      checked={systemSettings.allowRegistration}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, allowRegistration: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="registration" className="text-sm">Allow New User Registration</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="emailNotifs"
                      checked={systemSettings.emailNotifications}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="emailNotifs" className="text-sm">Email Notifications</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="orderNotifs"
                      checked={systemSettings.orderNotifications}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, orderNotifications: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="orderNotifs" className="text-sm">Order Notifications</label>
                  </div>
                </div>
              </div>

              <Button onClick={handleSystemSettingsUpdate} disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Save Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Current Password</label>
                  <Input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">New Password</label>
                  <Input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                  <Input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Change Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          {systemStats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="mr-2 h-5 w-5" />
                  System Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{systemStats.totalUsers}</div>
                    <div className="text-sm text-gray-600">Total Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{systemStats.totalOrders}</div>
                    <div className="text-sm text-gray-600">Total Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{systemStats.totalProducts}</div>
                    <div className="text-sm text-gray-600">Total Products</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">£{systemStats.totalRevenue}</div>
                    <div className="text-sm text-gray-600">Total Revenue</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Server Uptime:</span>
                    <span>{systemStats.serverUptime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Database Size:</span>
                    <span>{systemStats.databaseSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Backup:</span>
                    <span>{formatDate(systemStats.lastBackup)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Server className="mr-2 h-5 w-5" />
                Maintenance Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Database Backup</h4>
                    <p className="text-sm text-gray-600">Create a backup of the database</p>
                  </div>
                  <Button onClick={handleBackupDatabase} disabled={isLoading}>
                    <Download className="h-4 w-4 mr-2" />
                    Backup Now
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Clear Cache</h4>
                    <p className="text-sm text-gray-600">Clear system cache to improve performance</p>
                  </div>
                  <Button onClick={handleClearCache} disabled={isLoading} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear Cache
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
