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
  const { addToCart, addToWishlist } = useCartStore()
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

  const handleAddToCart = (product: any, quantity: number) => {
    addToCart(product, quantity)
  }

  const handleAddToWishlist = (product: any) => {
    addToWishlist(product)
  }

  const heroCategories = [
    {
      name: 'Formal Wear',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=600&fit=crop',
      href: '/products?subCategory=formal'
    },
    {
      name: 'Casual Wear',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&h=600&fit=crop',
      href: '/products?subCategory=casual'
    },
    {
      name: 'Ethnic Wear',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=600&fit=crop',
      href: '/products/ethnic-wear'
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white overflow-hidden">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
              Redefine Your
              <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
                Style Story
              </span>
            </h1>
            <p className="text-xl md:text-3xl text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto">
              Discover premium men's fashion with AI-powered recommendations, 
              AR try-ons, and immersive shopping experiences that redefine modern style.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" className="text-xl px-12 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
                Explore Collection
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
              <Button size="lg" variant="outline" className="text-xl px-12 py-6 text-white border-2 border-white hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105">
                Try VR Gallery
              </Button>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-float">
          <div className="w-20 h-20 bg-blue-500 rounded-full opacity-30 blur-sm"></div>
        </div>
        <div className="absolute bottom-20 right-10 animate-float" style={{ animationDelay: '1s' }}>
          <div className="w-16 h-16 bg-purple-500 rounded-full opacity-30 blur-sm"></div>
        </div>
        <div className="absolute top-1/2 left-1/4 animate-float" style={{ animationDelay: '2s' }}>
          <div className="w-12 h-12 bg-pink-500 rounded-full opacity-20 blur-sm"></div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">Shop by Category</h2>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto">Discover your perfect style across our carefully curated collections designed for the modern gentleman</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {heroCategories.map((category, index) => (
              <Link key={index} to={category.href} className="group">
                <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 rounded-2xl border-0 shadow-lg">
                  <div className="relative h-96">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/40 group-hover:via-black/10 group-hover:to-transparent transition-all duration-500"></div>
                    <div className="absolute bottom-8 left-8">
                      <h3 className="text-white text-3xl font-bold mb-4 group-hover:text-blue-300 transition-colors duration-300">{category.name}</h3>
                      <Button variant="secondary" size="lg" className="bg-white text-gray-900 hover:bg-blue-50 hover:text-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                        Shop Now
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

      {/* Featured Products */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-16">
            <div>
              <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">Featured Products</h2>
              <p className="text-gray-600 text-xl">Handpicked favorites from our latest collection, curated for the discerning gentleman</p>
            </div>
            <Link to="/products?featured=true">
              <Button variant="outline" size="lg" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                View All
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product) => (
                <div key={product.id} className="group">
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 product-card cursor-pointer">
                    <div 
                      className="relative aspect-square"
                      onClick={() => handleProductClick(product)}
                    >
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
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button 
                            size="sm" 
                            className="bg-white text-black hover:bg-gray-100 shadow-lg"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleProductClick(product)
                            }}
                          >
                            Quick View
                          </Button>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-1 group-hover:text-blue-600 transition-colors duration-200">
                        {product.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">{product.brand.name}</p>
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">
                            {product.rating.average.toFixed(1)} ({product.rating.count})
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-lg">
                          {formatPrice(product.price.selling)}
                        </span>
                        {product.discount?.isActive && (
                          <span className="text-gray-400 line-through text-sm">
                            {formatPrice(product.price.original)}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* AI Features */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">AI-Powered Shopping</h2>
            <p className="text-gray-600 text-xl max-w-3xl mx-auto">Experience the future of fashion retail with cutting-edge AI technology that understands your style preferences</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-10 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 rounded-2xl border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                    <feature.icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-6 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 mb-8 text-lg leading-relaxed">{feature.description}</p>
                  <Button variant="outline" size="lg" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    Try Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-16">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">Trending Now</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
                className="bg-white border-2 border-gray-200 rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:border-blue-300 hover:-translate-y-2 group"
              >
                <span className="font-semibold text-gray-800 group-hover:text-blue-600 text-lg transition-colors duration-300">{trend}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-6xl font-bold mb-6">Ready to Transform Your Wardrobe?</h2>
          <p className="text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Join thousands of fashion-forward men who trust ManVue for their style needs and discover a new level of sophistication
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button size="lg" className="text-xl px-12 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
              Start Shopping
            </Button>
            <Button size="lg" variant="outline" className="text-xl px-12 py-6 border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105">
              Download App
            </Button>
          </div>
        </div>
        
        {/* Background Elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full opacity-10 animate-float"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-purple-500 rounded-full opacity-10 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-pink-500 rounded-full opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>
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
