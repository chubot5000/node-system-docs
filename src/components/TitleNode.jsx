import { useCallback, useContext, useState } from 'react'
import { Handle, Position, useUpdateNodeInternals } from '@xyflow/react'
import { ConnectorContext } from '../App'

const allSides = ['top', 'bottom', 'left', 'right']
const posMap = { top: Position.Top, bottom: Position.Bottom, left: Position.Left, right: Position.Right }

function TitleNode({ data, id }) {
  const [title, setTitle] = useState(data.label || 'Title')
  const [editing, setEditing] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [hoveredSide, setHoveredSide] = useState(null)
  const ctx = useContext(ConnectorContext)
  const updateNodeInternals = useUpdateNodeInternals()

  const handles = data.activeHandles || ['bottom']
  const hTypes = data.handleTypes || {}

  return (
    <div
      style={{ width: 360, height: 100, border: `2px solid ${data.strokeColor || '#747474'}`, borderRadius: 4.35, background: data.fillColor || 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setHoveredSide(null) }}
    >
      {handles.map((side) => (
        <Handle key={side} type="source" position={posMap[side]} id={side}
          className={getHandleCls(hTypes[side])}
          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); ctx.onHandleContextMenu?.(e, id, side, hTypes[side] || 'plain') }}
        />
      ))}

      {hovered && <GhostZones handles={handles} hoveredSide={hoveredSide} setHoveredSide={setHoveredSide}
        onAdd={(side) => { ctx.onAddHandle?.(id, side); setTimeout(() => updateNodeInternals(id), 10) }} />}

      {editing ? (
        <input autoFocus defaultValue={title}
          onBlur={(e) => { setEditing(false); setTitle(e.target.value) }}
          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
          style={{ fontSize: 23, fontWeight: 700, color: '#747474', textAlign: 'center', background: 'transparent', outline: 'none', width: '100%', padding: '0 16px', border: 'none' }} />
      ) : (
        <div onDoubleClick={() => setEditing(true)}
          style={{ fontSize: 23, fontWeight: 700, color: '#747474', textAlign: 'center', cursor: 'text', padding: '0 16px', width: '100%' }}>
          {title}
        </div>
      )}
    </div>
  )
}

function GhostZones({ handles, hoveredSide, setHoveredSide, onAdd }) {
  const zones = { top: { top: -15, left: '20%', right: '20%', height: 30 }, bottom: { bottom: -15, left: '20%', right: '20%', height: 30 }, left: { left: -15, top: '20%', bottom: '20%', width: 30 }, right: { right: -15, top: '20%', bottom: '20%', width: 30 } }
  const ghosts = { top: { top: 0, left: '50%', marginLeft: -15 }, bottom: { top: 0, left: '50%', marginLeft: -15 }, left: { left: 0, top: '50%', marginTop: -15 }, right: { left: 0, top: '50%', marginTop: -15 } }

  return allSides.filter((s) => !handles.includes(s)).map((side) => (
    <div key={side} style={{ position: 'absolute', ...zones[side], zIndex: 5, cursor: 'pointer' }}
      onMouseEnter={() => setHoveredSide(side)} onMouseLeave={() => setHoveredSide(null)}
      onClick={(e) => { e.stopPropagation(); onAdd(side) }}>
      {hoveredSide === side && <div style={{ position: 'absolute', ...ghosts[side], width: 30, height: 30, background: 'white', border: '2px solid #747474', borderRadius: 1.4, opacity: 0.45, pointerEvents: 'none' }} />}
    </div>
  ))
}

function getHandleCls(t) { return t === 'black' ? 'handle-black' : t === 'additive' ? 'handle-additive' : t?.startsWith('arrow') ? `handle-${t}` : undefined }

export default TitleNode
