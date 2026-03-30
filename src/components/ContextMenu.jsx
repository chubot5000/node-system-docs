import { memo, useRef, useEffect } from 'react'
import { useSmartPosition } from '../utils/useSmartPosition'

function ContextMenu({ x, y, nodeId, isGrouped, onClose, onDuplicate, onRemoveAllHandles, onGroup, onUngroup }) {
  const ref = useRef()
  const pos = useSmartPosition(ref, x, y)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const menuItem = (label, icon, onClick, color = '#655343', hoverBg = '#f9f8f6') => (
    <div
      onClick={onClick}
      style={{ padding: '7px 16px', cursor: 'pointer', fontSize: 13, color, display: 'flex', alignItems: 'center', gap: 8 }}
      onMouseEnter={(e) => e.currentTarget.style.background = hoverBg}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      {icon} {label}
    </div>
  )

  return (
    <div ref={ref} style={{
      position: 'fixed', left: pos.left, top: pos.top, zIndex: 100,
      background: 'white', borderRadius: 8, border: '1px solid #E0DCDA',
      boxShadow: '0 4px 20px rgba(0,0,0,0.12)', minWidth: 180, padding: '6px 0',
      fontFamily: 'SwissNow, Inter, sans-serif',
    }}>
      {menuItem('Duplicate',
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
        () => { onDuplicate(nodeId); onClose() }
      )}

      {menuItem('Remove Connectors',
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 6L6 18M6 6l12 12"/></svg>,
        () => { onRemoveAllHandles(nodeId); onClose() }
      )}

      <div style={{ height: 1, background: '#E0DCDA', margin: '4px 0' }} />

      {isGrouped ? (
        menuItem('Ungroup',
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="14" width="8" height="8" rx="1"/><path d="M8 14H6a2 2 0 01-2-2v0"/><path d="M14 8h2a2 2 0 012 2v0"/></svg>,
          () => { onUngroup(nodeId); onClose() }
        )
      ) : (
        menuItem('Group',
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></svg>,
          () => { onGroup(nodeId); onClose() }
        )
      )}
    </div>
  )
}

export default memo(ContextMenu)
