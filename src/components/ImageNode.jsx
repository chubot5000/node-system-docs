import { memo, useState, useCallback, useRef, useContext } from 'react'
import { motion } from 'framer-motion'
import { NodeHandles } from './NodeHandles'
import { ConnectorContext } from '../App'

function ImageNode({ data, id }) {
  const [title, setTitle] = useState(data.label || 'GPU')
  const [imageSrc, setImageSrc] = useState(data.imageSrc || null)
  const [editingTitle, setEditingTitle] = useState(false)
  const [hovered, setHovered] = useState(false)
  const fileRef = useRef()
  const { activeConnectorType, onHandleContextMenu } = useContext(ConnectorContext)

  const [localHandles, setLocalHandles] = useState(data.activeHandles || ['bottom'])
  const [localTypes, setLocalTypes] = useState(data.handleTypes || {})
  const activeHandles = data.activeHandles || localHandles
  const handleTypes = data.handleTypes || localTypes

  const handleImageClick = useCallback(() => { fileRef.current?.click() }, [])
  const handleFile = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) { const r = new FileReader(); r.onload = (ev) => setImageSrc(ev.target.result); r.readAsDataURL(file) }
  }, [])
  const addHandle = useCallback((edge) => {
    setLocalHandles((prev) => prev.includes(edge) ? prev : [...prev, edge])
    setLocalTypes((prev) => ({ ...prev, [edge]: activeConnectorType || 'plain' }))
  }, [activeConnectorType])
  const removeHandle = useCallback((edge) => {
    setLocalHandles((prev) => prev.filter((e) => e !== edge))
    setLocalTypes((prev) => { const n = { ...prev }; delete n[edge]; return n })
  }, [])
  const handleCtxMenu = useCallback((e, edge) => {
    onHandleContextMenu?.(e, id, edge, handleTypes[edge] || 'plain')
  }, [onHandleContextMenu, id, handleTypes])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      style={{ width: 360, height: 311, border: `2px solid ${data.strokeColor || '#747474'}`, borderRadius: 4.35, background: data.fillColor || 'white', display: 'flex', flexDirection: 'column', position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <NodeHandles activeHandles={activeHandles} handleTypes={handleTypes} hovered={hovered} onAddHandle={addHandle} onRemoveHandle={removeHandle} onHandleContextMenu={handleCtxMenu} />
      
      <div style={{ padding: '16px 16px 8px' }}>
        {editingTitle ? (
          <input autoFocus defaultValue={title}
            onBlur={(e) => { setEditingTitle(false); setTitle(e.target.value) }}
            onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
            style={{ fontSize: 23, fontWeight: 700, color: '#747474', background: 'transparent', outline: 'none', border: 'none', fontFamily: 'Inter, sans-serif' }}
          />
        ) : (
          <div onDoubleClick={() => setEditingTitle(true)} style={{ fontSize: 23, fontWeight: 700, color: '#747474', cursor: 'text' }}>
            {title}
          </div>
        )}
      </div>

      <div
        onClick={handleImageClick}
        style={{ flex: 1, margin: '0 16px 16px', background: '#E6D9CE', borderRadius: 6, border: '1px solid #655343', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}
      >
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        {imageSrc ? (
          <img src={imageSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#655343" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        )}
      </div>
    </motion.div>
  )
}

export default memo(ImageNode)
