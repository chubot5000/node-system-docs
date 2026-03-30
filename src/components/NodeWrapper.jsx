import { useContext, useState, useCallback } from 'react'
import { flushSync } from 'react-dom'
import { Handle, Position, useUpdateNodeInternals, useStoreApi } from '@xyflow/react'
import { XYHandle } from '@xyflow/system'
import { ConnectorContext } from '../App'
import { allSides, getHandleStyle, getHandleCls, countOnSide, nextHandleId } from '../utils/handleUtils'

const posMap = { top: Position.Top, bottom: Position.Bottom, left: Position.Left, right: Position.Right }

export default function NodeWrapper({ id, data, maxPerSide = 3, style, onClick, children }) {
  const [hovered, setHovered] = useState(false)
  const [hoveredSide, setHoveredSide] = useState(null)
  const ctx = useContext(ConnectorContext)
  const updateNodeInternals = useUpdateNodeInternals()
  const store = useStoreApi()

  const handles = data.activeHandles || ['bottom-0']
  const hTypes = data.handleTypes || {}

  // Compute which sides are bridged (blocked from new connectors)
  const bridgedSides = new Set()
  if (ctx.bridges) {
    for (const b of ctx.bridges) {
      if (b.nodeA === id) bridgedSides.add(b.side)
      if (b.nodeB === id) {
        const opposite = { right: 'left', left: 'right', bottom: 'top', top: 'bottom' }
        bridgedSides.add(opposite[b.side])
      }
    }
  }

  const addHandle = (side) => {
    if (bridgedSides.has(side)) return  // blocked
    const newId = nextHandleId(side, handles)
    if (newId) {
      ctx.onAddHandle?.(id, newId)
      setTimeout(() => updateNodeInternals(id), 10)
    }
  }

  /*
   * Ghost zone pointerdown → one-motion drag-to-connect.
   * Uses flushSync to render the handle synchronously, then calls
   * XYHandle.onPointerDown (React Flow's internal API) immediately
   * while the pointer is still in the "down" state.
   */
  const onGhostPointerDown = useCallback((e, side) => {
    if (e.button !== 0) return
    if (bridgedSides.has(side)) return
    e.stopPropagation()
    e.preventDefault()

    const newId = nextHandleId(side, handles)
    if (!newId) return

    const nativeEvent = e.nativeEvent

    // Synchronously render the new handle so it exists in DOM immediately
    flushSync(() => {
      ctx.onAddHandle?.(id, newId)
    })

    // Update React Flow's internal handle position store synchronously
    updateNodeInternals(id)

    // Find the newly rendered handle DOM element
    const nodeEl = document.querySelector(`.react-flow__node[data-id="${id}"]`)
    if (!nodeEl) return
    const handleEl = nodeEl.querySelector(`.react-flow__handle[data-handleid="${newId}"]`)
    if (!handleEl) return

    // Call React Flow's internal connection-start API directly —
    // same call that <Handle>'s onMouseDown makes
    const s = store.getState()
    XYHandle.onPointerDown(nativeEvent, {
      handleDomNode: handleEl,
      autoPanOnConnect: s.autoPanOnConnect,
      connectionMode: s.connectionMode,
      connectionRadius: s.connectionRadius,
      domNode: s.domNode,
      nodeLookup: s.nodeLookup,
      lib: s.lib,
      isTarget: false,
      handleId: newId,
      nodeId: id,
      flowId: s.rfId,
      panBy: s.panBy,
      cancelConnection: s.cancelConnection,
      onConnectStart: s.onConnectStart,
      onConnectEnd: (...args) => store.getState().onConnectEnd?.(...args),
      updateConnection: s.updateConnection,
      onConnect: (...args) => store.getState().onConnect?.(...args),
      isValidConnection: (...args) => store.getState().isValidConnection?.(...args) ?? true,
      getTransform: () => store.getState().transform,
      getFromHandle: () => store.getState().connection.fromHandle,
      autoPanSpeed: s.autoPanSpeed,
      dragThreshold: s.connectionDragThreshold,
    })
  }, [id, handles, ctx, updateNodeInternals, store])

  return (
    <div
      style={{ position: 'relative', ...style }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setHoveredSide(null) }}
    >
      {handles.map((hId) => {
        const side = hId.split('-')[0]
        const posStyle = getHandleStyle(hId, handles)
        return [
          <Handle key={`${hId}-src`} type="source" position={posMap[side]} id={hId}
            className={getHandleCls(hTypes[hId])}
            style={posStyle}
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); ctx.onHandleContextMenu?.(e, id, hId, hTypes[hId] || 'plain') }}
          />,
          <Handle key={`${hId}-tgt`} type="target" position={posMap[side]} id={`${hId}-tgt`}
            className="handle-overlay"
            style={{ ...posStyle, opacity: 0 }}
          />
        ]
      })}

      {hovered && allSides.map((side) => {
        if (bridgedSides.has(side)) return null  // no connectors on bridged sides
        const count = countOnSide(side, handles)
        if (count >= maxPerSide) return null
        const isH = side === 'top' || side === 'bottom'
        const pct = ((count + 1) / (count + 2)) * 100
        const zones = {
          top: { top: -15, left: 0, right: 0, height: 30 },
          bottom: { bottom: -15, left: 0, right: 0, height: 30 },
          left: { left: -15, top: 0, bottom: 0, width: 30 },
          right: { right: -15, top: 0, bottom: 0, width: 30 },
        }
        const ghostPos = isH
          ? { left: `${pct}%`, marginLeft: -15, top: 0 }
          : { top: `${pct}%`, marginTop: -15, left: 0 }

        return (
          <div key={side} style={{ position: 'absolute', ...zones[side], zIndex: 1, cursor: 'crosshair' }}
            onMouseEnter={() => setHoveredSide(side)} onMouseLeave={() => setHoveredSide(null)}
            onPointerDown={(e) => onGhostPointerDown(e, side)}>
            {hoveredSide === side && (
              <div style={{ position: 'absolute', ...ghostPos, width: 30, height: 30, background: 'white', border: '2px solid #747474', borderRadius: 1.4, opacity: 0.45, pointerEvents: 'none' }} />
            )}
          </div>
        )
      })}

      {children}
    </div>
  )
}
