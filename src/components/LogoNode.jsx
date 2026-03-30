import { useCallback, useContext, useRef, useState } from 'react'
import { Handle, Position, useUpdateNodeInternals } from '@xyflow/react'
import { ConnectorContext } from '../App'

const allSides = ['top', 'bottom', 'left', 'right']
const posMap = { top: Position.Top, bottom: Position.Bottom, left: Position.Left, right: Position.Right }
function getHandleCls(t) { return t === 'black' ? 'handle-black' : t === 'additive' ? 'handle-additive' : t?.startsWith('arrow') ? `handle-${t}` : undefined }

const defaultLogo = (
  <svg width="120" height="120" viewBox="0 0 250 250" fill="none">
    <path d="M126.365 58.1094L200.437 102.011L180.626 129.745L124.758 96.6309L68.8887 129.745L49.0781 102.011L124.758 57.1572L126.365 58.1094Z" fill="white" stroke="rgba(255,255,255,0.3)"/>
    <path d="M129.001 108.437L175.968 136.271L156.159 164.005L124.761 145.397L93.3623 164.005L73.5537 136.271L124.761 105.92L129.001 108.437Z" fill="white" stroke="rgba(255,255,255,0.3)"/>
    <path d="M124.859 154.743L151.495 170.531L135.766 192.555L124.76 186.033L113.754 192.555L98.0234 170.531L124.76 154.685L124.859 154.743Z" fill="white" stroke="rgba(255,255,255,0.3)"/>
  </svg>
)

function LogoNode({ data, id }) {
  const [logoSrc, setLogoSrc] = useState(null)
  const [hovered, setHovered] = useState(false)
  const [hoveredSide, setHoveredSide] = useState(null)
  const fileRef = useRef()
  const ctx = useContext(ConnectorContext)
  const updateNodeInternals = useUpdateNodeInternals()

  const handles = data.activeHandles || ['bottom']
  const hTypes = data.handleTypes || {}

  return (
    <div
      onClick={() => fileRef.current?.click()}
      style={{ width: 250, height: 250, background: data.fillColor || '#655343', borderRadius: 5.6, border: `2px solid ${data.strokeColor || '#655343'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setHoveredSide(null) }}
    >
      {handles.map((side) => (
        <Handle key={side} type="source" position={posMap[side]} id={side}
          className={getHandleCls(hTypes[side])}
          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); ctx.onHandleContextMenu?.(e, id, side, hTypes[side] || 'plain') }}
        />
      ))}

      {hovered && allSides.filter((s) => !handles.includes(s)).map((side) => {
        const zones = { top: { top: -15, left: '20%', right: '20%', height: 30 }, bottom: { bottom: -15, left: '20%', right: '20%', height: 30 }, left: { left: -15, top: '20%', bottom: '20%', width: 30 }, right: { right: -15, top: '20%', bottom: '20%', width: 30 } }
        const ghosts = { top: { top: -15, left: '50%', marginLeft: -15 }, bottom: { bottom: -15, left: '50%', marginLeft: -15 }, left: { left: -15, top: '50%', marginTop: -15 }, right: { right: -15, top: '50%', marginTop: -15 } }
        return (
          <div key={side} style={{ position: 'absolute', ...zones[side], zIndex: 5, cursor: 'pointer' }}
            onMouseEnter={() => setHoveredSide(side)} onMouseLeave={() => setHoveredSide(null)}
            onClick={(e) => { e.stopPropagation(); ctx.onAddHandle?.(id, side); setTimeout(() => updateNodeInternals(id), 10) }}>
            {hoveredSide === side && <div style={{ position: 'absolute', ...ghosts[side], width: 30, height: 30, background: 'white', border: '2px solid #747474', borderRadius: 1.4, opacity: 0.45, pointerEvents: 'none' }} />}
          </div>
        )
      })}

      <input ref={fileRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = (ev) => setLogoSrc(ev.target.result); r.readAsDataURL(f) } }} style={{ display: 'none' }} />
      {logoSrc ? <img src={logoSrc} alt="" style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }} /> : defaultLogo}
    </div>
  )
}

export default LogoNode
