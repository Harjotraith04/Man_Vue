import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'
import toast from 'react-hot-toast'

export interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  avatar?: string
  phone?: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  preferences?: {
    newsletter: boolean
    notifications: boolean
    favoriteCategories: string[]
    sizePreferences: {
      shirt: string
      pants: string
      shoes: string
    }
  }
  wishlist?: string[]
  cart?: CartItem[]
  isActive?: boolean
  createdAt?: string
  lastLogin?: string
  orderHistory?: string[]
}

export interface CartItem {
  product: string
  quantity: number
  size: string
  color: string
  addedAt: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  setToken: (token: string) => void
  initialize: () => void
  refreshToken: () => Promise<void>
  fetchCurrentUser: () => Promise<void>
}

type AuthStore = AuthState & AuthActions

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await axios.post('/auth/login', { email, password })
          const { token, user } = response.data
          
          // Set token in axios headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          })
          
          toast.success(`Welcome back, ${user.name}!`)
        } catch (error: any) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Login failed'
          toast.error(message)
          throw error
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await axios.post('/auth/register', { name, email, password })
          const { token, user } = response.data
          
          // Set token in axios headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          })
          
          toast.success(`Welcome to Manvue, ${user.name}!`)
        } catch (error: any) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Registration failed'
          toast.error(message)
          throw error
        }
      },

      logout: () => {
        // Remove token from axios headers
        delete axios.defaults.headers.common['Authorization']
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        })
        
        // Clear localStorage to ensure complete logout
        localStorage.removeItem('auth-storage')
        localStorage.removeItem('cart-storage')
        
        toast.success('Logged out successfully')
      },

      updateProfile: async (data: Partial<User>) => {
        try {
          const response = await axios.put('/auth/profile', data)
          const { user } = response.data
          
          set(state => ({
            user: { ...state.user, ...user }
          }))
          
          toast.success('Profile updated successfully')
        } catch (error: any) {
          const message = error.response?.data?.message || 'Profile update failed'
          toast.error(message)
          throw error
        }
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        try {
          await axios.put('/auth/change-password', {
            currentPassword,
            newPassword
          })
          
          toast.success('Password changed successfully')
        } catch (error: any) {
          const message = error.response?.data?.message || 'Password change failed'
          toast.error(message)
          throw error
        }
      },

      setToken: (token: string) => {
        // Set token in axios headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
        set({ token, isAuthenticated: true })
      },

      initialize: async () => {
        const state = get()
        if (state.token) {
          // Set token in axios headers if it exists
          axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`
          
          console.log('🔐 Initialized auth with token:', state.token.substring(0, 50) + '...')
          
          // Fetch current user data if we have a token but no user data
          if (!state.user) {
            try {
              await get().fetchCurrentUser()
            } catch (error) {
              console.error('Failed to fetch user data on initialization:', error)
              // If fetching user fails, clear the token
              get().logout()
            }
          } else {
            console.log('✅ User authenticated:', state.user?.email)
          }
        }
      },

      fetchCurrentUser: async () => {
        try {
          const response = await axios.get('/auth/me')
          const { user } = response.data.data
          
          set({ user, isAuthenticated: true })
          console.log('✅ Fetched current user:', user.email)
        } catch (error: any) {
          console.error('Failed to fetch current user:', error)
          // If token is invalid, logout
          if (error.response?.status === 401) {
            get().logout()
          }
          throw error
        }
      },

      refreshToken: async () => {
        try {
          const state = get()
          if (!state.token) {
            throw new Error('No token to refresh')
          }
          
          const response = await axios.post('/auth/refresh')
          const { token } = response.data
          
          // Update token
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          set({ token })
        } catch (error) {
          // Token refresh failed, logout user
          get().logout()
          throw error
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

// Add axios interceptors for automatic token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // Only retry if it's a 401 and we haven't already retried
    // Also don't retry if this is already a refresh request to avoid infinite loops
    if (error.response?.status === 401 && 
        !originalRequest._retry && 
        !originalRequest.url?.includes('/auth/refresh')) {
      
      originalRequest._retry = true
      
      try {
        const authStore = useAuthStore.getState()
        
        // Check if we have a token to refresh
        if (authStore.token) {
          await authStore.refreshToken()
          return axios(originalRequest)
        } else {
          // No token, logout and redirect
          authStore.logout()
          window.location.href = '/auth'
          return Promise.reject(error)
        }
      } catch (refreshError) {
        // Refresh failed, logout and redirect
        useAuthStore.getState().logout()
        window.location.href = '/auth'
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)
