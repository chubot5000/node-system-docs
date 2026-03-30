import { useState } from 'react'
import NodeWrapper from './NodeWrapper'
import EditableText from './EditableText'

function TextNode({ data, id }) {
  const [title, setTitle] = useState(data.label || 'Data Center')
  const [body, setBody] = useState(data.body || '')

  return (
    <NodeWrapper id={id} data={data} maxPerSide={3}
      style={{ width: 250, minHeight: 250, border: `2px solid ${data.strokeColor || '#747474'}`, borderRadius: 4.35, background: data.fillColor || 'white', display: 'flex', flexDirection: 'column', padding: 24 }}>
      <EditableText value={title} onChange={setTitle} placeholder="Title"
        style={{ fontSize: 23, fontWeight: 700, color: '#747474', marginBottom: 16 }} />
      <EditableText value={body} onChange={setBody} placeholder="Body text" multiline
        style={{ fontSize: 18, color: '#747474', lineHeight: 1.6, whiteSpace: 'pre-wrap', flex: 1 }}
        inputStyle={{ flex: 1, resize: 'none', width: '100%' }} />
    </NodeWrapper>
  )
}

export default TextNode
