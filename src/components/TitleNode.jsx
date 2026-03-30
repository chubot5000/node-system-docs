import { memo, useState, useCallback } from 'react'
import { Handle, Position } from '@xyflow/react'
import { motion } from 'framer-motion'

function TitleNode({ data, id }) {
  const [title, setTitle] = useState(data.label || 'Title')
  const [editing, setEditing] = useState(false)

  const onDoubleClick = useCallback(() => setEditing(true), [])
  const onBlur = useCallback((e) => {
    setEditing(false)
    setTitle(e.target.value)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="bg-white border-border rounded-[4.35px]"
      style={{ width: 360, height: 100, border: '1px solid #747474', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Right} id="right" />
      {editing ? (
        <input
          autoFocus
          defaultValue={title}
          onBlur={onBlur}
          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
          className="text-sm font-semibold text-border text-center bg-transparent outline-none w-full px-4"
        />
      ) : (
        <div
          onDoubleClick={onDoubleClick}
          className="text-sm font-semibold text-border text-center cursor-text select-none px-4 w-full"
        >
          {title}
        </div>
      )}
    </motion.div>
  )
}

export default memo(TitleNode)
