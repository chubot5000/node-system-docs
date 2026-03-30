import { useRef, useCallback } from 'react'
import { useReactFlow } from '@xyflow/react'
import NodeWrapper from './NodeWrapper'
import EditableText from './EditableText'

function SmallImageNode({ data, id }) {
  const { setNodes } = useReactFlow()
  const fileRef = useRef()
  const imgSize = 105
  const updateField = useCallback((field, val) => {
    setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, [field]: val } } : n))
  }, [id, setNodes])

  return (
    <NodeWrapper id={id} data={data} maxPerSide={3}
      style={{ width: 360, height: imgSize, border: `2px solid ${data.strokeColor || '#A99482'}`, borderRadius: 4.35, background: data.fillColor || 'white', display: 'flex', flexDirection: 'row' }}>
      <div onClick={() => fileRef.current?.click()}
        style={{ width: imgSize, minWidth: imgSize, height: '100%', background: '#DBD0C6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRight: '2px solid #A99482', borderRadius: '3px 0 0 3px' }}>
        <input ref={fileRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = (ev) => updateField('imageSrc', ev.target.result); r.readAsDataURL(f) } }} style={{ display: 'none' }} />
        {data.imageSrc ? <img src={data.imageSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#A99482" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
        )}
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
        <EditableText value={data.label || 'OEM'} onChange={(v) => updateField('label', v)} placeholder="Title"
          style={{ fontSize: 23, fontWeight: 700, color: '#747474', textAlign: 'center', width: '100%' }} />
      </div>
    </NodeWrapper>
  )
}

export default SmallImageNode
