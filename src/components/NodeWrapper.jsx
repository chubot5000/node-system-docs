import { useContext, useState, useCallback, useRef } from 'react'
import { Handle, Position, useUpdateNodeInternals } from '@xyflow/react'
import { ConnectorContext } from '../App'
import { allSides, getHandleStyle, getHandleCls, countOnSide, nextHandleId } from '../utils/handleUtils'

const posMap = { top: Position.Top, bottom: Position.Bottom, left: Position.Left, right: Position.Right }

export default function NodeWrapper({ id, data, maxPerSide = 3, style, onClick, children }) {
  const [hovered, setHovered] = useState(false)
  const [hoveredSide, setHoveredSide] = useState(null)
  const ctx = useContext(ConnectorContext)
  const updateNodeInternals = useUpdateNodeInternals()
  const pendingDragRef = useRef(null)

  const handles = data.activeHandles || ['bottom-0']
  const hTypes = data.handleTypes || {}

  const addHandle = (side) => {
    const newId = nextHandleId(side, handles)
    if (newId) {
      ctx.onAddHandle?.(id, newId)
      setTimeout(() => updateNodeInternals(id), 10)
    }
  }

  /* Ghost pointerdown: create handle, then trigger connection drag from it.
     React Flow uses pointer events for node dragging — we must intercept
     pointerdown (not just mousedown) and stop it from reaching the node. */
  const onGhostPointerDown = useCallback((e, side) => {
    // Stop both pointer and mouse propagation to prevent node drag
    e.stopPropagation()
    e.preventDefault()
    // Also capture pointer so the node never sees it
    e.currentTarget.setPointerCapture(e.pointerId)

    const newId = nextHandleId(side, handles)
    if (!newId) return

    const { clientX, clientY, pointerId } = e
    const target = e.currentTarget

    // Release capture before we dispatch on the handle
    try { target.releasePointerCapture(pointerId) } catch (_) {}

    // Create the handle
    ctx.onAddHandle?.(id, newId)

    // Wait for React to render the new handle, update internals, then trigger drag
    requestAnimationFrame(() => {
      updateNodeInternals(id)
      requestAnimationFrame(() => {
        const nodeEl = document.querySelector(`.react-flow__node[data-id="${id}"]`)
        if (!nodeEl) return
        const handleEl = nodeEl.querySelector(`.react-flow__handle[data-handleid="${newId}"]`)
        if (!handleEl) return

        // React Flow listens for pointerdown on handles to start connections
        const pointerDown = new PointerEvent('pointerdown', {
          clientX, clientY, pointerId: 1, bubbles: true, cancelable: true,
          pointerType: 'mouse', isPrimary: true,
        })
        handleEl.dispatchEvent(pointerDown)
      })
    })
  }, [id, handles, ctx, updateNodeInternals])

  return (
    <div
      style={{ position: 'relative', ...style }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setHoveredSide(null) }}
    >
      {handles.map((hId) => {
        const side = hId.split('-')[0]
        const posStyle = getHandleStyle(hId, handles)
        return [
          <Handle key={`${hId}-src`} type="source" position={posMap[side]} id={hId}
            className={getHandleCls(hTypes[hId])}
            style={posStyle}
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); ctx.onHandleContextMenu?.(e, id, hId, hTypes[hId] || 'plain') }}
          />,
          <Handle key={`${hId}-tgt`} type="target" position={posMap[side]} id={`${hId}-tgt`}
            className="handle-overlay"
            style={{ ...posStyle, opacity: 0 }}
          />
        ]
      })}

      {hovered && allSides.map((side) => {
        const count = countOnSide(side, handles)
        if (count >= maxPerSide) return null
        const isH = side === 'top' || side === 'bottom'
        const pct = ((count + 1) / (count + 2)) * 100
        const zones = {
          top: { top: -15, left: 0, right: 0, height: 30 },
          bottom: { bottom: -15, left: 0, right: 0, height: 30 },
          left: { left: -15, top: 0, bottom: 0, width: 30 },
          right: { right: -15, top: 0, bottom: 0, width: 30 },
        }
        const ghostPos = isH
          ? { left: `${pct}%`, marginLeft: -15, top: 0 }
          : { top: `${pct}%`, marginTop: -15, left: 0 }

        return (
          <div key={side} style={{ position: 'absolute', ...zones[side], zIndex: 1, cursor: 'crosshair' }}
            onMouseEnter={() => setHoveredSide(side)} onMouseLeave={() => setHoveredSide(null)}
            onPointerDown={(e) => onGhostPointerDown(e, side)}
            onClick={(e) => e.stopPropagation()}>
            {hoveredSide === side && (
              <div style={{ position: 'absolute', ...ghostPos, width: 30, height: 30, background: 'white', border: '2px solid #747474', borderRadius: 1.4, opacity: 0.45, pointerEvents: 'none' }} />
            )}
          </div>
        )
      })}

      {children}
    </div>
  )
}
