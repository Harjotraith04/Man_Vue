import React, { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Shield, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminAuthPage() {
  const { isAuthenticated, login, isLoading, user } = useAuthStore()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/admin'

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Redirect if already authenticated as admin
  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to={from} replace />
  }

  // Redirect to regular auth if authenticated as customer
  if (isAuthenticated && user?.role === 'user') {
    return <Navigate to="/auth" replace />
  }

  const validateLoginForm = () => {
    const newErrors: Record<string, string> = {}

    if (!loginForm.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(loginForm.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!loginForm.password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateLoginForm()) return

    try {
      await login(loginForm.email, loginForm.password)
      
      // Check if user has admin role after login
      const currentUser = useAuthStore.getState().user
      if (currentUser?.role !== 'admin') {
        toast.error('Access denied. Admin credentials required.')
        useAuthStore.getState().logout()
        return
      }
    } catch (error) {
      // Error is handled by the store
    }
  }

  const updateLoginForm = (field: string, value: string) => {
    setLoginForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleAutoFillCredentials = () => {
    setLoginForm({
      email: 'admin@manvue.com',
      password: 'admin123'
    })
    // Clear any existing errors
    setErrors({})
    toast.success('Admin credentials filled in')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access the administration panel
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center space-x-2">
              <Lock className="h-5 w-5 text-blue-600" />
              <span>Administrator Access</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <Input
                  id="admin-email"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => updateLoginForm('email', e.target.value)}
                  placeholder="Enter your admin email"
                  className={`mt-1 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-blue-500'}`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  id="admin-password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => updateLoginForm('password', e.target.value)}
                  placeholder="Enter your admin password"
                  className={`mt-1 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-blue-500'}`}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-amber-700">
                      This area is restricted to authorized administrators only. 
                      Unauthorized access attempts are logged and monitored.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-dashed border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                onClick={handleAutoFillCredentials}
                disabled={isLoading}
              >
                🔑 Fill Test Admin Credentials
              </Button>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-md transition-all duration-200 shadow-lg hover:shadow-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Authenticating...
                  </div>
                ) : (
                  'Access Admin Panel'
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-center text-xs text-gray-500">
                Need customer access?{' '}
                <a href="/auth" className="font-medium text-blue-600 hover:text-blue-500">
                  Go to Customer Login
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Protected by enterprise-grade security. All access is logged and monitored.
          </p>
        </div>
      </div>
    </div>
  )
}
