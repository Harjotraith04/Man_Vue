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
          country: userProfile.address?.country || 'UK'
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
      // Fallback to user data from auth store
      if (user) {
        setProfileForm({
          name: user.name || '',
          phone: user.phone || '',
          address: {
            street: user.address?.street || '',
            city: user.address?.city || '',
            state: user.address?.state || '',
            zipCode: user.address?.zipCode || '',
            country: user.address?.country || 'UK'
          }
        })
      }
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
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>

        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role === 'admin' ? 'Admin' : 'Customer'}
                  </Badge>
                  <Badge variant={user.isActive ? 'default' : 'destructive'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  Shopping Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Notifications */}
                <div>
                  <h4 className="font-medium mb-3">Notifications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="newsletter"
                        checked={preferences.newsletter}
                        onChange={(e) => setPreferences(prev => ({ ...prev, newsletter: e.target.checked }))}
                        className="rounded"
                      />
                      <label htmlFor="newsletter" className="text-sm">
                        Email newsletter and promotions
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="notifications"
                        checked={preferences.notifications}
                        onChange={(e) => setPreferences(prev => ({ ...prev, notifications: e.target.checked }))}
                        className="rounded"
                      />
                      <label htmlFor="notifications" className="text-sm">
                        Order updates and notifications
                      </label>
                    </div>
                  </div>
                </div>

                {/* Size Preferences */}
                <div>
                  <h4 className="font-medium mb-3">Size Preferences</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Shirt Size</label>
                      <select
                        value={preferences.sizePreferences.shirt}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          sizePreferences: { ...prev.sizePreferences, shirt: e.target.value }
                        }))}
                        className="w-full p-2 border rounded-md"
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
                    <div>
                      <label className="block text-sm font-medium mb-2">Pants Size</label>
                      <select
                        value={preferences.sizePreferences.pants}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          sizePreferences: { ...prev.sizePreferences, pants: e.target.value }
                        }))}
                        className="w-full p-2 border rounded-md"
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
                    <div>
                      <label className="block text-sm font-medium mb-2">Shoe Size</label>
                      <select
                        value={preferences.sizePreferences.shoes}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          sizePreferences: { ...prev.sizePreferences, shoes: e.target.value }
                        }))}
                        className="w-full p-2 border rounded-md"
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

                <Button onClick={handlePreferencesUpdate} disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Save Preferences'}
                </Button>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="mr-2 h-5 w-5" />
                    Recent Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">View your recent orders and their status</p>
                  <Button onClick={() => window.location.href = '/orders'}>
                    View All Orders
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="mr-2 h-5 w-5" />
                    Wishlist
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Manage your saved items</p>
                  <Button onClick={() => window.location.href = '/wishlist'}>
                    View Wishlist
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

