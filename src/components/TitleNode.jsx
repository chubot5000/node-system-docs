import { memo, useState, useCallback } from 'react'
import { Handle, Position } from '@xyflow/react'
import { motion } from 'framer-motion'

const positionMap = {
  top: Position.Top,
  bottom: Position.Bottom,
  left: Position.Left,
  right: Position.Right,
}

const handleTypeMap = {
  top: 'target',
  bottom: 'source',
  left: 'target',
  right: 'source',
}

const addButtonPositions = {
  top: { top: -12, left: '50%', transform: 'translateX(-50%)' },
  bottom: { bottom: -12, left: '50%', transform: 'translateX(-50%)' },
  left: { left: -12, top: '50%', transform: 'translateY(-50%)' },
  right: { right: -12, top: '50%', transform: 'translateY(-50%)' },
}

function TitleNode({ data, id }) {
  const [title, setTitle] = useState(data.label || 'Title')
  const [editing, setEditing] = useState(false)
  const [activeHandles, setActiveHandles] = useState(data.activeHandles || ['bottom'])
  const [hovered, setHovered] = useState(false)

  const onDoubleClick = useCallback(() => setEditing(true), [])
  const onBlur = useCallback((e) => {
    setEditing(false)
    setTitle(e.target.value)
  }, [])

  const addHandle = useCallback((edge) => {
    setActiveHandles((prev) => prev.includes(edge) ? prev : [...prev, edge])
  }, [])

  const allEdges = ['top', 'bottom', 'left', 'right']

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="bg-white border-border rounded-[4.35px]"
      style={{ width: 360, height: 100, border: '2px solid #747474', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {activeHandles.map((edge) => (
        <Handle key={edge} type={handleTypeMap[edge]} position={positionMap[edge]} id={edge} />
      ))}
      {hovered && allEdges.filter((e) => !activeHandles.includes(e)).map((edge) => (
        <div
          key={`add-${edge}`}
          onClick={(e) => { e.stopPropagation(); addHandle(edge) }}
          style={{
            position: 'absolute',
            ...addButtonPositions[edge],
            width: 18, height: 18,
            background: 'white',
            border: '1.5px solid #747474',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            fontSize: 12,
            lineHeight: 1,
            color: '#747474',
            fontWeight: 'bold',
          }}
        >
          +
        </div>
      ))}
      {editing ? (
        <input
          autoFocus
          defaultValue={title}
          onBlur={onBlur}
          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
          className="text-lg font-bold text-[#747474] text-center bg-transparent outline-none w-full px-4"
        />
      ) : (
        <div
          onDoubleClick={onDoubleClick}
          className="text-lg font-bold text-[#747474] text-center cursor-text select-none px-4 w-full"
        >
          {title}
        </div>
      )}
    </motion.div>
  )
}

export default memo(TitleNode)
