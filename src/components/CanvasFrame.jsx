import { memo } from 'react'

function CanvasFrame({ data }) {
  return (
    <div
      className="canvas-frame"
      style={{
        width: data.width,
        height: data.height,
        background: 'white',
        border: '2px dashed #D5D0CC',
        borderRadius: 0,
        boxShadow: '0 4px 60px rgba(0,0,0,0.06)',
        pointerEvents: 'none',
      }}
    />
  )
}

export default memo(CanvasFrame)
