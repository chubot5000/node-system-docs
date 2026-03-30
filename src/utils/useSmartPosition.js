import { useState, useEffect, useCallback } from 'react'

/**
 * Measures a menu ref after mount and flips up if it would overflow the viewport bottom.
 * Also flips left if it would overflow the right edge.
 * Returns { top, left } for fixed positioning.
 */
export function useSmartPosition(ref, x, y) {
  const [pos, setPos] = useState({ top: y, left: x })

  useEffect(() => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const vh = window.innerHeight
    const vw = window.innerWidth
    const top = y + rect.height > vh - 8 ? y - rect.height : y
    const left = x + rect.width > vw - 8 ? x - rect.width : x
    setPos({ top: Math.max(8, top), left: Math.max(8, left) })
  }, [ref, x, y])

  return pos
}
