import { memo, useState, useCallback } from 'react'
import { toPng, toSvg } from 'html-to-image'
import { getViewportForBounds, useReactFlow } from '@xyflow/react'

const resolutions = [
  { label: 'HD (1920×1080)', w: 1920, h: 1080 },
  { label: 'Square (1080×1080)', w: 1080, h: 1080 },
  { label: 'Vertical (1080×1920)', w: 1080, h: 1920 },
  { label: '4K (3840×2160)', w: 3840, h: 2160 },
  { label: 'Instagram (1080×1350)', w: 1080, h: 1350 },
  { label: 'Twitter/X (1600×900)', w: 1600, h: 900 },
]

const nodeTypes = [
  { type: 'largeTitleNode', label: 'Large Title', icon: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="1" y="1" width="18" height="18" rx="1" stroke="#747474" strokeWidth="1.5"/>
      <text x="10" y="14" textAnchor="middle" fill="#655343" fontSize="11" fontWeight="700" fontFamily="Inter">T</text>
    </svg>
  )},
  { type: 'titleNode', label: 'Small Title', icon: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="1" y="5" width="18" height="10" rx="1" stroke="#747474" strokeWidth="1.5"/>
      <text x="10" y="14" textAnchor="middle" fill="#655343" fontSize="9" fontWeight="700" fontFamily="Inter">T</text>
    </svg>
  )},
  { type: 'textNode', label: 'Text', icon: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="1" y="1" width="18" height="18" rx="1" stroke="#747474" strokeWidth="1.5"/>
      <line x1="5" y1="6" x2="15" y2="6" stroke="#747474" strokeWidth="1.2"/>
      <line x1="5" y1="9.5" x2="15" y2="9.5" stroke="#747474" strokeWidth="1.2"/>
      <line x1="5" y1="13" x2="12" y2="13" stroke="#747474" strokeWidth="1.2"/>
    </svg>
  )},
  { type: 'logoNode', label: 'Logo', icon: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="1" y="1" width="18" height="18" rx="1" fill="#655343" stroke="#655343" strokeWidth="1.5"/>
      <path d="M10 5L14 9L12.5 11L10 8.5L7.5 11L6 9L10 5Z" fill="white"/>
      <path d="M10 9L12 11.5L11 13L10 12L9 13L8 11.5L10 9Z" fill="white"/>
    </svg>
  )},
  { type: 'imageNode', label: 'Image', icon: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="1" y="1" width="18" height="18" rx="1" stroke="#747474" strokeWidth="1.5"/>
      <circle cx="7" cy="7" r="1.5" fill="#747474"/>
      <path d="M2 15l5-5 4 4 2-2 5 5H2z" fill="#E6D9CE" stroke="#747474" strokeWidth="0.8"/>
    </svg>
  )},
]

const scales = [1, 2, 4]

function Section({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ borderBottom: '1px solid #EDEAE7' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 11, fontWeight: 600, color: '#999', textTransform: 'uppercase',
          letterSpacing: '0.06em', fontFamily: 'Inter, sans-serif',
        }}
      >
        {title}
        <svg width="10" height="10" viewBox="0 0 10 10" style={{ transform: open ? 'rotate(0)' : 'rotate(-90deg)', transition: 'transform 0.15s' }}>
          <path d="M2 3.5L5 6.5L8 3.5" stroke="#999" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
        </svg>
      </button>
      {open && <div style={{ padding: '0 16px 12px' }}>{children}</div>}
    </div>
  )
}

function RightPanel({ canvasW, canvasH, onCanvasChange }) {
  const [format, setFormat] = useState('png')
  const [scale, setScale] = useState(1)
  const [exporting, setExporting] = useState(false)
  const { zoomIn, zoomOut, fitView, getZoom } = useReactFlow()
  const [zoom, setZoom] = useState(100)

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  const handleZoomIn = () => { zoomIn(); setTimeout(() => setZoom(Math.round(getZoom() * 100)), 50) }
  const handleZoomOut = () => { zoomOut(); setTimeout(() => setZoom(Math.round(getZoom() * 100)), 50) }
  const handleFitView = () => { fitView({ padding: 0.08 }); setTimeout(() => setZoom(Math.round(getZoom() * 100)), 50) }

  const doExport = async () => {
    setExporting(true)
    try {
      const viewport = document.querySelector('.react-flow__viewport')
      if (!viewport) return

      const bounds = { x: 0, y: 0, width: canvasW, height: canvasH }
      const pixelW = canvasW * scale
      const pixelH = canvasH * scale
      const transform = getViewportForBounds(bounds, pixelW, pixelH, 0.5, scale * 2)

      const frame = viewport.querySelector('.canvas-frame')
      let origBorder, origShadow
      if (frame) {
        origBorder = frame.style.border
        origShadow = frame.style.boxShadow
        frame.style.border = 'none'
        frame.style.boxShadow = 'none'
      }

      const options = {
        width: pixelW, height: pixelH,
        style: {
          width: `${pixelW}px`, height: `${pixelH}px`,
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
        },
        backgroundColor: 'white',
        filter: (node) => {
          if (node?.classList?.contains('react-flow__background')) return false
          if (node?.classList?.contains('react-flow__controls')) return false
          return true
        },
      }

      const fn = format === 'svg' ? toSvg : toPng
      const dataUrl = await fn(viewport, options)

      if (frame) { frame.style.border = origBorder; frame.style.boxShadow = origShadow }

      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `canvas-${canvasW}x${canvasH}@${scale}x.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (e) { console.error('Export failed:', e) }
    setExporting(false)
  }

  const btnStyle = (active) => ({
    padding: '4px 0', fontSize: 11, fontWeight: active ? 600 : 400,
    color: active ? 'white' : '#655343',
    background: active ? '#655343' : 'white',
    border: '1px solid #E0DCDA', borderRadius: 4, cursor: 'pointer',
    fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', flex: 1,
  })

  return (
    <div style={{
      width: 220, height: '100%', background: 'white', borderLeft: '1px solid #EDEAE7',
      display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif',
      flexShrink: 0, overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #EDEAE7' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#655343' }}>Node System</div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Nodes */}
        <Section title="Nodes">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
            {nodeTypes.map((nt) => (
              <div
                key={nt.type}
                draggable
                onDragStart={(e) => onDragStart(e, nt.type)}
                title={nt.label}
                style={{
                  width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 6, border: '1px solid transparent', cursor: 'grab',
                  transition: 'border-color 0.1s, background 0.1s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#E0DCDA'; e.currentTarget.style.background = '#FAFAF9' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'transparent' }}
              >
                {nt.icon}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 10, color: '#B0AAA5', marginTop: 6 }}>Drag to canvas · Right-click canvas to add</div>
        </Section>

        {/* Canvas */}
        <Section title="Canvas">
          <select
            value={`${canvasW}x${canvasH}`}
            onChange={(e) => {
              const [w, h] = e.target.value.split('x').map(Number)
              onCanvasChange(w, h)
            }}
            style={{
              width: '100%', padding: '5px 8px', fontSize: 12, color: '#655343',
              border: '1px solid #E0DCDA', borderRadius: 5, background: 'white',
              cursor: 'pointer', outline: 'none', fontFamily: 'Inter, sans-serif',
            }}
          >
            {resolutions.map(r => (
              <option key={`${r.w}x${r.h}`} value={`${r.w}x${r.h}`}>{r.label}</option>
            ))}
          </select>
          <div style={{ fontSize: 10, color: '#B0AAA5', marginTop: 4 }}>{canvasW} × {canvasH}px</div>
        </Section>

        {/* Export */}
        <Section title="Export">
          <div style={{ display: 'flex', gap: 3, marginBottom: 8 }}>
            {['png', 'svg'].map(f => (
              <button key={f} onClick={() => setFormat(f)} style={btnStyle(format === f)}>{f}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 3, marginBottom: 6 }}>
            {scales.map(s => (
              <button key={s} onClick={() => setScale(s)} style={btnStyle(scale === s)}>{s}x</button>
            ))}
          </div>
          <div style={{ fontSize: 10, color: '#B0AAA5', marginBottom: 8 }}>{canvasW * scale} × {canvasH * scale}px</div>
          <button
            onClick={doExport}
            disabled={exporting}
            style={{
              width: '100%', padding: '7px 0', fontSize: 12, fontWeight: 600, color: 'white',
              background: exporting ? '#999' : '#655343', border: 'none', borderRadius: 5,
              cursor: exporting ? 'wait' : 'pointer', fontFamily: 'Inter, sans-serif',
            }}
          >
            {exporting ? 'Exporting…' : `Export ${format.toUpperCase()}`}
          </button>
        </Section>
      </div>

      {/* Zoom bar — bottom */}
      <div style={{
        padding: '10px 16px', borderTop: '1px solid #EDEAE7',
        display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center',
      }}>
        <button onClick={handleZoomOut} style={zoomBtn} title="Zoom out">
          <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6h8" stroke="#655343" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
        <span style={{ fontSize: 11, color: '#655343', fontWeight: 500, minWidth: 36, textAlign: 'center' }}>
          {zoom}%
        </span>
        <button onClick={handleZoomIn} style={zoomBtn} title="Zoom in">
          <svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 2v8M2 6h8" stroke="#655343" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
        <div style={{ width: 1, height: 16, background: '#EDEAE7', margin: '0 2px' }} />
        <button onClick={handleFitView} style={zoomBtn} title="Fit view">
          <svg width="12" height="12" viewBox="0 0 12 12"><rect x="1" y="1" width="10" height="10" rx="1.5" stroke="#655343" strokeWidth="1.3" fill="none"/><path d="M4 4h4v4H4z" fill="#655343" opacity="0.3"/></svg>
        </button>
      </div>
    </div>
  )
}

const zoomBtn = {
  width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'white', border: '1px solid #E0DCDA', borderRadius: 5, cursor: 'pointer',
  padding: 0,
}

export default memo(RightPanel)
