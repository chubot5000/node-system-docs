import { useRef, useCallback } from 'react'
import { useReactFlow } from '@xyflow/react'
import NodeWrapper from './NodeWrapper'
import EditableText from './EditableText'

function ImageNode({ data, id }) {
  const { setNodes } = useReactFlow()
  const fileRef = useRef()
  const updateField = useCallback((field, val) => {
    setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, [field]: val } } : n))
  }, [id, setNodes])

  return (
    <NodeWrapper id={id} data={data} maxPerSide={3}
      style={{ width: 200, height: 160, border: `1px solid ${data.strokeColor || '#A99482'}`, borderRadius: 3, background: data.fillColor || 'white', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px 12px 6px' }}>
        <EditableText value={data.label || 'GPU'} onChange={(v) => updateField('label', v)} placeholder="Title"
          style={{ fontSize: 13, fontWeight: 700, color: '#655343' }} />
      </div>
      <div onClick={() => fileRef.current?.click()}
        style={{ flex: 1, margin: '0 10px 10px', background: '#EDE7E0', borderRadius: 3, border: '1px solid #C5B9AC', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}>
        <input ref={fileRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = (ev) => updateField('imageSrc', ev.target.result); r.readAsDataURL(f) } }} style={{ display: 'none' }} />
        {data.imageSrc ? <img src={data.imageSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#A99482" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
        )}
      </div>
    </NodeWrapper>
  )
}

export default ImageNode
