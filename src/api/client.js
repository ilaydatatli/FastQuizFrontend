const NETWORK_ERROR_MESSAGE = 'Sunucuya ulaşılamadı.'
const UNKNOWN_ERROR_MESSAGE = 'Beklenmeyen bir hata oluştu.'

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

function baseUrl() {
  return (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')
}

async function readJson(response) {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

// Calls the API and returns parsed JSON, or throws ApiError { status, code, message }.
export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${baseUrl()}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', NETWORK_ERROR_MESSAGE)
  }

  const data = await readJson(response)

  if (!response.ok) {
    const error = data?.error
    if (error?.code) {
      throw new ApiError(response.status, error.code, error.message || UNKNOWN_ERROR_MESSAGE)
    }
    throw new ApiError(response.status, 'UNKNOWN_ERROR', UNKNOWN_ERROR_MESSAGE)
  }

  return data
}
