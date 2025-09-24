import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useProductStore } from '@/stores/productStore'
import { useCartStore } from '@/stores/cartStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import ProductDetailModal from '@/components/ui/ProductDetailModal'
import { Star, Filter, Grid, List, ChevronDown, Search } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { products, isLoading, fetchProducts } = useProductStore()
  const { addToCart, addToWishlist } = useCartStore()
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    subCategory: searchParams.get('subCategory') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
    inStock: searchParams.get('inStock') === 'true',
    featured: searchParams.get('featured') === 'true'
  })

  const categories = [
    'formal', 'shirts', 'tshirts', 'jeans', 'trousers', 'chinos', 'shorts',
    'jackets', 'blazers', 'suits', 'sweaters', 'hoodies',
    'kurtas', 'sherwanis', 'ethnic-wear',
    'shoes', 'sneakers', 'formal-shoes', 'boots', 'sandals',
    'watches', 'belts', 'wallets', 'sunglasses', 'ties', 'bags',
    'accessories'
  ]

  const subCategories = [
    'casual', 'formal', 'sport', 'party', 'wedding', 'office'
  ]

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Best Rated' },
    { value: 'popularity', label: 'Most Popular' }
  ]

  useEffect(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '' && value !== false) {
        params.set(key, value.toString())
      }
    })
    setSearchParams(params)
  }, [filters, setSearchParams])

  useEffect(() => {
    fetchProducts(filters)
  }, [filters, fetchProducts])

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      subCategory: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'newest',
      inStock: false,
      featured: false
    })
  }

  const handleProductClick = (product: any) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  const handleAddToCart = (product: any, quantity: number) => {
    addToCart(product, quantity)
  }

  const handleAddToWishlist = (product: any) => {
    addToWishlist(product)
  }

  const ProductCard = ({ product }: { product: any }) => (
    <div className="group">
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer rounded-xl border-0 shadow-md">
        <div 
          className="relative aspect-square"
          onClick={() => handleProductClick(product)}
        >
          <img
            src={product.primaryImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop'}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop';
            }}
          />
          {product.discount?.isActive && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              -{product.discount.percentage}%
            </div>
          )}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {product.isFeatured && (
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 text-xs font-bold shadow-lg">
                ⭐ Featured
              </Badge>
            )}
            <Badge className="bg-white/90 text-gray-800 border-0 text-xs font-medium shadow-sm">
              {product.category}
            </Badge>
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
              <Button 
                size="sm" 
                className="bg-white text-black hover:bg-gray-100 shadow-lg rounded-lg block mx-auto"
                onClick={(e) => {
                  e.stopPropagation()
                  handleProductClick(product)
                }}
              >
                👁️ Quick View
              </Button>
            </div>
          </div>
        </div>
        <CardContent className="p-5">
          <div className="mb-2">
            <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
              {product.brand?.name || 'ManVue'}
            </span>
          </div>
          <h3 className="font-semibold mb-2 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 text-gray-900">
            {product.title}
          </h3>
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600 ml-1">
                {product.rating?.average?.toFixed(1) || '0.0'} ({product.rating?.count || 0})
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 mb-3">
            <span className="font-bold text-xl text-blue-600">
              {formatPrice(product.price?.selling || 0)}
            </span>
            {product.discount?.isActive && (
              <span className="text-gray-400 line-through text-sm">
                {formatPrice(product.price?.original || 0)}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            {product.inventory?.totalStock === 0 ? (
              <Badge variant="destructive" className="text-xs">
                Out of Stock
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                ✅ In Stock ({product.inventory?.totalStock || 0})
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const ProductListItem = ({ product }: { product: any }) => (
    <div 
      className="group cursor-pointer"
      onClick={() => handleProductClick(product)}
    >
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 rounded-xl border-0 shadow-md">
        <div className="flex">
          <div className="w-64 h-64 flex-shrink-0 relative">
            <img
              src={product.primaryImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop'}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop';
              }}
            />
            {product.discount?.isActive && (
              <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                -{product.discount.percentage}%
              </div>
            )}
            <div className="absolute top-3 right-3">
              <Badge className="bg-white/90 text-gray-800 border-0 text-xs font-medium shadow-sm">
                {product.category}
              </Badge>
            </div>
          </div>
          <CardContent className="flex-1 p-8">
            <div className="flex justify-between items-start h-full">
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="mb-3">
                    <span className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full">
                      {product.brand?.name || 'ManVue'}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-600 transition-colors duration-200 text-gray-900">
                    {product.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3 text-lg leading-relaxed">
                    {product.shortDescription || product.description || 'Premium quality product from our collection.'}
                  </p>
                  <div className="flex items-center mb-4">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="text-lg text-gray-600 ml-2 font-medium">
                        {product.rating?.average?.toFixed(1) || '0.0'} ({product.rating?.count || 0} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.isFeatured && (
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 text-sm font-bold">
                      ⭐ Featured
                    </Badge>
                  )}
                  {product.inventory?.totalStock === 0 ? (
                    <Badge variant="destructive" className="text-sm">
                      Out of Stock
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-sm text-green-600 border-green-300">
                      ✅ In Stock
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right ml-8">
                <div className="flex flex-col items-end space-y-2 mb-4">
                  <span className="font-bold text-3xl text-blue-600">
                    {formatPrice(product.price?.selling || 0)}
                  </span>
                  {product.discount?.isActive && (
                    <span className="text-gray-400 line-through text-xl">
                      {formatPrice(product.price?.original || 0)}
                    </span>
                  )}
                </div>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleProductClick(product)
                  }}
                >
                  👁️ View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-10">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8 mb-8">
          <h1 className="text-5xl font-bold mb-4">Discover Premium Fashion</h1>
          <p className="text-xl text-blue-100 mb-6">Explore our complete collection of 69 curated products from 7 distinct categories</p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <span className="text-sm font-medium">🛍️ 69 Total Products</span>
            </div>
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <span className="text-sm font-medium">📂 7 Categories</span>
            </div>
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <span className="text-sm font-medium">🏷️ Real Product Images</span>
            </div>
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <span className="text-sm font-medium">✨ AI Powered</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search from 69 products..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full h-12 pl-4 pr-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Search className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* View Controls */}
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden border-2 border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>

            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-white shadow-sm' : ''}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-white shadow-sm' : ''}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Sort */}
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="border-2 border-gray-200 rounded-xl px-4 py-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm hover:shadow-md transition-all duration-200 font-medium"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <div className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <Card className="p-6 sticky top-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Filters</h3>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </div>

            <div className="space-y-6">
              {/* Category */}
              <div>
                <h4 className="font-medium mb-3">Category</h4>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub Category */}
              <div>
                <h4 className="font-medium mb-3">Style</h4>
                <select
                  value={filters.subCategory}
                  onChange={(e) => handleFilterChange('subCategory', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">All Styles</option>
                  {subCategories.map(subCategory => (
                    <option key={subCategory} value={subCategory}>
                      {subCategory.charAt(0).toUpperCase() + subCategory.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="font-medium mb-3">Price Range</h4>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="text-sm"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Quick Filters */}
              <div>
                <h4 className="font-medium mb-3">Quick Filters</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.inStock}
                      onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm">In Stock Only</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.featured}
                      onChange={(e) => handleFilterChange('featured', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm">Featured Products</span>
                  </label>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
              {[...Array(9)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className={`bg-gray-200 rounded-lg ${viewMode === 'grid' ? 'aspect-square mb-4' : 'h-48 mb-4'}`}></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No products found matching your criteria.</p>
              <Button onClick={clearFilters} className="mt-4">
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600">
                Showing {products.length} products
              </div>
              
              {/* Results Info */}
              <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {products.length} Products Found
                    </div>
                    {filters.category && (
                      <div className="bg-white px-3 py-1 rounded-full text-sm font-medium border border-blue-300">
                        📂 {filters.category.charAt(0).toUpperCase() + filters.category.slice(1)}
                      </div>
                    )}
                    {filters.search && (
                      <div className="bg-white px-3 py-1 rounded-full text-sm font-medium border border-blue-300">
                        🔍 "{filters.search}"
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    Viewing {viewMode === 'grid' ? 'Grid' : 'List'} View
                  </div>
                </div>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {products.map((product) => (
                    <ProductListItem key={product.id} product={product} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddToCart={handleAddToCart}
        onAddToWishlist={handleAddToWishlist}
      />
    </div>
  )
}