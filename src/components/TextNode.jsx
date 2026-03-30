import { memo, useState, useCallback, useContext } from 'react'
import { motion } from 'framer-motion'
import { NodeHandles } from './NodeHandles'
import { ConnectorContext } from '../App'

function TextNode({ data }) {
  const [title, setTitle] = useState(data.label || 'Data Center')
  const [body, setBody] = useState(data.body || 'Choose from a collection of ready-made templates.')
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingBody, setEditingBody] = useState(false)
  const [activeHandles, setActiveHandles] = useState(data.activeHandles || ['bottom'])
  const [handleTypes, setHandleTypes] = useState(data.handleTypes || {})
  const [hovered, setHovered] = useState(false)
  const activeConnectorType = useContext(ConnectorContext)

  const addHandle = useCallback((edge) => {
    setActiveHandles((prev) => prev.includes(edge) ? prev : [...prev, edge])
    setHandleTypes((prev) => ({ ...prev, [edge]: activeConnectorType || 'plain' }))
  }, [activeConnectorType])

  const removeHandle = useCallback((edge) => {
    setActiveHandles((prev) => prev.filter((e) => e !== edge))
    setHandleTypes((prev) => { const n = { ...prev }; delete n[edge]; return n })
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
      <NodeHandles activeHandles={activeHandles} handleTypes={handleTypes} hovered={hovered} onAddHandle={addHandle} onRemoveHandle={removeHandle} />
      
      {editingTitle ? (
        <input
          autoFocus
          defaultValue={title}
          onBlur={(e) => { setEditingTitle(false); setTitle(e.target.value) }}
          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
          className="text-lg font-bold text-[#747474] bg-transparent outline-none mb-4"
        />
      ) : (
        <div onDoubleClick={() => setEditingTitle(true)} className="text-lg font-bold text-[#747474] mb-4 cursor-text">
          {title}
        </div>
      )}

      {editingBody ? (
        <textarea
          autoFocus
          defaultValue={body}
          onBlur={(e) => { setEditingBody(false); setBody(e.target.value) }}
          className="text-sm text-[#747474] bg-transparent outline-none flex-1 resize-none leading-relaxed"
          rows={8}
        />
      ) : (
        <div onDoubleClick={() => setEditingBody(true)} className="text-sm text-[#747474] leading-relaxed cursor-text whitespace-pre-wrap">
          {body}
        </div>
      )}
    </motion.div>
  )
}

export default memo(TextNode)
