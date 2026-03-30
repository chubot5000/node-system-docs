import { memo, useState, useCallback } from 'react'
import { Handle, Position } from '@xyflow/react'
import { motion } from 'framer-motion'

function TextNode({ data }) {
  const [title, setTitle] = useState(data.label || 'Data Center')
  const [body, setBody] = useState(data.body || 'Choose from a collection of ready-made templates, made by creative professionals and ready for you to customize.')
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingBody, setEditingBody] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      style={{ width: 360, minHeight: 311, border: '1px solid #747474', borderRadius: 4.35, background: 'white', display: 'flex', flexDirection: 'column', padding: 24 }}
    >
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Right} id="right" />
      
      {editingTitle ? (
        <input
          autoFocus
          defaultValue={title}
          onBlur={(e) => { setEditingTitle(false); setTitle(e.target.value) }}
          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
          className="text-lg font-bold text-border bg-transparent outline-none mb-4"
        />
      ) : (
        <div
          onDoubleClick={() => setEditingTitle(true)}
          className="text-lg font-bold text-border mb-4 cursor-text"
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
