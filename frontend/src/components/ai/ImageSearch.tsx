import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  Camera, 
  Image as ImageIcon, 
  X, 
  Search,
  Loader2,
  Eye,
  Palette,
  Tag,
  Sparkles
} from 'lucide-react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

interface ImageAnalysis {
  items: string[]
  colors: string[]
  style: string
  categories: string[]
  patterns: string[]
  aesthetic: string
  search_keywords: string[]
}

interface ImageSearchResult {
  analysis: ImageAnalysis
  products: Array<{
    id: string
    title: string
    price: { selling: number }
    primaryImage: string
    slug: string
    category: string
    brand: { name: string }
    rating: { average: number }
    variants: Array<{
      color: string
      colorCode: string
    }>
  }>
  searchType: string
  totalFound: number
}

interface ImageSearchProps {
  onResults?: (results: ImageSearchResult) => void
  autoNavigate?: boolean
  className?: string
}

export default function ImageSearch({ onResults, autoNavigate = false, className = '' }: ImageSearchProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<ImageSearchResult | null>(null)
  const [selectedSearchType, setSelectedSearchType] = useState<'similar' | 'color' | 'style'>('similar')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const searchTypes = [
    { key: 'similar' as const, label: 'Similar Items', icon: Search, description: 'Find products that look similar' },
    { key: 'color' as const, label: 'Color Match', icon: Palette, description: 'Find products with similar colors' },
    { key: 'style' as const, label: 'Style Match', icon: Sparkles, description: 'Find products with similar style' }
  ]

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size should be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const imageDataUrl = e.target?.result as string
      setUploadedImage(imageDataUrl)
      performImageSearch(imageDataUrl)
    }
    reader.readAsDataURL(file)
  }

  const performImageSearch = async (imageDataUrl: string) => {
    setIsProcessing(true)
    setResults(null)

    try {
      const response = await axios.post('/ai/search-image', {
        imageUrl: imageDataUrl,
        searchType: selectedSearchType
      })

      const searchResults: ImageSearchResult = response.data.data
      setResults(searchResults)
      
      if (onResults) {
        onResults(searchResults)
      }

      if (autoNavigate && searchResults.products.length > 0) {
        const searchQuery = encodeURIComponent(searchResults.analysis.search_keywords.join(' '))
        navigate(`/search?q=${searchQuery}&type=image`)
      }

      toast.success(`Found ${searchResults.totalFound} similar products`)

    } catch (error) {
      console.error('Image search error:', error)
      toast.error('Image search failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const clearImage = () => {
    setUploadedImage(null)
    setResults(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const triggerCameraInput = () => {
    cameraInputRef.current?.click()
  }

  const retryWithDifferentType = (newType: 'similar' | 'color' | 'style') => {
    setSelectedSearchType(newType)
    if (uploadedImage) {
      performImageSearch(uploadedImage)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ImageIcon className="h-5 w-5 mr-2" />
          Visual Fashion Search
        </CardTitle>
        <p className="text-sm text-gray-600">
          Upload or take a photo to find similar fashion items
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Search Type Selection */}
        <div>
          <h4 className="font-semibold text-sm mb-3">Search Type</h4>
          <div className="grid grid-cols-3 gap-2">
            {searchTypes.map((type) => (
              <Button
                key={type.key}
                variant={selectedSearchType === type.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSearchType(type.key)}
                className="flex flex-col items-center py-3 h-auto"
              >
                <type.icon className="h-4 w-4 mb-1" />
                <span className="text-xs">{type.label}</span>
              </Button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {searchTypes.find(t => t.key === selectedSearchType)?.description}
          </p>
        </div>

        {/* Upload Area */}
        {!uploadedImage ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-gray-400" />
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900">Upload an image</h3>
                <p className="text-gray-600">Drag and drop or click to select</p>
              </div>
              
              <div className="flex justify-center space-x-4">
                <Button onClick={triggerFileInput} variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
                <Button onClick={triggerCameraInput} variant="outline">
                  <Camera className="h-4 w-4 mr-2" />
                  Take Photo
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Uploaded Image */}
            <div className="relative">
              <img
                src={uploadedImage}
                alt="Uploaded"
                className="w-full h-64 object-cover rounded-lg"
              />
              <Button
                onClick={clearImage}
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Processing State */}
            {isProcessing && (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                <p className="text-sm text-gray-600">Analyzing image and finding similar products...</p>
              </div>
            )}

            {/* Results */}
            {results && !isProcessing && (
              <div className="space-y-6">
                {/* Image Analysis */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    Image Analysis
                  </h4>
                  
                  <div className="space-y-3">
                    {results.analysis.items.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-blue-700">Items detected:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {results.analysis.items.map((item, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {results.analysis.colors.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-blue-700">Colors:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {results.analysis.colors.map((color, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {color}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <span className="text-sm font-medium text-blue-700">Style:</span>
                      <span className="text-sm text-blue-600 ml-2">{results.analysis.style}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-blue-700">Aesthetic:</span>
                      <span className="text-sm text-blue-600 ml-2">{results.analysis.aesthetic}</span>
                    </div>
                  </div>
                </div>

                {/* Search Type Alternatives */}
                <div className="flex justify-center space-x-2">
                  {searchTypes.filter(t => t.key !== selectedSearchType).map((type) => (
                    <Button
                      key={type.key}
                      variant="outline"
                      size="sm"
                      onClick={() => retryWithDifferentType(type.key)}
                    >
                      <type.icon className="h-3 w-3 mr-1" />
                      Try {type.label}
                    </Button>
                  ))}
                </div>

                {/* Product Results */}
                {results.products.length > 0 ? (
                  <div>
                    <h4 className="font-semibold mb-3">
                      Similar Products ({results.totalFound} found)
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {results.products.slice(0, 6).map((product) => (
                        <div key={product.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                          <img
                            src={product.primaryImage}
                            alt={product.title}
                            className="w-full h-32 object-cover rounded mb-2"
                          />
                          <h5 className="font-medium text-sm truncate">{product.title}</h5>
                          <p className="text-xs text-gray-600">{product.brand.name}</p>
                          
                          {/* Color variants */}
                          {product.variants.length > 0 && (
                            <div className="flex space-x-1 mt-2">
                              {product.variants.slice(0, 4).map((variant, index) => (
                                <div
                                  key={index}
                                  className="w-4 h-4 rounded-full border border-gray-300"
                                  style={{ backgroundColor: variant.colorCode }}
                                  title={variant.color}
                                />
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-bold text-sm">{formatPrice(product.price.selling)}</span>
                            <a
                              href={`/product/${product.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {results.products.length > 6 && (
                      <div className="text-center mt-4">
                        <Button
                          variant="default"
                          onClick={() => {
                            const searchQuery = encodeURIComponent(results.analysis.search_keywords.join(' '))
                            navigate(`/search?q=${searchQuery}&type=image`)
                          }}
                        >
                          <Search className="h-4 w-4 mr-2" />
                          View All {results.totalFound} Results
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No similar products found</h3>
                    <p className="text-gray-600 mb-4">
                      Try a different search type or upload another image
                    </p>
                    <div className="flex justify-center space-x-2">
                      {searchTypes.filter(t => t.key !== selectedSearchType).map((type) => (
                        <Button
                          key={type.key}
                          variant="outline"
                          size="sm"
                          onClick={() => retryWithDifferentType(type.key)}
                        >
                          <type.icon className="h-3 w-3 mr-1" />
                          {type.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Tips */}
        <div className="border-t pt-4">
          <h4 className="font-semibold text-sm mb-2">Tips for better results:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Use clear, well-lit photos</li>
            <li>• Focus on the main fashion item</li>
            <li>• Avoid busy backgrounds</li>
            <li>• Try different search types for varied results</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
