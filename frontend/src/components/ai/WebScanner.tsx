import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Globe, 
  X, 
  Search, 
  Filter,
  ShoppingBag,
  Star,
  Eye,
  Maximize2,
  Minimize2,
  Grid3X3,
  List,
  ExternalLink,
  Loader2,
  RefreshCcw,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Award,
  DollarSign
} from 'lucide-react'
import axios from 'axios'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

interface ScrapedProduct {
  title: string
  price: {
    selling: number
    currency: string
    original?: string
  }
  image: string
  link: string
  source: string
  sourceName: string
  rating?: string
  category: string
  scrapedAt: string
  priceComparison?: {
    isLowest: boolean
    isHighest: boolean
    percentageFromAverage: number
    avgPrice: number
  }
}

interface ScrapeResponse {
  success: boolean
  data: {
    products: ScrapedProduct[]
    query: string
    totalFound: number
    sitesScraped: string[]
    productsBySource: { [key: string]: ScrapedProduct[] }
    priceRange?: {
      min: number
      max: number
      average: number
    }
    scrapedAt: string
    isRealScraping: boolean
  }
}

interface ShoppingSite {
  id: string
  name: string
  baseUrl: string
  logo: string
}

interface WebScannerProps {
  isAboveChatBot?: boolean
}

export default function WebScanner({ isAboveChatBot = true }: WebScannerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [products, setProducts] = useState<ScrapedProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSites, setSelectedSites] = useState<string[]>(['amazon', 'ebay', 'next'])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [availableSites, setAvailableSites] = useState<ShoppingSite[]>([])
  const [popularCategories, setPopularCategories] = useState<Array<{name: string, query: string, icon: string}>>([])
  const [lastSearchQuery, setLastSearchQuery] = useState('')
  const [priceRange, setPriceRange] = useState<{min: number, max: number, average: number} | null>(null)
  const [sortBy, setSortBy] = useState<'relevance' | 'price-low' | 'price-high'>('relevance')

  useEffect(() => {
    if (isOpen) {
      loadInitialData()
    }
  }, [isOpen])

  const loadInitialData = async () => {
    try {
      // Load available sites and popular categories
      const [sitesResponse, categoriesResponse] = await Promise.all([
        axios.get('/web-scraper/sites'),
        axios.get('/web-scraper/popular-categories')
      ])
      
      setAvailableSites(sitesResponse.data.data.sites || [])
      setPopularCategories(categoriesResponse.data.data.categories || [])
    } catch (error) {
      console.error('Failed to load initial data:', error)
      toast.error('Failed to load shopping sites data')
    }
  }

  const scrapeProducts = async (query: string) => {
    if (!query.trim()) {
      toast.error('Please enter a search term')
      return
    }

    setIsLoading(true)
    setLastSearchQuery(query)
    
    try {
      const response = await axios.post<ScrapeResponse>('/web-scraper/scrape-products', {
        query: query.trim(),
        sites: selectedSites,
        limit: 24
      })
      
      const responseData = response.data.data
      let scrapedProducts = responseData.products || []
      
      // Sort products based on selected sort option
      if (sortBy === 'price-low') {
        scrapedProducts = scrapedProducts.sort((a, b) => a.price.selling - b.price.selling)
      } else if (sortBy === 'price-high') {
        scrapedProducts = scrapedProducts.sort((a, b) => b.price.selling - a.price.selling)
      }
      
      setProducts(scrapedProducts)
      setPriceRange(responseData.priceRange || null)
      
      if (responseData.isRealScraping) {
        const lowestPriceProducts = scrapedProducts.filter(p => p.priceComparison?.isLowest).length
        toast.success(
          `🎯 Found ${scrapedProducts.length} real products from ${responseData.sitesScraped?.length || 0} sites` +
          (lowestPriceProducts > 0 ? ` · ${lowestPriceProducts} lowest prices found` : ''),
          { duration: 4000 }
        )
      } else {
        toast.success(`Found ${scrapedProducts.length} products from ${responseData.sitesScraped?.length || 0} shopping sites`)
      }
    } catch (error) {
      console.error('Failed to scrape products:', error)
      toast.error('Failed to search products from shopping sites. Please try again.')
      setProducts([])
      setPriceRange(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      scrapeProducts(searchQuery)
    }
  }

  const handleCategorySearch = (categoryQuery: string) => {
    setSearchQuery(categoryQuery)
    scrapeProducts(categoryQuery)
  }

  const toggleSite = (siteId: string) => {
    setSelectedSites(prev => 
      prev.includes(siteId) 
        ? prev.filter(id => id !== siteId)
        : [...prev, siteId]
    )
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 left-6 z-[9999]" style={{ position: 'fixed', isolation: 'isolate' }}>
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-16 h-16 shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 border-2 border-yellow-400"
          title="Web Scanner - Search products across shopping websites"
          style={{ position: 'relative', zIndex: 1 }}
        >
          <Globe className="h-7 w-7 text-white animate-pulse" />
        </Button>
      </div>
    )
  }

  return (
    <div className={`fixed bottom-6 left-6 z-[9999] transition-all duration-200 ${
      isMinimized ? 'w-80 h-16' : 'w-[800px] h-[700px]'
    }`} style={{ position: 'fixed', pointerEvents: 'auto' }}>
      <Card className="h-full shadow-2xl bg-gray-900 border-2 border-orange-400" style={{ position: 'relative', zIndex: 1, isolation: 'isolate' }}>
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-orange-300 bg-gradient-to-r from-gray-800 to-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
              <Globe className="h-7 w-7 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-yellow-400">Web Scanner</CardTitle>
              <p className="text-sm text-gray-300">
                {isLoading ? 'Scanning shopping websites...' : 
                 products.length > 0 ? `${products.length} products found${lastSearchQuery ? ` for "${lastSearchQuery}"` : ''}` :
                 'Search products across multiple shopping sites'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {lastSearchQuery && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => scrapeProducts(lastSearchQuery)}
                disabled={isLoading}
                className="text-orange-400 border-orange-400 hover:bg-orange-400 hover:text-black"
                title="Refresh search"
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="text-orange-400 border-orange-400 hover:bg-orange-400 hover:text-black"
              title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-orange-400 border-orange-400 hover:bg-orange-400 hover:text-black"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-red-400 border-red-400 hover:bg-red-400 hover:text-black"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            {/* Search and Filters */}
            <div className="p-4 border-b border-orange-300 bg-gray-800 space-y-4">
              {/* Search Bar */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-orange-400" />
                  <input
                    type="text"
                    placeholder="Search products across shopping websites..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white placeholder-gray-400"
                    disabled={isLoading}
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'relevance' | 'price-low' | 'price-high')}
                  className="bg-gray-700 border border-orange-400 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-orange-500"
                  disabled={isLoading}
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
                <Button
                  onClick={handleSearch}
                  disabled={isLoading || !searchQuery.trim()}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  {isLoading ? 'Scanning...' : 'Search'}
                </Button>
              </div>

              {/* Price Range Display */}
              {priceRange && products.length > 0 && (
                <div className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center text-green-400">
                      <TrendingDown className="h-4 w-4 mr-1" />
                      <span>From £{priceRange.min.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center text-yellow-400">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>Avg £{priceRange.average.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center text-red-400">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span>Up to £{priceRange.max.toFixed(2)}</span>
                    </div>
                  </div>
                  <Badge className="bg-blue-600 text-white text-xs">
                    💰 Compare {products.length} prices
                  </Badge>
                </div>
              )}

              {/* Popular Categories */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-yellow-400">Popular Categories:</p>
                <div className="flex flex-wrap gap-2">
                  {popularCategories.slice(0, 6).map((category, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleCategorySearch(category.query)}
                      disabled={isLoading}
                      className="text-xs h-8 text-orange-300 border-orange-300 hover:bg-orange-300 hover:text-black"
                    >
                      <span className="mr-2">{category.icon}</span>
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Shopping Sites Selection */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-yellow-400">Shopping Sites:</p>
                <div className="flex flex-wrap gap-2">
                  {availableSites.map((site) => (
                    <Button
                      key={site.id}
                      variant={selectedSites.includes(site.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleSite(site.id)}
                      className={`text-xs h-8 ${
                        selectedSites.includes(site.id)
                          ? 'bg-orange-500 text-white'
                          : 'text-orange-300 border-orange-300 hover:bg-orange-300 hover:text-black'
                      }`}
                    >
                      {site.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            <CardContent className="flex-1 overflow-y-auto p-4 h-[640px] bg-gray-900">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-orange-400 text-lg font-medium">Scanning shopping websites...</p>
                    <p className="text-gray-400 text-sm mt-2">Searching across {selectedSites.length} sites</p>
                  </div>
                </div>
              ) : products.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Search className="h-16 w-16 text-orange-400 mx-auto mb-4" />
                    <p className="text-orange-400 text-lg font-medium mb-2">No products found</p>
                    <p className="text-gray-400 text-sm mb-4">Try searching for specific items like "men's shirts" or "sneakers"</p>
                    <div className="space-y-2">
                      <p className="text-sm text-yellow-400">Quick suggestions:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {['men shirts', 'women dresses', 'sneakers', 'jeans'].map((suggestion) => (
                          <Button
                            key={suggestion}
                            variant="outline"
                            size="sm"
                            onClick={() => handleCategorySearch(suggestion)}
                            className="text-xs text-orange-300 border-orange-300 hover:bg-orange-300 hover:text-black"
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 
                  "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4" : 
                  "space-y-3"
                }>
                  {products.map((product, index) => (
                    <div key={index} className={
                      viewMode === 'grid' 
                        ? "bg-gray-800 rounded-lg shadow-lg border border-orange-300 hover:border-orange-400 hover:shadow-xl transition-all duration-200"
                        : "bg-gray-800 rounded-lg shadow-lg border border-orange-300 hover:border-orange-400 hover:shadow-xl transition-all duration-200 flex p-3"
                    }>
                      {viewMode === 'grid' ? (
                        <>
                          <div className="aspect-square overflow-hidden rounded-t-lg bg-gray-700 relative">
                            {product.priceComparison?.isLowest && (
                              <div className="absolute top-2 left-2 z-10">
                                <Badge className="bg-green-600 text-white text-xs font-bold">
                                  <Award className="h-3 w-3 mr-1" />
                                  Lowest Price
                                </Badge>
                              </div>
                            )}
                            <img
                              src={product.image}
                              alt={product.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-image.jpg'
                              }}
                            />
                          </div>
                          <div className="p-3">
                            <h3 className="font-semibold text-sm text-white truncate" title={product.title}>
                              {product.title}
                            </h3>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs text-orange-400 capitalize">{product.sourceName || product.source}</p>
                              {product.rating && (
                                <div className="flex items-center text-yellow-400 text-xs">
                                  <Star className="h-3 w-3 mr-1 fill-current" />
                                  <span>{product.rating}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex flex-col">
                                <span className="text-lg font-bold text-yellow-400">
                                  £{product.price.selling.toFixed(2)}
                                </span>
                                {product.priceComparison && product.priceComparison.percentageFromAverage !== 0 && (
                                  <div className="flex items-center text-xs">
                                    {product.priceComparison.percentageFromAverage < 0 ? (
                                      <>
                                        <TrendingDown className="h-3 w-3 text-green-400 mr-1" />
                                        <span className="text-green-400">
                                          {Math.abs(product.priceComparison.percentageFromAverage)}% below avg
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <TrendingUp className="h-3 w-3 text-red-400 mr-1" />
                                        <span className="text-red-400">
                                          {product.priceComparison.percentageFromAverage}% above avg
                                        </span>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <Badge className={`text-xs ${
                                product.priceComparison?.isLowest 
                                  ? 'bg-green-600 text-white' 
                                  : product.priceComparison?.isHighest
                                  ? 'bg-red-600 text-white'
                                  : 'bg-orange-500 text-white'
                              }`}>
                                {product.sourceName || product.source}
                              </Badge>
                              <a
                                href={product.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-xs text-orange-400 hover:text-orange-300 font-medium"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View
                              </a>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-700 relative">
                            {product.priceComparison?.isLowest && (
                              <div className="absolute -top-1 -right-1 z-10">
                                <Badge className="bg-green-600 text-white text-[10px] font-bold px-1 py-0.5">
                                  <Award className="h-2 w-2" />
                                </Badge>
                              </div>
                            )}
                            <img
                              src={product.image}
                              alt={product.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-image.jpg'
                              }}
                            />
                          </div>
                          <div className="flex-1 ml-3 flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-sm text-white truncate max-w-xs" title={product.title}>
                                  {product.title}
                                </h3>
                                {product.rating && (
                                  <div className="flex items-center text-yellow-400 text-xs ml-2">
                                    <Star className="h-3 w-3 mr-1 fill-current" />
                                    <span>{product.rating}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 mb-1">
                                <Badge className={`text-[10px] ${
                                  product.priceComparison?.isLowest 
                                    ? 'bg-green-600 text-white' 
                                    : product.priceComparison?.isHighest
                                    ? 'bg-red-600 text-white'
                                    : 'bg-orange-500 text-white'
                                }`}>
                                  {product.sourceName || product.source}
                                </Badge>
                                {product.priceComparison && product.priceComparison.percentageFromAverage !== 0 && (
                                  <div className="flex items-center text-xs">
                                    {product.priceComparison.percentageFromAverage < 0 ? (
                                      <span className="text-green-400 flex items-center">
                                        <TrendingDown className="h-3 w-3 mr-1" />
                                        {Math.abs(product.priceComparison.percentageFromAverage)}% below
                                      </span>
                                    ) : (
                                      <span className="text-red-400 flex items-center">
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                        {product.priceComparison.percentageFromAverage}% above
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <span className="text-lg font-bold text-yellow-400">
                                £{product.price.selling.toFixed(2)}
                              </span>
                            </div>
                            <a
                              href={product.link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="outline" size="sm" className="text-xs text-orange-400 border-orange-400 hover:bg-orange-400 hover:text-black">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </a>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}
