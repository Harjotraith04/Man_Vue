import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProductStore } from '@/stores/productStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  Grid, 
  List,
  Star,
  Heart,
  ShoppingCart,
  Eye
} from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { useCartStore } from '@/stores/cartStore'
import toast from 'react-hot-toast'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [localSearchQuery, setLocalSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'relevance' | 'price-low' | 'price-high' | 'rating'>('relevance')
  
  const { 
    products, 
    isLoading, 
    filters, 
    clearFilters,
    searchProducts,
    addToWishlist,
    removeFromWishlist
  } = useProductStore()
  
  const { addItem } = useCartStore()
  
  const searchQuery = searchParams.get('q') || ''
  const voiceSearch = searchParams.get('voice') === 'true'

  useEffect(() => {
    if (searchQuery) {
      setLocalSearchQuery(searchQuery)
      searchProducts(searchQuery, { ...filters, sortBy })
    }
  }, [searchQuery, sortBy])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (localSearchQuery.trim()) {
      setSearchParams({ q: localSearchQuery.trim() })
    }
  }

  const handleSortChange = (newSort: typeof sortBy) => {
    setSortBy(newSort)
    if (searchQuery) {
      searchProducts(searchQuery, { ...filters, sortBy: newSort })
    }
  }

  const handleAddToCart = async (product: any) => {
    try {
      // Get default size and color from product variants
      const defaultSize = product.variants?.[0]?.sizes?.[0]?.size || 'M'
      const defaultColor = product.variants?.[0]?.color || 'Default'
      await addItem(product.id, 1, defaultSize, defaultColor)
      toast.success('Added to cart!')
    } catch (error) {
      toast.error('Failed to add to cart')
    }
  }

  const handleWishlistToggle = async (product: any) => {
    try {
      if (product.isWishlisted) {
        await removeFromWishlist(product.id)
      } else {
        await addToWishlist(product.id)
      }
    } catch (error) {
      toast.error('Failed to update wishlist')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(price)
  }

  const renderProductCard = (product: any) => (
    <Card key={product.id} className="group relative overflow-hidden bg-gray-800/50 border-gray-700 hover:border-blue-500/50 transition-all duration-300">
      <div className="relative">
        <Link to={`/product/${product.slug}`}>
          <div className="aspect-square overflow-hidden bg-gray-700">
            <img
              src={product.primaryImage || product.images?.[0] || '/placeholder-product.jpg'}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>
        
        {/* Wishlist Button */}
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 h-8 w-8 bg-gray-900/80 hover:bg-gray-800 rounded-full"
          onClick={() => handleWishlistToggle(product)}
        >
          <Heart 
            className={cn(
              "h-4 w-4",
              product.isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"
            )} 
          />
        </Button>

        {/* Quick Actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
          <Button
            size="icon"
            variant="ghost"
            className="h-10 w-10 bg-white/20 hover:bg-white/30 rounded-full"
            onClick={() => handleAddToCart(product)}
          >
            <ShoppingCart className="h-4 w-4 text-white" />
          </Button>
          <Link to={`/product/${product.slug}`}>
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 bg-white/20 hover:bg-white/30 rounded-full"
            >
              <Eye className="h-4 w-4 text-white" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-2">
          <Link to={`/product/${product.slug}`}>
            <h3 className="font-medium text-gray-200 hover:text-blue-400 transition-colors line-clamp-2">
              {product.title}
            </h3>
          </Link>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3 w-3",
                    i < Math.floor(product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
                  )}
                />
              ))}
              <span className="text-xs text-gray-400 ml-1">({product.reviewCount || 0})</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-lg font-bold text-green-400">
                {formatPrice(product.price?.selling || product.price || 0)}
              </div>
              {product.price?.original && product.price.original > (product.price?.selling || product.price) && (
                <div className="text-sm text-gray-500 line-through">
                  {formatPrice(product.price.original)}
                </div>
              )}
            </div>
            
            {product.discount?.isActive && product.discount?.percentage && (
              <Badge variant="destructive" className="text-xs">
                {product.discount.percentage}% OFF
              </Badge>
            )}
          </div>

          {product.category && (
            <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
              {product.category}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-900">
    <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {voiceSearch ? '🎤 Voice Search Results' : 'Search Results'}
              </h1>
              {searchQuery && (
                <p className="text-gray-400">
                  {isLoading ? 'Searching...' : `Found ${products.length} products for "${searchQuery}"`}
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for products..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
              />
            </div>
          </form>
        </div>

        {/* Filters and Sort */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as typeof sortBy)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="relevance">Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Rating</option>
            </select>
          </div>

          {filters && Object.keys(filters).length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-400 hover:text-white"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="mb-6 p-4 bg-gray-800/50 border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm">
                  <option value="">All Categories</option>
                  <option value="shirts">Shirts</option>
                  <option value="t-shirts">T-Shirts</option>
                  <option value="jeans">Jeans</option>
                  <option value="formal">Formal</option>
                  <option value="shoes">Shoes</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Price Range</label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
                <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm">
                  <option value="">All Ratings</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                </select>
              </div>
            </div>
          </Card>
        )}

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-400">Searching...</span>
          </div>
        ) : products.length > 0 ? (
          <div className={cn(
            "grid gap-6",
            viewMode === 'grid' 
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1"
          )}>
            {products.map(renderProductCard)}
          </div>
        ) : searchQuery ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-medium mb-2">No products found</h3>
              <p>Try adjusting your search terms or filters</p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setLocalSearchQuery('')
                setSearchParams({})
              }}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Clear Search
            </Button>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-medium mb-2">Start your search</h3>
              <p>Enter a product name or category to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
