import { memo, useState } from 'react'
import { Handle, Position } from '@xyflow/react'

const positionMap = { top: Position.Top, bottom: Position.Bottom, left: Position.Left, right: Position.Right }
const allEdges = ['top', 'bottom', 'left', 'right']

// Invisible hover zones on each edge to detect which side the cursor is near
const hoverZones = {
  top: { top: -20, left: '10%', right: '10%', height: 40, position: 'absolute' },
  bottom: { bottom: -20, left: '10%', right: '10%', height: 40, position: 'absolute' },
  left: { left: -20, top: '10%', bottom: '10%', width: 40, position: 'absolute' },
  right: { right: -20, top: '10%', bottom: '10%', width: 40, position: 'absolute' },
}

const ghostPositions = {
  top: { top: 0, left: '50%', transform: 'translate(-50%, -50%)' },
  bottom: { bottom: 0, left: '50%', transform: 'translate(-50%, 50%)' },
  left: { left: 0, top: '50%', transform: 'translate(-50%, -50%)' },
  right: { right: 0, top: '50%', transform: 'translate(50%, -50%)' },
}

function getHandleClass(cType) {
  if (!cType || cType === 'plain') return ''
  if (cType === 'black') return 'handle-black'
  if (cType === 'additive') return 'handle-additive'
  if (cType.startsWith('arrow')) return `handle-${cType}`
  return ''
}

export function NodeHandles({ activeHandles, handleTypes, hovered, onAddHandle, onRemoveHandle, onHandleContextMenu }) {
  const [hoveredEdge, setHoveredEdge] = useState(null)

  return (
    <>
      {/* Dual source+target handles per active edge */}
      {activeHandles.map((edge) => {
        const cType = handleTypes?.[edge] || 'plain'
        const cls = getHandleClass(cType)
        return (
          <div key={edge}>
            <Handle
              type="source"
              position={positionMap[edge]}
              id={`${edge}-src`}
              className={cls}
              onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onHandleContextMenu?.(e, edge) }}
            />
            <Handle
              type="target"
              position={positionMap[edge]}
              id={`${edge}-tgt`}
              className={`${cls} handle-overlay`}
              onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onHandleContextMenu?.(e, edge) }}
            />
          </div>
        )
      })}

      {/* Invisible hover zones for each empty edge — only show ghost for the hovered side */}
      {hovered && allEdges.filter((e) => !activeHandles.includes(e)).map((edge) => (
        <div
          key={`zone-${edge}`}
          style={{ ...hoverZones[edge], zIndex: 5, cursor: 'pointer' }}
          onMouseEnter={() => setHoveredEdge(edge)}
          onMouseLeave={() => setHoveredEdge(null)}
          onClick={(e) => { e.stopPropagation(); onAddHandle(edge) }}
        >
          {hoveredEdge === edge && (
            <div
              style={{
                position: 'absolute', ...ghostPositions[edge],
                width: 30, height: 30,
                background: 'white', border: '2px solid #747474',
                borderRadius: 1.4,
                opacity: 0.5,
                pointerEvents: 'none',
              }}
            />
          )}
        </div>
      ))}
    </>
  )
}

export { allEdges }
export default memo(NodeHandles)
