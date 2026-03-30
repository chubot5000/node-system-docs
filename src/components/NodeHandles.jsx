import { memo, useState } from 'react'
import { Handle, Position } from '@xyflow/react'

const positionMap = { top: Position.Top, bottom: Position.Bottom, left: Position.Left, right: Position.Right }
const allEdges = ['top', 'bottom', 'left', 'right']

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
  if (!cType || cType === 'plain') return undefined
  if (cType === 'black') return 'handle-black'
  if (cType === 'additive') return 'handle-additive'
  if (cType.startsWith('arrow')) return `handle-${cType}`
  return undefined
}

export function NodeHandles({ activeHandles, handleTypes, hovered, onAddHandle, onHandleContextMenu }) {
  const [hoveredEdge, setHoveredEdge] = useState(null)

  return (
    <>
      {activeHandles.map((edge) => (
        <Handle
          key={edge}
          type="target"
          position={positionMap[edge]}
          id={edge}
          isConnectableStart={true}
          isConnectableEnd={true}
          className={getHandleClass(handleTypes?.[edge]) || undefined}
          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onHandleContextMenu?.(e, edge) }}
        />
      ))}

      {hovered && allEdges.filter((e) => !activeHandles.includes(e)).map((edge) => (
        <div
          key={`zone-${edge}`}
          style={{ ...hoverZones[edge], zIndex: 5, cursor: 'pointer' }}
          onMouseEnter={() => setHoveredEdge(edge)}
          onMouseLeave={() => setHoveredEdge(null)}
          onClick={(e) => { e.stopPropagation(); onAddHandle(edge) }}
        >
          {hoveredEdge === edge && (
            <div style={{
              position: 'absolute', ...ghostPositions[edge],
              width: 30, height: 30, background: 'white', border: '2px solid #747474',
              borderRadius: 1.4, opacity: 0.5, pointerEvents: 'none',
            }} />
          )}
        </div>
      ))}
    </>
  )
}

export { allEdges }
export default memo(NodeHandles)
