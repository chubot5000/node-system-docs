import { memo, useState, useCallback, useContext } from 'react'
import { motion } from 'framer-motion'
import { NodeHandles } from './NodeHandles'
import { ConnectorContext } from '../App'

function TitleNode({ data, id }) {
  const [title, setTitle] = useState(data.label || 'Title')
  const [editing, setEditing] = useState(false)
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
      style={{ width: 360, height: 100, border: `2px solid ${data.strokeColor || '#747474'}`, borderRadius: 4.35, background: data.fillColor || 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <NodeHandles activeHandles={activeHandles} handleTypes={handleTypes} hovered={hovered} onAddHandle={addHandle} onRemoveHandle={removeHandle} />
      {editing ? (
        <input
          autoFocus
          defaultValue={title}
          onBlur={(e) => { setEditing(false); setTitle(e.target.value) }}
          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
          style={{ fontSize: 23, fontWeight: 700, color: '#747474', textAlign: 'center', background: 'transparent', outline: 'none', width: '100%', padding: '0 16px', border: 'none', fontFamily: 'Inter, sans-serif' }}
        />
      ) : (
        <div
          onDoubleClick={() => setEditing(true)}
          style={{ fontSize: 23, fontWeight: 700, color: '#747474', textAlign: 'center', cursor: 'text', userSelect: 'none', padding: '0 16px', width: '100%' }}
        >
          {title}
        </div>
      )}
    </motion.div>
  )
}

export default memo(TitleNode)
