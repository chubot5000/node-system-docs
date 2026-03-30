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
      style={{ width: 250, height: 80, border: `2px solid ${data.strokeColor || '#747474'}`, borderRadius: 4.35, background: data.fillColor || 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <EditableText value={data.label || 'Title'} onChange={updateLabel} placeholder="Title"
        style={{ fontSize: 23, fontWeight: 700, color: '#747474', textAlign: 'center', padding: '0 16px', width: '100%' }} />
    </NodeWrapper>
  )
}

export default TitleNode
