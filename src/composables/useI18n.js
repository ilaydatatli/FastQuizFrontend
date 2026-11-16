import { ref } from 'vue'
import en from '../i18n/en.js'
import es from '../i18n/es.js'
import tr from '../i18n/tr.js'

export const LANGUAGES = ['tr', 'en', 'es']
export const DEFAULT_LANGUAGE = 'tr'
export const FLAGS = { tr: '🇹🇷', en: '🇬🇧', es: '🇪🇸' }

const dictionaries = { tr, en, es }
const STORAGE_KEY = 'fastquiz.lang' // a preference, so localStorage is fine here

/** Saved choice -> device/browser language -> Turkish. */
export function detectLanguage(stored, deviceLanguages = []) {
  if (LANGUAGES.includes(stored)) return stored
  for (const tag of deviceLanguages) {
    const code = String(tag).toLowerCase().slice(0, 2)
    if (LANGUAGES.includes(code)) return code
  }
  return DEFAULT_LANGUAGE
}

function readStored() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function deviceLanguages() {
  if (typeof navigator === 'undefined') return []
  return navigator.languages?.length ? navigator.languages : [navigator.language]
}

function lookup(dictionary, key) {
  return key.split('.').reduce((node, part) => node?.[part], dictionary)
}

/** Text for `key` in `language`; missing keys fall back to Turkish, then to the key. */
export function translate(language, key, params = {}) {
  const text = lookup(dictionaries[language], key) ?? lookup(tr, key) ?? key
  return String(text).replace(/\{(\w+)\}/g, (match, name) => (name in params ? params[name] : match))
}

// One shared language for the whole app.
const locale = ref(detectLanguage(readStored(), deviceLanguages()))

function applyToDocument(language) {
  if (typeof document !== 'undefined') document.documentElement.lang = language
}
applyToDocument(locale.value)

export function setLanguage(language) {
  if (!LANGUAGES.includes(language)) return
  locale.value = language
  applyToDocument(language)
  try {
    localStorage.setItem(STORAGE_KEY, language)
  } catch {
    // Storage blocked: the choice still works until the page is reloaded.
  }
}

export function useI18n() {
  return {
    locale,
    t: (key, params) => translate(locale.value, key, params),
    setLanguage,
  }
}
