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

  const addMessage = (type: 'user' | 'bot', content: string, products?: any[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      products
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
      addMessage('bot', botResponse)

      // Check if the response suggests products and fetch them
      if (botResponse.toLowerCase().includes('recommend') || 
          botResponse.toLowerCase().includes('suggest') ||
          botResponse.toLowerCase().includes('show you')) {
        
        // Extract potential search terms from the conversation
        const searchTerms = extractSearchTerms(message + ' ' + botResponse)
        if (searchTerms) {
          fetchRecommendedProducts(searchTerms)
        }
      }

    } catch (error) {
      console.error('Chat error:', error)
      addMessage('bot', "I'm sorry, I'm having trouble responding right now. Please try again in a moment.")
    } finally {
      setIsTyping(false)
    }
  }

  const extractSearchTerms = (text: string): string => {
    // Simple keyword extraction - in a real app, you'd use more sophisticated NLP
    const keywords = ['shirt', 'jeans', 'jacket', 'shoes', 'formal', 'casual', 'ethnic', 'watch']
    const foundKeywords = keywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    )
    return foundKeywords[0] || ''
  }

  const fetchRecommendedProducts = async (searchTerm: string) => {
    try {
      const response = await axios.get(`/products?search=${searchTerm}&limit=4`)
      const products = response.data.data.products
      
      if (products.length > 0) {
        addMessage('bot', `Here are some ${searchTerm} recommendations for you:`, products)
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error)
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
    "What's trending now?",
    "Size guide help",
    "Color matching advice"
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
                          {message.products.map((product) => (
                            <div key={product.id} className="bg-white rounded-lg p-2 shadow-sm">
                              <div className="flex items-center space-x-2">
                                <img
                                  src={product.primaryImage}
                                  alt={product.title}
                                  className="w-12 h-12 rounded object-cover"
                                />
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-gray-800 truncate">
                                    {product.title}
                                  </p>
                                  <p className="text-xs text-blue-600 font-bold">
                                    {formatPrice(product.price.selling)}
                                  </p>
                                </div>
                                <a
                                  href={`/product/${product.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Button size="sm" variant="outline">
                                    View
                                  </Button>
                                </a>
                              </div>
                            </div>
                          ))}
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