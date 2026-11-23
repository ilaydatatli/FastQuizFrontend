// Small pure helpers for challenge rooms (Faz 25); tested in tests/room.spec.js.

// "kedi 42" / "kedi-42" -> "KEDI42"
export function cleanRoomCode(value) {
  return String(value ?? '')
    .toUpperCase()
    .replace(/[\s-]/g, '')
}

export function isRoomCode(value) {
  return /^[A-Z0-9]{6}$/.test(value)
}

// Hours until the room closes, rounded (a new room says 24, not 23);
// 0 = less than an hour left, null = closed.
export function hoursLeft(expiresAt, now = Date.now()) {
  const ms = new Date(expiresAt).getTime() - now
  if (ms <= 0) return null
  if (ms < 3_600_000) return 0
  return Math.round(ms / 3_600_000)
}

export function roomUrl(code, origin = window.location.origin) {
  return `${origin}/room/${code}`
}
