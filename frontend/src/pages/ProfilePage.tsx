import React, { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import axios from 'axios'
import toast from 'react-hot-toast'
import { User, Settings, Package, Heart, CreditCard } from 'lucide-react'

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'UK'
    }
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [preferences, setPreferences] = useState({
    newsletter: true,
    notifications: true,
    favoriteCategories: [],
    sizePreferences: {
      shirt: '',
      pants: '',
      shoes: ''
    }
  })

  useEffect(() => {
    if (user) {
      fetchUserProfile()
    }
  }, [user])

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/users/profile')
      const userProfile = response.data.data.user
      
      setProfileForm({
        name: userProfile.name || '',
        phone: userProfile.phone || '',
        address: {
          street: userProfile.address?.street || '',
          city: userProfile.address?.city || '',
          state: userProfile.address?.state || '',
          zipCode: userProfile.address?.zipCode || '',
          country: userProfile.address?.country || 'United Kingdom'
        }
      })

      setPreferences({
        newsletter: userProfile.preferences?.newsletter ?? true,
        notifications: userProfile.preferences?.notifications ?? true,
        favoriteCategories: userProfile.preferences?.favoriteCategories || [],
        sizePreferences: {
          shirt: userProfile.preferences?.sizePreferences?.shirt || '',
          pants: userProfile.preferences?.sizePreferences?.pants || '',
          shoes: userProfile.preferences?.sizePreferences?.shoes || ''
        }
      })
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      toast.error('Failed to load profile data')
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        address: profileForm.address
      })
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Profile update error:', error)
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

    setPasswordLoading(true)

    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword)
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      toast.success('Password changed successfully!')
    } catch (error) {
      console.error('Password change error:', error)
    } finally {
      setPasswordLoading(false)
    }
  }

  const handlePreferencesUpdate = async () => {
    setIsLoading(true)
    try {
      await axios.put('/users/preferences', preferences)
      toast.success('Preferences updated successfully!')
    } catch (error: any) {
      console.error('Preferences update error:', error)
      const message = error.response?.data?.message || 'Failed to update preferences'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Please Login</h1>
          <p className="text-gray-600 mb-8">You need to be logged in to view your profile.</p>
          <Button onClick={() => window.location.href = '/auth'}>
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>

        {/* Profile Header */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h2>
                <p className="text-gray-600 text-lg mb-3">{user.email}</p>
                <div className="flex items-center space-x-3">
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="px-3 py-1">
                    {user.role === 'admin' ? 'Admin' : 'Customer'}
                  </Badge>
                  <Badge variant={user.isActive ? 'default' : 'destructive'} className="px-3 py-1">
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {user.createdAt && (
                    <Badge variant="outline" className="px-3 py-1">
                      Member since {new Date(user.createdAt).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
                {user.lastLogin && (
                  <div className="mt-3 text-sm text-gray-500">
                    Last login: {new Date(user.lastLogin).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name</label>
                      <Input
                        value={profileForm.name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number</label>
                      <Input
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Street Address</label>
                    <Input
                      value={profileForm.address.street}
                      onChange={(e) => setProfileForm(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, street: e.target.value } 
                      }))}
                      placeholder="Enter your street address"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">City</label>
                      <Input
                        value={profileForm.address.city}
                        onChange={(e) => setProfileForm(prev => ({ 
                          ...prev, 
                          address: { ...prev.address, city: e.target.value } 
                        }))}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">State</label>
                      <Input
                        value={profileForm.address.state}
                        onChange={(e) => setProfileForm(prev => ({ 
                          ...prev, 
                          address: { ...prev.address, state: e.target.value } 
                        }))}
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">ZIP Code</label>
                      <Input
                        value={profileForm.address.zipCode}
                        onChange={(e) => setProfileForm(prev => ({ 
                          ...prev, 
                          address: { ...prev.address, zipCode: e.target.value } 
                        }))}
                        placeholder="ZIP"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Country</label>
                      <Input
                        value={profileForm.address.country}
                        onChange={(e) => setProfileForm(prev => ({ 
                          ...prev, 
                          address: { ...prev.address, country: e.target.value } 
                        }))}
                        placeholder="Country"
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Updating...' : 'Update Profile'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Settings className="mr-2 h-5 w-5" />
                  Shopping Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Favorite Categories */}
                <div>
                  <h4 className="font-semibold text-lg mb-4 text-white">Favorite Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {preferences.favoriteCategories.map((category, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1 bg-gray-700 text-gray-200">
                        {category}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-gray-300 mt-2">
                    These categories help us personalize your shopping experience
                  </p>
                </div>

                {/* Notifications */}
                <div>
                  <h4 className="font-semibold text-lg mb-4 text-white">Notifications</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
                      <div>
                        <label htmlFor="newsletter" className="font-medium text-white">
                          Email newsletter and promotions
                        </label>
                        <p className="text-sm text-gray-300">Get updates about new products and special offers</p>
                      </div>
                      <input
                        type="checkbox"
                        id="newsletter"
                        checked={preferences.newsletter}
                        onChange={(e) => setPreferences(prev => ({ ...prev, newsletter: e.target.checked }))}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 bg-gray-700 border-gray-600"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
                      <div>
                        <label htmlFor="notifications" className="font-medium text-white">
                          Order updates and notifications
                        </label>
                        <p className="text-sm text-gray-300">Receive real-time updates about your orders</p>
                      </div>
                      <input
                        type="checkbox"
                        id="notifications"
                        checked={preferences.notifications}
                        onChange={(e) => setPreferences(prev => ({ ...prev, notifications: e.target.checked }))}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 bg-gray-700 border-gray-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Size Preferences */}
                <div>
                  <h4 className="font-semibold text-lg mb-4 text-white">Size Preferences</h4>
                  <p className="text-sm text-gray-300 mb-4">Set your preferred sizes for faster checkout</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 border border-gray-700 rounded-lg bg-gray-800">
                      <label className="block text-sm font-medium mb-3 text-white">Shirt Size</label>
                      <select
                        value={preferences.sizePreferences.shirt}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          sizePreferences: { ...prev.sizePreferences, shirt: e.target.value }
                        }))}
                        className="w-full p-3 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                      >
                        <option value="">Select Size</option>
                        <option value="XS">XS</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                      </select>
                    </div>
                    <div className="p-4 border border-gray-700 rounded-lg bg-gray-800">
                      <label className="block text-sm font-medium mb-3 text-white">Pants Size</label>
                      <select
                        value={preferences.sizePreferences.pants}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          sizePreferences: { ...prev.sizePreferences, pants: e.target.value }
                        }))}
                        className="w-full p-3 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                      >
                        <option value="">Select Size</option>
                        <option value="28">28</option>
                        <option value="30">30</option>
                        <option value="32">32</option>
                        <option value="34">34</option>
                        <option value="36">36</option>
                        <option value="38">38</option>
                        <option value="40">40</option>
                      </select>
                    </div>
                    <div className="p-4 border border-gray-700 rounded-lg bg-gray-800">
                      <label className="block text-sm font-medium mb-3 text-white">Shoe Size</label>
                      <select
                        value={preferences.sizePreferences.shoes}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          sizePreferences: { ...prev.sizePreferences, shoes: e.target.value }
                        }))}
                        className="w-full p-3 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                      >
                        <option value="">Select Size</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                        <option value="11">11</option>
                        <option value="12">12</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <Button onClick={handlePreferencesUpdate} disabled={isLoading} size="lg" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white">
                    {isLoading ? 'Updating...' : 'Save Preferences'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
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
                  <Button type="submit" disabled={passwordLoading}>
                    {passwordLoading ? 'Updating...' : 'Change Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <div className="text-center py-12">
              <Package className="h-24 w-24 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Overview</h2>
              <p className="text-gray-600 mb-8 text-lg">
                View your recent orders and manage your account from the dedicated sections.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => window.location.href = '/orders'} size="lg">
                  <Package className="h-4 w-4 mr-2" />
                  View Orders
                </Button>
                <Button onClick={() => window.location.href = '/wishlist'} variant="outline" size="lg">
                  <Heart className="h-4 w-4 mr-2" />
                  View Wishlist
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

