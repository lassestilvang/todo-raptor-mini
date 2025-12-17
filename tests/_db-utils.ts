export async function runQuery(q: any) {
  if (!q) return
  if (typeof q.run === 'function') return await q.run()
  return await q
}
