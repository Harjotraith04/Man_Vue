import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'
import toast from 'react-hot-toast'

export interface Product {
  id: string
  title: string
  slug: string
  price: {
    original: number
    selling: number
  }
  discount?: {
    percentage: number
    isActive: boolean
  }
  primaryImage: string
  variants: ProductVariant[]
  category: string
  brand: {
    name: string
  }
  rating: {
    average: number
    count: number
  }
  isActive?: boolean
  isFeatured?: boolean
  isNewArrival?: boolean
  isBestSeller?: boolean
  soldCount?: number
  createdAt?: string
  createdBy?: string
}

export interface ProductVariant {
  color: string
  colorCode: string
  images: Array<{
    url: string
    alt: string
    isPrimary: boolean
  }>
  sizes: Array<{
    size: string
    stock: number
    price: number
  }>
}

export interface CartItem {
  product: Product
  quantity: number
  size: string
  color: string
  unitPrice: number
  totalPrice: number
  addedAt: string
}

export interface CartSummary {
  subtotal: number
  tax: number
  shipping: number
  total: number
  itemCount: number
  totalItems: number
}

interface CartState {
  items: CartItem[]
  summary: CartSummary
  isLoading: boolean
  isOpen: boolean
}

interface CartActions {
  addItem: (productId: string, quantity: number, size: string, color: string) => Promise<void>
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => Promise<void>
  removeItem: (productId: string, size: string, color: string) => Promise<void>
  clearCart: () => Promise<void>
  loadCart: () => Promise<void>
  toggleCart: () => void
  setCartOpen: (isOpen: boolean) => void
  calculateSummary: () => void
}

type CartStore = CartState & CartActions

const initialSummary: CartSummary = {
  subtotal: 0,
  tax: 0,
  shipping: 0,
  total: 0,
  itemCount: 0,
  totalItems: 0
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      summary: initialSummary,
      isLoading: false,
      isOpen: false,

      // Actions
      addItem: async (productId: string, quantity: number, size: string, color: string) => {
        set({ isLoading: true })
        try {
          await axios.post('/users/cart', {
            productId,
            quantity,
            size,
            color
          })
          
          // Reload cart to get updated data
          await get().loadCart()
          
          toast.success('Item added to cart')
          
          // Auto-open cart drawer for a few seconds
          set({ isOpen: true })
          setTimeout(() => {
            set({ isOpen: false })
          }, 3000)
        } catch (error: any) {
          const message = error.response?.data?.message || 'Failed to add item to cart'
          toast.error(message)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      updateQuantity: async (productId: string, size: string, color: string, quantity: number) => {
        set({ isLoading: true })
        try {
          await axios.put(`/users/cart/${productId}`, {
            quantity,
            size,
            color
          })
          
          await get().loadCart()
          
          if (quantity === 0) {
            toast.success('Item removed from cart')
          } else {
            toast.success('Cart updated')
          }
        } catch (error: any) {
          const message = error.response?.data?.message || 'Failed to update cart'
          toast.error(message)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      removeItem: async (productId: string, size: string, color: string) => {
        set({ isLoading: true })
        try {
          await axios.delete(`/users/cart/${productId}`, {
            data: { size, color }
          })
          
          await get().loadCart()
          toast.success('Item removed from cart')
        } catch (error: any) {
          const message = error.response?.data?.message || 'Failed to remove item'
          toast.error(message)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      clearCart: async () => {
        set({ isLoading: true })
        try {
          await axios.delete('/users/cart')
          
          set({
            items: [],
            summary: initialSummary,
            isLoading: false
          })
          
          toast.success('Cart cleared')
        } catch (error: any) {
          const message = error.response?.data?.message || 'Failed to clear cart'
          toast.error(message)
          set({ isLoading: false })
          throw error
        }
      },

      loadCart: async () => {
        try {
          const response = await axios.get('/users/cart')
          const { items, summary } = response.data.data
          
          set({
            items,
            summary,
            isLoading: false
          })
        } catch (error: any) {
          console.error('Failed to load cart:', error)
          set({
            items: [],
            summary: initialSummary,
            isLoading: false
          })
        }
      },

      toggleCart: () => {
        set(state => ({ isOpen: !state.isOpen }))
      },

      setCartOpen: (isOpen: boolean) => {
        set({ isOpen })
      },

      calculateSummary: () => {
        const state = get()
        const items = state.items
        
        const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
        const tax = subtotal * 0.18 // 18% GST
        const shipping = subtotal > 50 ? 0 : 5 // Free shipping above £50
        const total = subtotal + tax + shipping
        const itemCount = items.length
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

        set({
          summary: {
            subtotal,
            tax,
            shipping,
            total,
            itemCount,
            totalItems
          }
        })
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        summary: state.summary
      })
    }
  )
)
