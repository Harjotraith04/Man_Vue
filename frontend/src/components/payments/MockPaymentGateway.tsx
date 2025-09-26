import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

interface MockPaymentGatewayProps {
  amount: number
  orderId: string
  onSuccess: (transactionId: string) => void
  onError: (error: string) => void
  onCancel: () => void
}

export default function MockPaymentGateway({
  amount,
  orderId,
  onSuccess,
  onError,
  onCancel
}: MockPaymentGatewayProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState<'form' | 'processing' | 'success' | 'error'>('form')
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardHolder: ''
  })
  const [transactionId, setTransactionId] = useState('')

  const handleCardNumberChange = (value: string) => {
    // Format card number with spaces every 4 digits
    const formatted = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
    if (formatted.length <= 19) {
      setCardDetails({ ...cardDetails, cardNumber: formatted })
    }
  }

  const handleExpiryChange = (field: 'expiryMonth' | 'expiryYear', value: string) => {
    if (value.length <= 2 && /^\d*$/.test(value)) {
      setCardDetails({ ...cardDetails, [field]: value })
    }
  }

  const handleCvvChange = (value: string) => {
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setCardDetails({ ...cardDetails, cvv: value })
    }
  }

  const validateCard = () => {
    const { cardNumber, expiryMonth, expiryYear, cvv, cardHolder } = cardDetails
    
    if (!cardNumber.replace(/\s/g, '') || cardNumber.replace(/\s/g, '').length < 13) {
      toast.error('Please enter a valid card number')
      return false
    }
    
    if (!expiryMonth || parseInt(expiryMonth) < 1 || parseInt(expiryMonth) > 12) {
      toast.error('Please enter a valid expiry month')
      return false
    }
    
    if (!expiryYear || parseInt(expiryYear) < 24) {
      toast.error('Please enter a valid expiry year')
      return false
    }
    
    if (!cvv || cvv.length < 3) {
      toast.error('Please enter a valid CVV')
      return false
    }
    
    if (!cardHolder.trim()) {
      toast.error('Please enter the cardholder name')
      return false
    }
    
    return true
  }

  const simulatePayment = async () => {
    if (!validateCard()) return

    setIsProcessing(true)
    setStep('processing')

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Generate mock transaction ID
      const mockTransactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      setTransactionId(mockTransactionId)

      // Simulate success/failure based on card number
      const cardNum = cardDetails.cardNumber.replace(/\s/g, '')
      
      // Card ending in 0000 simulates failure
      if (cardNum.endsWith('0000')) {
        setStep('error')
        onError('Payment declined by bank. Please try a different card.')
        return
      }

      // All other cards simulate success
      setStep('success')
      
      // Call success callback after a short delay
      setTimeout(() => {
        onSuccess(mockTransactionId)
      }, 1500)

    } catch (error) {
      setStep('error')
      onError('Payment processing failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (step === 'processing') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4 bg-white/95 backdrop-blur border-0 shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <Loader2 className="h-16 w-16 text-blue-600 animate-spin mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h3>
              <p className="text-gray-600">Please wait while we process your payment...</p>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-white/20 to-white/40 animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4 bg-white/95 backdrop-blur border-0 shadow-2xl">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
            <p className="text-gray-600 mb-4">Your payment has been processed successfully.</p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Transaction ID:</p>
              <p className="font-mono text-sm font-bold text-gray-900">{transactionId}</p>
            </div>
            <p className="text-sm text-gray-500">Redirecting to order confirmation...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4 bg-white/95 backdrop-blur border-0 shadow-2xl">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h3>
            <p className="text-gray-600 mb-6">There was an issue processing your payment.</p>
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => setStep('form')}
                className="flex-1"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg bg-white/95 backdrop-blur border-0 shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Secure Payment</CardTitle>
                <p className="text-sm text-gray-600">MockPay Gateway</p>
              </div>
            </div>
            <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
              <Shield className="h-3 w-3 mr-1" />
              Secure
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Order ID:</span>
              <span className="font-mono text-sm font-bold">{orderId.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Amount:</span>
              <span className="text-2xl font-bold text-blue-600">{formatPrice(amount)}</span>
            </div>
          </div>

          {/* Card Details Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardDetails.cardNumber}
                onChange={(e) => handleCardNumberChange(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Tip: Use any number except ending in 0000 (simulates failure)
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="expiryMonth">Month</Label>
                <Input
                  id="expiryMonth"
                  placeholder="MM"
                  value={cardDetails.expiryMonth}
                  onChange={(e) => handleExpiryChange('expiryMonth', e.target.value)}
                  maxLength={2}
                />
              </div>
              <div>
                <Label htmlFor="expiryYear">Year</Label>
                <Input
                  id="expiryYear"
                  placeholder="YY"
                  value={cardDetails.expiryYear}
                  onChange={(e) => handleExpiryChange('expiryYear', e.target.value)}
                  maxLength={2}
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={cardDetails.cvv}
                  onChange={(e) => handleCvvChange(e.target.value)}
                  type="password"
                  maxLength={4}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cardHolder">Cardholder Name</Label>
              <Input
                id="cardHolder"
                placeholder="John Doe"
                value={cardDetails.cardHolder}
                onChange={(e) => setCardDetails({ ...cardDetails, cardHolder: e.target.value })}
              />
            </div>
          </div>

          {/* Demo Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">🔧 Demo Payment Gateway</h4>
            <p className="text-sm text-blue-800">
              This is a simulation that requires no API keys. In a real implementation, 
              this would connect to your preferred payment processor.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={simulatePayment}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Pay {formatPrice(amount)}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
