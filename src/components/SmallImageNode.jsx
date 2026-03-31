import { useRef, useCallback } from 'react'
import { useReactFlow } from '@xyflow/react'
import NodeWrapper from './NodeWrapper'
import EditableText from './EditableText'

function SmallImageNode({ data, id }) {
  const { setNodes } = useReactFlow()
  const fileRef = useRef()
  const imgSize = 50
  const updateField = useCallback((field, val) => {
    setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, [field]: val } } : n))
  }, [id, setNodes])

  return (
    <NodeWrapper id={id} data={data} maxPerSide={3}
      style={{ width: 200, height: imgSize, border: `1px solid ${data.strokeColor || '#A99482'}`, borderRadius: 3, background: data.fillColor || 'white', display: 'flex', flexDirection: 'row' }}>
      <div onClick={() => fileRef.current?.click()}
        style={{ width: imgSize, minWidth: imgSize, height: '100%', background: '#DBD0C6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRight: '1px solid #A99482', borderRadius: '2px 0 0 2px' }}>
        <input ref={fileRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = (ev) => updateField('imageSrc', ev.target.result); r.readAsDataURL(f) } }} style={{ display: 'none' }} />
        {data.imageSrc ? <img src={data.imageSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A99482" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
        )}
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 10px' }}>
        <EditableText value={data.label || 'OEM'} onChange={(v) => updateField('label', v)} placeholder="Title"
          style={{ fontSize: 13, fontWeight: 600, color: '#655343', textAlign: 'center', width: '100%' }} />
      </div>
    </NodeWrapper>
  )
}

export default SmallImageNode
