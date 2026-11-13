import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, apiFetch } from '../src/api/client.js'

function mockResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => (body === undefined ? '' : typeof body === 'string' ? body : JSON.stringify(body)),
  }
}

describe('apiFetch', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://api.test/api/v1/')
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('returns parsed JSON on success', async () => {
    const categories = [{ slug: 'yazilim', name: 'Yazılım' }]
    fetch.mockResolvedValue(mockResponse(200, categories))

    await expect(apiFetch('/categories/')).resolves.toEqual(categories)
    expect(fetch).toHaveBeenCalledWith('http://api.test/api/v1/categories/', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      body: undefined,
    })
  })

  it('sends JSON body and Bearer token', async () => {
    fetch.mockResolvedValue(mockResponse(200, { ok: true }))

    await apiFetch('/quizzes/1/answers/', {
      method: 'POST',
      token: 'secret-token',
      body: { question_id: 5, choice_id: null },
    })

    const [, options] = fetch.mock.calls[0]
    expect(options.method).toBe('POST')
    expect(options.headers.Authorization).toBe('Bearer secret-token')
    expect(options.headers['Content-Type']).toBe('application/json')
    expect(options.body).toBe('{"question_id":5,"choice_id":null}')
  })

  it('does not send Authorization without a token', async () => {
    fetch.mockResolvedValue(mockResponse(200, []))

    await apiFetch('/categories/')

    expect(fetch.mock.calls[0][1].headers).not.toHaveProperty('Authorization')
  })

  it('converts the error body into ApiError', async () => {
    fetch.mockResolvedValue(
      mockResponse(410, { error: { code: 'QUIZ_EXPIRED', message: 'Quiz süresi doldu.' } }),
    )

    const error = await apiFetch('/quizzes/1/current/').catch((e) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(410)
    expect(error.code).toBe('QUIZ_EXPIRED')
    expect(error.message).toBe('Quiz süresi doldu.')
  })

  it('handles an error response without the expected body', async () => {
    fetch.mockResolvedValue(mockResponse(502, '<html>Bad Gateway</html>'))

    const error = await apiFetch('/categories/').catch((e) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(502)
    expect(error.code).toBe('UNKNOWN_ERROR')
    expect(error.message).toBe('Beklenmeyen bir hata oluştu.')
  })

  it('turns a network failure into NETWORK_ERROR', async () => {
    fetch.mockRejectedValue(new TypeError('Failed to fetch'))

    const error = await apiFetch('/categories/').catch((e) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(0)
    expect(error.code).toBe('NETWORK_ERROR')
    expect(error.message).toBe('Sunucuya ulaşılamadı.')
  })
})
