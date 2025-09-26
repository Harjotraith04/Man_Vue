import * as tf from '@tensorflow/tfjs'
import * as mobilenet from '@tensorflow-models/mobilenet'
import * as cocoSsd from '@tensorflow-models/coco-ssd'

// Initialize models
let mobilenetModel: mobilenet.MobileNet | null = null
let objectDetectionModel: cocoSsd.ObjectDetection | null = null

// Load models
export const loadModels = async () => {
  try {
    console.log('Loading ML models...')
    
    // Load MobileNet for feature extraction
    if (!mobilenetModel) {
      mobilenetModel = await mobilenet.load()
      console.log('MobileNet loaded')
    }
    
    // Load COCO-SSD for object detection
    if (!objectDetectionModel) {
      objectDetectionModel = await cocoSsd.load()
      console.log('COCO-SSD loaded')
    }
    
    return true
  } catch (error) {
    console.error('Error loading ML models:', error)
    return false
  }
}

// Extract dominant colors from image
export const extractColors = (imageElement: HTMLImageElement): Promise<string[]> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      resolve(['black', 'white'])
      return
    }
    
    canvas.width = imageElement.width
    canvas.height = imageElement.height
    ctx.drawImage(imageElement, 0, 0)
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    
    const colorCounts: { [key: string]: number } = {}
    
    // Sample every 10th pixel for performance
    for (let i = 0; i < data.length; i += 40) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      
      // Convert to color name
      const colorName = getColorName(r, g, b)
      colorCounts[colorName] = (colorCounts[colorName] || 0) + 1
    }
    
    // Get top 3 colors
    const sortedColors = Object.entries(colorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([color]) => color)
    
    resolve(sortedColors.length > 0 ? sortedColors : ['black', 'white'])
  })
}

// Convert RGB to color name
const getColorName = (r: number, g: number, b: number): string => {
  const colors = [
    { name: 'red', rgb: [255, 0, 0] },
    { name: 'blue', rgb: [0, 0, 255] },
    { name: 'green', rgb: [0, 255, 0] },
    { name: 'yellow', rgb: [255, 255, 0] },
    { name: 'orange', rgb: [255, 165, 0] },
    { name: 'purple', rgb: [128, 0, 128] },
    { name: 'pink', rgb: [255, 192, 203] },
    { name: 'brown', rgb: [165, 42, 42] },
    { name: 'black', rgb: [0, 0, 0] },
    { name: 'white', rgb: [255, 255, 255] },
    { name: 'gray', rgb: [128, 128, 128] },
    { name: 'navy', rgb: [0, 0, 128] },
    { name: 'maroon', rgb: [128, 0, 0] },
    { name: 'olive', rgb: [128, 128, 0] },
    { name: 'teal', rgb: [0, 128, 128] }
  ]
  
  let minDistance = Infinity
  let closestColor = 'black'
  
  colors.forEach(color => {
    const distance = Math.sqrt(
      Math.pow(r - color.rgb[0], 2) +
      Math.pow(g - color.rgb[1], 2) +
      Math.pow(b - color.rgb[2], 2)
    )
    
    if (distance < minDistance) {
      minDistance = distance
      closestColor = color.name
    }
  })
  
  return closestColor
}

// Detect objects in image
export const detectObjects = async (imageElement: HTMLImageElement): Promise<string[]> => {
  try {
    if (!objectDetectionModel) {
      await loadModels()
    }
    
    if (!objectDetectionModel) {
      return ['clothing']
    }
    
    const predictions = await objectDetectionModel.detect(imageElement)
    
    // Filter for clothing-related objects and map to fashion categories
    const clothingObjects = predictions
      .filter(pred => pred.score > 0.3)
      .map(pred => mapToFashionCategory(pred.class))
      .filter(item => item !== null) as string[]
    
    return clothingObjects.length > 0 ? [...new Set(clothingObjects)] : ['clothing']
  } catch (error) {
    console.error('Object detection error:', error)
    return ['clothing']
  }
}

// Map detected objects to fashion categories
const mapToFashionCategory = (detectedClass: string): string | null => {
  const fashionMapping: { [key: string]: string } = {
    'person': 'clothing',
    'handbag': 'bags',
    'backpack': 'bags',
    'umbrella': 'accessories',
    'tie': 'accessories',
    'suitcase': 'bags',
    'shoe': 'shoes',
    'sneaker': 'shoes',
    'boot': 'shoes',
    'sandal': 'shoes'
  }
  
  const lowerClass = detectedClass.toLowerCase()
  
  // Direct mapping
  if (fashionMapping[lowerClass]) {
    return fashionMapping[lowerClass]
  }
  
  // Partial matching for clothing items
  if (lowerClass.includes('shirt') || lowerClass.includes('top')) return 'shirts'
  if (lowerClass.includes('jean') || lowerClass.includes('pant')) return 'jeans'
  if (lowerClass.includes('dress')) return 'dresses'
  if (lowerClass.includes('jacket') || lowerClass.includes('coat')) return 'jackets'
  if (lowerClass.includes('shoe') || lowerClass.includes('boot') || lowerClass.includes('sneaker')) return 'shoes'
  if (lowerClass.includes('bag') || lowerClass.includes('purse')) return 'bags'
  if (lowerClass.includes('hat') || lowerClass.includes('cap')) return 'accessories'
  if (lowerClass.includes('watch')) return 'accessories'
  if (lowerClass.includes('glasses')) return 'accessories'
  
  return null
}

// Get image embeddings using MobileNet
export const getImageEmbeddings = async (imageElement: HTMLImageElement): Promise<number[]> => {
  try {
    if (!mobilenetModel) {
      await loadModels()
    }
    
    if (!mobilenetModel) {
      return []
    }
    
    // Get embeddings (feature vector)
    const embeddings = mobilenetModel.infer(imageElement, true) as tf.Tensor
    const embeddingArray = await embeddings.data()
    
    // Clean up tensor
    embeddings.dispose()
    
    return Array.from(embeddingArray)
  } catch (error) {
    console.error('Embedding extraction error:', error)
    return []
  }
}

// Analyze fashion style based on colors and objects
export const analyzeFashionStyle = (colors: string[], objects: string[]): {
  style: string
  aesthetic: string
  categories: string[]
} => {
  const styles = {
    formal: ['black', 'white', 'navy', 'gray'],
    casual: ['blue', 'red', 'green', 'yellow'],
    elegant: ['black', 'white', 'navy', 'purple'],
    sporty: ['blue', 'red', 'white', 'black'],
    bohemian: ['brown', 'orange', 'yellow', 'green'],
    vintage: ['brown', 'olive', 'maroon', 'navy']
  }
  
  let detectedStyle = 'casual'
  let maxMatches = 0
  
  Object.entries(styles).forEach(([style, styleColors]) => {
    const matches = colors.filter(color => styleColors.includes(color)).length
    if (matches > maxMatches) {
      maxMatches = matches
      detectedStyle = style
    }
  })
  
  const aesthetic = getAesthetic(colors, objects)
  const categories = objects.length > 0 ? objects : ['clothing']
  
  return {
    style: detectedStyle,
    aesthetic,
    categories
  }
}

const getAesthetic = (colors: string[], objects: string[]): string => {
  const darkColors = ['black', 'navy', 'maroon', 'gray']
  const brightColors = ['red', 'yellow', 'orange', 'pink']
  const neutralColors = ['white', 'gray', 'brown', 'beige']
  
  const hasDark = colors.some(color => darkColors.includes(color))
  const hasBright = colors.some(color => brightColors.includes(color))
  const hasNeutral = colors.some(color => neutralColors.includes(color))
  
  if (hasDark && !hasBright) return 'minimalist'
  if (hasBright && !hasDark) return 'vibrant'
  if (hasNeutral && !hasBright && !hasDark) return 'neutral'
  if (hasDark && hasBright) return 'bold'
  
  return 'modern'
}

// Complete image analysis
export const analyzeImage = async (imageElement: HTMLImageElement) => {
  try {
    // Run analysis in parallel for speed
    const [colors, objects, embeddings] = await Promise.all([
      extractColors(imageElement),
      detectObjects(imageElement),
      getImageEmbeddings(imageElement)
    ])
    
    const fashionAnalysis = analyzeFashionStyle(colors, objects)
    
    // Generate search keywords
    const searchKeywords = [
      ...fashionAnalysis.categories,
      ...colors,
      fashionAnalysis.style,
      fashionAnalysis.aesthetic
    ].filter(Boolean)
    
    return {
      items: objects,
      colors,
      style: fashionAnalysis.style,
      categories: fashionAnalysis.categories,
      patterns: [], // Could be enhanced with pattern recognition
      aesthetic: fashionAnalysis.aesthetic,
      search_keywords: searchKeywords,
      embeddings
    }
  } catch (error) {
    console.error('Image analysis error:', error)
    return {
      items: ['clothing'],
      colors: ['black', 'white'],
      style: 'casual',
      categories: ['clothing'],
      patterns: [],
      aesthetic: 'modern',
      search_keywords: ['fashion', 'clothing'],
      embeddings: []
    }
  }
}
