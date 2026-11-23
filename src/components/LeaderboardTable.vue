<script setup>
import { FLAGS, useI18n } from '../composables/useI18n.js'

const { t } = useI18n()

const props = defineProps({
  entries: { type: Array, required: true },
  highlight: { type: Object, default: null }, // { rank, nickname } of a just-saved score
  // "Genel" board: rows have categories_played instead of language / correct_count.
  categoryCount: { type: Number, default: null },
})

function isHighlighted(entry) {
  return props.highlight?.rank === entry.rank && props.highlight?.nickname === entry.nickname
}
</script>

<template>
  <p v-if="entries.length === 0" class="empty">{{ t('leaderboard.empty') }}</p>

  <table v-else class="table">
    <thead>
      <tr>
        <th scope="col" class="rank">#</th>
        <th scope="col">{{ t('leaderboard.nickname') }}</th>
        <template v-if="categoryCount === null">
          <th scope="col" class="flag"><span class="sr-only">{{ t('leaderboard.language') }}</span></th>
          <th scope="col" class="num">{{ t('leaderboard.correct') }}</th>
        </template>
        <th v-else scope="col" class="num">{{ t('leaderboard.categoriesPlayed') }}</th>
        <th scope="col" class="num">{{ t('leaderboard.points') }}</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="entry in entries"
        :key="entry.rank"
        :class="{ 'is-top': entry.rank <= 3, 'is-new': isHighlighted(entry) }"
      >
        <td class="rank">{{ entry.rank }}</td>
        <td class="nickname">
          {{ entry.nickname }}
          <span v-if="isHighlighted(entry)" class="new-tag">{{ t('leaderboard.you') }}</span>
        </td>
        <template v-if="categoryCount === null">
          <td class="flag">
            <span aria-hidden="true" :title="t(`languages.${entry.language}`)">{{ FLAGS[entry.language] }}</span>
            <span class="sr-only">{{ t(`languages.${entry.language}`) }}</span>
          </td>
          <td class="num">{{ entry.correct_count }}</td>
        </template>
        <td v-else class="num">{{ entry.categories_played }}/{{ categoryCount }}</td>
        <td class="num points">{{ entry.points }}</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.empty {
  padding: var(--space-8) var(--space-4);
  color: var(--color-text-muted);
  text-align: center;
}

.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 var(--space-2);
}

th {
  padding: 0 var(--space-3);
  color: var(--color-text-muted);
  font-size: 0.8125rem;
  font-weight: 600;
  text-align: left;
}

td {
  padding: var(--space-3);
  background: var(--color-surface);
}

td:first-child {
  border-radius: var(--radius-md) 0 0 var(--radius-md);
}

td:last-child {
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}

.rank {
  width: 2.5rem;
  font-family: var(--font-mono);
  text-align: center;
}

.flag {
  width: 2rem;
  padding-left: 0;
  padding-right: 0;
  text-align: center;
}

.num {
  font-family: var(--font-mono);
  text-align: right;
}

.nickname {
  word-break: break-word;
}

.points {
  font-weight: 500;
}

.is-top .rank,
.is-top .points {
  color: var(--accent);
  text-shadow: var(--glow-sm);
}

.is-new td {
  background: var(--color-surface-2);
  box-shadow: 0 0 0 2px var(--color-correct) inset;
}

.new-tag {
  margin-left: var(--space-2);
  padding: 0 var(--space-2);
  border-radius: 999px;
  background: var(--color-correct);
  color: var(--color-bg);
  font-size: 0.75rem;
  font-weight: 600;
}
</style>
