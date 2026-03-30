import { memo, useState, useCallback } from 'react'
import { Handle, Position } from '@xyflow/react'
import { motion } from 'framer-motion'

const positionMap = { top: Position.Top, bottom: Position.Bottom, left: Position.Left, right: Position.Right }
const handleTypeMap = { top: 'target', bottom: 'source', left: 'target', right: 'source' }
const addButtonPositions = {
  top: { top: -12, left: '50%', transform: 'translateX(-50%)' },
  bottom: { bottom: -12, left: '50%', transform: 'translateX(-50%)' },
  left: { left: -12, top: '50%', transform: 'translateY(-50%)' },
  right: { right: -12, top: '50%', transform: 'translateY(-50%)' },
}
const allEdges = ['top', 'bottom', 'left', 'right']

function TextNode({ data }) {
  const [title, setTitle] = useState(data.label || 'Data Center')
  const [body, setBody] = useState(data.body || 'Choose from a collection of ready-made templates, made by creative professionals and ready for you to customize.')
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingBody, setEditingBody] = useState(false)
  const [activeHandles, setActiveHandles] = useState(data.activeHandles || ['bottom'])
  const [hovered, setHovered] = useState(false)

  const addHandle = useCallback((edge) => {
    setActiveHandles((prev) => prev.includes(edge) ? prev : [...prev, edge])
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      style={{ width: 360, minHeight: 311, border: '2px solid #747474', borderRadius: 4.35, background: 'white', display: 'flex', flexDirection: 'column', padding: 24, position: 'relative' }}
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
            position: 'absolute', ...addButtonPositions[edge],
            width: 18, height: 18, background: 'white', border: '1.5px solid #747474',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 10, fontSize: 12, lineHeight: 1, color: '#747474', fontWeight: 'bold',
          }}
        >+</div>
      ))}
      
      {editingTitle ? (
        <input
          autoFocus
          defaultValue={title}
          onBlur={(e) => { setEditingTitle(false); setTitle(e.target.value) }}
          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
          className="text-lg font-bold text-[#747474] bg-transparent outline-none mb-4"
        />
      ) : (
        <div
          onDoubleClick={() => setEditingTitle(true)}
          className="text-lg font-bold text-[#747474] mb-4 cursor-text"
        >
          {title}
        </div>
      )}

      {editingBody ? (
        <textarea
          autoFocus
          defaultValue={body}
          onBlur={(e) => { setEditingBody(false); setBody(e.target.value) }}
          className="text-sm text-border bg-transparent outline-none flex-1 resize-none leading-relaxed"
          rows={8}
        />
      ) : (
        <div
          onDoubleClick={() => setEditingBody(true)}
          className="text-sm text-border leading-relaxed cursor-text whitespace-pre-wrap"
        >
          {body}
        </div>
      )}
    </motion.div>
  )
}

export default memo(TextNode)
