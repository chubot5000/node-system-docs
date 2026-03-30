import { useRef, useState } from 'react'
import NodeWrapper from './NodeWrapper'

function SmallImageNode({ data, id }) {
  const [title, setTitle] = useState(data.label || 'OEM')
  const [imageSrc, setImageSrc] = useState(null)
  const [editing, setEditing] = useState(false)
  const fileRef = useRef()
  const imgSize = 105

  return (
    <NodeWrapper id={id} data={data} maxPerSide={3}
      style={{ width: 360, height: imgSize, border: `2px solid ${data.strokeColor || '#A99482'}`, borderRadius: 4.35, background: data.fillColor || 'white', display: 'flex', flexDirection: 'row' }}>
      {/* Square image area on left */}
      <div onClick={() => fileRef.current?.click()}
        style={{ width: imgSize, minWidth: imgSize, height: '100%', background: '#DBD0C6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRight: '2px solid #A99482', borderRadius: '3px 0 0 3px' }}>
        <input ref={fileRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = (ev) => setImageSrc(ev.target.result); r.readAsDataURL(f) } }} style={{ display: 'none' }} />
        {imageSrc ? <img src={imageSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#A99482" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
        )}
      </div>
      {/* Title on right */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
        {editing ? (
          <input autoFocus defaultValue={title}
            onBlur={(e) => { setEditing(false); setTitle(e.target.value) }}
            onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
            style={{ fontSize: 23, fontWeight: 700, color: '#747474', textAlign: 'center', background: 'transparent', outline: 'none', width: '100%', border: 'none' }} />
        ) : (
          <div onDoubleClick={() => setEditing(true)}
            style={{ fontSize: 23, fontWeight: 700, color: '#747474', textAlign: 'center', cursor: 'text', width: '100%' }}>
            {title}
          </div>
        )}
      </div>
    </NodeWrapper>
  )
}

export default SmallImageNode
