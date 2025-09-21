import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bot, 
  Mic, 
  Camera, 
  Sparkles, 
  TrendingUp,
  Palette,
  Search,
  MessageCircle
} from 'lucide-react'
import VoiceSearch from '@/components/ai/VoiceSearch'
import ImageSearch from '@/components/ai/ImageSearch'
import ChatBot from '@/components/ai/ChatBot'
import toast from 'react-hot-toast'

export default function AIFeaturesPage() {
  const [activeTab, setActiveTab] = useState('overview')

  const features = [
    {
      icon: MessageCircle,
      title: 'AI Fashion Advisor',
      description: 'Get personalized style advice and recommendations from our AI-powered chatbot',
      benefits: ['24/7 fashion assistance', 'Personalized recommendations', 'Style tips and advice', 'Outfit coordination help']
    },
    {
      icon: Mic,
      title: 'Voice Shopping',
      description: 'Search for products using natural voice commands in any language',
      benefits: ['Hands-free shopping', 'Natural language search', 'Voice-activated filters', 'Audio feedback']
    },
    {
      icon: Camera,
      title: 'Visual Search',
      description: 'Upload photos to find similar fashion items or get style inspiration',
      benefits: ['Image-based discovery', 'Style matching', 'Color coordination', 'Trend identification']
    },
    {
      icon: Sparkles,
      title: 'Smart Recommendations',
      description: 'AI analyzes your preferences and behavior to suggest perfect items',
      benefits: ['Machine learning insights', 'Behavioral analysis', 'Trend prediction', 'Personalized curation']
    }
  ]

  const useCases = [
    {
      title: 'Morning Outfit Planning',
      description: 'Ask our AI what to wear based on weather, occasion, and your wardrobe',
      example: '"What should I wear for a business meeting today?"'
    },
    {
      title: 'Shopping Assistant',
      description: 'Get help finding specific items or alternatives within your budget',
      example: '"Show me formal shirts under ₹3000"'
    },
    {
      title: 'Style Inspiration',
      description: 'Upload photos of outfits you like to find similar items in our store',
      example: 'Upload a celebrity outfit photo to get the look'
    },
    {
      title: 'Color Coordination',
      description: 'Learn which colors work well together for your complexion and style',
      example: '"What colors go well with navy blue?"'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            AI-Powered Fashion Experience
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the future of fashion retail with our cutting-edge AI features. 
            Get personalized recommendations, voice shopping, and visual search powered by advanced machine learning.
          </p>
        </div>

        {/* Feature Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="voice">Voice Search</TabsTrigger>
            <TabsTrigger value="visual">Visual Search</TabsTrigger>
            <TabsTrigger value="chatbot">AI Advisor</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <feature.icon className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-700">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Use Cases */}
            <div>
              <h2 className="text-3xl font-bold text-center mb-8">How AI Enhances Your Shopping</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {useCases.map((useCase, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-2">{useCase.title}</h3>
                      <p className="text-gray-600 mb-3">{useCase.description}</p>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-sm text-blue-800 italic">"{useCase.example}"</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Ready to Experience AI Shopping?</h2>
                <p className="text-blue-100 mb-6">
                  Try our AI features now and discover a smarter way to shop for fashion
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    variant="secondary" 
                    onClick={() => setActiveTab('voice')}
                    className="text-blue-600"
                  >
                    <Mic className="h-4 w-4 mr-2" />
                    Try Voice Search
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => setActiveTab('visual')}
                    className="text-blue-600"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Try Visual Search
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="voice">
            <div className="max-w-2xl mx-auto">
              <VoiceSearch className="w-full" />
            </div>
          </TabsContent>

          <TabsContent value="visual">
            <div className="max-w-2xl mx-auto">
              <ImageSearch className="w-full" />
            </div>
          </TabsContent>

          <TabsContent value="chatbot">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    AI Fashion Advisor
                  </CardTitle>
                  <p className="text-gray-600">
                    The chatbot is always available in the bottom-right corner. Here are some conversation starters:
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      "Help me choose an outfit for a wedding",
                      "What colors suit my skin tone?",
                      "Show me the latest fashion trends",
                      "How should I dress for a job interview?",
                      "What's the difference between slim and regular fit?",
                      "Can you suggest accessories for this outfit?"
                    ].map((prompt, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="text-left h-auto p-4 justify-start"
                        onClick={() => {
                          // This would trigger the chatbot with the prompt
                          toast.success('Check the chatbot in the bottom-right corner!')
                        }}
                      >
                        "{prompt}"
                      </Button>
                    ))}
                  </div>
                  
                  <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-3">AI Advisor Features:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <Bot className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                        <p className="text-sm font-medium">Smart Conversations</p>
                        <p className="text-xs text-gray-600">Context-aware responses</p>
                      </div>
                      <div className="text-center">
                        <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        <p className="text-sm font-medium">Trend Insights</p>
                        <p className="text-xs text-gray-600">Latest fashion trends</p>
                      </div>
                      <div className="text-center">
                        <Palette className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                        <p className="text-sm font-medium">Style Advice</p>
                        <p className="text-xs text-gray-600">Personalized recommendations</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Technology Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Powered by Advanced AI Technology</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Google Gemini AI</h3>
                <p className="text-sm text-gray-600">
                  Advanced natural language processing for intelligent conversations and recommendations
                </p>
              </div>
              <div>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Computer Vision</h3>
                <p className="text-sm text-gray-600">
                  Image recognition and analysis for visual search and style matching
                </p>
              </div>
              <div>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Machine Learning</h3>
                <p className="text-sm text-gray-600">
                  Continuous learning from user behavior to improve recommendations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
