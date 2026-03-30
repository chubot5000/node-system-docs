import { useRef, useState } from 'react'
import NodeWrapper from './NodeWrapper'

function ImageNode({ data, id }) {
  const [title, setTitle] = useState(data.label || 'GPU')
  const [imageSrc, setImageSrc] = useState(null)
  const [editingTitle, setEditingTitle] = useState(false)
  const fileRef = useRef()

  return (
    <NodeWrapper id={id} data={data} maxPerSide={3}
      style={{ width: 250, height: 250, border: `2px solid ${data.strokeColor || '#747474'}`, borderRadius: 4.35, background: data.fillColor || 'white', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 16px 8px' }}>
        {editingTitle ? (
          <input autoFocus defaultValue={title} onBlur={(e) => { setEditingTitle(false); setTitle(e.target.value) }} onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
            style={{ fontSize: 23, fontWeight: 700, color: '#747474', background: 'transparent', outline: 'none', border: 'none' }} />
        ) : (
          <div onDoubleClick={() => setEditingTitle(true)} style={{ fontSize: 23, fontWeight: 700, color: '#747474', cursor: 'text' }}>{title}</div>
        )}
      </div>
      <div onClick={() => fileRef.current?.click()}
        style={{ flex: 1, margin: '0 16px 16px', background: '#E6D9CE', borderRadius: 6, border: '1px solid #655343', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}>
        <input ref={fileRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = (ev) => setImageSrc(ev.target.result); r.readAsDataURL(f) } }} style={{ display: 'none' }} />
        {imageSrc ? <img src={imageSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#655343" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
        )}
      </div>
    </NodeWrapper>
  )
}

export default ImageNode
