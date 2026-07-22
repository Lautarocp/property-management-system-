import axios from 'axios'

const apiClient = axios.create({
  baseURL: window.location.hostname.includes('.ts.net')
    ? `https://${window.location.hostname}:8443/api`
    : `http://${window.location.hostname}:3000/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add token to headers
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

// Response interceptor - handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
