import { useCallback } from 'react'
import { useReactFlow } from '@xyflow/react'
import NodeWrapper from './NodeWrapper'
import EditableText from './EditableText'

function TextNode({ data, id }) {
  const { setNodes } = useReactFlow()
  const updateField = useCallback((field, val) => {
    setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, [field]: val } } : n))
  }, [id, setNodes])

  return (
    <NodeWrapper id={id} data={data} maxPerSide={3}
      style={{ width: 250, minHeight: 250, border: `2px solid ${data.strokeColor || '#747474'}`, borderRadius: 4.35, background: data.fillColor || 'white', display: 'flex', flexDirection: 'column', padding: 24 }}>
      <EditableText value={data.label || 'Data Center'} onChange={(v) => updateField('label', v)} placeholder="Title"
        style={{ fontSize: 23, fontWeight: 700, color: '#747474', marginBottom: 16 }} />
      <EditableText value={data.body || ''} onChange={(v) => updateField('body', v)} placeholder="Body text" multiline
        style={{ fontSize: 18, color: '#747474', lineHeight: 1.6, whiteSpace: 'pre-wrap', flex: 1 }}
        inputStyle={{ flex: 1, resize: 'none', width: '100%' }} />
    </NodeWrapper>
  )
}

export default TextNode
