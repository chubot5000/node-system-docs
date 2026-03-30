import { useState } from 'react'
import NodeWrapper from './NodeWrapper'

function LargeTitleNode({ data, id }) {
  const [title, setTitle] = useState(data.label || 'Large Title')
  const [editing, setEditing] = useState(false)

  return (
    <NodeWrapper id={id} data={data} maxPerSide={3}
      style={{ width: 360, height: 360, border: `2px solid ${data.strokeColor || '#747474'}`, borderRadius: 4.35, background: data.fillColor || 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {editing ? (
        <input autoFocus defaultValue={title}
          onBlur={(e) => { setEditing(false); setTitle(e.target.value) }}
          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
          style={{ fontSize: 23, fontWeight: 700, color: '#747474', textAlign: 'center', background: 'transparent', outline: 'none', width: '100%', padding: '0 16px', border: 'none' }} />
      ) : (
        <div onDoubleClick={() => setEditing(true)}
          style={{ fontSize: 23, fontWeight: 700, color: '#747474', textAlign: 'center', cursor: 'text', padding: '0 16px', width: '100%' }}>
          {title}
        </div>
      )}
    </NodeWrapper>
  )
}

export default LargeTitleNode
