import { useState } from 'react'
import { useTheme } from '../ThemeContext'

/* Reusable inline-editable text with placeholder + cursor icon when empty */
export default function EditableText({ value, onChange, style = {}, placeholder = 'Double-click to edit', inputStyle = {}, multiline = false }) {
  const { mode } = useTheme()
  const [editing, setEditing] = useState(false)
  const [localVal, setLocalVal] = useState(value)
  const placeholderColor = mode === 'dark' ? '#555' : '#C4BCAC'

  // Sync if parent value changes (e.g. undo/redo)
  if (!editing && value !== localVal) setLocalVal(value)

  const baseStyle = { cursor: 'text', minHeight: '1.2em', position: 'relative', ...style }
  const isEmpty = !localVal || !localVal.trim()

  if (editing) {
    const shared = { autoFocus: true, defaultValue: localVal, style: { ...style, background: 'transparent', outline: 'none', border: 'none', resize: 'none', ...inputStyle } }
    const onDone = (e) => {
      setEditing(false)
      setLocalVal(e.target.value)
      onChange(e.target.value)
    }
    return multiline
      ? <textarea {...shared} onBlur={onDone} />
      : <input {...shared} onBlur={onDone} onKeyDown={(e) => e.key === 'Enter' && e.target.blur()} />
  }

  return (
    <div onDoubleClick={() => setEditing(true)} style={baseStyle}>
      {isEmpty ? (
        <span style={{ color: placeholderColor, fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={placeholderColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 10H3"/><path d="M21 6H3"/><path d="M21 14H3"/><path d="M17 18H3"/>
          </svg>
          {placeholder}
        </span>
      ) : localVal}
    </div>
  )
}
