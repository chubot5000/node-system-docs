import { memo, useState, useRef, useEffect } from 'react'

const presetColors = ['#FFFFFF', '#F5F3F0', '#E6D9CE', '#655343', '#747474', '#000000', '#F23030', '#68C4BA', '#C8E619', '#00063D']

function ContextMenu({ x, y, nodeId, currentFill, currentStroke, onClose, onDelete, onDuplicate, onRemoveAllHandles, onFillChange, onStrokeChange }) {
  const [showFillPicker, setShowFillPicker] = useState(false)
  const [showStrokePicker, setShowStrokePicker] = useState(false)
  const ref = useRef()

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
      position: 'fixed', left: x, top: y, zIndex: 100,
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

      <div
        onClick={() => { setShowFillPicker(!showFillPicker); setShowStrokePicker(false) }}
        style={{ padding: '7px 16px', cursor: 'pointer', fontSize: 13, color: '#655343', display: 'flex', alignItems: 'center', gap: 8 }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#f9f8f6'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <span style={{ width: 14, height: 14, borderRadius: 2, border: '1.5px solid #747474', background: currentFill || 'white', display: 'inline-block', flexShrink: 0 }} />
        Fill Color
      </div>
      {showFillPicker && (
        <div style={{ padding: '4px 16px 8px', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {presetColors.map((c) => (
            <div key={c} onClick={() => { onFillChange(nodeId, c); onClose() }}
              style={{ width: 20, height: 20, borderRadius: 3, background: c, border: '1.5px solid #747474', cursor: 'pointer' }} />
          ))}
        </div>
      )}

      <div
        onClick={() => { setShowStrokePicker(!showStrokePicker); setShowFillPicker(false) }}
        style={{ padding: '7px 16px', cursor: 'pointer', fontSize: 13, color: '#655343', display: 'flex', alignItems: 'center', gap: 8 }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#f9f8f6'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <span style={{ width: 14, height: 14, borderRadius: 2, border: `2.5px solid ${currentStroke || '#747474'}`, background: 'transparent', display: 'inline-block', flexShrink: 0 }} />
        Stroke Color
      </div>
      {showStrokePicker && (
        <div style={{ padding: '4px 16px 8px', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {presetColors.map((c) => (
            <div key={c} onClick={() => { onStrokeChange(nodeId, c); onClose() }}
              style={{ width: 20, height: 20, borderRadius: 3, background: c, border: '1.5px solid #747474', cursor: 'pointer' }} />
          ))}
        </div>
      )}

      <div style={{ height: 1, background: '#E0DCDA', margin: '4px 0' }} />

      {menuItem('Remove Node',
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg>,
        () => { onDelete(nodeId); onClose() }, '#ff4444', '#fef2f2'
      )}
    </div>
  )
}

export default memo(ContextMenu)
