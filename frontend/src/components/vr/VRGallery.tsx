import React, { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Environment, Text, Box, Plane } from '@react-three/drei'
import { TextureLoader, Vector3 } from 'three'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Headphones, 
  Maximize2, 
  RotateCcw, 
  Settings, 
  Eye,
  Navigation,
  Zap,
  ShoppingBag
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface Product {
  id: string
  title: string
  price: { selling: number }
  primaryImage: string
  slug: string
  category: string
}

interface VRGalleryProps {
  products?: Product[]
  className?: string
}

// Product Display Component for VR
function ProductDisplay({ product, position }: { product: Product; position: [number, number, number] }) {
  const meshRef = useRef<any>()
  const [hovered, setHovered] = useState(false)
  const texture = useLoader(TextureLoader, product.primaryImage)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = hovered ? Math.sin(state.clock.elapsedTime) * 0.1 : 0
    }
  })

  return (
    <group position={position}>
      {/* Product Image Plane */}
      <Plane
        ref={meshRef}
        args={[2, 2.5]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => window.open(`/product/${product.slug}`, '_blank')}
      >
        <meshStandardMaterial map={texture} />
      </Plane>
      
      {/* Product Info */}
      <Text
        position={[0, -1.8, 0.1]}
        fontSize={0.2}
        color="#333"
        anchorX="center"
        anchorY="middle"
        maxWidth={2}
      >
        {product.title}
      </Text>
      
      <Text
        position={[0, -2.2, 0.1]}
        fontSize={0.15}
        color="#666"
        anchorX="center"
        anchorY="middle"
      >
        {formatPrice(product.price.selling)}
      </Text>

      {/* Interaction Glow */}
      {hovered && (
        <Box args={[2.2, 2.7, 0.1]} position={[0, 0, -0.1]}>
          <meshStandardMaterial
            color="#4f46e5"
            transparent
            opacity={0.2}
            emissive="#4f46e5"
            emissiveIntensity={0.3}
          />
        </Box>
      )}
    </group>
  )
}

// Room Environment Component
function VRRoom({ products }: { products: Product[] }) {
  return (
    <>
      {/* Floor */}
      <Plane args={[20, 20]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
        <meshStandardMaterial color="#f5f5f5" />
      </Plane>

      {/* Walls */}
      <Plane args={[20, 10]} position={[0, 2, -10]}>
        <meshStandardMaterial color="#ffffff" />
      </Plane>
      
      <Plane args={[20, 10]} rotation={[0, Math.PI / 2, 0]} position={[-10, 2, 0]}>
        <meshStandardMaterial color="#fafafa" />
      </Plane>
      
      <Plane args={[20, 10]} rotation={[0, -Math.PI / 2, 0]} position={[10, 2, 0]}>
        <meshStandardMaterial color="#fafafa" />
      </Plane>

      {/* Welcome Text */}
      <Text
        position={[0, 4, -9]}
        fontSize={0.5}
        color="#1f2937"
        anchorX="center"
        anchorY="middle"
      >
        Welcome to ManVue VR Gallery
      </Text>

      <Text
        position={[0, 3.2, -9]}
        fontSize={0.2}
        color="#6b7280"
        anchorX="center"
        anchorY="middle"
        maxWidth={10}
      >
        Explore our latest men's fashion collection in virtual reality
      </Text>

      {/* Product Displays */}
      {products.slice(0, 12).map((product, index) => {
        const angle = (index / 12) * Math.PI * 2
        const radius = 6
        const x = Math.sin(angle) * radius
        const z = Math.cos(angle) * radius
        return (
          <ProductDisplay
            key={product.id}
            product={product}
            position={[x, 0, z]}
          />
        )
      })}

      {/* Directional Arrows */}
      {[0, 1, 2, 3].map((i) => (
        <Text
          key={i}
          position={[
            Math.sin((i / 4) * Math.PI * 2) * 8,
            -1,
            Math.cos((i / 4) * Math.PI * 2) * 8
          ]}
          fontSize={0.3}
          color="#4f46e5"
          anchorX="center"
          anchorY="middle"
          rotation={[0, -(i / 4) * Math.PI * 2, 0]}
        >
          ↑
        </Text>
      ))}
    </>
  )
}

export default function VRGallery({ products = [], className = '' }: VRGalleryProps) {
  const [isVRSupported, setIsVRSupported] = useState(false)
  const [isVRActive, setIsVRActive] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    // Check for WebXR support
    if ('xr' in navigator) {
      navigator.xr?.isSessionSupported('immersive-vr').then((supported) => {
        setIsVRSupported(supported)
      })
    }
  }, [])

  const categories = ['all', 'shirts', 'jeans', 'jackets', 'shoes', 'accessories']
  
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory)

  const startVRSession = async () => {
    if (isVRSupported && 'xr' in navigator) {
      try {
        const session = await navigator.xr?.requestSession('immersive-vr')
        setIsVRActive(true)
        session?.addEventListener('end', () => setIsVRActive(false))
      } catch (error) {
        console.error('Failed to start VR session:', error)
      }
    }
  }

  // Fallback sample products if none provided
  const sampleProducts: Product[] = [
    {
      id: '1',
      title: 'Classic White Shirt',
      price: { selling: 1999 },
      primaryImage: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop',
      slug: 'classic-white-shirt',
      category: 'shirts'
    },
    {
      id: '2',
      title: 'Blue Denim Jeans',
      price: { selling: 2999 },
      primaryImage: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop',
      slug: 'blue-denim-jeans',
      category: 'jeans'
    },
    {
      id: '3',
      title: 'Leather Jacket',
      price: { selling: 9999 },
      primaryImage: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop',
      slug: 'leather-jacket',
      category: 'jackets'
    }
  ]

  const displayProducts = filteredProducts.length > 0 ? filteredProducts : sampleProducts

  return (
    <div className={className}>
      {/* Controls */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <Headphones className="h-5 w-5 mr-2" />
              VR Fashion Gallery
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant={isVRSupported ? 'success' : 'destructive'}>
                VR {isVRSupported ? 'Supported' : 'Not Available'}
              </Badge>
              {isVRSupported && (
                <Button onClick={startVRSession} disabled={isVRActive}>
                  <Headphones className="h-4 w-4 mr-2" />
                  {isVRActive ? 'VR Active' : 'Enter VR'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-blue-500" />
              <span>Immersive 3D Experience</span>
            </div>
            <div className="flex items-center space-x-2">
              <Navigation className="h-4 w-4 text-green-500" />
              <span>360° Product Views</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-4 w-4 text-purple-500" />
              <span>Virtual Shopping</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* VR Gallery */}
      <Card>
        <CardContent className="p-0">
          <div style={{ height: '600px', width: '100%' }}>
            <Canvas
              camera={{ position: [0, 2, 8], fov: 60 }}
              style={{ background: 'linear-gradient(to bottom, #87CEEB 0%, #98FB98 100%)' }}
            >
              <ambientLight intensity={0.4} />
              <pointLight position={[10, 10, 10]} intensity={0.8} />
              <directionalLight position={[-5, 5, 5]} intensity={0.5} />
              
              <VRRoom products={displayProducts} />
              
              <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={2}
                maxDistance={15}
                minPolarAngle={0}
                maxPolarAngle={Math.PI / 2}
              />
              
              <Environment preset="apartment" />
            </Canvas>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Navigation Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Desktop Controls</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                  Click and drag to look around
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                  Scroll to zoom in/out
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                  Click on products to view details
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                  Use category filters to browse
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">VR Mode</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  Look around naturally with head movement
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  Point controllers at products to interact
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  Walk around the virtual showroom
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  Use trigger to select items
                </li>
              </ul>
            </div>
          </div>
          
          {!isVRSupported && (
            <div className="mt-4 p-4 bg-orange-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <Zap className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-orange-800">VR Not Available</h4>
                  <p className="text-sm text-orange-700">
                    Your browser or device doesn't support WebXR. You can still explore the 3D gallery using mouse/touch controls.
                    For the full VR experience, try using a VR-compatible browser like Chrome or Firefox on a VR headset.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
