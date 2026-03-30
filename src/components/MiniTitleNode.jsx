import { useState } from 'react'
import NodeWrapper from './NodeWrapper'
import EditableText from './EditableText'

function MiniTitleNode({ data, id }) {
  const [title, setTitle] = useState(data.label || 'Mini')

  return (
    <NodeWrapper id={id} data={data} maxPerSide={3}
      style={{ width: 180, height: 80, border: `2px solid ${data.strokeColor || '#747474'}`, borderRadius: 4.35, background: data.fillColor || 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <EditableText value={title} onChange={setTitle} placeholder="Title"
        style={{ fontSize: 23, fontWeight: 700, color: '#747474', textAlign: 'center', padding: '0 12px', width: '100%' }} />
    </NodeWrapper>
  )
}

export default MiniTitleNode
