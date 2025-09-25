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
  RefreshCcw
} from 'lucide-react'
import axios from 'axios'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

interface ScrapedProduct {
  title: string
  price: {
    selling: number
    currency: string
  }
  image: string
  link: string
  source: string
  category: string
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
      const response = await axios.post('/web-scraper/scrape-products', {
        query: query.trim(),
        sites: selectedSites,
        limit: 24
      })
      
      const scrapedProducts = response.data.data.products || []
      setProducts(scrapedProducts)
      
      toast.success(`Found ${scrapedProducts.length} products from ${response.data.data.sitesScraped?.length || 0} shopping sites`)
    } catch (error) {
      console.error('Failed to scrape products:', error)
      toast.error('Failed to search products from shopping sites')
      setProducts([])
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
      <div className={`fixed ${isAboveChatBot ? 'bottom-24' : 'bottom-6'} right-6 z-40`}>
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-16 h-16 shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 border-2 border-yellow-400"
          title="Web Scanner - Search products across shopping websites"
        >
          <Globe className="h-7 w-7 text-white animate-pulse" />
        </Button>
      </div>
    )
  }

  return (
    <div className={`fixed ${isAboveChatBot ? 'bottom-24' : 'bottom-6'} right-6 z-40 transition-all duration-200 ${
      isMinimized ? 'w-80 h-16' : 'w-[900px] h-[700px]'
    }`}>
      <Card className="h-full shadow-2xl bg-gray-900 backdrop-blur-sm border-2 border-orange-400">
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
                <Button
                  onClick={handleSearch}
                  disabled={isLoading || !searchQuery.trim()}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  {isLoading ? 'Scanning...' : 'Search'}
                </Button>
              </div>

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
            <CardContent className="flex-1 overflow-y-auto p-4 h-[440px] bg-gray-900">
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
                  "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : 
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
                          <div className="aspect-square overflow-hidden rounded-t-lg bg-gray-700">
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
                            <p className="text-xs text-orange-400 capitalize mb-2">{product.source}</p>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-lg font-bold text-yellow-400">
                                £{product.price.selling.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <Badge className="text-xs bg-orange-500 text-white">
                                {product.source}
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
                          <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-700">
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
                            <div>
                              <h3 className="font-semibold text-sm text-white truncate max-w-xs" title={product.title}>
                                {product.title}
                              </h3>
                              <p className="text-xs text-orange-400">{product.source}</p>
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
