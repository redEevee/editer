import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || ''

const client = axios.create({ baseURL: BASE_URL })

client.interceptors.request.use(config => {
  const key = localStorage.getItem('openai_api_key')
  if (key) config.headers['x-api-key'] = key
  return config
})

export async function analyzeStoryboard(file, count = 9) {
  const formData = new FormData()
  formData.append('pdf', file)
  formData.append('count', String(count))
  const response = await client.post('/api/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export async function generateImage(imagePrompt, postId) {
  const response = await client.post('/api/generate-image', { imagePrompt, postId })
  return response.data
}
