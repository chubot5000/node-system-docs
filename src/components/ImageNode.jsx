import { useCallback, useContext, useRef, useState } from 'react'
import { Handle, Position, useUpdateNodeInternals } from '@xyflow/react'
import { ConnectorContext } from '../App'

const allSides = ['top', 'bottom', 'left', 'right']
const posMap = { top: Position.Top, bottom: Position.Bottom, left: Position.Left, right: Position.Right }
function getHandleCls(t) { return t === 'black' ? 'handle-black' : t === 'additive' ? 'handle-additive' : t?.startsWith('arrow') ? `handle-${t}` : undefined }

function ImageNode({ data, id }) {
  const [title, setTitle] = useState(data.label || 'GPU')
  const [imageSrc, setImageSrc] = useState(null)
  const [editingTitle, setEditingTitle] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [hoveredSide, setHoveredSide] = useState(null)
  const fileRef = useRef()
  const ctx = useContext(ConnectorContext)
  const updateNodeInternals = useUpdateNodeInternals()

  const handles = data.activeHandles || ['bottom']
  const hTypes = data.handleTypes || {}

  return (
    <div
      style={{ width: 360, height: 311, border: `2px solid ${data.strokeColor || '#747474'}`, borderRadius: 4.35, background: data.fillColor || 'white', display: 'flex', flexDirection: 'column', position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setHoveredSide(null) }}
    >
      {handles.map((side) => (
        <Handle key={side} type="source" position={posMap[side]} id={side}
          className={getHandleCls(hTypes[side])}
          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); ctx.onHandleContextMenu?.(e, id, side, hTypes[side] || 'plain') }}
        />
      ))}

      {hovered && allSides.filter((s) => !handles.includes(s)).map((side) => {
        const zones = { top: { top: -15, left: '20%', right: '20%', height: 30 }, bottom: { bottom: -15, left: '20%', right: '20%', height: 30 }, left: { left: -15, top: '20%', bottom: '20%', width: 30 }, right: { right: -15, top: '20%', bottom: '20%', width: 30 } }
        const ghosts = { top: { top: 0, left: '50%', marginLeft: -15 }, bottom: { top: 0, left: '50%', marginLeft: -15 }, left: { left: 0, top: '50%', marginTop: -15 }, right: { left: 0, top: '50%', marginTop: -15 } }
        return (
          <div key={side} style={{ position: 'absolute', ...zones[side], zIndex: 5, cursor: 'pointer' }}
            onMouseEnter={() => setHoveredSide(side)} onMouseLeave={() => setHoveredSide(null)}
            onClick={(e) => { e.stopPropagation(); ctx.onAddHandle?.(id, side); setTimeout(() => updateNodeInternals(id), 10) }}>
            {hoveredSide === side && <div style={{ position: 'absolute', ...ghosts[side], width: 30, height: 30, background: 'white', border: '2px solid #747474', borderRadius: 1.4, opacity: 0.45, pointerEvents: 'none' }} />}
          </div>
        )
      })}

      <div style={{ padding: '16px 16px 8px' }}>
        {editingTitle ? (
          <input autoFocus defaultValue={title} onBlur={(e) => { setEditingTitle(false); setTitle(e.target.value) }} onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
            style={{ fontSize: 23, fontWeight: 700, color: '#747474', background: 'transparent', outline: 'none', border: 'none' }} />
        ) : (
          <div onDoubleClick={() => setEditingTitle(true)} style={{ fontSize: 23, fontWeight: 700, color: '#747474', cursor: 'text' }}>{title}</div>
        )}
      </div>

      <div onClick={() => fileRef.current?.click()}
        style={{ flex: 1, margin: '0 16px 16px', background: '#E6D9CE', borderRadius: 6, border: '1px solid #655343', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}>
        <input ref={fileRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = (ev) => setImageSrc(ev.target.result); r.readAsDataURL(f) } }} style={{ display: 'none' }} />
        {imageSrc ? <img src={imageSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#655343" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
        )}
      </div>
    </div>
  )
}

export default ImageNode
