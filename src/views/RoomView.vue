<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getRoom } from '../api/quiz.js'
import { useI18n } from '../composables/useI18n.js'
import { usePlayer } from '../composables/usePlayer.js'
import { errorMessage, useQuiz } from '../composables/useQuiz.js'
import { cleanRoomCode, hoursLeft, roomUrl } from '../composables/room.js'
import LeaderboardTable from '../components/LeaderboardTable.vue'
import NeonButton from '../components/NeonButton.vue'

const route = useRoute()
const router = useRouter()
const quiz = useQuiz()
const { t, locale } = useI18n()
const { nickname, startEditing } = usePlayer()

const code = computed(() => cleanRoomCode(route.params.code))
// Set by RoomNewView right after the room was opened.
const justCreated = ref(Boolean(window.history.state?.created))

const data = ref(null)
const loading = ref(true)
const loadError = ref('')
const notFound = ref(false)
const starting = ref(false)
const playError = ref('')
const copied = ref(false)
const manualUrl = ref('') // shown when sharing and copying are not possible

const hours = computed(() => (data.value ? hoursLeft(data.value.room.expires_at) : null))
const isOpen = computed(() => Boolean(data.value?.is_open && hours.value !== null))
// One play per nickname: the player's own row, if they already played.
const myEntry = computed(() => data.value?.entries.find((e) => e.nickname === nickname.value) ?? null)
const canPlay = computed(() => isOpen.value && !myEntry.value)

let latestLoad = 0

async function load() {
  const thisLoad = ++latestLoad
  loading.value = true
  loadError.value = ''
  try {
    const room = await getRoom(code.value, locale.value)
    if (thisLoad !== latestLoad) return
    data.value = room
  } catch (error) {
    if (thisLoad !== latestLoad) return
    notFound.value = error.code === 'ROOM_NOT_FOUND'
    loadError.value = errorMessage(error)
  } finally {
    if (thisLoad === latestLoad) loading.value = false
  }
}

async function onPlay() {
  if (starting.value) return
  if (!nickname.value) {
    startEditing()
    return
  }
  starting.value = true
  playError.value = ''
  try {
    const { quizId } = await quiz.startRoom(code.value, nickname.value)
    await router.push({ name: 'quiz', params: { quizId } })
  } catch (error) {
    playError.value = errorMessage(error)
    if (['ROOM_ALREADY_PLAYED', 'ROOM_CLOSED', 'ROOM_FULL'].includes(error.code)) load()
  } finally {
    starting.value = false
  }
}

async function onShare() {
  const url = roomUrl(code.value)
  const text = t('room.shareText', { category: data.value.room.category.name, code: code.value })
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Fast Quiz', text, url })
      return
    } catch (error) {
      if (error?.name === 'AbortError') return // the player closed the share sheet
    }
  }
  try {
    await navigator.clipboard.writeText(`${text} ${url}`)
    copied.value = true
    setTimeout(() => (copied.value = false), 2500)
  } catch {
    manualUrl.value = url // last resort: the player copies it by hand
  }
}

onMounted(load)
watch(code, load)
watch(locale, load) // category name follows the language
</script>

<template>
  <section class="room">
    <p v-if="loading && !data" class="status" role="status">{{ t('common.loading') }}</p>

    <div v-else-if="loadError && !data" class="error" role="alert">
      <p>{{ loadError }}</p>
      <NeonButton v-if="!notFound" @click="load">{{ t('common.retry') }}</NeonButton>
      <RouterLink to="/" class="link">{{ t('common.backHome') }}</RouterLink>
    </div>

    <template v-else-if="data">
      <header class="head" :style="{ '--accent': `var(--neon-${data.room.category.color})` }">
        <p class="category">{{ data.room.category.name }}</p>
        <h1>
          <span class="label">{{ t('room.code') }}</span>
          <span class="code">{{ data.room.code }}</span>
        </h1>
        <p class="time">
          <template v-if="!isOpen">{{ t('room.closed') }}</template>
          <template v-else-if="hours === 0">{{ t('room.closingSoon') }}</template>
          <template v-else>{{ t('room.closesIn', { hours }) }}</template>
        </p>
      </header>

      <p class="explain">{{ t('room.explain') }}</p>

      <p v-if="justCreated && isOpen" class="notice is-good" role="status">{{ t('room.created') }}</p>

      <div class="actions">
        <NeonButton v-if="canPlay" class="play" :disabled="starting" @click="onPlay">
          {{ starting ? t('room.playing') : t('room.play') }}
        </NeonButton>
        <button v-if="isOpen" type="button" class="share" @click="onShare">
          {{ copied ? t('room.copied') : `${t('room.share')} 🔗` }}
        </button>
      </div>

      <input
        v-if="manualUrl"
        class="manual-url"
        readonly
        :value="manualUrl"
        :aria-label="t('room.code')"
        @focus="$event.target.select()"
      />

      <p v-if="myEntry" class="status">{{ t('room.played') }}</p>
      <p v-if="playError" class="notice" role="alert">{{ playError }}</p>

      <div class="board" :style="{ '--accent': `var(--neon-${data.room.category.color})` }">
        <div class="board-head">
          <h2>{{ t('room.board') }}</h2>
          <button type="button" class="link" :disabled="loading" @click="load">{{ t('room.refresh') }}</button>
        </div>
        <p v-if="data.entries.length === 0" class="status">{{ t('room.empty') }}</p>
        <LeaderboardTable v-else :entries="data.entries" :highlight="myEntry" />
      </div>
    </template>
  </section>
</template>

<style scoped>
.room {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  max-width: 640px;
  margin: var(--space-4) auto 0;
}

.head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  text-align: center;
}

.category {
  color: var(--accent);
  font-family: var(--font-display);
  font-weight: 700;
}

h1 {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  font-weight: 500;
}

.code {
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 2.5rem;
  letter-spacing: 0.15em;
  text-shadow: var(--glow-sm);
}

.time,
.status {
  color: var(--color-text-muted);
  text-align: center;
}

.explain {
  padding: var(--space-3) var(--space-4);
  border-left: 3px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: 0.9375rem;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-3);
}

.share,
.link {
  padding: var(--space-2) var(--space-3);
  border: none;
  background: none;
  color: var(--neon-cyan);
  font-family: var(--font-display);
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
}

.manual-url {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  font-family: var(--font-mono);
}

.notice {
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--color-wrong);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  text-align: center;
}

.notice.is-good {
  border-color: var(--color-correct);
}

.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-6);
  border: 2px solid var(--color-wrong);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  text-align: center;
}

.board {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-top: var(--space-4);
}

.board-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

h2 {
  font-size: 1.25rem;
}
</style>
