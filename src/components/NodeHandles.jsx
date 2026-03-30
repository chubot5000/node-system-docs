import { memo, useCallback } from 'react'
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
  top: { top: -28, left: '50%', transform: 'translateX(-50%)' },
  bottom: { bottom: -28, left: '50%', transform: 'translateX(-50%)' },
  left: { left: -28, top: '50%', transform: 'translateY(-50%)' },
  right: { right: -28, top: '50%', transform: 'translateY(-50%)' },
}

// Connector type visuals rendered inside the handle via CSS overlay
const connectorIcons = {
  plain: null,
  arrow: (
    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" style={{ pointerEvents: 'none' }}>
      <path d="M2 5L10.5 5M10.5 5L7.5 2M10.5 5L7.5 8" stroke="#655343" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  additive: <span style={{ fontSize: 16, fontWeight: 600, color: '#747474', pointerEvents: 'none', lineHeight: 1 }}>+</span>,
  black: null,
}

export function NodeHandles({ activeHandles, handleTypes, hovered, onAddHandle, onRemoveHandle }) {
  return (
    <>
      {activeHandles.map((edge) => {
        const cType = handleTypes?.[edge] || 'plain'
        const isFilled = cType === 'black'
        return (
          <div key={edge} style={{ position: 'relative' }}>
            <Handle
              type="source"
              position={positionMap[edge]}
              id={`${edge}-source`}
              className={isFilled ? 'handle-black' : cType === 'arrow' ? 'handle-arrow' : cType === 'additive' ? 'handle-additive' : ''}
            />
            <Handle
              type="target"
              position={positionMap[edge]}
              id={`${edge}-target`}
              className={isFilled ? 'handle-black' : cType === 'arrow' ? 'handle-arrow' : cType === 'additive' ? 'handle-additive' : ''}
            />
            {/* Icon overlay for connector type */}
            {connectorIcons[cType] && (
              <div
                style={{
                  position: 'absolute',
                  ...getHandleCenterStyle(edge),
                  width: 30, height: 30,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  pointerEvents: 'none',
                  zIndex: 5,
                }}
              >
                {connectorIcons[cType]}
              </div>
            )}
          </div>
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

function getHandleCenterStyle(edge) {
  switch (edge) {
    case 'top': return { top: -15, left: '50%', transform: 'translateX(-50%)' }
    case 'bottom': return { bottom: -15, left: '50%', transform: 'translateX(-50%)' }
    case 'left': return { left: -15, top: '50%', transform: 'translateY(-50%)' }
    case 'right': return { right: -15, top: '50%', transform: 'translateY(-50%)' }
    default: return {}
  }
}

export { allEdges }
export default memo(NodeHandles)
