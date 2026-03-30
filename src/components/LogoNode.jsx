import { memo, useState, useCallback, useRef, useContext } from 'react'
import { motion } from 'framer-motion'
import { NodeHandles } from './NodeHandles'
import { ConnectorContext } from '../App'

const defaultLogo = (
  <svg width="120" height="120" viewBox="0 0 250 250" fill="none">
    <path d="M126.365 58.1094L200.437 102.011L180.626 129.745L124.758 96.6309L68.8887 129.745L49.0781 102.011L124.758 57.1572L126.365 58.1094Z" fill="white" stroke="rgba(255,255,255,0.3)"/>
    <path d="M129.001 108.437L175.968 136.271L156.159 164.005L124.761 145.397L93.3623 164.005L73.5537 136.271L124.761 105.92L129.001 108.437Z" fill="white" stroke="rgba(255,255,255,0.3)"/>
    <path d="M124.859 154.743L151.495 170.531L135.766 192.555L124.76 186.033L113.754 192.555L98.0234 170.531L124.76 154.685L124.859 154.743Z" fill="white" stroke="rgba(255,255,255,0.3)"/>
  </svg>
)

function LogoNode({ data }) {
  const [logoSrc, setLogoSrc] = useState(data.logoSrc || null)
  const [activeHandles, setActiveHandles] = useState(data.activeHandles || ['bottom'])
  const [handleTypes, setHandleTypes] = useState(data.handleTypes || {})
  const [hovered, setHovered] = useState(false)
  const fileRef = useRef()
  const activeConnectorType = useContext(ConnectorContext)

  const handleClick = useCallback(() => { fileRef.current?.click() }, [])
  const handleFile = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setLogoSrc(ev.target.result)
      reader.readAsDataURL(file)
    }
  }, [])
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
      onClick={handleClick}
      style={{ width: 250, height: 250, background: data.fillColor || '#655343', borderRadius: 5.6, border: `2px solid ${data.strokeColor || '#655343'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <NodeHandles activeHandles={activeHandles} handleTypes={handleTypes} hovered={hovered} onAddHandle={addHandle} onRemoveHandle={removeHandle} />
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      {logoSrc ? (
        <img src={logoSrc} alt="Logo" style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }} />
      ) : defaultLogo}
    </motion.div>
  )
}

export default memo(LogoNode)
