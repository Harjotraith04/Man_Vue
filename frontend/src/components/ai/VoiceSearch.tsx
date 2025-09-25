import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Search,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

interface VoiceSearchResult {
  analysis: {
    categories: string[]
    style: string
    colors: string[]
    occasion: string
    budget_range: string
    query_intent: string
  }
  recommendations: Array<{
    id: string
    title: string
    price: { selling: number }
    primaryImage: string
    slug: string
    category: string
    brand: { name: string }
    rating: { average: number }
  }>
  message: string
  totalFound: number
}

interface VoiceSearchProps {
  onResults?: (results: VoiceSearchResult) => void
  autoNavigate?: boolean
  className?: string
}

export default function VoiceSearch({ onResults, autoNavigate = true, className = '' }: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [results, setResults] = useState<VoiceSearchResult | null>(null)
  const [recognition, setRecognition] = useState<any>(null)
  const [isSpeechSupported, setIsSpeechSupported] = useState(false)
  const [speakingResults, setSpeakingResults] = useState(false)
  
  const navigate = useNavigate()

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSpeechSupported(true)
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'en-US'
      
      recognition.onstart = () => {
        setIsListening(true)
        setTranscript('')
      }
      
      recognition.onresult = (event: any) => {
        let interimTranscript = ''
        let finalTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }
        
        setTranscript(finalTranscript || interimTranscript)
        
        if (finalTranscript) {
          handleVoiceSearch(finalTranscript)
        }
      }
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        
        let errorMessage = 'Voice recognition failed. Please try again.'
        if (event.error === 'no-speech') {
          errorMessage = 'No speech detected. Please try speaking again.'
        } else if (event.error === 'network') {
          errorMessage = 'Network error. Please check your connection.'
        }
        
        toast.error(errorMessage)
      }
      
      recognition.onend = () => {
        setIsListening(false)
      }
      
      setRecognition(recognition)
    }
  }, [])

  const startListening = () => {
    if (!recognition) {
      toast.error('Voice recognition not supported in your browser')
      return
    }

    if (isListening) {
      recognition.stop()
    } else {
      recognition.start()
    }
  }

  const handleVoiceSearch = async (searchTranscript: string) => {
    setIsProcessing(true)
    
    try {
      const response = await axios.post('/ai/voice-recommend', {
        transcript: searchTranscript,
        occasion: 'general'
      })

      const searchResults: VoiceSearchResult = response.data.data
      setResults(searchResults)
      
      if (onResults) {
        onResults(searchResults)
      }

      // Speak the results if speech synthesis is available
      if ('speechSynthesis' in window) {
        speakResults(searchResults.message)
      }

      // Auto-navigate to search results if enabled
      if (autoNavigate && searchResults.recommendations.length > 0) {
        const searchQuery = encodeURIComponent(searchResults.analysis.query_intent)
        navigate(`/search?q=${searchQuery}&voice=true`)
      }

      toast.success(`Found ${searchResults.totalFound} products matching your request`)

    } catch (error) {
      console.error('Voice search error:', error)
      toast.error('Voice search failed. Please try again.')
    } finally {
      setIsProcessing(false)
      setIsListening(false)
    }
  }

  const speakResults = (message: string) => {
    if (!('speechSynthesis' in window)) return

    setSpeakingResults(true)
    const utterance = new SpeechSynthesisUtterance(message)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 0.8

    utterance.onend = () => {
      setSpeakingResults(false)
    }

    utterance.onerror = () => {
      setSpeakingResults(false)
    }

    window.speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setSpeakingResults(false)
    }
  }

  if (!isSpeechSupported) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Voice Search Not Available</h3>
          <p className="text-gray-600">
            Your browser doesn't support voice recognition. Please use the text search instead.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mic className="h-5 w-5 mr-2" />
          Voice Fashion Search
        </CardTitle>
        <p className="text-sm text-gray-600">
          Tell me what you're looking for and I'll find the perfect fashion items for you
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Voice Input Controls */}
        <div className="flex justify-center space-x-4">
          <Button
            onClick={startListening}
            disabled={isProcessing}
            className={`w-16 h-16 rounded-full ${
              isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isListening ? (
              <MicOff className="h-6 w-6 text-white" />
            ) : (
              <Mic className="h-6 w-6 text-white" />
            )}
          </Button>
          
          {speakingResults && (
            <Button
              onClick={stopSpeaking}
              variant="outline"
              className="w-16 h-16 rounded-full"
            >
              <VolumeX className="h-6 w-6" />
            </Button>
          )}
        </div>

        {/* Status */}
        <div className="text-center">
          {isListening && (
            <div className="flex items-center justify-center space-x-2 text-red-500">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Listening...</span>
            </div>
          )}
          
          {isProcessing && (
            <div className="flex items-center justify-center space-x-2 text-blue-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">Processing your request...</span>
            </div>
          )}
          
          {speakingResults && (
            <div className="flex items-center justify-center space-x-2 text-green-500">
              <Volume2 className="h-4 w-4" />
              <span className="text-sm font-medium">Speaking results...</span>
            </div>
          )}
        </div>

        {/* Transcript */}
        {transcript && (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">You said:</p>
            <p className="font-medium">"{transcript}"</p>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-4">
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">Search completed!</span>
            </div>
            
            {/* Analysis */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">I understood:</h4>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {results.analysis.categories.map((category, index) => (
                    <Badge key={index} variant="outline">
                      {category}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-blue-700">{results.message}</p>
              </div>
            </div>

            {/* Product Recommendations */}
            {results.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Recommended Products ({results.totalFound} found)</h4>
                <div className="grid grid-cols-2 gap-3">
                  {results.recommendations.slice(0, 4).map((product) => (
                    <div key={product.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                      <img
                        src={product.primaryImage}
                        alt={product.title}
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                      <h5 className="font-medium text-sm truncate">{product.title}</h5>
                      <p className="text-xs text-gray-600">{product.brand.name}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-sm">{formatPrice(product.price.selling)}</span>
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
                
                {results.recommendations.length > 4 && (
                  <div className="text-center mt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const searchQuery = encodeURIComponent(results.analysis.query_intent)
                        navigate(`/search?q=${searchQuery}`)
                      }}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      View All {results.totalFound} Results
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Usage Examples */}
        <div className="border-t pt-4">
          <h4 className="font-semibold text-sm mb-2">Try saying:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• "Show me formal shirts under 30 pounds"</li>
            <li>• "I need casual jeans for weekend"</li>
            <li>• "Find ethnic wear for weddings"</li>
            <li>• "Looking for running shoes in blue"</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
