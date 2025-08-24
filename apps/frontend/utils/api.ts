const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const api = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  },

  async post<T>(endpoint: string, data: any): Promise<T> {
    console.log('POST request to:', `${API_BASE_URL}${endpoint}`)
    console.log('POST data:', JSON.stringify(data, null, 2))
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('POST error response:', errorText)
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
    }
    return response.json()
  },

  async put<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  },

  async patch<T>(endpoint: string, data: any): Promise<T> {
    console.log('PATCH request to:', `${API_BASE_URL}${endpoint}`)
    console.log('PATCH data:', JSON.stringify(data, null, 2))
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('PATCH error response:', errorText)
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
    }
    return response.json()
  },

  async delete(endpoint: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
  },
}