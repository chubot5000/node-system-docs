import { useContext, useState } from 'react'
import { Handle, Position, useUpdateNodeInternals } from '@xyflow/react'
import { ConnectorContext } from '../App'
import { allSides, getHandleStyle, getHandleCls, countOnSide, nextHandleId, groupBySide } from '../utils/handleUtils'

const posMap = { top: Position.Top, bottom: Position.Bottom, left: Position.Left, right: Position.Right }

/* Compute ghost handle position — mirrors getHandleStyle but for the next slot */
function ghostHandleStyle(side, currentCount) {
  // Position as if there's one more handle on this side
  const total = currentCount + 1
  const idx = currentCount // 0-indexed, this is the new one
  const pct = ((idx + 1) / (total + 1)) * 100
  const isH = side === 'top' || side === 'bottom'

  const base = {
    width: 30, height: 30, borderRadius: 1.4,
    background: 'white', border: '2px solid #747474',
    opacity: 0.45, cursor: 'crosshair',
  }
  if (isH) {
    return { ...base, left: `${pct}%`, top: side === 'top' ? -15 : undefined, bottom: side === 'bottom' ? -15 : undefined, transform: 'translateX(-50%)' }
  }
  return { ...base, top: `${pct}%`, left: side === 'left' ? -15 : undefined, right: side === 'right' ? -15 : undefined, transform: 'translateY(-50%)' }
}

export default function NodeWrapper({ id, data, maxPerSide = 3, style, onClick, children }) {
  const [hovered, setHovered] = useState(false)
  const [hoveredSide, setHoveredSide] = useState(null)
  const ctx = useContext(ConnectorContext)
  const updateNodeInternals = useUpdateNodeInternals()

  const handles = data.activeHandles || ['bottom-0']
  const hTypes = data.handleTypes || {}

  return (
    <div
      style={{ position: 'relative', ...style }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setHoveredSide(null) }}
    >
      {/* Real handles */}
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

      {/* Ghost handles — real <Handle> components styled as ghosts.
          React Flow handles the drag natively. onConnectStart in App promotes them. */}
      {hovered && allSides.map((side) => {
        const count = countOnSide(side, handles)
        if (count >= maxPerSide) return null
        const ghostId = nextHandleId(side, handles)
        if (!ghostId) return null

        // Hover zone to detect which side the mouse is on
        const zones = {
          top: { top: -15, left: 0, right: 0, height: 30 },
          bottom: { bottom: -15, left: 0, right: 0, height: 30 },
          left: { left: -15, top: 0, bottom: 0, width: 30 },
          right: { right: -15, top: 0, bottom: 0, width: 30 },
        }

        return (
          <div key={`ghost-zone-${side}`}
            style={{ position: 'absolute', ...zones[side], zIndex: 1 }}
            onMouseEnter={() => setHoveredSide(side)}
            onMouseLeave={() => setHoveredSide(null)}
          >
            {hoveredSide === side && (
              <Handle
                type="source"
                position={posMap[side]}
                id={`__ghost__${ghostId}`}
                className="ghost-handle"
                style={ghostHandleStyle(side, count)}
              />
            )}
          </div>
        )
      })}

      {children}
    </div>
  )
}
