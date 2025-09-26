import { create } from 'zustand'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Product } from './cartStore'

export interface ProductFilters {
  category?: string
  subCategory?: string
  minPrice?: number
  maxPrice?: number
  rating?: number
  sortBy?: 'newest' | 'price-low' | 'price-high' | 'rating' | 'popularity'
  search?: string
  inStock?: boolean
  featured?: boolean
  newArrival?: boolean
  bestSeller?: boolean
  page?: number
  limit?: number
}

export interface ProductPagination {
  currentPage: number
  totalPages: number
  totalProducts: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ProductReview {
  id: string
  user: {
    name: string
    avatar?: string
  }
  rating: number
  comment: string
  helpful: string[]
  verified: boolean
  createdAt: string
}

export interface DetailedProduct extends Product {
  description: string
  shortDescription?: string
  subCategory?: string
  specifications: {
    material: string
    care: string
    fit: string
    pattern: string
    sleeve?: string
    neckType?: string
    origin: string
    weight?: string
    dimensions?: {
      length: string
      width: string
      height: string
    }
  }
  sizeChart?: string
  glbModelUrl?: string
  tags: string[]
  features: string[]
  reviews: ProductReview[]
  relatedProducts: Product[]
  viewCount: number
  soldCount: number
  isWishlisted: boolean
}

interface ProductState {
  products: Product[]
  featuredProducts: Product[]
  currentProduct: DetailedProduct | null
  categories: string[]
  subCategories: string[]
  filters: ProductFilters
  pagination: ProductPagination
  isLoading: boolean
  isLoadingProduct: boolean
  searchSuggestions: string[]
  recentlyViewed: Product[]
}

interface ProductActions {
  fetchProducts: (filters?: ProductFilters) => Promise<void>
  fetchFeaturedProducts: () => Promise<void>
  fetchProduct: (slug: string) => Promise<void>
  searchProducts: (query: string, filters?: ProductFilters) => Promise<void>
  fetchCategories: () => Promise<void>
  setFilters: (filters: Partial<ProductFilters>) => void
  clearFilters: () => void
  addToWishlist: (productId: string) => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  addReview: (productId: string, rating: number, comment: string) => Promise<void>
  addToRecentlyViewed: (product: Product) => void
  getSearchSuggestions: (query: string) => Promise<void>
}

type ProductStore = ProductState & ProductActions

const initialFilters: ProductFilters = {
  page: 1,
  limit: 12,
  sortBy: 'newest'
}

const initialPagination: ProductPagination = {
  currentPage: 1,
  totalPages: 1,
  totalProducts: 0,
  hasNext: false,
  hasPrev: false
}

export const useProductStore = create<ProductStore>((set, get) => ({
  // Initial state
  products: [],
  featuredProducts: [],
  currentProduct: null,
  categories: [],
  subCategories: [],
  filters: initialFilters,
  pagination: initialPagination,
  isLoading: false,
  isLoadingProduct: false,
  searchSuggestions: [],
  recentlyViewed: [],

  // Actions
  fetchProducts: async (filters?: ProductFilters) => {
    set({ isLoading: true })
    try {
      const currentFilters = { ...get().filters, ...filters }
      const params = new URLSearchParams()
      
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString())
        }
      })

      const response = await axios.get(`/products?${params}`)
      const { products, pagination } = response.data.data


      set({
        products,
        pagination,
        filters: currentFilters,
        isLoading: false
      })
    } catch (error: any) {
      console.error('Failed to fetch products:', error)
      toast.error('Failed to load products')
      set({ isLoading: false })
    }
  },

  fetchFeaturedProducts: async () => {
    try {
      const response = await axios.get('/products?featured=true&limit=8')
      const { products } = response.data.data

      set({ featuredProducts: products })
    } catch (error: any) {
      console.error('Failed to fetch featured products:', error)
    }
  },

  fetchProduct: async (slug: string) => {
    set({ isLoadingProduct: true, currentProduct: null })
    try {
      const response = await axios.get(`/products/${slug}`)
      const { product, isWishlisted } = response.data.data

      const detailedProduct: DetailedProduct = {
        ...product,
        isWishlisted
      }

      set({
        currentProduct: detailedProduct,
        isLoadingProduct: false
      })

      // Add to recently viewed
      get().addToRecentlyViewed(product)
    } catch (error: any) {
      console.error('Failed to fetch product:', error)
      toast.error('Failed to load product')
      set({ isLoadingProduct: false })
      throw error
    }
  },

  searchProducts: async (query: string, filters?: ProductFilters) => {
    set({ isLoading: true })
    try {
      const searchFilters = {
        ...get().filters,
        ...filters,
        search: query,
        page: 1 // Reset to first page for new search
      }

      await get().fetchProducts(searchFilters)
    } catch (error) {
      console.error('Search failed:', error)
      toast.error('Search failed')
      set({ isLoading: false })
    }
  },

  fetchCategories: async () => {
    try {
      const response = await axios.get('/products/categories/list')
      const { categories, subCategories } = response.data.data

      set({ categories, subCategories })
    } catch (error: any) {
      console.error('Failed to fetch categories:', error)
    }
  },

  setFilters: (newFilters: Partial<ProductFilters>) => {
    const filters = { ...get().filters, ...newFilters }
    set({ filters })
    get().fetchProducts(filters)
  },

  clearFilters: () => {
    set({ filters: initialFilters })
    get().fetchProducts(initialFilters)
  },

  addToWishlist: async (productId: string) => {
    try {
      await axios.post(`/products/${productId}/wishlist`)
      
      // Update current product if it's the same one
      const currentProduct = get().currentProduct
      if (currentProduct && currentProduct.id === productId) {
        set({
          currentProduct: {
            ...currentProduct,
            isWishlisted: true
          }
        })
      }

      toast.success('Added to wishlist')
    } catch (error: any) {
      console.error('Wishlist error:', error.response?.data || error.message)
      const message = error.response?.data?.message || 'Failed to add to wishlist'
      toast.error(message)
      throw error
    }
  },

  removeFromWishlist: async (productId: string) => {
    try {
      await axios.post(`/products/${productId}/wishlist`)
      
      // Update current product if it's the same one
      const currentProduct = get().currentProduct
      if (currentProduct && currentProduct.id === productId) {
        set({
          currentProduct: {
            ...currentProduct,
            isWishlisted: false
          }
        })
      }

      toast.success('Removed from wishlist')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to remove from wishlist'
      toast.error(message)
      throw error
    }
  },

  addReview: async (productId: string, rating: number, comment: string) => {
    try {
      const response = await axios.post(`/products/${productId}/reviews`, {
        rating,
        comment
      })
      
      const { review, rating: newRating } = response.data.data

      // Update current product reviews
      const currentProduct = get().currentProduct
      if (currentProduct && currentProduct.id === productId) {
        set({
          currentProduct: {
            ...currentProduct,
            reviews: [...currentProduct.reviews, review],
            rating: newRating
          }
        })
      }

      toast.success('Review added successfully')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to add review'
      toast.error(message)
      throw error
    }
  },

  addToRecentlyViewed: (product: Product) => {
    const recentlyViewed = get().recentlyViewed
    
    // Remove if already exists
    const filtered = recentlyViewed.filter(p => p.id !== product.id)
    
    // Add to beginning and keep only last 10
    const updated = [product, ...filtered].slice(0, 10)
    
    set({ recentlyViewed: updated })
  },

  getSearchSuggestions: async (query: string) => {
    if (query.length < 2) {
      set({ searchSuggestions: [] })
      return
    }

    try {
      const response = await axios.get(`/products?search=${query}&limit=5`)
      const { products } = response.data.data
      
      const suggestions = products.map((product: Product) => product.title)
      set({ searchSuggestions: suggestions })
    } catch (error: any) {
      console.error('Failed to get search suggestions:', error)
      set({ searchSuggestions: [] })
    }
  }
}))

// Auto-fetch categories on store creation
useProductStore.getState().fetchCategories()
