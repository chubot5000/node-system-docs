import { useCallback } from 'react'
import { useReactFlow } from '@xyflow/react'
import NodeWrapper from './NodeWrapper'
import EditableText from './EditableText'

function TitleNode({ data, id }) {
  const { setNodes } = useReactFlow()
  const updateLabel = useCallback((val) => {
    setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, label: val } } : n))
  }, [id, setNodes])

  return (
    <NodeWrapper id={id} data={data} maxPerSide={1}
      style={{ width: 160, height: 40, border: `1px solid ${data.strokeColor || '#A99482'}`, borderRadius: 3, background: data.fillColor || 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <EditableText value={data.label || 'Title'} onChange={updateLabel} placeholder="Title"
        style={{ fontSize: 13, fontWeight: 600, color: '#655343', textAlign: 'center', padding: '0 12px', width: '100%' }} />
    </NodeWrapper>
  )
}

export default TitleNode
