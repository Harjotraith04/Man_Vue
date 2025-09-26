import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProductStore } from '@/stores/productStore'
import { useCartStore } from '@/stores/cartStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import ProductDetailModal from '@/components/ui/ProductDetailModal'
import { ArrowRight, Star, TrendingUp, Sparkles, Headphones, Camera } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default function HomePage() {
  const { featuredProducts, fetchFeaturedProducts, isLoading } = useProductStore()
  const { addItem: addToCart } = useCartStore()
  const { addToWishlist } = useProductStore()
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchFeaturedProducts()
  }, [fetchFeaturedProducts])

  const handleProductClick = (product: any) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  const handleAddToCart = (product: any, quantity: number, size?: string, color?: string) => {
    const defaultSize = product?.variants?.[0]?.sizes?.[0]?.size || 'S'
    const defaultColor = product?.variants?.[0]?.color || 'Default'
    addToCart(product._id || product.id, quantity, size || defaultSize, color || defaultColor)
  }

  const handleAddToWishlist = (productId: string) => {
    addToWishlist(productId)
  }

  const heroCategories = [
    {
      name: 'Formal Wear',
      description: 'Professional formal shirts for business occasions',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=600&fit=crop',
      href: '/products?category=formal',
      count: '9 Products'
    },
    {
      name: 'Casual Shirts',
      description: 'Comfortable shirts for everyday wear',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&h=600&fit=crop',
      href: '/products?category=shirts',
      count: '10 Products'
    },
    {
      name: 'Jeans & T-Shirts',
      description: 'Casual essentials for everyday comfort',
      image: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=500&h=600&fit=crop',
      href: '/products?category=jeans',
      count: '20 Products'
    },
    {
      name: 'Ethnic Kurtas',
      description: 'Traditional wear for festive occasions',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=600&fit=crop',
      href: '/products?category=kurtas',
      count: '10 Products'
    },
    {
      name: 'Shoes & Accessories',
      description: 'Complete your look with perfect finishing touches',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=600&fit=crop',
      href: '/products?category=shoes',
      count: '20 Products'
    }
  ]

  const features = [
    {
      icon: Sparkles,
      title: 'AI Style Advisor',
      description: 'Get personalized fashion recommendations powered by AI',
      href: '/ai-advisor'
    },
    {
      icon: Headphones,
      title: 'Voice Shopping',
      description: 'Shop with voice commands for a hands-free experience',
      href: '/voice-search'
    },
    {
      icon: Camera,
      title: 'Visual Search',
      description: 'Upload photos to find similar fashion items instantly',
      href: '/image-search'
    }
  ]

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-black via-gray-900 to-blue-900 text-white overflow-hidden min-h-screen flex items-center justify-center">
        {/* Optimized Particle System */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="particle opacity-20 gpu-accelerated"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${10 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>

        {/* Subtle Matrix Background */}
        <div className="absolute inset-0 matrix-bg opacity-15" />
        
        <div className="container mx-auto px-4 pb-16 relative z-10 -mt-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight animate-slide-in-glow">
              <span className="block holographic glitch-effect">Redefine Your</span>
              <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-bounce-glow neon-border p-4 rounded-2xl">
                Style Story
              </span>
            </h1>
            <p className="text-xl md:text-3xl text-gray-300 mb-12 leading-relaxed max-w-4xl mx-auto animate-fade-in-up">
              🚀 Discover premium men's fashion with AI-powered recommendations, 
              AR try-ons, and immersive shopping experiences that redefine modern style.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/products">
                <Button size="lg" className="text-xl px-12 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-110 morph-button neon-border animate-bounce-glow rounded-2xl">
                  🛍️ Explore Collection
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
              <Link to="/vr-gallery">
                <Button size="lg" variant="outline" className="text-xl px-12 py-6 text-white border-4 border-purple-400 hover:bg-purple-600 hover:text-white transition-all duration-300 transform hover:scale-110 morph-button hover-neon-purple rounded-2xl">
                  🥽 Try VR Gallery
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Enhanced Floating Elements */}
        <div className="absolute top-20 left-10 animate-bounce-glow">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-50 blur-sm liquid-shape"></div>
        </div>
        <div className="absolute bottom-20 right-10 animate-float" style={{ animationDelay: '1s' }}>
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-50 blur-sm liquid-shape"></div>
        </div>
        <div className="absolute top-1/2 left-1/4 animate-bounce-glow" style={{ animationDelay: '2s' }}>
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full opacity-40 blur-sm liquid-shape"></div>
        </div>
        <div className="absolute top-1/3 right-1/4 animate-float" style={{ animationDelay: '3s' }}>
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full opacity-40 blur-sm liquid-shape"></div>
        </div>
        <div className="absolute bottom-1/3 left-1/3 animate-bounce-glow" style={{ animationDelay: '4s' }}>
          <div className="w-14 h-14 bg-gradient-to-r from-yellow-500 to-red-500 rounded-full opacity-40 blur-sm liquid-shape"></div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-black to-gray-800 relative">
        <div className="absolute inset-0 matrix-bg opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-6xl font-bold mb-8 holographic">Shop by Category</h2>
            <p className="text-gray-300 text-2xl max-w-3xl mx-auto">✨ Discover your perfect style across our carefully curated collections designed for the modern gentleman</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {heroCategories.map((category, index) => (
              <Link key={index} to={category.href} className="group">
                <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-6 hover:scale-105 rounded-3xl border-0 shadow-2xl gradient-dark-card hover-neon card-3d">
                  <div className="relative h-80">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-120"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-purple-900/30 to-transparent group-hover:from-blue-900/70 group-hover:via-purple-900/40 group-hover:to-transparent transition-all duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                    <div className="absolute bottom-6 left-6 right-6 animate-slide-in-glow">
                      <div className="mb-4">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold inline-block mb-3 neon-border animate-bounce-glow">
                          {category.count}
                        </div>
                      </div>
                      <h3 className="text-white text-2xl font-bold mb-3 group-hover:holographic transition-all duration-300">{category.name}</h3>
                      <p className="text-gray-200 text-sm mb-6 opacity-90">{category.description}</p>
                      <Button variant="secondary" size="sm" className="bg-gradient-to-r from-white to-gray-100 text-gray-900 hover:from-blue-100 hover:to-purple-100 hover:text-blue-600 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform group-hover:scale-110 morph-button rounded-xl">
                        🛍️ Shop Now
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Browse All Categories */}
      <section className="py-20 bg-gradient-to-br from-gray-800 via-purple-900 to-blue-900 relative overflow-hidden">
        <div className="absolute inset-0 matrix-bg opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-6xl font-bold mb-8 holographic">Browse All Collections</h2>
            <p className="text-gray-200 text-2xl max-w-4xl mx-auto">🚀 Explore our complete range of men's fashion with 69 premium products across 7 distinct categories</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {[
              { name: 'Formal', category: 'formal', emoji: '👔', count: '9' },
              { name: 'Shirts', category: 'shirts', emoji: '👕', count: '10' },
              { name: 'T-Shirts', category: 'tshirts', emoji: '🎽', count: '10' },
              { name: 'Jeans', category: 'jeans', emoji: '👖', count: '10' },
              { name: 'Kurtas', category: 'kurtas', emoji: '🥻', count: '10' },
              { name: 'Shoes', category: 'shoes', emoji: '👞', count: '10' },
              { name: 'Accessories', category: 'accessories', emoji: '⌚', count: '10' },
              { name: 'All', category: 'all', emoji: '🛍️', count: '69' }
            ].map((item, index) => (
              <Link
                key={index}
                to={item.category === 'all' ? '/products' : `/products?category=${item.category}`}
                className="group animate-slide-in-glow"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Card className="text-center p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:scale-110 gradient-dark-card backdrop-blur-md border-0 shadow-2xl hover-neon card-3d rounded-2xl">
                  <CardContent className="p-0">
                    <div className="text-5xl mb-4 animate-bounce-glow">{item.emoji}</div>
                    <h3 className="font-bold text-xl mb-4 text-white group-hover:holographic transition-all duration-300">{item.name}</h3>
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold inline-block neon-border animate-pulse">
                      {item.count} Items
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gradient-to-br from-black via-gray-900 to-purple-900 relative">
        <div className="absolute inset-0 matrix-bg opacity-15" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between mb-16 gap-8">
            <div className="animate-fade-in-up">
              <h2 className="text-6xl font-bold mb-8 holographic">Featured Products</h2>
              <p className="text-gray-200 text-2xl">🎯 Handpicked favorites from our imported Kaggle collection, featuring real product images</p>
            </div>
            <Link to="/products?featured=true" className="animate-slide-in-glow">
              <Button variant="outline" size="lg" className="border-4 border-blue-400 text-blue-400 hover:bg-blue-600 hover:text-white px-12 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-110 morph-button neon-border">
                🌟 View All Featured
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="text-center py-12 mb-8">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-gray-300 text-xl">🔥 Loading featured products...</p>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mt-8">
                {[...Array(10)].map((_, index) => (
                  <div key={index} className="gradient-dark-card rounded-2xl p-4">
                    <div className="skeleton aspect-square rounded-2xl mb-6"></div>
                    <div className="h-4 skeleton rounded-lg mb-3"></div>
                    <div className="h-4 skeleton rounded-lg w-2/3 mb-2"></div>
                    <div className="h-6 skeleton rounded-lg w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
              {featuredProducts.slice(0, 10).map((product, index) => (
                <div key={product.id} className="group animate-slide-in-glow will-change-transform" style={{ animationDelay: `${index * 0.05}s` }}>
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 product-card cursor-pointer rounded-2xl gradient-dark-card hover-neon transform hover:scale-105 hover:-translate-y-3 gpu-accelerated">
                    <div 
                      className="relative aspect-square"
                      onClick={() => handleProductClick(product)}
                    >
                      <img
                        src={product.primaryImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop'}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 rounded-t-2xl"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop';
                        }}
                      />
                      {product.discount?.isActive && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-2 rounded-full text-xs font-bold shadow-2xl neon-border animate-bounce-glow">
                          🔥 -{product.discount.percentage}%
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <div className="bg-gradient-to-r from-blue-500/90 to-purple-500/90 text-white px-3 py-2 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm">
                          {product.category}
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button 
                            size="sm" 
                            className="bg-gradient-to-r from-white to-gray-100 text-black hover:from-blue-100 hover:to-purple-100 hover:text-blue-600 shadow-2xl rounded-xl morph-button transform hover:scale-110"
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
                    <CardContent className="p-6 bg-gradient-to-b from-gray-800/90 to-gray-900/90">
                      <div className="mb-3">
                        <span className="text-xs text-blue-400 font-bold bg-blue-500/20 px-3 py-1 rounded-full border border-blue-400/30">
                          {product.brand?.name || 'ManVue'}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg mb-3 text-white group-hover:holographic transition-all duration-300 line-clamp-2">
                        {product.title}
                      </h3>
                      <div className="flex items-center mb-4">
                        <div className="flex items-center">
                          <Star className="h-5 w-5 text-yellow-400 fill-current animate-bounce-glow" />
                          <span className="text-sm text-gray-300 ml-2">
                            {product.rating?.average?.toFixed(1) || '0.0'} ({product.rating?.count || 0})
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-2xl text-blue-400">
                          {formatPrice(product.price?.selling || 0)}
                        </span>
                        {product.discount?.isActive && (
                          <span className="text-gray-500 line-through text-lg">
                            {formatPrice(product.price?.original || 0)}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-16 animate-fade-in-up">
            <Link to="/products">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-16 py-6 rounded-2xl font-bold shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-110 morph-button neon-border text-2xl">
                🚀 Browse All 69 Products
                <ArrowRight className="ml-4 h-7 w-7" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="py-20 bg-gradient-to-br from-purple-900 via-blue-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 matrix-bg opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-6xl font-bold mb-8 holographic">AI-Powered Shopping</h2>
            <p className="text-gray-200 text-2xl max-w-4xl mx-auto">🤖 Experience the future of fashion retail with cutting-edge AI technology that understands your style preferences</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <div key={index} className="animate-slide-in-glow" style={{ animationDelay: `${index * 0.2}s` }}>
                <Card className="text-center p-12 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-6 hover:scale-110 rounded-3xl border-0 shadow-2xl gradient-dark-card hover-neon card-3d">
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-2xl neon-border animate-bounce-glow liquid-shape">
                      <feature.icon className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold mb-8 text-white holographic">{feature.title}</h3>
                    <p className="text-gray-300 mb-10 text-xl leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-20 bg-gradient-to-br from-black via-gray-900 to-blue-900 relative">
        <div className="absolute inset-0 matrix-bg opacity-15" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-center mb-16 animate-fade-in-up">
            <div className="flex items-center space-x-6">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl neon-border animate-bounce-glow liquid-shape">
                <TrendingUp className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-6xl font-bold holographic">Trending Now</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              'Oversized Blazers',
              'Vintage Denim',
              'Minimalist Watches',
              'Statement Sneakers',
              'Linen Shirts',
              'Cargo Pants',
              'Leather Jackets',
              'Smart Casuals'
            ].map((trend, index) => (
              <Link
                key={index}
                to={`/search?q=${encodeURIComponent(trend)}`}
                className="gradient-dark-card border-2 border-blue-500/30 rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-500 hover:border-blue-400 hover:-translate-y-4 hover:scale-105 group hover-neon card-3d animate-slide-in-glow"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="font-bold text-white group-hover:holographic text-xl transition-all duration-300">
                  ✨ {trend}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-br from-black via-purple-900 to-blue-900 text-white relative overflow-hidden">
        {/* Optimized Particle System */}
        <div className="absolute inset-0">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="particle opacity-30 gpu-accelerated"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${12 + Math.random() * 8}s`,
              }}
            />
          ))}
        </div>
        <div className="absolute inset-0 matrix-bg opacity-20" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-8xl font-bold mb-10 holographic glitch-effect animate-bounce-glow">Ready to Transform Your Wardrobe?</h2>
          <p className="text-3xl text-gray-200 mb-16 max-w-5xl mx-auto animate-fade-in-up">
            🚀 Join thousands of fashion-forward men who trust ManVue for their style needs and discover a new level of sophistication with cutting-edge technology
          </p>
          <div className="flex flex-col sm:flex-row gap-10 justify-center">
            <Link to="/products">
              <Button size="lg" className="text-3xl px-20 py-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-110 morph-button neon-border rounded-2xl animate-bounce-glow">
                🛍️ Start Shopping
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-3xl px-20 py-8 border-4 border-white text-white hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-110 morph-button hover-neon-purple rounded-2xl">
              📱 Download App
            </Button>
          </div>
        </div>
        
        {/* Enhanced Background Elements */}
        <div className="absolute top-10 left-10 w-40 h-40 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 animate-bounce-glow liquid-shape"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 animate-float liquid-shape" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full opacity-20 animate-bounce-glow liquid-shape" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/4 right-1/4 w-28 h-28 bg-gradient-to-r from-green-500 to-blue-500 rounded-full opacity-20 animate-float liquid-shape" style={{ animationDelay: '3s' }}></div>
        <div className="absolute bottom-1/4 left-1/4 w-36 h-36 bg-gradient-to-r from-yellow-500 to-red-500 rounded-full opacity-20 animate-bounce-glow liquid-shape" style={{ animationDelay: '4s' }}></div>
      </section>

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
