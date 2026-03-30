import { useCallback, useContext, useState } from 'react'
import { Handle, Position, useUpdateNodeInternals } from '@xyflow/react'
import { ConnectorContext } from '../App'

const allSides = ['top', 'bottom', 'left', 'right']
const posMap = { top: Position.Top, bottom: Position.Bottom, left: Position.Left, right: Position.Right }
function getHandleCls(t) { return t === 'black' ? 'handle-black' : t === 'additive' ? 'handle-additive' : t?.startsWith('arrow') ? `handle-${t}` : undefined }

function TextNode({ data, id }) {
  const [title, setTitle] = useState(data.label || 'Data Center')
  const [body, setBody] = useState(data.body || '')
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingBody, setEditingBody] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [hoveredSide, setHoveredSide] = useState(null)
  const ctx = useContext(ConnectorContext)
  const updateNodeInternals = useUpdateNodeInternals()

  const handles = data.activeHandles || ['bottom']
  const hTypes = data.handleTypes || {}

  return (
    <div
      style={{ width: 360, minHeight: 311, border: `2px solid ${data.strokeColor || '#747474'}`, borderRadius: 4.35, background: data.fillColor || 'white', display: 'flex', flexDirection: 'column', padding: 24, position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setHoveredSide(null) }}
    >
      {handles.map((side) => (
        <Handle key={side} type="source" position={posMap[side]} id={side}
          className={getHandleCls(hTypes[side])}
          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); ctx.onHandleContextMenu?.(e, id, side, hTypes[side] || 'plain') }}
        />
      ))}

      {hovered && allSides.filter((s) => !handles.includes(s)).map((side) => (
        <GhostZone key={side} side={side} active={hoveredSide === side}
          onEnter={() => setHoveredSide(side)} onLeave={() => setHoveredSide(null)}
          onAdd={() => { ctx.onAddHandle?.(id, side); setTimeout(() => updateNodeInternals(id), 10) }} />
      ))}

      {editingTitle ? (
        <input autoFocus defaultValue={title} onBlur={(e) => { setEditingTitle(false); setTitle(e.target.value) }} onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
          style={{ fontSize: 23, fontWeight: 700, color: '#747474', background: 'transparent', outline: 'none', marginBottom: 16, border: 'none' }} />
      ) : (
        <div onDoubleClick={() => setEditingTitle(true)} style={{ fontSize: 23, fontWeight: 700, color: '#747474', marginBottom: 16, cursor: 'text' }}>{title}</div>
      )}

      {editingBody ? (
        <textarea autoFocus defaultValue={body} onBlur={(e) => { setEditingBody(false); setBody(e.target.value) }}
          style={{ fontSize: 18, color: '#747474', background: 'transparent', outline: 'none', flex: 1, resize: 'none', lineHeight: 1.6, border: 'none' }} rows={8} />
      ) : (
        <div onDoubleClick={() => setEditingBody(true)} style={{ fontSize: 18, color: '#747474', lineHeight: 1.6, cursor: 'text', whiteSpace: 'pre-wrap' }}>{body}</div>
      )}
    </div>
  )
}

function GhostZone({ side, active, onEnter, onLeave, onAdd }) {
  const zones = { top: { top: -15, left: '20%', right: '20%', height: 30 }, bottom: { bottom: -15, left: '20%', right: '20%', height: 30 }, left: { left: -15, top: '20%', bottom: '20%', width: 30 }, right: { right: -15, top: '20%', bottom: '20%', width: 30 } }
  const ghosts = { top: { top: -15, left: '50%', marginLeft: -15 }, bottom: { bottom: -15, left: '50%', marginLeft: -15 }, left: { left: -15, top: '50%', marginTop: -15 }, right: { right: -15, top: '50%', marginTop: -15 } }
  return (
    <div style={{ position: 'absolute', ...zones[side], zIndex: 5, cursor: 'pointer' }} onMouseEnter={onEnter} onMouseLeave={onLeave} onClick={(e) => { e.stopPropagation(); onAdd() }}>
      {active && <div style={{ position: 'absolute', ...ghosts[side], width: 30, height: 30, background: 'white', border: '2px solid #747474', borderRadius: 1.4, opacity: 0.45, pointerEvents: 'none' }} />}
    </div>
  )
}

export default TextNode
