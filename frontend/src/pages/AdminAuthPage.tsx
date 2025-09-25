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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="particle absolute top-1/4 left-1/4 w-2 h-2"></div>
        <div className="particle absolute top-3/4 left-3/4 w-1 h-1"></div>
        <div className="particle absolute top-1/2 left-1/6 w-1.5 h-1.5"></div>
        <div className="particle absolute top-1/6 left-2/3 w-1 h-1"></div>
        <div className="particle absolute top-2/3 left-1/3 w-2 h-2"></div>
      </div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Navigation Button */}
        <div className="flex justify-end">
          <a 
            href="/auth" 
            className="inline-flex items-center px-4 py-2 bg-gray-800 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 hover:border-gray-500 transition-all duration-300 text-sm font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Customer Login
          </a>
        </div>

        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-2xl animate-pulse-glow">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-white">
            Admin Portal
          </h2>
          <p className="mt-2 text-center text-lg text-gray-300">
            Sign in to access the administration panel
          </p>
        </div>

        <Card className="gradient-dark-card shadow-2xl border-gray-700">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center space-x-2 text-white">
              <Lock className="h-5 w-5 text-blue-400" />
              <span>Administrator Access</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="admin-email" className="block text-sm font-medium text-gray-200 mb-2">
                  Email address
                </label>
                <Input
                  id="admin-email"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => updateLoginForm('email', e.target.value)}
                  placeholder="Enter your admin email"
                  className={`bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="admin-password" className="block text-sm font-medium text-gray-200 mb-2">
                  Password
                </label>
                <Input
                  id="admin-password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => updateLoginForm('password', e.target.value)}
                  placeholder="Enter your admin password"
                  className={`bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 ${errors.password ? 'border-red-500' : ''}`}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                )}
              </div>

              <div className="bg-amber-900/20 border border-amber-600/30 rounded-md p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-amber-300">
                      This area is restricted to authorized administrators only. 
                      Unauthorized access attempts are logged and monitored.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-dashed border-gray-600 text-gray-300 hover:border-blue-400 hover:text-blue-300 hover:bg-gray-700 transition-all duration-200 bg-gray-800"
                onClick={handleAutoFillCredentials}
                disabled={isLoading}
              >
                🔑 Fill Test Admin Credentials
              </Button>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
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

            <div className="mt-6 pt-4 border-t border-gray-700">
              <p className="text-center text-xs text-gray-400">
                Need customer access?{' '}
                <a href="/auth" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
                  Go to Customer Login
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-400">
            Protected by enterprise-grade security. All access is logged and monitored.
          </p>
        </div>
      </div>
    </div>
  )
}
