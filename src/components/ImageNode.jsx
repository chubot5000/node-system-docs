import { memo, useState, useCallback, useRef } from 'react'
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

function ImageNode({ data }) {
  const [title, setTitle] = useState(data.label || 'GPU')
  const [imageSrc, setImageSrc] = useState(data.imageSrc || null)
  const [editingTitle, setEditingTitle] = useState(false)
  const [activeHandles, setActiveHandles] = useState(data.activeHandles || ['bottom'])
  const [hovered, setHovered] = useState(false)
  const fileRef = useRef()

  const handleImageClick = useCallback(() => { fileRef.current?.click() }, [])
  const handleFile = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setImageSrc(ev.target.result)
      reader.readAsDataURL(file)
    }
  }, [])
  const addHandle = useCallback((edge) => {
    setActiveHandles((prev) => prev.includes(edge) ? prev : [...prev, edge])
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      style={{ width: 360, height: 311, border: '2px solid #747474', borderRadius: 4.35, background: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}
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
      
      <div className="p-4 pb-2">
        {editingTitle ? (
          <input
            autoFocus
            defaultValue={title}
            onBlur={(e) => { setEditingTitle(false); setTitle(e.target.value) }}
            onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
            className="text-lg font-bold text-border bg-transparent outline-none"
          />
        ) : (
          <div
            onDoubleClick={() => setEditingTitle(true)}
            className="text-lg font-bold text-border cursor-text"
          >
            {title}
          </div>
        )}
      </div>

      <div
        onClick={handleImageClick}
        className="flex-1 mx-4 mb-4 rounded cursor-pointer flex items-center justify-center"
        style={{ background: '#E6D9CE', borderRadius: 6, border: '1px solid #655343' }}
      >
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        {imageSrc ? (
          <img src={imageSrc} alt="" className="w-full h-full object-cover rounded" />
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
