import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin,
  CreditCard,
  Truck,
  Shield,
  RotateCcw
} from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerSections = {
    company: {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Careers', href: '/careers' },
        { name: 'Press', href: '/press' },
        { name: 'Sustainability', href: '/sustainability' }
      ]
    },
    help: {
      title: 'Help & Support',
      links: [
        { name: 'Contact Us', href: '/contact' },
        { name: 'Size Guide', href: '/size-guide' },
        { name: 'FAQ', href: '/faq' },
        { name: 'Track Order', href: '/track-order' },
        { name: 'Returns & Exchange', href: '/returns' }
      ]
    },
    shop: {
      title: 'Shop',
      links: [
        { name: 'New Arrivals', href: '/products?newArrival=true' },
        { name: 'Best Sellers', href: '/products?bestSeller=true' },
        { name: 'Sale', href: '/products?discount=true' },
        { name: 'Formal Wear', href: '/products?subCategory=formal' },
        { name: 'Casual Wear', href: '/products?subCategory=casual' }
      ]
    },
    legal: {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Cookie Policy', href: '/cookies' },
        { name: 'Shipping Policy', href: '/shipping' }
      ]
    }
  }

  const features = [
    {
      icon: Truck,
      title: 'Free Shipping',
      description: 'On orders above £50'
    },
    {
      icon: RotateCcw,
      title: 'Easy Returns',
      description: '30-day return policy'
    },
    {
      icon: Shield,
      title: 'Secure Payment',
      description: '100% secure transactions'
    },
    {
      icon: CreditCard,
      title: 'COD Available',
      description: 'Cash on delivery option'
    }
  ]

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/manvue', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com/manvue', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com/manvue', label: 'Instagram' },
    { icon: Youtube, href: 'https://youtube.com/manvue', label: 'YouTube' }
  ]

  const handleNewsletterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email')
    console.log('Newsletter signup:', email)
    // TODO: Implement newsletter signup
  }

  return (
    <footer className="bg-gray-900 text-white">
      {/* Features Section */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <feature.icon className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <div className="text-3xl font-bold text-white">
                ManVue
              </div>
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Your ultimate destination for premium men's fashion. Discover the latest trends with AI-powered recommendations and immersive shopping experiences.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <span>support@manvue.com</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span>+44 07741855104</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span>London, UK</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-xl font-semibold mb-2">Stay Updated</h3>
            <p className="text-gray-400 mb-4">
              Get the latest fashion trends and exclusive offers delivered to your inbox.
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <Input
                type="email"
                name="email"
                placeholder="Enter your email"
                required
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              />
              <Button type="submit" variant="default">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Social Links & Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <div className="flex space-x-4 mb-4 md:mb-0">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
          
          <div className="text-gray-400 text-sm text-center md:text-right">
            <p>&copy; {currentYear} ManVue. All rights reserved.</p>
            <p className="mt-1">
              Made with ❤️ for fashion enthusiasts
            </p>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-gray-800 py-4">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">We Accept</p>
            <div className="flex justify-center items-center space-x-4 text-xs text-gray-500">
              <span>Visa</span>
              <span>•</span>
              <span>Mastercard</span>
              <span>•</span>
              <span>UPI</span>
              <span>•</span>
              <span>Razorpay</span>
              <span>•</span>
              <span>COD</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
