import { memo, useState, useCallback } from 'react'
import { toPng } from 'html-to-image'
import { getViewportForBounds, useReactFlow } from '@xyflow/react'
import { generateVectorSvg } from '../utils/svgExport'
import { Heading1, Heading2, Heading3, AlignLeft, Hexagon, Image } from 'lucide-react'

const resolutions = [
  { label: 'HD (1920×1080)', w: 1920, h: 1080 },
  { label: 'Square (1080×1080)', w: 1080, h: 1080 },
  { label: 'Vertical (1080×1920)', w: 1080, h: 1920 },
  { label: '4K (3840×2160)', w: 3840, h: 2160 },
  { label: 'Instagram (1080×1350)', w: 1080, h: 1350 },
  { label: 'Twitter/X (1600×900)', w: 1600, h: 900 },
]

export const nodeTypeList = [
  { type: 'largeTitleNode', label: 'Large Title', Icon: Heading1 },
  { type: 'titleNode', label: 'Small Title', Icon: Heading2 },
  { type: 'miniTitleNode', label: 'Mini Title', Icon: Heading3 },
  { type: 'textNode', label: 'Text', Icon: AlignLeft },
  { type: 'logoNode', label: 'Logo', Icon: Hexagon },
  { type: 'imageNode', label: 'Image', Icon: Image },
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
          letterSpacing: '0.06em', fontFamily: 'SwissNow, Inter, sans-serif',
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

function HexColorInput({ value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 28, height: 28, borderRadius: 4, border: '1px solid #E0DCDA', overflow: 'hidden', flexShrink: 0, position: 'relative', background: value }}>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
          style={{ position: 'absolute', inset: -4, width: 'calc(100% + 8px)', height: 'calc(100% + 8px)', cursor: 'pointer', opacity: 0 }} />
      </div>
      <input type="text" value={value} onChange={(e) => { const v = e.target.value; if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) onChange(v) }}
        style={{ width: 72, padding: '4px 6px', fontSize: 11, color: '#655343', border: '1px solid #E0DCDA', borderRadius: 4, fontFamily: 'monospace', textTransform: 'uppercase', outline: 'none' }} />
    </div>
  )
}

const alignIcons = {
  'left': <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1v12M4 3h7v3H4zM4 8h5v3H4z" stroke="#655343" strokeWidth="1.2"/></svg>,
  'center-h': <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M3 3h8v3H3zM4 8h6v3H4z" stroke="#655343" strokeWidth="1.2"/></svg>,
  'right': <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M13 1v12M3 3h7v3H3zM5 8h5v3H5z" stroke="#655343" strokeWidth="1.2"/></svg>,
  'top': <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1h12M3 4v7h3V4zM8 4v5h3V4z" stroke="#655343" strokeWidth="1.2"/></svg>,
  'center-v': <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7h12M3 3v8h3V3zM8 4v6h3V4z" stroke="#655343" strokeWidth="1.2"/></svg>,
  'bottom': <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 13h12M3 3v7h3V3zM8 5v5h3V5z" stroke="#655343" strokeWidth="1.2"/></svg>,
  'distribute-h': <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1v12M13 1v12M5 4h4v6H5z" stroke="#655343" strokeWidth="1.2"/></svg>,
  'distribute-v': <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1h12M1 13h12M4 5h6v4H4z" stroke="#655343" strokeWidth="1.2"/></svg>,
}

function RightPanel({ canvasW, canvasH, onCanvasChange, canvasBg, onCanvasBgChange, selectedNodes, onFillChange, onStrokeChange, onAlign }) {
  const [format, setFormat] = useState('png')
  const [scale, setScale] = useState(1)
  const [exporting, setExporting] = useState(false)
  const rfInstance = useReactFlow()
  const { zoomIn, zoomOut, fitView, getZoom } = rfInstance
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
      if (format === 'svg') {
        // True vector SVG — every element is selectable/editable in Figma
        const svgContent = generateVectorSvg(rfInstance, canvasW, canvasH)
        const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `canvas-${canvasW}x${canvasH}.svg`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        // PNG raster export at specified scale
        const viewport = document.querySelector('.react-flow__viewport')
        if (!viewport) return

        const pixelW = canvasW * scale
        const pixelH = canvasH * scale
        const transform = getViewportForBounds(
          { x: 0, y: 0, width: canvasW, height: canvasH },
          pixelW, pixelH, 0.5, scale * 2
        )

        const frame = viewport.querySelector('.canvas-frame')
        let origBorder, origShadow
        if (frame) {
          origBorder = frame.style.border
          origShadow = frame.style.boxShadow
          frame.style.border = 'none'
          frame.style.boxShadow = 'none'
        }

        const pngDataUrl = await toPng(viewport, {
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
        })

        if (frame) { frame.style.border = origBorder; frame.style.boxShadow = origShadow }

        const a = document.createElement('a')
        a.href = pngDataUrl
        a.download = `canvas-${canvasW}x${canvasH}@${scale}x.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }
    } catch (e) { console.error('Export failed:', e) }
    setExporting(false)
  }

  const btnStyle = (active) => ({
    padding: '4px 0', fontSize: 11, fontWeight: active ? 600 : 400,
    color: active ? 'white' : '#655343',
    background: active ? '#655343' : 'white',
    border: '1px solid #E0DCDA', borderRadius: 4, cursor: 'pointer',
    fontFamily: 'SwissNow, Inter, sans-serif', textTransform: 'uppercase', flex: 1,
  })

  return (
    <div style={{
      width: 220, height: '100%', background: 'white', borderLeft: '1px solid #EDEAE7',
      display: 'flex', flexDirection: 'column', fontFamily: 'SwissNow, Inter, sans-serif',
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
            {nodeTypeList.map((nt) => (
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
                <nt.Icon size={16} color="#655343" strokeWidth={1.8} />
              </div>
            ))}
          </div>
          {/* hint removed */}
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
              cursor: 'pointer', outline: 'none', fontFamily: 'SwissNow, Inter, sans-serif',
            }}
          >
            {resolutions.map(r => (
              <option key={`${r.w}x${r.h}`} value={`${r.w}x${r.h}`}>{r.label}</option>
            ))}
          </select>
          <div style={{ fontSize: 10, color: '#B0AAA5', marginTop: 4 }}>{canvasW} × {canvasH}px</div>
        </Section>

        {/* Background */}
        <Section title="Background">
          <HexColorInput value={canvasBg} onChange={onCanvasBgChange} />
        </Section>

        {/* Appearance — only when node(s) selected */}
        {selectedNodes.length > 0 && (
          <Section title="Appearance">
            <div style={{ fontSize: 11, color: '#999', marginBottom: 6, fontWeight: 500 }}>
              {selectedNodes.length === 1 ? selectedNodes[0].data.label || 'Node' : `${selectedNodes.length} nodes`}
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: '#B0AAA5', marginBottom: 4 }}>Fill</div>
              <HexColorInput
                value={selectedNodes[0].data.fillColor || '#FFFFFF'}
                onChange={(c) => selectedNodes.forEach(n => onFillChange(n.id, c))}
              />
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#B0AAA5', marginBottom: 4 }}>Stroke</div>
              <HexColorInput
                value={selectedNodes[0].data.strokeColor || '#747474'}
                onChange={(c) => selectedNodes.forEach(n => onStrokeChange(n.id, c))}
              />
            </div>
          </Section>
        )}

        {/* Alignment — show when 2+ nodes selected */}
        {selectedNodes.length >= 2 && (
          <Section title="Alignment">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', gap: 2 }}>
                {['left', 'center-h', 'right'].map((a) => (
                  <button key={a} onClick={() => onAlign?.(a)} title={a.replace('-', ' ')}
                    style={{ flex: 1, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', border: '1px solid #E0DCDA', borderRadius: 4, cursor: 'pointer', padding: 0 }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#FAFAF9'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >{alignIcons[a]}</button>
                ))}
                <div style={{ width: 1, background: '#E0DCDA', margin: '0 2px', flexShrink: 0 }} />
                {['top', 'center-v', 'bottom'].map((a) => (
                  <button key={a} onClick={() => onAlign?.(a)} title={a.replace('-', ' ')}
                    style={{ flex: 1, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', border: '1px solid #E0DCDA', borderRadius: 4, cursor: 'pointer', padding: 0 }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#FAFAF9'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >{alignIcons[a]}</button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 2 }}>
                {['distribute-h', 'distribute-v'].map((a) => (
                  <button key={a} onClick={() => onAlign?.(a)} title={a.replace('-', ' ')}
                    style={{ flex: 1, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', border: '1px solid #E0DCDA', borderRadius: 4, cursor: 'pointer', padding: 0 }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#FAFAF9'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >{alignIcons[a]}</button>
                ))}
              </div>
            </div>
          </Section>
        )}

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
              cursor: exporting ? 'wait' : 'pointer', fontFamily: 'SwissNow, Inter, sans-serif',
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
