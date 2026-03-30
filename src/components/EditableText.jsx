import { useState } from 'react'

/* Reusable inline-editable text with placeholder + cursor icon when empty */
export default function EditableText({ value, onChange, style = {}, placeholder = 'Double-click to edit', inputStyle = {}, multiline = false }) {
  const [editing, setEditing] = useState(false)

  const baseStyle = { cursor: 'text', minHeight: '1.2em', position: 'relative', ...style }
  const isEmpty = !value || !value.trim()

  if (editing) {
    const shared = { autoFocus: true, defaultValue: value, style: { ...style, background: 'transparent', outline: 'none', border: 'none', resize: 'none', ...inputStyle } }
    const onDone = (e) => { setEditing(false); onChange(e.target.value) }
    return multiline
      ? <textarea {...shared} onBlur={onDone} />
      : <input {...shared} onBlur={onDone} onKeyDown={(e) => e.key === 'Enter' && e.target.blur()} />
  }

  return (
    <div onDoubleClick={() => setEditing(true)} style={baseStyle}>
      {isEmpty ? (
        <span style={{ color: '#C4BCAC', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4BCAC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 10H3"/><path d="M21 6H3"/><path d="M21 14H3"/><path d="M17 18H3"/>
          </svg>
          {placeholder}
        </span>
      ) : value}
    </div>
  )
}
