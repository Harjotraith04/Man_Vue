import React, { useState } from 'react'
import { X, Star, Heart, ShoppingBag, Minus, Plus, Share2, Truck, Shield, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'

interface ProductDetailModalProps {
  product: any
  isOpen: boolean
  onClose: () => void
  onAddToCart: (product: any, quantity: number) => void
  onAddToWishlist: (product: any) => void
}

export default function ProductDetailModal({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart, 
  onAddToWishlist 
}: ProductDetailModalProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)

  if (!isOpen || !product) return null

  const images = product.images || [product.primaryImage]
  const sizes = product.sizes || ['S', 'M', 'L', 'XL', 'XXL']
  const colors = product.colors || ['Black', 'White', 'Blue', 'Gray']

  const handleAddToCart = () => {
    onAddToCart(product, quantity)
    onClose()
  }

  const handleAddToWishlist = () => {
    onAddToWishlist(product)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row max-h-[calc(90vh-80px)] overflow-hidden">
          {/* Image Gallery */}
          <div className="lg:w-1/2 p-6">
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                <img
                  src={images[selectedImage] || product.primaryImage}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
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
          </div>

          {/* Product Details */}
          <div className="lg:w-1/2 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Title and Brand */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
                <p className="text-lg text-gray-600 mb-4">{product.brand?.name}</p>
                
                {/* Rating */}
                <div className="flex items-center space-x-2 mb-4">
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
                  <span className="text-sm text-gray-600">
                    {product.rating?.average?.toFixed(1) || '0.0'} ({product.rating?.count || 0} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center space-x-4 mb-6">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(product.price?.selling || 0)}
                  </span>
                  {product.discount?.isActive && (
                    <>
                      <span className="text-xl text-gray-400 line-through">
                        {formatPrice(product.price?.original || 0)}
                      </span>
                      <Badge variant="destructive" className="text-sm">
                        {product.discount.percentage}% OFF
                      </Badge>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {product.description || product.shortDescription || 'No description available.'}
                </p>
              </div>

              {/* Size Selection */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded-lg font-medium transition-all duration-200 ${
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
                <h3 className="text-lg font-semibold mb-3">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border rounded-lg font-medium transition-all duration-200 ${
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
                <h3 className="text-lg font-semibold mb-3">Quantity</h3>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-10 w-10"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-10 w-10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Truck className="h-5 w-5 text-blue-500" />
                  <span>Free Shipping</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <RotateCcw className="h-5 w-5 text-purple-500" />
                  <span>Easy Returns</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={product.inventory?.totalStock === 0}
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  {product.inventory?.totalStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleAddToWishlist}
                  className="px-6 py-3 rounded-xl border-2 border-gray-300 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Wishlist
                </Button>
                <Button
                  variant="outline"
                  className="px-6 py-3 rounded-xl border-2 border-gray-300 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
