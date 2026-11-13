<script setup>
const props = defineProps({
  entries: { type: Array, required: true },
  highlight: { type: Object, default: null }, // { rank, nickname } of a just-saved score
})

function isHighlighted(entry) {
  return props.highlight?.rank === entry.rank && props.highlight?.nickname === entry.nickname
}
</script>

<template>
  <p v-if="entries.length === 0" class="empty">Henüz skor yok. İlk sen ol! ✨</p>

  <table v-else class="table">
    <thead>
      <tr>
        <th scope="col" class="rank">#</th>
        <th scope="col">Takma ad</th>
        <th scope="col" class="num">Doğru</th>
        <th scope="col" class="num">Puan</th>
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
          <span v-if="isHighlighted(entry)" class="new-tag">sen</span>
        </td>
        <td class="num">{{ entry.correct_count }}</td>
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
