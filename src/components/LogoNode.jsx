import { useRef, useCallback } from 'react'
import { useReactFlow } from '@xyflow/react'
import NodeWrapper from './NodeWrapper'

const defaultLogo = (
  <svg width="70" height="70" viewBox="0 0 250 250" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0.24339" y="0.24339" width="249.513" height="249.513" rx="5.59798" fill="#655343"/>
    <rect x="0.24339" y="0.24339" width="249.513" height="249.513" rx="5.59798" stroke="#655343" strokeWidth="0.486781"/>
    <path d="M126.365 58.1094L200.437 102.011L180.626 129.745L124.758 96.6309L68.8887 129.745L49.0781 102.011L124.758 57.1572L126.365 58.1094Z" fill="white" stroke="#1D1A19"/>
    <path d="M129.001 108.437L175.968 136.271L156.159 164.005L124.761 145.397L93.3623 164.005L73.5537 136.271L124.761 105.92L129.001 108.437Z" fill="white" stroke="#1D1A19"/>
    <path d="M124.859 154.743V154.744L131.634 158.761L138.41 162.775L145.188 166.792L151.495 170.531L147.733 175.8L143.654 181.508L139.575 187.218V187.219L135.766 192.555L129.384 188.772L125.015 186.184L124.76 186.033L124.505 186.184L120.137 188.772H120.136L113.754 192.555L109.945 187.219V187.218L105.866 181.508H105.865L101.787 175.8L98.0234 170.531L104.333 166.792L111.109 162.775L117.887 158.761L124.66 154.744L124.659 154.743L124.76 154.685L124.859 154.743Z" fill="white" stroke="#1D1A19"/>
    <path d="M125.588 57.3047V97.5724" stroke="#1D1A19"/>
    <path d="M125.588 106.383V146.751" stroke="#1D1A19"/>
    <path d="M125.588 155.406V187.721" stroke="#1D1A19"/>
  </svg>
)

function LogoNode({ data, id }) {
  const { setNodes } = useReactFlow()
  const fileRef = useRef()
  const onUpload = useCallback((e) => {
    const f = e.target.files?.[0]
    if (f) { const r = new FileReader(); r.onload = (ev) => setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, imageSrc: ev.target.result } } : n)); r.readAsDataURL(f) }
  }, [id, setNodes])

  return (
    <NodeWrapper id={id} data={data} maxPerSide={3}
      onClick={() => fileRef.current?.click()}
      style={{ width: 130, height: 130, background: data.fillColor || '#655343', borderRadius: 3, border: `1px solid ${data.strokeColor || '#655343'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
      <input ref={fileRef} type="file" accept="image/*" onChange={onUpload} style={{ display: 'none' }} />
      {data.imageSrc ? <img src={data.imageSrc} alt="" style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }} /> : defaultLogo}
    </NodeWrapper>
  )
}

export default LogoNode
