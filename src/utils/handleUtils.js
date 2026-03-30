export const allSides = ['top', 'bottom', 'left', 'right']

export function groupBySide(activeHandles) {
  const g = {}
  for (const h of activeHandles) {
    const s = h.split('-')[0]
    ;(g[s] ||= []).push(h)
  }
  return g
}

export function getHandleStyle(handleId, activeHandles) {
  const side = handleId.split('-')[0]
  const group = groupBySide(activeHandles)
  const sorted = (group[side] || []).sort()
  const idx = sorted.indexOf(handleId)
  const count = sorted.length
  const pct = ((idx + 1) / (count + 1)) * 100 + (count > 1 ? (50 - ((idx + 1) / (count + 1)) * 100) * 0.07 : 0)
  return (side === 'top' || side === 'bottom') ? { left: `${pct}%` } : { top: `${pct}%` }
}

export function getHandleCls(t) {
  return t === 'black' ? 'handle-black' : t === 'additive' ? 'handle-additive' : t?.startsWith('arrow') ? `handle-${t}` : undefined
}

export function countOnSide(side, activeHandles) {
  return activeHandles.filter(h => h.startsWith(side + '-')).length
}

export function nextHandleId(side, activeHandles) {
  for (let i = 0; i < 3; i++) {
    const id = `${side}-${i}`
    if (!activeHandles.includes(id)) return id
  }
  return null
}
