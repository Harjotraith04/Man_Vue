import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProductStore } from '@/stores/productStore'
import { useCartStore } from '@/stores/cartStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Heart, ShoppingBag, Minus, Plus, Share2, Truck, Shield, RotateCcw, ArrowLeft, Check } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const { fetchProduct, addToWishlist } = useProductStore()
  const { addItem: addToCart } = useCartStore()
  
  const [product, setProduct] = useState<any>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (slug) {
      const loadProduct = async () => {
        try {
          setIsLoading(true)
          await fetchProduct(slug)
          // Get the product from the store after fetching
          const { currentProduct } = useProductStore.getState()
          setProduct(currentProduct)
        } catch (error) {
          console.error('Error fetching product:', error)
        } finally {
          setIsLoading(false)
        }
      }
      loadProduct()
    }
  }, [slug, fetchProduct])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="aspect-square bg-gray-200 rounded-xl"></div>
              <div className="flex space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
        <Link to="/products">
          <Button>Back to Products</Button>
        </Link>
      </div>
    )
  }

  // Extract data from product variants
  const images = product?.variants?.[0]?.images?.map(img => img.url) || [product?.primaryImage]
  const sizes = product?.variants?.[0]?.sizes?.map(s => s.size) || ['S', 'M', 'L', 'XL', 'XXL']
  const colors = product?.variants?.map(v => v.color) || ['Default']

  // Set default values when product loads
  useEffect(() => {
    if (product && sizes.length > 0 && colors.length > 0) {
      setSelectedSize(sizes[0])
      setSelectedColor(colors[0])
    }
  }, [product, sizes, colors])

  const handleAddToCart = () => {
    const size = selectedSize || sizes[0]
    const color = selectedColor || colors[0]
    addToCart(product._id, quantity, size, color)
  }

  const handleAddToWishlist = () => {
    addToWishlist(product)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-blue-600">Products</Link>
        <span>/</span>
        <span className="text-gray-900">{product.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
            <img
              src={images[selectedImage] || product.primaryImage}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnail Images */}
          {images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto">
              {images.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 ${
                    selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-8">
          {/* Title and Brand */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">{product.title}</h1>
            <p className="text-xl text-gray-600 mb-4">{product.brand?.name}</p>
            
            {/* Rating */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating?.average || 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600">
                {product.rating?.average?.toFixed(1) || '0.0'} ({product.rating?.count || 0} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4 mb-6">
              <span className="text-4xl font-bold text-gray-900">
                {formatPrice(product.price?.selling || 0)}
              </span>
              {product.discount?.isActive && (
                <>
                  <span className="text-2xl text-gray-400 line-through">
                    {formatPrice(product.price?.original || 0)}
                  </span>
                  <Badge variant="destructive" className="text-lg px-3 py-1">
                    {product.discount.percentage}% OFF
                  </Badge>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Description</h3>
            <p className="text-gray-700 leading-relaxed text-lg">
              {product.description || product.shortDescription || 'No description available.'}
            </p>
          </div>

          {/* Size Selection */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Size</h3>
            <div className="flex flex-wrap gap-3">
              {sizes.map((size: string) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-6 py-3 border-2 rounded-xl font-medium transition-all duration-200 ${
                    selectedSize === size
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Color</h3>
            <div className="flex flex-wrap gap-3">
              {colors.map((color: string) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-6 py-3 border-2 rounded-xl font-medium transition-all duration-200 ${
                    selectedColor === color
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Quantity</h3>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-12 w-12"
              >
                <Minus className="h-5 w-5" />
              </Button>
              <span className="text-2xl font-medium w-16 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                className="h-12 w-12"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3 text-gray-600">
              <Truck className="h-6 w-6 text-blue-500" />
              <div>
                <p className="font-medium">Free Shipping</p>
                <p className="text-sm">On orders over £50</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-gray-600">
              <Shield className="h-6 w-6 text-green-500" />
              <div>
                <p className="font-medium">Secure Payment</p>
                <p className="text-sm">100% secure checkout</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-gray-600">
              <RotateCcw className="h-6 w-6 text-purple-500" />
              <div>
                <p className="font-medium">Easy Returns</p>
                <p className="text-sm">30-day return policy</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button
              onClick={handleAddToCart}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={product.inventory?.totalStock === 0}
            >
              <ShoppingBag className="h-6 w-6 mr-3" />
              {product.inventory?.totalStock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
            <Button
              variant="outline"
              onClick={handleAddToWishlist}
              className="px-8 py-4 rounded-xl border-2 border-gray-300 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
            >
              <Heart className="h-6 w-6 mr-3" />
              Wishlist
            </Button>
            <Button
              variant="outline"
              className="px-8 py-4 rounded-xl border-2 border-gray-300 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
            >
              <Share2 className="h-6 w-6" />
            </Button>
          </div>

          {/* Back Button */}
          <div className="pt-6">
            <Link to="/products">
              <Button variant="outline" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
