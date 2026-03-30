import { useState } from 'react'
import NodeWrapper from './NodeWrapper'

function TextNode({ data, id }) {
  const [title, setTitle] = useState(data.label || 'Data Center')
  const [body, setBody] = useState(data.body || '')
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingBody, setEditingBody] = useState(false)

  return (
    <NodeWrapper id={id} data={data} maxPerSide={3}
      style={{ width: 250, minHeight: 250, border: `2px solid ${data.strokeColor || '#747474'}`, borderRadius: 4.35, background: data.fillColor || 'white', display: 'flex', flexDirection: 'column', padding: 24 }}>
      {editingTitle ? (
        <input autoFocus defaultValue={title} onBlur={(e) => { setEditingTitle(false); setTitle(e.target.value) }} onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
          style={{ fontSize: 23, fontWeight: 700, color: '#747474', background: 'transparent', outline: 'none', marginBottom: 16, border: 'none' }} />
      ) : (
        <div onDoubleClick={() => setEditingTitle(true)} style={{ fontSize: 23, fontWeight: 700, color: '#747474', marginBottom: 16, cursor: 'text' }}>{title}</div>
      )}
      {editingBody ? (
        <textarea autoFocus defaultValue={body} onBlur={(e) => { setEditingBody(false); setBody(e.target.value) }}
          style={{ fontSize: 18, color: '#747474', background: 'transparent', outline: 'none', flex: 1, resize: 'none', lineHeight: 1.6, border: 'none' }} rows={8} />
      ) : (
        <div onDoubleClick={() => setEditingBody(true)} style={{ fontSize: 18, color: '#747474', lineHeight: 1.6, cursor: 'text', whiteSpace: 'pre-wrap' }}>{body}</div>
      )}
    </NodeWrapper>
  )
}

export default TextNode
