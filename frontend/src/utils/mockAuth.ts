import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

// Simple mock authentication for testing
export const mockAuth = {
  // Test user token (valid for 30 days)
  testToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZDVlNmM3MmU4ODYyODUzMTY2ZTRmNiIsImlhdCI6MTc1ODg0OTQ1OSwiZXhwIjoxNzYxNDQxNDU5fQ.PzKFlwRP7dV37LOZQn-lgw2q_7jzf0zlQP8zwPgeRXs",
  
  // Test user credentials
  testUser: {
    email: "test@example.com",
    password: "test123",
    name: "Test User",
    id: "68d5e6c72e8862853166e4f6"
  },

  // Apply mock auth for development
  applyMockAuth() {
    console.log('🚀 Applying mock authentication...')
    
    // Set axios header first
    axios.defaults.headers.common['Authorization'] = `Bearer ${this.testToken}`;
    
    // Set the auth state
    useAuthStore.setState({
      user: {
        id: this.testUser.id,
        name: this.testUser.name,
        email: this.testUser.email,
        role: 'user'
      },
      token: this.testToken,
      isAuthenticated: true,
      isLoading: false
    });
    
    console.log('✅ Mock authentication applied!')
    console.log('✅ User:', this.testUser.email)
    console.log('✅ Token:', this.testToken.substring(0, 50) + '...')
    console.log('✅ Auth state:', useAuthStore.getState().isAuthenticated)
    
    // Force re-render by dispatching a custom event
    window.dispatchEvent(new CustomEvent('auth-updated'))
  }
};

// Auto-apply in development immediately
if (typeof window !== 'undefined') {
  console.log('🔧 Setting up mock auth...')
  
  // Apply immediately and also after a short delay
  mockAuth.applyMockAuth()
  
  setTimeout(() => {
    mockAuth.applyMockAuth()
  }, 500)
  
  setTimeout(() => {
    mockAuth.applyMockAuth()
  }, 2000)
}

export default mockAuth
