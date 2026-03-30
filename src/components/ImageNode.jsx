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
      style={{ width: 250, height: 250, border: `2px solid ${data.strokeColor || '#747474'}`, borderRadius: 4.35, background: data.fillColor || 'white', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 16px 8px' }}>
        <EditableText value={data.label || 'GPU'} onChange={(v) => updateField('label', v)} placeholder="Title"
          style={{ fontSize: 23, fontWeight: 700, color: '#747474' }} />
      </div>
      <div onClick={() => fileRef.current?.click()}
        style={{ flex: 1, margin: '0 16px 16px', background: '#E6D9CE', borderRadius: 6, border: '1px solid #655343', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}>
        <input ref={fileRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = (ev) => updateField('imageSrc', ev.target.result); r.readAsDataURL(f) } }} style={{ display: 'none' }} />
        {data.imageSrc ? <img src={data.imageSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#655343" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
        )}
      </div>
    </NodeWrapper>
  )
}

export default ImageNode
