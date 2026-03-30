import { memo, useState, useCallback, useRef } from 'react'
import { Handle, Position } from '@xyflow/react'
import { motion } from 'framer-motion'

function ImageNode({ data }) {
  const [title, setTitle] = useState(data.label || 'GPU')
  const [imageSrc, setImageSrc] = useState(data.imageSrc || null)
  const [editingTitle, setEditingTitle] = useState(false)
  const fileRef = useRef()

  const handleImageClick = useCallback(() => {
    fileRef.current?.click()
  }, [])

  const handleFile = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setImageSrc(ev.target.result)
      reader.readAsDataURL(file)
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      style={{ width: 360, height: 311, border: '1px solid #747474', borderRadius: 4.35, background: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Right} id="right" />
      
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
