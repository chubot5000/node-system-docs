import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'

const positionMap = { top: Position.Top, bottom: Position.Bottom, left: Position.Left, right: Position.Right }
const allEdges = ['top', 'bottom', 'left', 'right']

const ghostPositions = {
  top: { top: 0, left: '50%', transform: 'translate(-50%, -50%)' },
  bottom: { bottom: 0, left: '50%', transform: 'translate(-50%, 50%)' },
  left: { left: 0, top: '50%', transform: 'translate(-50%, -50%)' },
  right: { right: 0, top: '50%', transform: 'translate(50%, -50%)' },
}

const removeButtonOffsets = {
  top: { top: -30, left: '50%', transform: 'translateX(-50%)' },
  bottom: { bottom: -30, left: '50%', transform: 'translateX(-50%)' },
  left: { left: -30, top: '50%', transform: 'translateY(-50%)' },
  right: { right: -30, top: '50%', transform: 'translateY(-50%)' },
}

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
      {/* Each active edge gets TWO overlapping handles: source + target */}
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

      {/* Ghost connector previews on hover for edges without handles */}
      {hovered && allEdges.filter((e) => !activeHandles.includes(e)).map((edge) => (
        <div
          key={`ghost-${edge}`}
          onClick={(e) => { e.stopPropagation(); onAddHandle(edge) }}
          style={{
            position: 'absolute', ...ghostPositions[edge],
            width: 30, height: 30,
            background: 'white', border: '2px solid #747474',
            borderRadius: 1.4,
            opacity: 0.4,
            cursor: 'pointer', zIndex: 10,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.4'}
        />
      ))}

      {/* Remove buttons on hover */}
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
