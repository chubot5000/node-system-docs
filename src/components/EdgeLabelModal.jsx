import { memo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../ThemeContext'

function EdgeLabelModal({ edge, position, onClose, onSetLabel, onDelete }) {
  const [label, setLabel] = useState(edge?.label || '')
  const { theme } = useTheme()

  if (!edge) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={{
          position: 'fixed', zIndex: 50, left: position.x, top: position.y,
          background: theme.menuBg, borderRadius: 8, border: `1px solid ${theme.menuBorder}`,
          boxShadow: theme.menuShadow, padding: 16, minWidth: 220,
          fontFamily: 'SwissNow, Inter, sans-serif',
        }}
      >
        <h3 style={{ fontSize: 11, fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Edge Label</h3>
        <input
          autoFocus value={label}
          onChange={(e) => setLabel(e.target.value.toUpperCase())}
          placeholder="e.g. OWNS"
          style={{ width: '100%', border: `1px solid ${theme.inputBorder}`, borderRadius: 4, padding: '6px 10px', fontSize: 13, color: theme.text, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', outline: 'none', background: theme.inputBg, boxSizing: 'border-box' }}
          onKeyDown={(e) => { if (e.key === 'Enter') { onSetLabel(edge.id, label); onClose() } if (e.key === 'Escape') onClose() }}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button onClick={() => { onSetLabel(edge.id, label); onClose() }}
            style={{ flex: 1, padding: '6px 0', borderRadius: 4, fontSize: 12, fontWeight: 600, color: 'white', background: theme.exportBg, border: 'none', cursor: 'pointer' }}>
            Apply
          </button>
          <button onClick={() => { onDelete(edge.id); onClose() }}
            style={{ padding: '6px 12px', borderRadius: 4, fontSize: 12, fontWeight: 600, color: '#ff4444', border: '1px solid #ff444433', background: 'transparent', cursor: 'pointer' }}>
            Delete
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default memo(EdgeLabelModal)
