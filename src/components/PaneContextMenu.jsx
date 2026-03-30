import { memo, useRef, useEffect } from 'react'

const nodeOptions = [
  { type: 'largeTitleNode', label: 'Large Title' },
  { type: 'titleNode', label: 'Small Title' },
  { type: 'textNode', label: 'Text Node' },
  { type: 'logoNode', label: 'Logo Node' },
  { type: 'imageNode', label: 'Image Node' },
]

function PaneContextMenu({ x, y, onSelect, onClose }) {
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
        Add Node
      </div>
      {nodeOptions.map((opt) => (
        <div
          key={opt.type}
          onClick={() => { onSelect(opt.type); onClose() }}
          style={{ padding: '8px 16px', cursor: 'pointer', fontSize: 13, color: '#655343' }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f5f3f0'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          {opt.label}
        </div>
      ))}
    </div>
  )
}

export default memo(PaneContextMenu)
