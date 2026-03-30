import { memo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function EdgeLabelModal({ edge, position, onClose, onSetLabel, onDelete }) {
  const [label, setLabel] = useState(edge?.label || '')

  if (!edge) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed z-50 bg-white rounded-lg shadow-xl border p-4"
        style={{ left: position.x, top: position.y, borderColor: '#CFCBC8', minWidth: 220 }}
      >
        <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-3">Edge Label</h3>
        <input
          autoFocus
          value={label}
          onChange={(e) => setLabel(e.target.value.toUpperCase())}
          placeholder="e.g. OWNS"
          className="w-full border rounded px-3 py-2 text-sm text-accent font-semibold uppercase tracking-wider outline-none focus:border-accent"
          style={{ borderColor: '#CFCBC8' }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { onSetLabel(edge.id, label); onClose() }
            if (e.key === 'Escape') onClose()
          }}
        />
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => { onSetLabel(edge.id, label); onClose() }}
            className="flex-1 py-1.5 rounded text-xs font-semibold text-white bg-accent hover:opacity-90"
          >
            Apply
          </button>
          <button
            onClick={() => { onDelete(edge.id); onClose() }}
            className="px-3 py-1.5 rounded text-xs font-semibold text-red-500 border border-red-200 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default memo(EdgeLabelModal)
