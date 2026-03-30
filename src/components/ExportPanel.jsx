import { memo, useState } from 'react'
import { toPng, toSvg } from 'html-to-image'
import { getViewportForBounds } from '@xyflow/react'

const resolutions = [
  { label: 'HD (1920×1080)', w: 1920, h: 1080 },
  { label: 'Square (1080×1080)', w: 1080, h: 1080 },
  { label: 'Vertical (1080×1920)', w: 1080, h: 1920 },
  { label: '4K (3840×2160)', w: 3840, h: 2160 },
  { label: 'Instagram (1080×1350)', w: 1080, h: 1350 },
  { label: 'Twitter/X (1600×900)', w: 1600, h: 900 },
]

const scales = [1, 2, 4]

function ExportPanel({ canvasW, canvasH, onCanvasChange }) {
  const [format, setFormat] = useState('png')
  const [scale, setScale] = useState(1)
  const [exporting, setExporting] = useState(false)

  const currentRes = resolutions.find(r => r.w === canvasW && r.h === canvasH)

  const doExport = async () => {
    setExporting(true)
    try {
      const viewport = document.querySelector('.react-flow__viewport')
      if (!viewport) return

      const bounds = { x: 0, y: 0, width: canvasW, height: canvasH }
      const pixelW = canvasW * scale
      const pixelH = canvasH * scale

      const transform = getViewportForBounds(bounds, pixelW, pixelH, 0.5, scale * 2)

      // Hide canvas frame border during export
      const frame = viewport.querySelector('.canvas-frame')
      let origBorder
      if (frame) {
        origBorder = frame.style.border
        frame.style.border = 'none'
        frame.style.boxShadow = 'none'
      }

      const options = {
        width: pixelW,
        height: pixelH,
        style: {
          width: `${pixelW}px`,
          height: `${pixelH}px`,
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
        },
        backgroundColor: 'white',
        // Filter out background dots and controls from export
        filter: (node) => {
          if (node?.classList?.contains('react-flow__background')) return false
          if (node?.classList?.contains('react-flow__controls')) return false
          if (node?.classList?.contains('react-flow__minimap')) return false
          return true
        },
      }

      const fn = format === 'svg' ? toSvg : toPng
      const dataUrl = await fn(viewport, options)

      // Restore frame border
      if (frame && origBorder !== undefined) {
        frame.style.border = origBorder
        frame.style.boxShadow = '0 4px 60px rgba(0,0,0,0.06)'
      }

      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `canvas-${canvasW}x${canvasH}@${scale}x.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (e) {
      console.error('Export failed:', e)
    }
    setExporting(false)
  }

  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 50,
      background: 'white', borderRadius: 12, border: '1px solid #E0DCDA',
      boxShadow: '0 4px 24px rgba(0,0,0,0.1)', padding: '16px 20px',
      fontFamily: 'SwissNow, Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 12,
      minWidth: 240,
    }}>
      {/* Resolution */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
          Canvas Size
        </div>
        <select
          value={`${canvasW}x${canvasH}`}
          onChange={(e) => {
            const [w, h] = e.target.value.split('x').map(Number)
            onCanvasChange(w, h)
          }}
          style={{
            width: '100%', padding: '6px 10px', fontSize: 13, color: '#655343',
            border: '1px solid #E0DCDA', borderRadius: 6, background: 'white',
            cursor: 'pointer', outline: 'none',
          }}
        >
          {resolutions.map(r => (
            <option key={`${r.w}x${r.h}`} value={`${r.w}x${r.h}`}>{r.label}</option>
          ))}
        </select>
      </div>

      {/* Format */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
          Format
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['png', 'svg'].map(f => (
            <button key={f} onClick={() => setFormat(f)}
              style={{
                flex: 1, padding: '5px 0', fontSize: 12, fontWeight: format === f ? 600 : 400,
                color: format === f ? 'white' : '#655343',
                background: format === f ? '#655343' : 'white',
                border: '1px solid #E0DCDA', borderRadius: 4, cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >{f}</button>
          ))}
        </div>
      </div>

      {/* Scale */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
          Scale
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {scales.map(s => (
            <button key={s} onClick={() => setScale(s)}
              style={{
                flex: 1, padding: '5px 0', fontSize: 12, fontWeight: scale === s ? 600 : 400,
                color: scale === s ? 'white' : '#655343',
                background: scale === s ? '#655343' : 'white',
                border: '1px solid #E0DCDA', borderRadius: 4, cursor: 'pointer',
              }}
            >{s}x</button>
          ))}
        </div>
        <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>
          {canvasW * scale} × {canvasH * scale}px
        </div>
      </div>

      {/* Export button */}
      <button
        onClick={doExport}
        disabled={exporting}
        style={{
          padding: '10px 0', fontSize: 13, fontWeight: 600, color: 'white',
          background: exporting ? '#999' : '#655343', border: 'none', borderRadius: 6,
          cursor: exporting ? 'wait' : 'pointer', letterSpacing: '0.03em',
        }}
      >
        {exporting ? 'Exporting...' : `Export ${format.toUpperCase()}`}
      </button>
    </div>
  )
}

export default memo(ExportPanel)
