/**
 * Messages under the result after the score was saved automatically (Faz 22).
 * `score` is the POST .../score/ response. Returns [{ key, params }] for t().
 */
export function motivationLines(score) {
  if (!score) return []
  const { rank, points, best_points: best, is_new_best: isNewBest, points_to_top10: toTop10 } = score

  if (rank === 1) {
    return [isNewBest ? { key: 'result.topNew' } : { key: 'result.topHold', params: { best } }]
  }

  const lines = [
    isNewBest
      ? { key: 'result.newBest' }
      : { key: 'result.beatRecord', params: { best, gap: best - points + 1 } },
  ]
  if (toTop10 == null) lines.push({ key: 'result.rank', params: { rank } })
  else lines.push({ key: 'result.toTop10', params: { points: toTop10 } })
  return lines
}
