import { memo, useRef, useEffect } from 'react'

const connectorOptions = [
  { id: 'plain', label: 'Plain', preview: (
    <div style={{ width: 20, height: 20, border: '2px solid #747474', borderRadius: 1, background: 'white' }} />
  )},
  { id: 'arrow-right', label: '→ Arrow Right', preview: (
    <div style={{ width: 20, height: 20, border: '2px solid #747474', borderRadius: 1, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 12, color: '#655343' }}>→</span>
    </div>
  )},
  { id: 'arrow-left', label: '← Arrow Left', preview: (
    <div style={{ width: 20, height: 20, border: '2px solid #747474', borderRadius: 1, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 12, color: '#655343' }}>←</span>
    </div>
  )},
  { id: 'arrow-up', label: '↑ Arrow Up', preview: (
    <div style={{ width: 20, height: 20, border: '2px solid #747474', borderRadius: 1, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 12, color: '#655343' }}>↑</span>
    </div>
  )},
  { id: 'arrow-down', label: '↓ Arrow Down', preview: (
    <div style={{ width: 20, height: 20, border: '2px solid #747474', borderRadius: 1, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 12, color: '#655343' }}>↓</span>
    </div>
  )},
  { id: 'additive', label: '+ Additive', preview: (
    <div style={{ width: 20, height: 20, border: '2px solid #747474', borderRadius: 1, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 14, color: '#747474', fontWeight: 600 }}>+</span>
    </div>
  )},
  { id: 'black', label: 'Black', preview: (
    <div style={{ width: 20, height: 20, border: '2px solid #747474', borderRadius: 1, background: 'black' }} />
  )},
]

function HandleContextMenu({ x, y, currentType, onSelect, onRemove, onClose }) {
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
      <div style={{ padding: '4px 16px 6px', fontSize: 11, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Connector Type
      </div>
      {connectorOptions.map((opt) => (
        <div
          key={opt.id}
          onClick={() => { onSelect(opt.id); onClose() }}
          style={{
            padding: '6px 16px', cursor: 'pointer', fontSize: 13, color: '#655343',
            display: 'flex', alignItems: 'center', gap: 10,
            background: currentType === opt.id ? '#f5f3f0' : 'transparent',
            fontWeight: currentType === opt.id ? 600 : 400,
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f5f3f0'}
          onMouseLeave={(e) => e.currentTarget.style.background = currentType === opt.id ? '#f5f3f0' : 'transparent'}
        >
          {opt.preview}
          {opt.label}
        </div>
      ))}
      <div style={{ height: 1, background: '#E0DCDA', margin: '4px 0' }} />
      <div
        onClick={() => { onRemove(); onClose() }}
        style={{ padding: '6px 16px', cursor: 'pointer', fontSize: 13, color: '#ff4444', display: 'flex', alignItems: 'center', gap: 8 }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <span style={{ fontSize: 14 }}>✕</span> Remove Connector
      </div>
    </div>
  )
}

export default memo(HandleContextMenu)
