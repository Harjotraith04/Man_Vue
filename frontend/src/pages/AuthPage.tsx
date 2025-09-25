import React, { useState, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import toast from 'react-hot-toast'

export default function AuthPage() {
  const { isAuthenticated, login, register, isLoading } = useAuthStore()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [authMode, setAuthMode] = useState<'customer' | 'admin'>('customer')
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={from} replace />
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

  const validateRegisterForm = () => {
    const newErrors: Record<string, string> = {}

    if (!registerForm.name) {
      newErrors.name = 'Name is required'
    } else if (registerForm.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!registerForm.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(registerForm.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!registerForm.password) {
      newErrors.password = 'Password is required'
    } else if (registerForm.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(registerForm.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }

    if (!registerForm.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (registerForm.password !== registerForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateLoginForm()) return

    try {
      await login(loginForm.email, loginForm.password)
    } catch (error) {
      // Error is handled by the store
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateRegisterForm()) return

    try {
      await register(registerForm.name, registerForm.email, registerForm.password)
    } catch (error) {
      // Error is handled by the store
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/auth/google`
  }

  const updateLoginForm = (field: string, value: string) => {
    setLoginForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const updateRegisterForm = (field: string, value: string) => {
    setRegisterForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="particle absolute top-1/4 left-1/4 w-2 h-2"></div>
        <div className="particle absolute top-3/4 left-3/4 w-1 h-1"></div>
        <div className="particle absolute top-1/2 left-1/6 w-1.5 h-1.5"></div>
        <div className="particle absolute top-1/6 left-2/3 w-1 h-1"></div>
        <div className="particle absolute top-2/3 left-1/3 w-2 h-2"></div>
      </div>
      
      <div className="max-w-md w-full space-y-4 relative z-10">
        {/* Auth Mode Toggle */}
        <div className="flex justify-center">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-1 flex">
            <button
              onClick={() => setAuthMode('customer')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 flex items-center ${
                authMode === 'customer'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Customer
            </button>
            <button
              onClick={() => setAuthMode('admin')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 flex items-center ${
                authMode === 'admin'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Admin
            </button>
          </div>
        </div>

        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-2xl animate-pulse-glow">
            {authMode === 'customer' ? (
              <span className="text-white font-bold text-xl">M</span>
            ) : (
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            )}
          </div>
          <h2 className="mt-3 text-center text-2xl font-extrabold text-white">
            {authMode === 'customer' ? 'Welcome to Manvue' : 'Admin Portal'}
          </h2>
          <p className="mt-1 text-center text-sm text-gray-300">
            {authMode === 'customer' 
              ? 'Your premium men\'s fashion destination'
              : 'Sign in to access the administration panel'
            }
          </p>
        </div>

        <Card className="gradient-dark-card shadow-2xl border-gray-700">
          <CardContent className="p-4">
            {authMode === 'admin' && (
              <div className="text-center mb-3">
                <h3 className="text-lg font-semibold text-white flex items-center justify-center space-x-2">
                  <svg className="h-4 w-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Administrator Access</span>
                </h3>
              </div>
            )}
            
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800 border border-gray-700">
                <TabsTrigger value="login" className="text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-sm">Sign In</TabsTrigger>
                {authMode === 'customer' && (
                  <TabsTrigger value="register" className="text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-sm">Sign Up</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="login" className="space-y-3">
                <form onSubmit={handleLogin} className="space-y-3">
                  <div>
                    <label htmlFor="login-email" className="block text-sm font-medium text-gray-200 mb-1">
                      Email address
                    </label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => updateLoginForm('email', e.target.value)}
                      placeholder="Enter your email"
                      className={`bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 h-9 ${errors.email ? 'border-red-500' : ''}`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-400">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="login-password" className="block text-sm font-medium text-gray-200 mb-1">
                      Password
                    </label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => updateLoginForm('password', e.target.value)}
                      placeholder="Enter your password"
                      className={`bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 h-9 ${errors.password ? 'border-red-500' : ''}`}
                    />
                    {errors.password && (
                      <p className="mt-1 text-xs text-red-400">{errors.password}</p>
                    )}
                  </div>

                  {authMode === 'admin' && (
                    <div className="bg-amber-900/20 border border-amber-600/30 rounded-md p-2">
                      <div className="flex">
                        <div className="ml-2">
                          <p className="text-xs text-amber-300">
                            This area is restricted to authorized administrators only. 
                            Unauthorized access attempts are logged and monitored.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 text-sm"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : authMode === 'admin' ? 'Access Admin Panel' : 'Sign in'}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
                  </div>
                </div>

                {authMode === 'admin' ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-dashed border-gray-600 text-gray-300 hover:border-blue-400 hover:text-blue-300 hover:bg-gray-700 transition-all duration-200 bg-gray-800 py-2 text-sm"
                    onClick={() => {
                      setLoginForm({
                        email: 'admin@manvue.com',
                        password: 'admin123'
                      })
                      setErrors({})
                      toast.success('Admin credentials filled in')
                    }}
                    disabled={isLoading}
                  >
                    🔑 Fill Test Admin Credentials
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:border-gray-500 font-semibold py-2 rounded-lg transition-all duration-300 text-sm"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </Button>
                )}
              </TabsContent>

              {authMode === 'customer' && (
                <TabsContent value="register" className="space-y-3">
                <form onSubmit={handleRegister} className="space-y-3">
                  <div>
                    <label htmlFor="register-name" className="block text-sm font-medium text-gray-200 mb-1">
                      Full name
                    </label>
                    <Input
                      id="register-name"
                      type="text"
                      value={registerForm.name}
                      onChange={(e) => updateRegisterForm('name', e.target.value)}
                      placeholder="Enter your full name"
                      className={`bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 h-9 ${errors.name ? 'border-red-500' : ''}`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-400">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="register-email" className="block text-sm font-medium text-gray-200 mb-1">
                      Email address
                    </label>
                    <Input
                      id="register-email"
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => updateRegisterForm('email', e.target.value)}
                      placeholder="Enter your email"
                      className={`bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 h-9 ${errors.email ? 'border-red-500' : ''}`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-400">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="register-password" className="block text-sm font-medium text-gray-200 mb-1">
                      Password
                    </label>
                    <Input
                      id="register-password"
                      type="password"
                      value={registerForm.password}
                      onChange={(e) => updateRegisterForm('password', e.target.value)}
                      placeholder="Create a password"
                      className={`bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 h-9 ${errors.password ? 'border-red-500' : ''}`}
                    />
                    {errors.password && (
                      <p className="mt-1 text-xs text-red-400">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="register-confirm-password" className="block text-sm font-medium text-gray-200 mb-1">
                      Confirm password
                    </label>
                    <Input
                      id="register-confirm-password"
                      type="password"
                      value={registerForm.confirmPassword}
                      onChange={(e) => updateRegisterForm('confirmPassword', e.target.value)}
                      placeholder="Confirm your password"
                      className={`bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 h-9 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 text-sm"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating account...' : 'Create account'}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:border-gray-500 font-semibold py-3 rounded-lg transition-all duration-300"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center">
          {authMode === 'customer' ? (
            <p className="text-xs text-gray-400">
              By signing up, you agree to our{' '}
              <a href="/terms" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
                Privacy Policy
              </a>
            </p>
          ) : (
            <p className="text-xs text-gray-400">
              Protected by enterprise-grade security. All access is logged and monitored.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}