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
      style={{ width: 180, minHeight: 160, border: `1px solid ${data.strokeColor || '#A99482'}`, borderRadius: 3, background: data.fillColor || 'white', display: 'flex', flexDirection: 'column', padding: 14 }}>
      <EditableText value={data.label || 'Data Center'} onChange={(v) => updateField('label', v)} placeholder="Title"
        style={{ fontSize: 13, fontWeight: 700, color: '#655343', marginBottom: 10 }} />
      <EditableText value={data.body || ''} onChange={(v) => updateField('body', v)} placeholder="Body text" multiline
        style={{ fontSize: 11, color: '#7A6E63', lineHeight: 1.5, whiteSpace: 'pre-wrap', flex: 1 }}
        inputStyle={{ flex: 1, resize: 'none', width: '100%' }} />
    </NodeWrapper>
  )
}

export default TextNode
