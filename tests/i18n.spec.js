import { describe, expect, it } from 'vitest'
import { detectLanguage, translate } from '../src/composables/useI18n.js'
import { errorMessage } from '../src/composables/useQuiz.js'
import en from '../src/i18n/en.js'
import es from '../src/i18n/es.js'
import nl from '../src/i18n/nl.js'
import tr from '../src/i18n/tr.js'

// Flatten {a: {b: 'x'}} -> {'a.b': 'x'}
function flatten(node, prefix = '') {
  return Object.entries(node).reduce((all, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    return typeof value === 'object' ? { ...all, ...flatten(value, path) } : { ...all, [path]: value }
  }, {})
}

function placeholders(text) {
  return [...String(text).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort()
}

describe('dictionaries', () => {
  const base = flatten(tr)

  for (const [name, dictionary] of Object.entries({ en, nl, es })) {
    it(`${name} has exactly the same keys as tr`, () => {
      expect(Object.keys(flatten(dictionary)).sort()).toEqual(Object.keys(base).sort())
    })

    it(`${name} uses the same {placeholders} as tr`, () => {
      const flat = flatten(dictionary)
      for (const [key, text] of Object.entries(base)) {
        expect(placeholders(flat[key]), key).toEqual(placeholders(text))
      }
    })
  }
})

describe('detectLanguage', () => {
  it('prefers the saved choice', () => {
    expect(detectLanguage('es', ['en-US'])).toBe('es')
  })

  it('ignores an unknown saved value', () => {
    expect(detectLanguage('de', ['en-GB'])).toBe('en')
  })

  it('uses the first supported device language', () => {
    expect(detectLanguage(null, ['de-DE', 'es-MX', 'en-US'])).toBe('es')
    expect(detectLanguage(null, ['TR-tr'])).toBe('tr')
    expect(detectLanguage(null, ['nl-BE', 'en'])).toBe('nl')
  })

  it('falls back to Turkish', () => {
    expect(detectLanguage(null, ['de-DE', 'fr'])).toBe('tr')
    expect(detectLanguage(null, [])).toBe('tr')
  })
})

describe('translate', () => {
  it('fills in parameters', () => {
    expect(translate('en', 'result.correct', { correct: 14, total: 20 })).toBe('14 / 20 correct')
  })

  it('falls back to Turkish, then to the key', () => {
    expect(translate('xx', 'common.retry')).toBe('Tekrar dene')
    expect(translate('en', 'no.such.key')).toBe('no.such.key')
  })
})

describe('errorMessage', () => {
  it('shows the message for the error code in the given language', () => {
    const error = { status: 410, code: 'QUIZ_EXPIRED', message: 'Türkçe sunucu mesajı' }
    expect(errorMessage(error, 'en')).toBe('This quiz has expired. Start a new one.')
    expect(errorMessage(error, 'es')).toBe('Este quiz ha caducado. Empieza uno nuevo.')
  })

  it('treats any 429 as rate limited', () => {
    expect(errorMessage({ status: 429, code: 'SOMETHING' }, 'en')).toBe(en.errors.RATE_LIMITED)
  })

  it('falls back to the server message for unknown codes', () => {
    expect(errorMessage({ status: 409, code: 'NEW_CODE', message: 'Sunucu mesajı' }, 'en')).toBe('Sunucu mesajı')
    expect(errorMessage({ status: 409, code: 'NEW_CODE' }, 'en')).toBe(en.errors.UNKNOWN_ERROR)
  })
})
