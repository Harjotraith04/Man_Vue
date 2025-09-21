import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useProductStore } from '@/stores/productStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Star, TrendingUp, Sparkles, Headphones, Camera } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default function HomePage() {
  const { featuredProducts, fetchFeaturedProducts, isLoading } = useProductStore()

  useEffect(() => {
    fetchFeaturedProducts()
  }, [fetchFeaturedProducts])

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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-900 to-black text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Redefine Your
              <span className="block bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Style Story
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Discover premium men's fashion with AI-powered recommendations, 
              AR try-ons, and immersive shopping experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-4">
                Explore Collection
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 text-white border-white hover:bg-white hover:text-black">
                Try VR Gallery
              </Button>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-float">
          <div className="w-16 h-16 bg-blue-500 rounded-full opacity-20"></div>
        </div>
        <div className="absolute bottom-20 right-10 animate-float" style={{ animationDelay: '1s' }}>
          <div className="w-12 h-12 bg-purple-500 rounded-full opacity-20"></div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Shop by Category</h2>
            <p className="text-gray-600 text-lg">Discover your perfect style across our curated collections</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {heroCategories.map((category, index) => (
              <Link key={index} to={category.href} className="group">
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="relative h-80">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-20 transition-all duration-300"></div>
                    <div className="absolute bottom-6 left-6">
                      <h3 className="text-white text-2xl font-bold mb-2">{category.name}</h3>
                      <Button variant="secondary" size="sm">
                        Shop Now
                        <ArrowRight className="ml-2 h-4 w-4" />
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
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold mb-4">Featured Products</h2>
              <p className="text-gray-600 text-lg">Handpicked favorites from our latest collection</p>
            </div>
            <Link to="/products?featured=true">
              <Button variant="outline">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
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
                <Link key={product.id} to={`/product/${product.slug}`} className="group">
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 product-card">
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
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* AI Features */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">AI-Powered Shopping</h2>
            <p className="text-gray-600 text-lg">Experience the future of fashion retail</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-gray-600 mb-6">{feature.description}</p>
                  <Button variant="outline">
                    Try Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-12">
            <TrendingUp className="h-8 w-8 text-blue-500 mr-3" />
            <h2 className="text-4xl font-bold">Trending Now</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-all duration-200 hover:border-blue-300"
              >
                <span className="font-medium text-gray-800">{trend}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Wardrobe?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of fashion-forward men who trust ManVue for their style needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Start Shopping
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black">
              Download App
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
