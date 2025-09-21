import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Upload, ImagePlus } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

interface AddProductProps {
  onClose: () => void
  onSuccess: () => void
}

interface ProductVariant {
  color: string
  colorCode: string
  sizes: { size: string; stock: number; price: number }[]
}

interface ProductForm {
  title: string
  description: string
  shortDescription: string
  category: string
  subCategory: string
  brand: { name: string; logo: string }
  price: { original: number; selling: number }
  discount: { percentage: number; isActive: boolean }
  specifications: {
    material: string
    care: string
    fit: string
    pattern: string
    sleeve: string
    neckType: string
    origin: string
  }
  tags: string[]
  features: string[]
  isFeatured: boolean
  isNewArrival: boolean
  isBestSeller: boolean
}

export default function AddProduct({ onClose, onSuccess }: AddProductProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [imagePreview, setImagePreview] = useState<string[]>([])
  const [variants, setVariants] = useState<ProductVariant[]>([{
    color: 'Default',
    colorCode: '#000000',
    sizes: [{ size: 'M', stock: 10, price: 0 }]
  }])

  const [form, setForm] = useState<ProductForm>({
    title: '',
    description: '',
    shortDescription: '',
    category: '',
    subCategory: '',
    brand: { name: '', logo: '' },
    price: { original: 0, selling: 0 },
    discount: { percentage: 0, isActive: false },
    specifications: {
      material: '',
      care: '',
      fit: 'regular',
      pattern: '',
      sleeve: '',
      neckType: '',
      origin: ''
    },
    tags: [],
    features: [],
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false
  })

  const [newTag, setNewTag] = useState('')
  const [newFeature, setNewFeature] = useState('')

  const categories = [
    'shirts', 'tshirts', 'jeans', 'trousers', 'chinos', 'shorts',
    'jackets', 'blazers', 'suits', 'sweaters', 'hoodies',
    'kurtas', 'sherwanis', 'ethnic-wear',
    'shoes', 'sneakers', 'formal-shoes', 'boots', 'sandals',
    'watches', 'belts', 'wallets', 'sunglasses', 'ties', 'bags',
    'accessories'
  ]

  const subCategories = [
    'casual', 'formal', 'sport', 'party', 'wedding', 'office',
    'summer', 'winter', 'monsoon', 'festival', 'daily-wear'
  ]

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40', '42']

  const fitOptions = ['slim', 'regular', 'loose', 'tight', 'relaxed', 'oversized']

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + images.length > 10) {
      toast.error('Maximum 10 images allowed')
      return
    }

    setImages(prev => [...prev, ...files])
    
    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreview(prev => prev.filter((_, i) => i !== index))
  }

  const addTag = () => {
    if (newTag.trim() && !form.tags.includes(newTag.trim())) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const addFeature = () => {
    if (newFeature.trim() && !form.features.includes(newFeature.trim())) {
      setForm(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }))
      setNewFeature('')
    }
  }

  const removeFeature = (feature: string) => {
    setForm(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }))
  }

  const addVariantSize = (variantIndex: number) => {
    setVariants(prev => prev.map((variant, i) => 
      i === variantIndex 
        ? { 
            ...variant, 
            sizes: [...variant.sizes, { size: 'M', stock: 10, price: form.price.selling }]
          }
        : variant
    ))
  }

  const removeVariantSize = (variantIndex: number, sizeIndex: number) => {
    setVariants(prev => prev.map((variant, i) => 
      i === variantIndex 
        ? { 
            ...variant, 
            sizes: variant.sizes.filter((_, si) => si !== sizeIndex)
          }
        : variant
    ))
  }

  const updateVariant = (variantIndex: number, field: string, value: any) => {
    setVariants(prev => prev.map((variant, i) => 
      i === variantIndex ? { ...variant, [field]: value } : variant
    ))
  }

  const updateVariantSize = (variantIndex: number, sizeIndex: number, field: string, value: any) => {
    setVariants(prev => prev.map((variant, i) => 
      i === variantIndex 
        ? {
            ...variant,
            sizes: variant.sizes.map((size, si) => 
              si === sizeIndex ? { ...size, [field]: value } : size
            )
          }
        : variant
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData()
      
      // Add basic product data
      Object.entries(form).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          formData.append(key, JSON.stringify(value))
        } else {
          formData.append(key, value.toString())
        }
      })

      // Add variants
      formData.append('variants', JSON.stringify(variants))

      // Add images
      images.forEach(image => {
        formData.append('images', image)
      })

      const response = await axios.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      toast.success('Product created successfully!')
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Failed to create product:', error)
      const message = error.response?.data?.message || 'Failed to create product'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Add New Product</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Product Title *</label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter product title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Brand Name *</label>
                  <Input
                    value={form.brand.name}
                    onChange={(e) => setForm(prev => ({ 
                      ...prev, 
                      brand: { ...prev.brand, name: e.target.value }
                    }))}
                    placeholder="Enter brand name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter detailed product description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Short Description</label>
                <Input
                  value={form.shortDescription}
                  onChange={(e) => setForm(prev => ({ ...prev, shortDescription: e.target.value }))}
                  placeholder="Brief product summary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Sub Category</label>
                  <select
                    value={form.subCategory}
                    onChange={(e) => setForm(prev => ({ ...prev, subCategory: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select sub category</option>
                    {subCategories.map(subCat => (
                      <option key={subCat} value={subCat}>
                        {subCat.charAt(0).toUpperCase() + subCat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Original Price *</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price.original || ''}
                    onChange={(e) => setForm(prev => ({ 
                      ...prev, 
                      price: { ...prev.price, original: parseFloat(e.target.value) || 0 }
                    }))}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Selling Price *</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price.selling || ''}
                    onChange={(e) => setForm(prev => ({ 
                      ...prev, 
                      price: { ...prev.price, selling: parseFloat(e.target.value) || 0 }
                    }))}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Discount %</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={form.discount.percentage || ''}
                    onChange={(e) => setForm(prev => ({ 
                      ...prev, 
                      discount: { 
                        ...prev.discount, 
                        percentage: parseFloat(e.target.value) || 0,
                        isActive: parseFloat(e.target.value) > 0
                      }
                    }))}
                    placeholder="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Images */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <ImagePlus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600">Click to upload images</p>
                    <p className="text-xs text-gray-400">Maximum 10 images, up to 5MB each</p>
                  </label>
                </div>

                {imagePreview.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreview.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2 h-6 w-6 p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        {index === 0 && (
                          <Badge className="absolute bottom-2 left-2">Primary</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Product Variants */}
          <Card>
            <CardHeader>
              <CardTitle>Product Variants & Sizes</CardTitle>
            </CardHeader>
            <CardContent>
              {variants.map((variant, variantIndex) => (
                <div key={variantIndex} className="border rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Color</label>
                      <Input
                        value={variant.color}
                        onChange={(e) => updateVariant(variantIndex, 'color', e.target.value)}
                        placeholder="Color name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Color Code</label>
                      <Input
                        type="color"
                        value={variant.colorCode}
                        onChange={(e) => updateVariant(variantIndex, 'colorCode', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium">Available Sizes</label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => addVariantSize(variantIndex)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Size
                      </Button>
                    </div>
                    
                    <div className="grid gap-3">
                      {variant.sizes.map((size, sizeIndex) => (
                        <div key={sizeIndex} className="grid grid-cols-4 gap-2 items-center">
                          <select
                            value={size.size}
                            onChange={(e) => updateVariantSize(variantIndex, sizeIndex, 'size', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            {sizes.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <Input
                            type="number"
                            min="0"
                            value={size.stock}
                            onChange={(e) => updateVariantSize(variantIndex, sizeIndex, 'stock', parseInt(e.target.value) || 0)}
                            placeholder="Stock"
                            className="text-sm"
                          />
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={size.price}
                            onChange={(e) => updateVariantSize(variantIndex, sizeIndex, 'price', parseFloat(e.target.value) || 0)}
                            placeholder="Price"
                            className="text-sm"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeVariantSize(variantIndex, sizeIndex)}
                            disabled={variant.sizes.length === 1}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Material</label>
                  <Input
                    value={form.specifications.material}
                    onChange={(e) => setForm(prev => ({ 
                      ...prev, 
                      specifications: { ...prev.specifications, material: e.target.value }
                    }))}
                    placeholder="e.g., 100% Cotton"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Fit</label>
                  <select
                    value={form.specifications.fit}
                    onChange={(e) => setForm(prev => ({ 
                      ...prev, 
                      specifications: { ...prev.specifications, fit: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {fitOptions.map(fit => (
                      <option key={fit} value={fit}>
                        {fit.charAt(0).toUpperCase() + fit.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Care Instructions</label>
                  <Input
                    value={form.specifications.care}
                    onChange={(e) => setForm(prev => ({ 
                      ...prev, 
                      specifications: { ...prev.specifications, care: e.target.value }
                    }))}
                    placeholder="e.g., Machine wash cold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Origin</label>
                  <Input
                    value={form.specifications.origin}
                    onChange={(e) => setForm(prev => ({ 
                      ...prev, 
                      specifications: { ...prev.specifications, origin: e.target.value }
                    }))}
                    placeholder="e.g., Made in India"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags and Features */}
          <Card>
            <CardHeader>
              <CardTitle>Tags & Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <div className="flex space-x-2 mb-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Features</label>
                <div className="flex space-x-2 mb-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add a feature"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  />
                  <Button type="button" onClick={addFeature} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {form.features.map(feature => (
                    <div key={feature} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm">{feature}</span>
                      <Button type="button" size="sm" variant="ghost" onClick={() => removeFeature(feature)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Flags */}
          <Card>
            <CardHeader>
              <CardTitle>Product Flags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Featured Product</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={form.isNewArrival}
                    onChange={(e) => setForm(prev => ({ ...prev, isNewArrival: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>New Arrival</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={form.isBestSeller}
                    onChange={(e) => setForm(prev => ({ ...prev, isBestSeller: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Best Seller</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Creating Product...' : 'Create Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
