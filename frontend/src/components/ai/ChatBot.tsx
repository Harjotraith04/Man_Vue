import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MessageCircle, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Camera, 
  Image as ImageIcon,
  Bot,
  User,
  Minimize2,
  Maximize2
} from 'lucide-react'
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
  products?: Array<{
    id: string
    title: string
    price: { selling: number }
    primaryImage: string
    slug: string
  }>
  userQuery?: string
}

interface VoiceRecognition {
  start: () => void
  stop: () => void
  onresult: (event: any) => void
  onerror: (event: any) => void
  onend: () => void
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hi! I'm your AI fashion advisor. I can help you find the perfect outfit, suggest styles, or answer any fashion questions. How can I assist you today?",
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<VoiceRecognition | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuthStore()

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputMessage(transcript)
        setIsListening(false)
      }
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        toast.error('Voice recognition failed. Please try again.')
      }
      
      recognition.onend = () => {
        setIsListening(false)
      }
      
      setRecognition(recognition)
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const addMessage = (type: 'user' | 'bot', content: string, products?: any[], userQuery?: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      products,
      userQuery
    }
    setMessages(prev => [...prev, newMessage])
  }

  const sendMessage = async (message: string) => {
    if (!message.trim()) return

    // Add user message
    addMessage('user', message)
    setInputMessage('')
    setIsTyping(true)

    try {
      // Build context from recent messages
      const context = messages.slice(-5).map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))

      const response = await axios.post('/ai/chat', {
        message,
        context
      })

      const botResponse = response.data.data.message
      const products = response.data.data.products || []
      
      if (products.length > 0) {
        addMessage('bot', botResponse, products, message)
      } else {
        addMessage('bot', botResponse, undefined, message)
      }

      // No additional random recommendations - only show products from database search

    } catch (error) {
      console.error('Chat error:', error)
      addMessage('bot', "I'm sorry, I'm having trouble responding right now. Please try again in a moment.")
    } finally {
      setIsTyping(false)
    }
  }

  const extractSearchTerms = (text: string): string => {
    // Enhanced keyword extraction matching actual database categories
    const keywords = [
      // Primary categories (match database exactly)
      'shirts', 'shirt', 'jeans', 'jackets', 'jacket', 'tshirts', 't-shirt', 'tshirt',
      'formal-shoes', 'accessories', 'kurtas', 'kurta', 'formal', 'shoes', 'shoe',
      // Style descriptors
      'casual', 'professional', 'business', 'office', 'ethnic', 'traditional',
      // Price-based queries
      'maximum price', 'minimum price', 'highest price', 'lowest price', 'premium', 'budget', 'expensive', 'cheap',
      // Specific items
      'trousers', 'pants', 'sneakers', 'boots', 'belt', 'wallet', 'watch',
      'chinos', 'shorts', 'blazer', 'suit', 'sweater', 'hoodie'
    ]
    
    const textLower = text.toLowerCase()
    const foundKeywords = keywords.filter(keyword => textLower.includes(keyword))
    
    // Handle price-based queries specially (including common typos and variations)
    if (textLower.includes('maximum price') || textLower.includes('highest price') || 
        textLower.includes('maximum prize') || textLower.includes('highest prize') ||
        textLower.includes('max price') || textLower.includes('max prize')) {
      return 'maximum price products'
    }
    if (textLower.includes('minimum price') || textLower.includes('lowest price') ||
        textLower.includes('minimum prize') || textLower.includes('lowest prize') ||
        textLower.includes('min price') || textLower.includes('min prize')) {
      return 'minimum price products'
    }
    if (textLower.includes('premium') || textLower.includes('expensive') || textLower.includes('luxury')) {
      return 'premium products'
    }
    if (textLower.includes('budget') || textLower.includes('cheap') || textLower.includes('affordable')) {
      return 'budget products'
    }
    
    // Return the most specific match first, prioritizing exact database categories
    const priorityOrder = ['formal-shoes', 'tshirts', 'accessories', 'kurtas', 'jackets', 'shirts', 'jeans', 'shoes', 'formal']
    for (const priority of priorityOrder) {
      if (foundKeywords.includes(priority)) return priority
    }
    
    return foundKeywords.sort((a, b) => b.length - a.length)[0] || ''
  }

  const fetchRecommendedProducts = async (searchTerm: string) => {
    try {
      // Use the smart recommendation endpoint
      const response = await axios.post('/ai/recommend-products', {
        query: searchTerm,
        limit: 6
      })
      
      const { products } = response.data.data
      
      if (products && products.length > 0) {
        addMessage('bot', `Here are some ${searchTerm} recommendations from our collection:`, products)
      } else {
        // Fallback to general featured products
        const fallbackResponse = await axios.get('/products?limit=4&featured=true')
        const fallbackProducts = fallbackResponse.data.data.products
        
        if (fallbackProducts.length > 0) {
          const formattedProducts = fallbackProducts.map((product: any) => ({
            id: product._id,
            title: product.title,
            price: product.price,
            primaryImage: product.variants?.[0]?.images?.[0]?.url || product.primaryImage,
            slug: product.slug,
            category: product.category,
            rating: product.rating
          }))
          addMessage('bot', "Here are some popular items from our collection:", formattedProducts)
        }
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error)
      
      // Final fallback - try basic product search
      try {
        const fallbackResponse = await axios.get(`/products?search=${searchTerm}&limit=4`)
        const fallbackProducts = fallbackResponse.data.data.products
        
        if (fallbackProducts.length > 0) {
          const formattedProducts = fallbackProducts.map((product: any) => ({
            id: product._id,
            title: product.title,
            price: product.price,
            primaryImage: product.variants?.[0]?.images?.[0]?.url || product.primaryImage,
            slug: product.slug,
            category: product.category,
            rating: product.rating
          }))
          addMessage('bot', `Here are some ${searchTerm} options I found:`, formattedProducts)
        }
      } catch (finalError) {
        console.error('All product fetch attempts failed:', finalError)
        addMessage('bot', `I'm having trouble fetching specific ${searchTerm} recommendations right now, but I'd be happy to help you in other ways! You can browse our full collection using the products page.`)
      }
    }
  }

  const handleVoiceInput = () => {
    if (!recognition) {
      toast.error('Voice recognition not supported in your browser')
      return
    }

    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      recognition.start()
      setIsListening(true)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    // Convert to base64
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64Image = e.target?.result as string
      
      addMessage('user', '📷 Uploaded an image for fashion search')
      setIsTyping(true)

      try {
        const response = await axios.post('/ai/search-image', {
          imageUrl: base64Image,
          searchType: 'similar'
        })

        const { analysis, products } = response.data.data
        
        let botResponse = `I can see this image contains ${analysis.items?.join(', ') || 'fashion items'}. `
        botResponse += `The main colors are ${analysis.colors?.join(', ') || 'various colors'}. `
        
        if (products && products.length > 0) {
          botResponse += 'Here are some similar products I found:'
          addMessage('bot', botResponse, products)
        } else {
          botResponse += "I couldn't find similar products, but let me help you find something else!"
          addMessage('bot', botResponse)
        }

      } catch (error) {
        console.error('Image search error:', error)
        addMessage('bot', "I'm having trouble analyzing the image. Please try again or describe what you're looking for instead.")
      } finally {
        setIsTyping(false)
      }
    }
    
    reader.readAsDataURL(file)
    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleVoiceRecommendation = async (transcript: string) => {
    addMessage('user', `🎤 ${transcript}`)
    setIsTyping(true)

    try {
      const response = await axios.post('/ai/voice-recommend', {
        transcript,
        occasion: 'general'
      })

      const { analysis, recommendations, message } = response.data.data
      
      if (recommendations && recommendations.length > 0) {
        addMessage('bot', message, recommendations)
      } else {
        addMessage('bot', message || "I understand you're looking for fashion recommendations. Let me help you find something perfect!")
      }

    } catch (error) {
      console.error('Voice recommendation error:', error)
      addMessage('bot', "I heard you, but I'm having trouble processing your request. Could you type it instead?")
    } finally {
      setIsTyping(false)
    }
  }

  const quickActions = [
    "Help me find a formal outfit",
    "Show me casual wear", 
    "Show me maximum prize products",
    "Show me minimum price products",
    "What's trending now?",
    "I need help choosing"
  ]

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    )
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-200 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
    }`}>
      <Card className="h-full shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm">AI Fashion Advisor</CardTitle>
              <p className="text-xs text-gray-500">Online • Ready to help</p>
            </div>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 h-[400px]">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : ''}`}>
                    <div
                      className={`rounded-lg p-3 ${
                        message.type === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      
                      {/* Product recommendations */}
                      {message.products && message.products.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.products.map((product) => {
                            // Find the best color variant to display
                            const getBestVariantImage = (product) => {
                              if (!product.variants || product.variants.length === 0) {
                                return product.primaryImage || '/placeholder-image.jpg';
                              }
                              
                              // If searching for a specific color, try to find that variant
                              const searchQuery = (message.userQuery || message.content).toLowerCase();
                              const colorKeywords = ['red', 'blue', 'black', 'white', 'green', 'brown', 'navy', 'gray', 'grey'];
                              const foundColor = colorKeywords.find(color => searchQuery.includes(color));
                              
                              if (foundColor) {
                                const colorVariant = product.variants.find(v => 
                                  v.color.toLowerCase().includes(foundColor)
                                );
                                if (colorVariant && colorVariant.images && colorVariant.images.length > 0) {
                                  return colorVariant.images[0].url;
                                }
                              }
                              
                              // Fallback to primary image or first variant image
                              const primaryVariant = product.variants.find(v => v.images && v.images.some(img => img.isPrimary));
                              if (primaryVariant && primaryVariant.images && primaryVariant.images.length > 0) {
                                return primaryVariant.images[0].url;
                              }
                              
                              return product.variants[0]?.images?.[0]?.url || product.primaryImage || '/placeholder-image.jpg';
                            };
                            
                            const availableColors = product.variants ? product.variants.map(v => v.color).join(', ') : 'Default';
                            
                            return (
                              <div key={product.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:border-gray-300 transition-colors">
                                <div className="flex items-center space-x-3">
                                  <div className="flex-shrink-0">
                                    <img
                                      src={getBestVariantImage(product)}
                                      alt={product.title}
                                      className="w-16 h-16 rounded-md object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/placeholder-image.jpg'
                                      }}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate" title={product.title}>
                                      {product.title}
                                    </p>
                                    <p className="text-xs text-gray-500 capitalize">
                                      {product.category || 'Fashion'}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      Colors: {availableColors}
                                    </p>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <p className="text-sm text-blue-600 font-bold">
                                        {formatPrice(product.price?.selling || product.price)}
                                      </p>
                                      {product.rating?.average && (
                                        <div className="flex items-center">
                                          <span className="text-xs text-yellow-500">★</span>
                                          <span className="text-xs text-gray-600 ml-1">
                                            {product.rating.average.toFixed(1)}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex-shrink-0">
                                    <a
                                      href={`/product/${product.slug}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-block"
                                    >
                                      <Button size="sm" variant="outline" className="text-xs px-3">
                                        View
                                      </Button>
                                    </a>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          <div className="text-center mt-2">
                            <a 
                              href="/products" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-500 hover:text-blue-700 underline"
                            >
                              View all products →
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className={`flex items-center mt-1 space-x-1 text-xs text-gray-500 ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}>
                      {message.type === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                      <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Quick Actions */}
            <div className="px-4 py-2 border-t">
              <div className="flex flex-wrap gap-1">
                {quickActions.slice(0, 3).map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => sendMessage(action)}
                    className="text-xs h-6"
                  >
                    {action}
                  </Button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask about fashion, styles, or products..."
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputMessage)}
                    className="pr-20"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-6 w-6 p-0"
                    >
                      <Camera className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleVoiceInput}
                      className={`h-6 w-6 p-0 ${isListening ? 'text-red-500' : ''}`}
                    >
                      {isListening ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={() => sendMessage(inputMessage)}
                  disabled={!inputMessage.trim() || isTyping}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              {isListening && (
                <div className="mt-2 flex items-center space-x-2 text-red-500">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs">Listening...</span>
                </div>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </>
        )}
      </Card>
    </div>
  )
}