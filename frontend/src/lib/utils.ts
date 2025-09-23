import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | undefined | null, currency: string = '£'): string {
  if (price === undefined || price === null || isNaN(price)) {
    return `${currency}0`
  }
  return `${currency}${price.toLocaleString('en-GB')}`
}

export function formatDiscountPercentage(original: number, selling: number): number {
  return Math.round(((original - selling) / original) * 100)
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const target = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Just now'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }
  
  return formatDate(date)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, wait)
    }
  }
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50)
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[+]?[\d\s\-\(\)]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

export function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function isServer(): boolean {
  return typeof window === 'undefined'
}

export function getImageUrl(url: string, width?: number, height?: number): string {
  if (!url) return ''
  
  // If it's already a full URL, return as is
  if (url.startsWith('http')) {
    return url
  }
  
  // For Cloudinary URLs, add transformations
  if (url.includes('cloudinary')) {
    const baseUrl = url.split('/upload/')[0] + '/upload/'
    const imagePath = url.split('/upload/')[1]
    
    let transformations = []
    if (width) transformations.push(`w_${width}`)
    if (height) transformations.push(`h_${height}`)
    transformations.push('c_fill', 'q_auto', 'f_auto')
    
    return `${baseUrl}${transformations.join(',')}/${imagePath}`
  }
  
  return url
}

export function getResponsiveImageSizes(baseUrl: string) {
  return {
    thumbnail: getImageUrl(baseUrl, 150, 150),
    small: getImageUrl(baseUrl, 300, 300),
    medium: getImageUrl(baseUrl, 600, 600),
    large: getImageUrl(baseUrl, 1200, 1200),
    original: baseUrl
  }
}

export function createImageSrcSet(baseUrl: string): string {
  const sizes = getResponsiveImageSizes(baseUrl)
  return [
    `${sizes.small} 300w`,
    `${sizes.medium} 600w`,
    `${sizes.large} 1200w`
  ].join(', ')
}

export function scrollToTop(smooth: boolean = true): void {
  window.scrollTo({
    top: 0,
    behavior: smooth ? 'smooth' : 'auto'
  })
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text)
  }
  
  // Fallback for older browsers
  const textArea = document.createElement('textarea')
  textArea.value = text
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()
  
  try {
    document.execCommand('copy')
    document.body.removeChild(textArea)
    return Promise.resolve()
  } catch (err) {
    document.body.removeChild(textArea)
    return Promise.reject(err)
  }
}

export function downloadFile(url: string, filename: string): void {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function shareUrl(url: string, title?: string): void {
  if (navigator.share) {
    navigator.share({
      title: title || 'Check this out!',
      url
    })
  } else {
    copyToClipboard(url)
  }
}

export function generateColorFromString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const hue = hash % 360
  return `hsl(${hue}, 65%, 50%)`
}

export function isValidImageUrl(url: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
  const lowercaseUrl = url.toLowerCase()
  
  return imageExtensions.some(ext => lowercaseUrl.includes(ext)) || 
         lowercaseUrl.includes('cloudinary') ||
         lowercaseUrl.includes('unsplash')
}
