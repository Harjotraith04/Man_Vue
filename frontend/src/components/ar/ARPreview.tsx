import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Move3D, 
  Eye,
  Camera,
  Download,
  Share2,
  Info
} from 'lucide-react'
import '@google/model-viewer'

interface ARPreviewProps {
  modelUrl?: string
  productTitle: string
  productImage: string
  className?: string
  autoRotate?: boolean
  cameraControls?: boolean
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any
    }
  }
}

export default function ARPreview({ 
  modelUrl, 
  productTitle, 
  productImage, 
  className = '',
  autoRotate = true,
  cameraControls = true
}: ARPreviewProps) {
  const modelViewerRef = useRef<any>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasARSupport, setHasARSupport] = useState(false)
  const [isInAR, setIsInAR] = useState(false)

  useEffect(() => {
    // Check for AR support
    if ('XRSession' in window) {
      navigator.xr?.isSessionSupported('immersive-ar').then((supported) => {
        setHasARSupport(supported)
      })
    }
  }, [])

  const handleModelLoad = () => {
    setIsLoading(false)
  }

  const handleARStart = () => {
    setIsInAR(true)
  }

  const handleAREnd = () => {
    setIsInAR(false)
  }

  const resetCameraPosition = () => {
    if (modelViewerRef.current) {
      modelViewerRef.current.resetTurntableRotation()
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      modelViewerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const takeScreenshot = () => {
    if (modelViewerRef.current) {
      const screenshot = modelViewerRef.current.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `${productTitle}-ar-preview.png`
      link.href = screenshot
      link.click()
    }
  }

  const shareModel = async () => {
    if (navigator.share && modelUrl) {
      try {
        await navigator.share({
          title: `${productTitle} - AR Preview`,
          text: `Check out this 3D preview of ${productTitle}`,
          url: window.location.href
        })
      } catch (error) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
      }
    }
  }

  // If no model URL is provided, show fallback
  if (!modelUrl) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Move3D className="h-5 w-5 mr-2" />
            3D Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Move3D className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-600 mb-2">3D Model Coming Soon</h3>
              <p className="text-sm text-gray-500">
                We're working on creating a 3D model for this product. 
                In the meantime, check out the product images.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Move3D className="h-5 w-5 mr-2" />
            AR Preview
          </CardTitle>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={takeScreenshot}>
              <Camera className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={shareModel}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="relative">
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10">
              <div className="text-center">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-sm text-gray-600">Loading 3D model...</p>
              </div>
            </div>
          )}

          {/* Model Viewer */}
          <model-viewer
            ref={modelViewerRef}
            src={modelUrl}
            poster={productImage}
            alt={productTitle}
            auto-rotate={autoRotate}
            camera-controls={cameraControls}
            style={{
              width: '100%',
              height: '400px',
              borderRadius: '8px',
              backgroundColor: '#f8f9fa'
            }}
            loading="eager"
            reveal="interaction"
            ar={hasARSupport}
            ar-modes="webxr scene-viewer quick-look"
            ios-src={modelUrl.replace('.glb', '.usdz')} // iOS AR format
            onLoad={handleModelLoad}
            onError={() => setIsLoading(false)}
            onAr={handleARStart}
            onArEnd={handleAREnd}
          >
            {/* AR Button */}
            <button
              slot="ar-button"
              className="absolute bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-600 transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span>View in AR</span>
            </button>

            {/* Hotspots for interactive areas */}
            <button
              className="absolute top-1/2 left-1/4 w-4 h-4 bg-blue-500 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2 pulse"
              slot="hotspot-1"
              data-position="0 0.5 0"
              data-normal="0 1 0"
              title="Product details"
            />
          </model-viewer>

          {/* Controls Overlay */}
          <div className="absolute bottom-4 left-4 flex space-x-2">
            <Button size="sm" variant="secondary" onClick={resetCameraPosition}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* AR Status */}
          {isInAR && (
            <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
              AR Mode Active
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-4 space-y-3">
          <div className="flex items-start space-x-2 text-sm text-gray-600">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">3D Preview Instructions:</p>
              <ul className="space-y-1 text-xs">
                <li>• Drag to rotate the model</li>
                <li>• Pinch/scroll to zoom in/out</li>
                <li>• Click "View in AR" for augmented reality experience</li>
                {hasARSupport && <li>• Point your camera to place the item in your space</li>}
              </ul>
            </div>
          </div>

          {/* AR Support Info */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${hasARSupport ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm font-medium">
                AR {hasARSupport ? 'Supported' : 'Not Available'}
              </span>
            </div>
            {hasARSupport && (
              <span className="text-xs text-gray-600">Try it on your space!</span>
            )}
          </div>

          {/* Model Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Model Quality:</span>
              <span className="ml-2 font-medium">High Definition</span>
            </div>
            <div>
              <span className="text-gray-600">File Size:</span>
              <span className="ml-2 font-medium">~2MB</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
