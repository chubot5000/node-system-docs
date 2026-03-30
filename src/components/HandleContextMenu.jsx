import { memo, useRef, useEffect } from 'react'
import { useSmartPosition } from '../utils/useSmartPosition'

const ArrowIcon = ({ rotate = 0 }) => (
  <div style={{ width: 20, height: 20, border: '2px solid #747474', borderRadius: 1, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width="11" height="9" viewBox="0 0 13 11" fill="none" style={{ transform: `rotate(${rotate}deg)` }}>
      <path d="M1.52653 0.101018L11.6158 4.60057C12.4249 4.96112 12.4249 6.0391 11.6158 6.39965L1.52653 10.8992C0.612929 11.3068-0.335502 10.4018 0.117325 9.55355L2.04352 5.9456C2.19324 5.66511 2.19324 5.3345 2.04352 5.05461L0.117326 1.44666C-0.33489 0.598454 0.612319-0.307199 1.52653 0.101018Z" fill="#655343"/>
    </svg>
  </div>
)

const connectorOptions = [
  { id: 'plain', label: 'Plain', preview: (
    <div style={{ width: 20, height: 20, border: '2px solid #747474', borderRadius: 1, background: 'white' }} />
  )},
  { id: 'arrow-right', label: 'Arrow Right', preview: <ArrowIcon rotate={0} /> },
  { id: 'arrow-left', label: 'Arrow Left', preview: <ArrowIcon rotate={180} /> },
  { id: 'arrow-up', label: 'Arrow Up', preview: <ArrowIcon rotate={-90} /> },
  { id: 'arrow-down', label: 'Arrow Down', preview: <ArrowIcon rotate={90} /> },
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
  const pos = useSmartPosition(ref, x, y)

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
        position: 'fixed', left: pos.left, top: pos.top, zIndex: 100,
        background: 'white', borderRadius: 8, border: '1px solid #E0DCDA',
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)', minWidth: 180, padding: '6px 0',
        fontFamily: 'SwissNow, Inter, sans-serif',
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
