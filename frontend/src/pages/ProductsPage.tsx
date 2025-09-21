import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useProductStore } from '@/stores/productStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Star, Filter, Grid, List, ChevronDown } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { products, isLoading, fetchProducts } = useProductStore()
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  
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
    'shirts', 'tshirts', 'jeans', 'trousers', 'chinos', 'shorts',
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

  const ProductCard = ({ product }: { product: any }) => (
    <Link to={`/product/${product.slug}`} className="group">
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="relative aspect-square">
          <img
            src={product.primaryImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop'}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.discount?.isActive && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              {product.discount.percentage}% OFF
            </div>
          )}
          {product.isFeatured && (
            <Badge className="absolute top-2 right-2" variant="secondary">
              Featured
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-1 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
            {product.title}
          </h3>
          <p className="text-gray-600 text-sm mb-2">{product.brand?.name}</p>
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600 ml-1">
                {product.rating?.average?.toFixed(1) || '0.0'} ({product.rating?.count || 0})
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg">
              {formatPrice(product.price?.selling || 0)}
            </span>
            {product.discount?.isActive && (
              <span className="text-gray-400 line-through text-sm">
                {formatPrice(product.price?.original || 0)}
              </span>
            )}
          </div>
          {product.inventory?.totalStock === 0 && (
            <Badge variant="destructive" className="mt-2">
              Out of Stock
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  )

  const ProductListItem = ({ product }: { product: any }) => (
    <Link to={`/product/${product.slug}`} className="group">
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="flex">
          <div className="w-48 h-48 flex-shrink-0">
            <img
              src={product.primaryImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop'}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <CardContent className="flex-1 p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors duration-200">
                  {product.title}
                </h3>
                <p className="text-gray-600 mb-2">{product.brand?.name}</p>
                <p className="text-gray-700 mb-4 line-clamp-2">{product.shortDescription}</p>
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">
                      {product.rating?.average?.toFixed(1) || '0.0'} ({product.rating?.count || 0})
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-bold text-xl">
                    {formatPrice(product.price?.selling || 0)}
                  </span>
                  {product.discount?.isActive && (
                    <span className="text-gray-400 line-through">
                      {formatPrice(product.price?.original || 0)}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  {product.discount?.isActive && (
                    <Badge variant="destructive">
                      {product.discount.percentage}% OFF
                    </Badge>
                  )}
                  {product.isFeatured && (
                    <Badge variant="secondary">
                      Featured
                    </Badge>
                  )}
                  {product.inventory?.totalStock === 0 && (
                    <Badge variant="destructive">
                      Out of Stock
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Products</h1>
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full"
            />
          </div>

          {/* View Controls */}
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>

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

            {/* Sort */}
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
              
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  )
}