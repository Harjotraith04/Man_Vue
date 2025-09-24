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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      {/* Particle Background in Modal */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="particle opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <div className="gradient-dark-card rounded-3xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden border border-blue-500/20 hover-neon backdrop-blur-md animate-slide-in-glow">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-blue-500/20 bg-gradient-to-r from-gray-900/90 to-purple-900/50">
          <h2 className="text-4xl font-bold holographic">Product Details</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-12 w-12 hover:bg-red-600/30 rounded-full hover-neon morph-button"
          >
            <X className="h-6 w-6 text-red-400" />
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row max-h-[calc(95vh-120px)] overflow-hidden">
          {/* Image Gallery */}
          <div className="lg:w-1/2 p-8">
            <div className="space-y-6">
              {/* Main Image */}
              <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl overflow-hidden hover-neon border border-blue-500/20 shadow-2xl">
                <img
                  src={images[selectedImage] || product.primaryImage}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop';
                  }}
                />
              </div>

              {/* Thumbnail Images */}
              {images.length > 1 ? (
                <div className="flex space-x-4 overflow-x-auto pb-2">
                  {images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:scale-110 ${
                        selectedImage === index 
                          ? 'border-blue-400 shadow-lg shadow-blue-500/50 neon-border' 
                          : 'border-gray-600 hover:border-blue-500/50'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop';
                        }}
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex space-x-4 overflow-x-auto pb-2">
                  {/* Create multiple views of the same image for better gallery effect */}
                  {[0, 1, 2, 3].map((index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:scale-110 ${
                        selectedImage === index 
                          ? 'border-blue-400 shadow-lg shadow-blue-500/50 neon-border' 
                          : 'border-gray-600 hover:border-blue-500/50'
                      }`}
                    >
                      <img
                        src={product.primaryImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop'}
                        alt={`${product.title} view ${index + 1}`}
                        className="w-full h-full object-cover"
                        style={{
                          filter: index === 0 ? 'none' : index === 1 ? 'sepia(0.3)' : index === 2 ? 'contrast(1.2)' : 'brightness(1.1)'
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="lg:w-1/2 p-8 overflow-y-auto bg-gradient-to-b from-gray-900/50 to-black/50">
            <div className="space-y-8">
              {/* Title and Brand */}
              <div className="animate-fade-in-up">
                <h1 className="text-4xl font-bold text-white mb-4 holographic">{product.title}</h1>
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 px-4 py-2 rounded-xl inline-block mb-6">
                  <p className="text-lg text-blue-300 font-bold">{product.brand?.name || 'ManVue'}</p>
                </div>
                
                {/* Rating */}
                <div className="flex items-center space-x-3 mb-6">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-6 w-6 ${
                          i < Math.floor(product.rating?.average || 0)
                            ? 'text-yellow-400 fill-current animate-bounce-glow'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg text-gray-300 font-medium">
                    {product.rating?.average?.toFixed(1) || '0.0'} ({product.rating?.count || 0} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center space-x-6 mb-8">
                  <span className="text-5xl font-bold text-blue-400 animate-bounce-glow">
                    {formatPrice(product.price?.selling || 0)}
                  </span>
                  {product.discount?.isActive && (
                    <>
                      <span className="text-2xl text-gray-500 line-through">
                        {formatPrice(product.price?.original || 0)}
                      </span>
                      <Badge variant="destructive" className="text-lg px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 border-0 neon-border animate-pulse">
                        🔥 {product.discount.percentage}% OFF
                      </Badge>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="animate-slide-in-glow">
                <h3 className="text-2xl font-bold mb-4 text-blue-300">📝 Description</h3>
                <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-600/30 rounded-2xl p-6 backdrop-blur-sm">
                  <p className="text-gray-200 leading-relaxed text-lg">
                    {product.description || product.shortDescription || '✨ Premium quality product from our exclusive collection. Crafted with attention to detail and modern design aesthetics.'}
                  </p>
                </div>
              </div>

              {/* Size Selection */}
              <div className="animate-fade-in-up">
                <h3 className="text-2xl font-bold mb-4 text-purple-300">📏 Size</h3>
                <div className="flex flex-wrap gap-3">
                  {sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-3 border-2 rounded-2xl font-bold transition-all duration-300 transform hover:scale-110 ${
                        selectedSize === size
                          ? 'border-blue-400 bg-blue-500/20 text-blue-300 neon-border animate-bounce-glow'
                          : 'border-gray-600 text-gray-300 hover:border-blue-500/50 hover:bg-blue-500/10'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="animate-slide-in-glow">
                <h3 className="text-2xl font-bold mb-4 text-pink-300">🎨 Color</h3>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-6 py-3 border-2 rounded-2xl font-bold transition-all duration-300 transform hover:scale-110 ${
                        selectedColor === color
                          ? 'border-pink-400 bg-pink-500/20 text-pink-300 neon-border animate-bounce-glow'
                          : 'border-gray-600 text-gray-300 hover:border-pink-500/50 hover:bg-pink-500/10'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="animate-fade-in-up">
                <h3 className="text-2xl font-bold mb-4 text-green-300">🔢 Quantity</h3>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-12 w-12 border-2 border-red-500/50 text-red-400 hover:bg-red-500/20 hover:border-red-400 rounded-2xl morph-button hover-neon"
                  >
                    <Minus className="h-5 w-5" />
                  </Button>
                  <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-2 border-green-500/50 rounded-2xl px-8 py-3 neon-border">
                    <span className="text-2xl font-bold text-green-300 w-16 text-center block">{quantity}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-12 w-12 border-2 border-green-500/50 text-green-400 hover:bg-green-500/20 hover:border-green-400 rounded-2xl morph-button hover-neon"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-slide-in-glow">
                <div className="flex items-center space-x-3 text-lg text-gray-300 bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-2xl p-4 hover-neon">
                  <div className="bg-blue-500 p-2 rounded-xl animate-bounce-glow">
                    <Truck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-blue-300">🚚 Free Shipping</p>
                    <p className="text-sm text-gray-400">On orders above £50</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-lg text-gray-300 bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/30 rounded-2xl p-4 hover-neon">
                  <div className="bg-green-500 p-2 rounded-xl animate-bounce-glow">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-green-300">🔒 Secure Payment</p>
                    <p className="text-sm text-gray-400">100% protected</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-lg text-gray-300 bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-2xl p-4 hover-neon">
                  <div className="bg-purple-500 p-2 rounded-xl animate-bounce-glow">
                    <RotateCcw className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-purple-300">🔄 Easy Returns</p>
                    <p className="text-sm text-gray-400">30-day policy</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 pt-8">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-8 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105 morph-button neon-border"
                  disabled={product.inventory?.totalStock === 0}
                >
                  <ShoppingBag className="h-6 w-6 mr-3" />
                  {product.inventory?.totalStock === 0 ? '❌ Out of Stock' : '🛒 Add to Cart'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleAddToWishlist}
                  className="px-8 py-4 rounded-2xl border-2 border-red-400 text-red-400 hover:bg-red-500/20 hover:border-red-300 hover:text-red-300 transition-all duration-300 font-bold transform hover:scale-105 morph-button hover-neon-purple"
                >
                  <Heart className="h-6 w-6 mr-3" />
                  💝 Wishlist
                </Button>
                <Button
                  variant="outline"
                  className="px-8 py-4 rounded-2xl border-2 border-blue-400 text-blue-400 hover:bg-blue-500/20 hover:border-blue-300 hover:text-blue-300 transition-all duration-300 font-bold transform hover:scale-105 morph-button hover-neon"
                >
                  <Share2 className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
