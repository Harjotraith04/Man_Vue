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
  const { fetchProduct, currentProduct, isLoadingProduct, addToWishlist, removeFromWishlist } = useProductStore()
  const { addItem } = useCartStore()
  
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (slug) {
      fetchProduct(slug)
    }
  }, [slug, fetchProduct])

  useEffect(() => {
    if (currentProduct) {
      // Set default selections
      if (currentProduct.variants && currentProduct.variants.length > 0) {
        const defaultVariant = currentProduct.variants[0]
        setSelectedColor(defaultVariant.color)
        if (defaultVariant.sizes && defaultVariant.sizes.length > 0) {
          setSelectedSize(defaultVariant.sizes[0].size)
        }
      }
    }
  }, [currentProduct])

  if (isLoadingProduct) {
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

  if (!currentProduct) {
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

  const product = currentProduct
  const images = product.variants?.[0]?.images || [{ url: product.primaryImage, alt: product.title }]
  const sizes = product?.variants?.[0]?.sizes?.map(s => s.size) || ['S', 'M', 'L', 'XL', 'XXL']
  const colors = product?.variants?.map(v => v.color) || ['Default', 'Black', 'White', 'Blue', 'Gray']

  const handleAddToCart = () => {
    const defaultSize = sizes[0] || 'S'
    const defaultColor = colors[0] || 'Default'
    addItem(product._id || product.id, quantity, selectedSize || defaultSize, selectedColor || defaultColor)
  }

  const handleAddToWishlist = () => {
    addToWishlist(product._id || product.id)
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-blue-400">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-blue-400">Products</Link>
          <span>/</span>
          <span className="text-white">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-gray-800 rounded-2xl overflow-hidden border border-gray-700">
              <img
                src={images[selectedImage]?.url || product.primaryImage || '/placeholder-product.jpg'}
                alt={product.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-product.jpg';
                }}
              />
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto">
                {images.map((image: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 ${
                      selectedImage === index ? 'border-blue-500' : 'border-gray-600'
                    }`}
                  >
                    <img
                      src={image?.url || image}
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
              <h1 className="text-4xl font-bold text-white mb-3">{product.title}</h1>
              <p className="text-xl text-gray-400 mb-4">{product.brand?.name || 'ManVue'}</p>
            
              {/* Rating */}
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating?.average || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-400">
                  {product.rating?.average?.toFixed(1) || '0.0'} ({product.rating?.count || 0} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-4xl font-bold text-green-400">
                  {formatPrice(product.price?.selling || 0)}
                </span>
                {product.discount?.isActive && (
                  <>
                    <span className="text-2xl text-gray-500 line-through">
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
              <h3 className="text-xl font-semibold mb-4 text-white">Description</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                {product.description || product.shortDescription || 'No description available.'}
              </p>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-white">Size</h3>
              <div className="flex flex-wrap gap-3">
                {sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-6 py-3 border-2 rounded-xl font-medium transition-all duration-200 ${
                      selectedSize === size
                        ? 'border-blue-500 bg-blue-900 text-blue-300'
                        : 'border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white bg-gray-800'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-white">Color</h3>
              <div className="flex flex-wrap gap-3">
                {colors.map((color: string) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-6 py-3 border-2 rounded-xl font-medium transition-all duration-200 ${
                      selectedColor === color
                        ? 'border-blue-500 bg-blue-900 text-blue-300'
                        : 'border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white bg-gray-800'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-white">Quantity</h3>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-12 w-12"
              >
                <Minus className="h-5 w-5" />
              </Button>
              <span className="text-2xl font-medium w-16 text-center text-white">{quantity}</span>
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
              <div className="flex items-center space-x-3 text-gray-300">
                <Truck className="h-6 w-6 text-blue-400" />
                <div>
                  <p className="font-medium text-white">Free Shipping</p>
                  <p className="text-sm">On orders over £50</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Shield className="h-6 w-6 text-green-400" />
                <div>
                  <p className="font-medium text-white">Secure Payment</p>
                  <p className="text-sm">100% secure checkout</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <RotateCcw className="h-6 w-6 text-purple-400" />
                <div>
                  <p className="font-medium text-white">Easy Returns</p>
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
                className="px-8 py-4 rounded-xl border-2 border-gray-600 hover:border-red-400 hover:bg-red-900 hover:text-red-300 transition-all duration-200 text-gray-300"
              >
                <Heart className="h-6 w-6 mr-3" />
                Wishlist
              </Button>
              <Button
                variant="outline"
                className="px-8 py-4 rounded-xl border-2 border-gray-600 hover:border-blue-400 hover:bg-blue-900 hover:text-blue-300 transition-all duration-200 text-gray-300"
              >
                <Share2 className="h-6 w-6" />
              </Button>
            </div>

            {/* Back Button */}
            <div className="pt-6">
              <Link to="/products">
                <Button variant="outline" className="flex items-center border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
