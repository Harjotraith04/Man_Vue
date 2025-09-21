import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setToken } = useAuthStore()

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (token) {
      setToken(token)
      navigate('/', { replace: true })
    } else {
      navigate('/auth', { replace: true })
    }
  }, [searchParams, setToken, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="spinner mx-auto mb-4"></div>
        <p>Completing authentication...</p>
      </div>
    </div>
  )
}
