import { memo, useState, useCallback, useRef, useEffect } from 'react'

const presetColors = ['#FFFFFF', '#F5F3F0', '#E6D9CE', '#655343', '#747474', '#000000', '#F23030', '#68C4BA', '#C8E619', '#00063D']

function ContextMenu({ x, y, nodeId, currentFill, currentStroke, onClose, onDelete, onDuplicate, onFillChange, onStrokeChange }) {
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

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed', left: x, top: y, zIndex: 100,
        background: 'white', borderRadius: 8, border: '1px solid #E0DCDA',
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)', minWidth: 180, padding: '6px 0',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div
        onClick={() => { onDuplicate(nodeId); onClose() }}
        style={{ padding: '8px 16px', cursor: 'pointer', fontSize: 14, color: '#655343', display: 'flex', alignItems: 'center', gap: 8 }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#f9f8f6'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#655343" strokeWidth="1.8"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
        Duplicate
      </div>

      <div style={{ height: 1, background: '#E0DCDA', margin: '4px 0' }} />

      <div
        onClick={() => { onDelete(nodeId); onClose() }}
        style={{ padding: '8px 16px', cursor: 'pointer', fontSize: 14, color: '#ff4444', display: 'flex', alignItems: 'center', gap: 8 }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <span style={{ fontSize: 16 }}>✕</span> Remove Node
      </div>

      <div style={{ height: 1, background: '#E0DCDA', margin: '4px 0' }} />

      <div
        onClick={() => { setShowFillPicker(!showFillPicker); setShowStrokePicker(false) }}
        style={{ padding: '8px 16px', cursor: 'pointer', fontSize: 14, color: '#655343', display: 'flex', alignItems: 'center', gap: 8 }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#f9f8f6'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <span style={{ width: 16, height: 16, borderRadius: 3, border: '1.5px solid #747474', background: currentFill || 'white', display: 'inline-block' }} />
        Fill Color
      </div>
      {showFillPicker && (
        <div style={{ padding: '4px 16px 8px', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {presetColors.map((c) => (
            <div
              key={c}
              onClick={() => { onFillChange(nodeId, c); onClose() }}
              style={{ width: 22, height: 22, borderRadius: 3, background: c, border: '1.5px solid #747474', cursor: 'pointer' }}
            />
          ))}
        </div>
      )}

      <div
        onClick={() => { setShowStrokePicker(!showStrokePicker); setShowFillPicker(false) }}
        style={{ padding: '8px 16px', cursor: 'pointer', fontSize: 14, color: '#655343', display: 'flex', alignItems: 'center', gap: 8 }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#f9f8f6'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <span style={{ width: 16, height: 16, borderRadius: 3, border: `2.5px solid ${currentStroke || '#747474'}`, background: 'transparent', display: 'inline-block' }} />
        Stroke Color
      </div>
      {showStrokePicker && (
        <div style={{ padding: '4px 16px 8px', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {presetColors.map((c) => (
            <div
              key={c}
              onClick={() => { onStrokeChange(nodeId, c); onClose() }}
              style={{ width: 22, height: 22, borderRadius: 3, background: c, border: '1.5px solid #747474', cursor: 'pointer' }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default memo(ContextMenu)
