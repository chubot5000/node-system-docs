import { useRef, useState } from 'react'
import NodeWrapper from './NodeWrapper'

const defaultLogo = (
  <svg width="120" height="120" viewBox="0 0 250 250" fill="none">
    <path d="M126.365 58.1094L200.437 102.011L180.626 129.745L124.758 96.6309L68.8887 129.745L49.0781 102.011L124.758 57.1572L126.365 58.1094Z" fill="white" stroke="rgba(255,255,255,0.3)"/>
    <path d="M129.001 108.437L175.968 136.271L156.159 164.005L124.761 145.397L93.3623 164.005L73.5537 136.271L124.761 105.92L129.001 108.437Z" fill="white" stroke="rgba(255,255,255,0.3)"/>
    <path d="M124.859 154.743L151.495 170.531L135.766 192.555L124.76 186.033L113.754 192.555L98.0234 170.531L124.76 154.685L124.859 154.743Z" fill="white" stroke="rgba(255,255,255,0.3)"/>
  </svg>
)

function LogoNode({ data, id }) {
  const [logoSrc, setLogoSrc] = useState(null)
  const fileRef = useRef()

  return (
    <NodeWrapper id={id} data={data} maxPerSide={3}
      onClick={() => fileRef.current?.click()}
      style={{ width: 250, height: 250, background: data.fillColor || '#655343', borderRadius: 4.35, border: `2px solid ${data.strokeColor || '#655343'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
      <input ref={fileRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = (ev) => setLogoSrc(ev.target.result); r.readAsDataURL(f) } }} style={{ display: 'none' }} />
      {logoSrc ? <img src={logoSrc} alt="" style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }} /> : defaultLogo}
    </NodeWrapper>
  )
}

export default LogoNode
