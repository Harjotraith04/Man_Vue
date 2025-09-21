import React, { useEffect, useState } from 'react'
import { useProductStore } from '@/stores/productStore'
import VRGallery from '@/components/vr/VRGallery'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Headphones, Sparkles, Eye, Navigation } from 'lucide-react'

export default function VRGalleryPage() {
  const { featuredProducts, fetchFeaturedProducts, isLoading } = useProductStore()
  const [selectedExperience, setSelectedExperience] = useState<'gallery' | 'showroom'>('gallery')

  useEffect(() => {
    fetchFeaturedProducts()
  }, [fetchFeaturedProducts])

  const experiences = [
    {
      id: 'gallery' as const,
      title: 'Fashion Gallery',
      description: 'Browse our latest collection in a circular virtual gallery',
      icon: Eye,
      features: ['360° Product Views', 'Interactive Navigation', 'Category Filtering']
    },
    {
      id: 'showroom' as const,
      title: 'Virtual Showroom',
      description: 'Experience a realistic fashion store environment',
      icon: Navigation,
      features: ['Realistic Store Layout', 'Mannequin Displays', 'Shopping Experience']
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-6">
            <Headphones className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Virtual Reality Gallery
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Step into the future of fashion retail with our immersive VR experience. 
            Explore products in 3D, walk through virtual showrooms, and shop like never before.
          </p>
        </div>

        {/* Experience Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {experiences.map((experience) => (
            <Card 
              key={experience.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedExperience === experience.id 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedExperience(experience.id)}
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    selectedExperience === experience.id 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <experience.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{experience.title}</CardTitle>
                    <p className="text-sm text-gray-600">{experience.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {experience.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-700">
                      <Sparkles className="h-3 w-3 text-blue-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-gray-600">Loading VR experience...</p>
            </CardContent>
          </Card>
        ) : (
          /* VR Gallery Component */
          <VRGallery products={featuredProducts} className="w-full" />
        )}

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Headphones className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">WebXR Compatible</h3>
              <p className="text-sm text-gray-600">
                Works with all major VR headsets including Oculus, HTC Vive, and mobile VR
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Eye className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Immersive Shopping</h3>
              <p className="text-sm text-gray-600">
                Experience products in 3D space with realistic lighting and materials
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Navigation className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Natural Navigation</h3>
              <p className="text-sm text-gray-600">
                Move naturally in virtual space using hand tracking and controller support
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Browser Compatibility */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Browser & Device Support</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Supported Browsers</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✅ Chrome 79+ (Windows, Android)</li>
                  <li>✅ Firefox 70+ (Windows, Android)</li>
                  <li>✅ Edge 80+ (Windows)</li>
                  <li>✅ Samsung Internet (Android)</li>
                  <li>⚠️ Safari (Limited support)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">VR Devices</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✅ Oculus Quest/Quest 2</li>
                  <li>✅ HTC Vive</li>
                  <li>✅ Valve Index</li>
                  <li>✅ Windows Mixed Reality</li>
                  <li>✅ Mobile VR (Cardboard, Gear VR)</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> For the best experience, use a VR headset with hand tracking. 
                Desktop users can still explore using mouse and keyboard controls.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
