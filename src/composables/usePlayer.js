import { ref } from 'vue'

// The player's nickname, asked once and remembered on this device (Faz 22).
// localStorage is fine: it is a preference, not a secret.
const STORAGE_KEY = 'fastquiz.nickname'

// Same rule as the server (services.NICKNAME_RE: Python's \w is Unicode letters,
// digits, marks and "_"). The server still checks; this only gives instant feedback.
const NICKNAME_RE = /^[\p{L}\p{N}\p{M}\p{Pc}\- ]{2,16}$/u

export function cleanNickname(value) {
  const nickname = String(value ?? '').trim()
  return NICKNAME_RE.test(nickname) ? nickname : null
}

function readStored() {
  try {
    return cleanNickname(localStorage.getItem(STORAGE_KEY))
  } catch {
    return null // storage blocked: we simply ask again
  }
}

const nickname = ref(readStored())
const editing = ref(false)

export function usePlayer() {
  /** Returns false (and changes nothing) if the nickname breaks the rule. */
  function setNickname(value) {
    const clean = cleanNickname(value)
    if (!clean) return false
    nickname.value = clean
    editing.value = false
    try {
      localStorage.setItem(STORAGE_KEY, clean)
    } catch {
      // Storage blocked: the name still works until the page is reloaded.
    }
    return true
  }

  return {
    nickname,
    editing,
    setNickname,
    startEditing: () => (editing.value = true),
    cancelEditing: () => (editing.value = false),
  }
}
