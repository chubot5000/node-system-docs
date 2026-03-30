import { memo, useState, useCallback, useContext } from 'react'
import { motion } from 'framer-motion'
import { NodeHandles } from './NodeHandles'
import { ConnectorContext } from '../App'

function TitleNode({ data, id }) {
  const [title, setTitle] = useState(data.label || 'Title')
  const [editing, setEditing] = useState(false)
  const [hovered, setHovered] = useState(false)
  const { onHandleContextMenu, onAddHandle, onRemoveHandle } = useContext(ConnectorContext)

  const addHandle = useCallback((edge) => onAddHandle?.(id, edge), [onAddHandle, id])
  const removeHandle = useCallback((edge) => onRemoveHandle?.(id, edge), [onRemoveHandle, id])
  const handleCtxMenu = useCallback((e, edge) => {
    onHandleContextMenu?.(e, id, edge, (data.handleTypes || {})[edge] || 'plain')
  }, [onHandleContextMenu, id, data.handleTypes])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      style={{ width: 360, height: 100, border: `2px solid ${data.strokeColor || '#747474'}`, borderRadius: 4.35, background: data.fillColor || 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <NodeHandles activeHandles={data.activeHandles || ['bottom']} handleTypes={data.handleTypes || {}} hovered={hovered} onAddHandle={addHandle} onRemoveHandle={removeHandle} onHandleContextMenu={handleCtxMenu} />
      {editing ? (
        <input
          autoFocus defaultValue={title}
          onBlur={(e) => { setEditing(false); setTitle(e.target.value) }}
          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
          style={{ fontSize: 23, fontWeight: 700, color: '#747474', textAlign: 'center', background: 'transparent', outline: 'none', width: '100%', padding: '0 16px', border: 'none', fontFamily: 'Inter, sans-serif' }}
        />
      ) : (
        <div onDoubleClick={() => setEditing(true)}
          style={{ fontSize: 23, fontWeight: 700, color: '#747474', textAlign: 'center', cursor: 'text', userSelect: 'none', padding: '0 16px', width: '100%' }}>
          {title}
        </div>
      )}
    </motion.div>
  )
}

export default memo(TitleNode)
