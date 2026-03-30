import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'

const positionMap = { top: Position.Top, bottom: Position.Bottom, left: Position.Left, right: Position.Right }
const allEdges = ['top', 'bottom', 'left', 'right']

const addButtonPositions = {
  top: { top: -12, left: '50%', transform: 'translateX(-50%)' },
  bottom: { bottom: -12, left: '50%', transform: 'translateX(-50%)' },
  left: { left: -12, top: '50%', transform: 'translateY(-50%)' },
  right: { right: -12, top: '50%', transform: 'translateY(-50%)' },
}

const removeButtonOffsets = {
  top: { top: -30, left: '50%', transform: 'translateX(-50%)' },
  bottom: { bottom: -30, left: '50%', transform: 'translateX(-50%)' },
  left: { left: -30, top: '50%', transform: 'translateY(-50%)' },
  right: { right: -30, top: '50%', transform: 'translateY(-50%)' },
}

// Map connector type to CSS class
function getHandleClass(cType) {
  if (!cType || cType === 'plain') return ''
  if (cType === 'black') return 'handle-black'
  if (cType === 'additive') return 'handle-additive'
  if (cType.startsWith('arrow')) return `handle-${cType}`
  return ''
}

export function NodeHandles({ activeHandles, handleTypes, hovered, onAddHandle, onRemoveHandle, onHandleContextMenu }) {
  return (
    <>
      {activeHandles.map((edge) => {
        const cType = handleTypes?.[edge] || 'plain'
        const cls = getHandleClass(cType)
        return (
          <Handle
            key={edge}
            type="source"
            position={positionMap[edge]}
            id={edge}
            isConnectableStart={true}
            isConnectableEnd={true}
            className={cls}
            onContextMenu={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onHandleContextMenu?.(e, edge)
            }}
          />
        )
      })}

      {hovered && allEdges.filter((e) => !activeHandles.includes(e)).map((edge) => (
        <div
          key={`add-${edge}`}
          onClick={(e) => { e.stopPropagation(); onAddHandle(edge) }}
          style={{
            position: 'absolute', ...addButtonPositions[edge],
            width: 18, height: 18, background: 'white', border: '1.5px solid #747474',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 10, fontSize: 12, lineHeight: 1, color: '#747474', fontWeight: 'bold',
          }}
        >+</div>
      ))}

      {hovered && activeHandles.map((edge) => (
        <div
          key={`rm-${edge}`}
          onClick={(e) => { e.stopPropagation(); onRemoveHandle(edge) }}
          style={{
            position: 'absolute', ...removeButtonOffsets[edge],
            width: 14, height: 14, background: '#ff4444', border: 'none',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 10, fontSize: 9, lineHeight: 1, color: 'white', fontWeight: 'bold',
          }}
        >×</div>
      ))}
    </>
  )
}

export { allEdges }
export default memo(NodeHandles)
