import { createContext, useCallback, useEffect, useRef, useState } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  useUpdateNodeInternals,
  Background,
  BackgroundVariant,
  ConnectionMode,
  SelectionMode,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import RightPanel from './components/RightPanel'
import CanvasFrame from './components/CanvasFrame'
import MiniTitleNode from './components/MiniTitleNode'
import LargeTitleNode from './components/LargeTitleNode'
import TitleNode from './components/TitleNode'
import TextNode from './components/TextNode'
import LogoNode from './components/LogoNode'
import ImageNode from './components/ImageNode'
import EdgeLabelModal from './components/EdgeLabelModal'
import ContextMenu from './components/ContextMenu'
import HandleContextMenu from './components/HandleContextMenu'
import PaneContextMenu from './components/PaneContextMenu'
import { nextHandleId, countOnSide } from './utils/handleUtils'

export const ConnectorContext = createContext('plain')

function BridgeNode({ data }) {
  return (
    <div className="bridge-connector-visual"
      onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation()
        window.dispatchEvent(new CustomEvent('bridge-context-menu', {
          detail: { x: e.clientX, y: e.clientY, bridgeId: data.bridgeId }
        }))
      }}
      style={{
        width: 30, height: 30, background: 'white',
        border: '2px solid #747474', borderRadius: 1.4,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, fontWeight: 700, color: '#747474',
        fontFamily: 'Inter, sans-serif',
        pointerEvents: 'all', cursor: 'pointer',
    }}>+</div>
  )
}

const nodeTypes = {
  bridgeNode: BridgeNode,
  canvasFrame: CanvasFrame,
  miniTitleNode: MiniTitleNode,
  largeTitleNode: LargeTitleNode,
  titleNode: TitleNode,
  textNode: TextNode,
  logoNode: LogoNode,
  imageNode: ImageNode,
}

const CANVAS_ID = '__canvas__'
const isSpecialNode = (n) => n.id === CANVAS_ID || n.id?.startsWith('bridge-')
const DEFAULT_W = 1920
const DEFAULT_H = 1080

const makeCanvasNode = (w, h) => ({
  id: CANVAS_ID,
  type: 'canvasFrame',
  position: { x: 0, y: 0 },
  data: { width: w, height: h },
  draggable: false,
  selectable: false,
  focusable: false,
  deletable: false,
  connectable: false,
  zIndex: -1,
})

const defaultEdgeOptions = {
  type: 'default',
  style: { stroke: '#747474', strokeWidth: 2 },
  animated: false,
  labelBgPadding: [16, 10],
  labelBgBorderRadius: 6,
}

const initialNodes = [
  makeCanvasNode(DEFAULT_W, DEFAULT_H),
  { id: '1', type: 'titleNode', position: { x: 835, y: 500 }, data: { label: 'New Title', activeHandles: ['bottom-0'], handleTypes: {} } },
]

const initialEdges = []

let id = 2
const getId = () => `${id++}`

function Flow() {
  const reactFlowWrapper = useRef(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [reactFlowInstance, setReactFlowInstance] = useState(null)
  const [selectedEdge, setSelectedEdge] = useState(null)
  const [edgeModalPos, setEdgeModalPos] = useState({ x: 0, y: 0 })
  const [activeConnectorType, setActiveConnectorType] = useState('plain')
  const [contextMenu, setContextMenu] = useState(null)
  const [handleMenu, setHandleMenu] = useState(null)
  const [paneMenu, setPaneMenu] = useState(null)
  const [bridgeMenu, setBridgeMenu] = useState(null)

  /* ── Undo / Redo (manual snapshots, no effects) ── */
  const historyRef = useRef([])
  const historyIdxRef = useRef(-1)

  const takeSnapshot = useCallback(() => {
    const snap = {
      nodes: JSON.parse(JSON.stringify(nodes.filter(n => !n.id.startsWith('bridge-')))),
      edges: JSON.parse(JSON.stringify(edges)),
    }
    historyRef.current = historyRef.current.slice(0, historyIdxRef.current + 1)
    historyRef.current.push(snap)
    if (historyRef.current.length > 50) historyRef.current.shift()
    historyIdxRef.current = historyRef.current.length - 1
  }, [nodes, edges])

  // Push initial snapshot
  useEffect(() => { if (historyRef.current.length === 0) takeSnapshot() }, [])
  const [canvasW, setCanvasW] = useState(DEFAULT_W)
  const [canvasH, setCanvasH] = useState(DEFAULT_H)
  const [canvasBg, setCanvasBg] = useState('#FFFFFF')
  const selectedNodes = nodes.filter(n => n.selected && !isSpecialNode(n))

  // Sync canvas bg color to canvas frame node
  useEffect(() => {
    setNodes((nds) => nds.map((n) => n.id === CANVAS_ID ? { ...n, data: { ...n.data, bg: canvasBg } } : n))
  }, [canvasBg, setNodes])

  // Listen for bridge right-click from BridgeNode component
  useEffect(() => {
    const handler = (e) => setBridgeMenu({ x: e.detail.x, y: e.detail.y, bridgeId: e.detail.bridgeId })
    window.addEventListener('bridge-context-menu', handler)
    return () => window.removeEventListener('bridge-context-menu', handler)
  }, [])

  const updateNodeInternals = useUpdateNodeInternals()
  const connectingFrom = useRef(null)

  const onConnectStart = useCallback((event, params) => {
    connectingFrom.current = params
  }, [])

  const onConnect = useCallback((params) => {
    connectingFrom.current = null
    setEdges((eds) => addEdge({ ...params, style: { stroke: '#747474', strokeWidth: 2 }, labelBgPadding: [16, 10] }, eds))
  }, [setEdges])

  const onConnectEnd = useCallback((event) => {
    if (!connectingFrom.current || !reactFlowInstance) return
    const from = connectingFrom.current
    connectingFrom.current = null

    const targetEl = document.elementFromPoint(event.clientX, event.clientY)
    const nodeEl = targetEl?.closest('.react-flow__node')
    if (!nodeEl) return
    const targetNodeId = nodeEl.getAttribute('data-id')
    if (!targetNodeId || targetNodeId === from.nodeId) return

    // Use React Flow's internal node data for accurate position and dimensions
    const targetNode = reactFlowInstance.getNode(targetNodeId)
    if (!targetNode) return

    const maxPerSide = targetNode.type === 'titleNode' ? 1 : 3

    const flowPos = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY })

    // measured gives actual rendered size; positionAbsolute accounts for any parent offsets
    const nodeW = targetNode.measured?.width ?? nodeEl.offsetWidth
    const nodeH = targetNode.measured?.height ?? nodeEl.offsetHeight
    const nodeX = targetNode.positionAbsolute?.x ?? targetNode.position.x
    const nodeY = targetNode.positionAbsolute?.y ?? targetNode.position.y

    const cx = nodeX + nodeW / 2
    const cy = nodeY + nodeH / 2
    const dx = flowPos.x - cx
    const dy = flowPos.y - cy

    // Normalize by half-dimensions so side detection works for non-square nodes
    let side
    const ratioX = Math.abs(dx) / (nodeW / 2)
    const ratioY = Math.abs(dy) / (nodeH / 2)
    if (ratioX > ratioY) {
      side = dx > 0 ? 'right' : 'left'
    } else {
      side = dy > 0 ? 'bottom' : 'top'
    }

    const activeHandles = targetNode.data.activeHandles || []
    const sideCount = countOnSide(side, activeHandles)

    if (sideCount >= maxPerSide) return // side full

    const newHandleId = nextHandleId(side, activeHandles)
    if (!newHandleId) return

    setNodes((nds) => nds.map((n) => {
      if (n.id !== targetNodeId) return n
      const ah = [...(n.data.activeHandles || []), newHandleId]
      const ht = { ...(n.data.handleTypes || {}), [newHandleId]: activeConnectorType || 'plain' }
      return { ...n, data: { ...n.data, activeHandles: ah, handleTypes: ht } }
    }))

    // Wait for React to render the new handle, then register it, then create the edge
    requestAnimationFrame(() => {
      updateNodeInternals(targetNodeId)
      // Wait another frame for React Flow to register the new handle positions
      requestAnimationFrame(() => {
        setEdges((eds) => addEdge({
          source: from.nodeId,
          sourceHandle: from.handleId,
          target: targetNodeId,
          targetHandle: `${newHandleId}-tgt`,
          style: { stroke: '#747474', strokeWidth: 2 },
          labelBgPadding: [16, 10],
        }, eds))
      })
    })
  }, [reactFlowInstance, setNodes, setEdges, activeConnectorType, updateNodeInternals])

  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback((event) => {
    event.preventDefault()
    const type = event.dataTransfer.getData('application/reactflow')
    if (!type || !reactFlowInstance) return
    const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY })
    const label = type === 'miniTitleNode' ? 'Mini' : type === 'largeTitleNode' ? 'Large Title' : type === 'titleNode' ? 'New Title' : type === 'textNode' ? 'New Section' : type === 'imageNode' ? 'Image' : ''
    setNodes((nds) => nds.concat({
      id: getId(), type, position,
      data: {
        label,
        body: type === 'textNode' ? 'Double-click to edit this text content.' : undefined,
        activeHandles: ['bottom-0'], handleTypes: {},
      },
    }))
  }, [reactFlowInstance, setNodes])

  /* ── Snap & Bridge: overlapping connector + group drag ── */
  const SNAP_THRESHOLD = 50
  const BRIDGE_SIZE = 30
  const BRIDGE_OVERLAP = 10  // connector overlaps 10px into each node
  const BRIDGE_GAP = BRIDGE_SIZE - BRIDGE_OVERLAP * 2  // actual gap = 10px
  const [bridges, setBridges] = useState([])  // { id, nodeA, nodeB, side }
  const dragStartPos = useRef({})  // track drag start for group movement

  /* Find all nodes in the same bridge group (connected transitively) */
  const getBridgeGroup = useCallback((nodeId) => {
    const group = new Set([nodeId])
    let changed = true
    while (changed) {
      changed = false
      for (const b of bridges) {
        if (group.has(b.nodeA) && !group.has(b.nodeB)) { group.add(b.nodeB); changed = true }
        if (group.has(b.nodeB) && !group.has(b.nodeA)) { group.add(b.nodeA); changed = true }
      }
    }
    return group
  }, [bridges])

  /* On drag start: record starting positions for group + shift-lock */
  const onNodeDragStart = useCallback((event, draggedNode) => {
    if (isSpecialNode(draggedNode)) return
    const pos = {
      __draggedId: draggedNode.id,
      __startX: draggedNode.position.x,
      __startY: draggedNode.position.y,
      __shiftLockAxis: null,  // determined on first move if shift held
    }
    // Bridge group positions
    const group = getBridgeGroup(draggedNode.id)
    if (group.size > 1) {
      for (const nId of group) {
        const n = reactFlowInstance?.getNode(nId)
        if (n) pos[nId] = { x: n.position.x, y: n.position.y }
      }
    }
    dragStartPos.current = pos
  }, [getBridgeGroup, reactFlowInstance])

  /* On drag: shift-lock + bridge group movement */
  const onNodeDrag = useCallback((event, draggedNode) => {
    const pos = dragStartPos.current
    if (!pos.__draggedId || pos.__draggedId !== draggedNode.id) return

    let dx = draggedNode.position.x - pos.__startX
    let dy = draggedNode.position.y - pos.__startY

    // Shift-lock: constrain to one axis
    if (event.shiftKey) {
      if (!pos.__shiftLockAxis) {
        // Determine axis on first significant movement
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
          pos.__shiftLockAxis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y'
        }
      }
      if (pos.__shiftLockAxis === 'x') {
        // Lock Y — move node back to start Y
        setNodes((nds) => nds.map((n) =>
          n.id === draggedNode.id ? { ...n, position: { x: draggedNode.position.x, y: pos.__startY } } : n
        ))
        dy = 0
      } else if (pos.__shiftLockAxis === 'y') {
        // Lock X — move node back to start X
        setNodes((nds) => nds.map((n) =>
          n.id === draggedNode.id ? { ...n, position: { x: pos.__startX, y: draggedNode.position.y } } : n
        ))
        dx = 0
      }
    } else {
      pos.__shiftLockAxis = null  // reset if shift released
    }

    setNodes((nds) => {
      // Move bridge group members
      const moved = nds.map((n) => {
        if (n.id === draggedNode.id || !pos[n.id]) return n
        return { ...n, position: { x: pos[n.id].x + dx, y: pos[n.id].y + dy } }
      })
      // Update bridge connector positions
      return moved.map((n) => {
        if (!n.id.startsWith('bridge-')) return n
        const b = bridges.find((br) => br.id === n.id)
        if (!b) return n
        const nA = moved.find((nd) => nd.id === b.nodeA)
        if (!nA) return n
        const aW = nA.measured?.width ?? 250
        const aH = nA.measured?.height ?? 80
        let cx, cy
        if (b.side === 'right') { cx = nA.position.x + aW - 10; cy = nA.position.y + aH / 2 - 15 }
        else if (b.side === 'left') { cx = nA.position.x - 20; cy = nA.position.y + aH / 2 - 15 }
        else if (b.side === 'bottom') { cx = nA.position.x + aW / 2 - 15; cy = nA.position.y + aH - 10 }
        else { cx = nA.position.x + aW / 2 - 15; cy = nA.position.y - 20 }
        return { ...n, position: { x: cx, y: cy } }
      })
    })
  }, [setNodes, bridges])

  const onNodeDragStop = useCallback((event, draggedNode) => {
    dragStartPos.current = {}
    if (draggedNode.id === CANVAS_ID || draggedNode.id.startsWith('bridge-') || !reactFlowInstance) return

    const dNode = reactFlowInstance.getNode(draggedNode.id)
    if (!dNode) return
    const dW = dNode.measured?.width ?? 250
    const dH = dNode.measured?.height ?? 80
    const dX = dNode.position.x
    const dY = dNode.position.y

    // Don't snap if already bridged (group is moving)
    const group = getBridgeGroup(draggedNode.id)
    const allNodes = reactFlowInstance.getNodes()

    for (const other of allNodes) {
      if (other.id === CANVAS_ID || other.id.startsWith('bridge-') || other.id === dNode.id) continue
      // Skip if other is in the same bridge group
      if (group.has(other.id)) continue

      const oW = other.measured?.width ?? 250
      const oH = other.measured?.height ?? 80
      const oX = other.position.x
      const oY = other.position.y

      const vOverlap = Math.min(dY + dH, oY + oH) - Math.max(dY, oY)
      const hOverlap = Math.min(dX + dW, oX + oW) - Math.max(dX, oX)

      let snapSide = null
      let newX = dX, newY = dY

      if (vOverlap > Math.min(dH, oH) * 0.3) {
        const gapRight = oX - (dX + dW)
        const gapLeft = dX - (oX + oW)
        if (gapRight >= -10 && gapRight <= SNAP_THRESHOLD) {
          newX = oX - dW - BRIDGE_GAP
          newY = oY + oH / 2 - dH / 2
          snapSide = 'right'
        } else if (gapLeft >= -10 && gapLeft <= SNAP_THRESHOLD) {
          newX = oX + oW + BRIDGE_GAP
          newY = oY + oH / 2 - dH / 2
          snapSide = 'left'
        }
      }

      if (!snapSide && hOverlap > Math.min(dW, oW) * 0.3) {
        const gapBelow = oY - (dY + dH)
        const gapAbove = dY - (oY + oH)
        if (gapBelow >= -10 && gapBelow <= SNAP_THRESHOLD) {
          newY = oY - dH - BRIDGE_GAP
          newX = oX + oW / 2 - dW / 2
          snapSide = 'bottom'
        } else if (gapAbove >= -10 && gapAbove <= SNAP_THRESHOLD) {
          newY = oY + oH + BRIDGE_GAP
          newX = oX + oW / 2 - dW / 2
          snapSide = 'top'
        }
      }

      if (!snapSide) continue

      const existing = bridges.find((b) =>
        (b.nodeA === dNode.id && b.nodeB === other.id) ||
        (b.nodeA === other.id && b.nodeB === dNode.id)
      )
      if (existing) {
        setNodes((nds) => nds.map((n) => n.id === dNode.id ? { ...n, position: { x: newX, y: newY } } : n))
        break
      }

      // Snap the entire group by the same delta
      const dx = newX - dX
      const dy = newY - dY
      setNodes((nds) => nds.map((n) => {
        if (n.id === dNode.id) return { ...n, position: { x: newX, y: newY } }
        if (group.has(n.id)) return { ...n, position: { x: n.position.x + dx, y: n.position.y + dy } }
        return n
      }))

      setBridges((prev) => [...prev, {
        id: `bridge-${dNode.id}-${other.id}`,
        nodeA: dNode.id,
        nodeB: other.id,
        side: snapSide,
      }])

      break
    }
  }, [reactFlowInstance, bridges, getBridgeGroup, setNodes])

  /* Remove bridge by id */
  const removeBridge = useCallback((bridgeId) => {
    setBridges((prev) => prev.filter((b) => b.id !== bridgeId))
  }, [])

  // Remove bridges when either node is deleted (return prev if unchanged to avoid loops)
  useEffect(() => {
    const nodeIds = new Set(nodes.filter(n => !n.id.startsWith('bridge-')).map((n) => n.id))
    setBridges((prev) => {
      const next = prev.filter((b) => nodeIds.has(b.nodeA) && nodeIds.has(b.nodeB))
      return next.length === prev.length ? prev : next
    })
  }, [nodes])

  // Sync bridge connector nodes into the nodes array
  useEffect(() => {
    if (!reactFlowInstance) return
    setNodes((nds) => {
      const filtered = nds.filter((n) => !n.id.startsWith('bridge-'))
      const bridgeNodes = bridges.map((b) => {
        const nA = filtered.find((n) => n.id === b.nodeA)
        if (!nA) return null
        const aW = nA.measured?.width ?? 250
        const aH = nA.measured?.height ?? 80

        // Connector overlaps into each node by BRIDGE_OVERLAP
        let cx, cy
        if (b.side === 'right') {
          cx = nA.position.x + aW - BRIDGE_OVERLAP
          cy = nA.position.y + aH / 2 - BRIDGE_SIZE / 2
        } else if (b.side === 'left') {
          cx = nA.position.x - BRIDGE_SIZE + BRIDGE_OVERLAP
          cy = nA.position.y + aH / 2 - BRIDGE_SIZE / 2
        } else if (b.side === 'bottom') {
          cx = nA.position.x + aW / 2 - BRIDGE_SIZE / 2
          cy = nA.position.y + aH - BRIDGE_OVERLAP
        } else {
          cx = nA.position.x + aW / 2 - BRIDGE_SIZE / 2
          cy = nA.position.y - BRIDGE_SIZE + BRIDGE_OVERLAP
        }

        return {
          id: b.id,
          type: 'bridgeNode',
          position: { x: cx, y: cy },
          data: { bridgeId: b.id },
          draggable: false,
          selectable: true,
          focusable: false,
          deletable: false,
          connectable: false,
          zIndex: 10,
        }
      }).filter(Boolean)

      return [...filtered, ...bridgeNodes]
    })
  }, [bridges, reactFlowInstance, setNodes])

  const onEdgeClick = useCallback((event, edge) => {
    event.stopPropagation()
    setSelectedEdge(edge)
    setEdgeModalPos({ x: event.clientX, y: event.clientY })
  }, [])

  const onSetEdgeLabel = useCallback((edgeId, label) => {
    setEdges((eds) => eds.map((e) => e.id === edgeId ? { ...e, label } : e))
  }, [setEdges])

  const onDeleteEdge = useCallback((edgeId) => {
    setEdges((eds) => eds.filter((e) => e.id !== edgeId))
  }, [setEdges])

  const onPaneClick = useCallback(() => {
    setSelectedEdge(null)
    setContextMenu(null)
    setHandleMenu(null)
    setPaneMenu(null)
    setBridgeMenu(null)
  }, [])

  const onPaneContextMenu = useCallback((event) => {
    event.preventDefault()
    setPaneMenu({ x: event.clientX, y: event.clientY, flowPos: reactFlowInstance?.screenToFlowPosition({ x: event.clientX, y: event.clientY }) })
  }, [reactFlowInstance])

  const onPaneAddNode = useCallback((type) => {
    if (!paneMenu?.flowPos) return
    const label = type === 'miniTitleNode' ? 'Mini' : type === 'largeTitleNode' ? 'Large Title' : type === 'titleNode' ? 'New Title' : type === 'textNode' ? 'New Section' : type === 'imageNode' ? 'Image' : ''
    setNodes((nds) => nds.concat({
      id: getId(), type, position: paneMenu.flowPos,
      data: {
        label,
        body: type === 'textNode' ? 'Double-click to edit this text content.' : undefined,
        activeHandles: ['bottom-0'], handleTypes: {},
      },
    }))
  }, [paneMenu, setNodes])

  const onCanvasChange = useCallback((w, h) => {
    setCanvasW(w)
    setCanvasH(h)
    setNodes((nds) => nds.map((n) => n.id === CANVAS_ID
      ? { ...n, data: { ...n.data, width: w, height: h, bg: canvasBg } }
      : n
    ))
    // Fit view to new canvas bounds after a tick
    requestAnimationFrame(() => {
      reactFlowInstance?.fitBounds({ x: 0, y: 0, width: w, height: h }, { padding: 0.1 })
    })
  }, [setNodes, reactFlowInstance])

  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault()
    // Bridge node → show remove bridge option
    if (node.id.startsWith('bridge-')) {
      setBridgeMenu({ x: event.clientX, y: event.clientY, bridgeId: node.id })
      return
    }
    // Canvas frame → show pane context menu instead
    if (isSpecialNode(node)) {
      setPaneMenu({ x: event.clientX, y: event.clientY, flowPos: reactFlowInstance?.screenToFlowPosition({ x: event.clientX, y: event.clientY }) })
      return
    }
    if (event.target.closest('.react-flow__handle')) return
    setHandleMenu(null)
    setContextMenu({ x: event.clientX, y: event.clientY, nodeId: node.id, fill: node.data.fillColor, stroke: node.data.strokeColor })
  }, [reactFlowInstance])

  const onRemoveAllHandles = useCallback((nodeId) => {
    setNodes((nds) => nds.map((n) => {
      if (n.id !== nodeId) return n
      return { ...n, data: { ...n.data, activeHandles: [], handleTypes: {} } }
    }))
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId))
    setTimeout(() => updateNodeInternals(nodeId), 0)
  }, [setNodes, setEdges, updateNodeInternals])

  const onDuplicateNode = useCallback((nodeId) => {
    setNodes((nds) => {
      const original = nds.find((n) => n.id === nodeId)
      if (!original || isSpecialNode(original)) return nds
      return nds.concat({
        ...original,
        id: getId(),
        position: { x: original.position.x + 50, y: original.position.y + 50 },
        selected: false,
        data: { ...original.data, activeHandles: [...original.data.activeHandles], handleTypes: { ...original.data.handleTypes } },
      })
    })
  }, [setNodes])

  /* Duplicate selected nodes with offset */
  const duplicateSelected = useCallback(() => {
    setNodes((nds) => {
      const sel = nds.filter((n) => n.selected && !isSpecialNode(n))
      if (!sel.length) return nds
      const clones = sel.map((n) => ({
        ...n,
        id: getId(),
        position: { x: n.position.x + 50, y: n.position.y + 50 },
        selected: true,
        data: { ...n.data, activeHandles: [...(n.data.activeHandles || [])], handleTypes: { ...(n.data.handleTypes || {}) } },
      }))
      // Deselect originals
      return nds.map((n) => n.selected && !isSpecialNode(n) ? { ...n, selected: false } : n).concat(clones)
    })
  }, [setNodes])

  const onDeleteNode = useCallback((nodeId) => {
    if (isSpecialNode({id: nodeId})) return
    setNodes((nds) => nds.filter((n) => n.id !== nodeId))
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId))
  }, [setNodes, setEdges])

  const onFillChange = useCallback((nodeId, color) => {
    setNodes((nds) => nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, fillColor: color } } : n))
  }, [setNodes])

  const onStrokeChange = useCallback((nodeId, color) => {
    setNodes((nds) => nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, strokeColor: color } } : n))
  }, [setNodes])

  const onAddHandle = useCallback((nodeId, handleId) => {
    setNodes((nds) => nds.map((n) => {
      if (n.id !== nodeId) return n
      if (n.data.activeHandles.includes(handleId)) return n
      const ah = [...n.data.activeHandles, handleId]
      const ht = { ...n.data.handleTypes, [handleId]: activeConnectorType || 'plain' }
      return { ...n, data: { ...n.data, activeHandles: ah, handleTypes: ht } }
    }))
    setTimeout(() => updateNodeInternals(nodeId), 0)
  }, [setNodes, activeConnectorType, updateNodeInternals])

  const onHandleContextMenu = useCallback((event, nodeId, handleId, currentType) => {
    setContextMenu(null)
    setHandleMenu({ x: event.clientX, y: event.clientY, nodeId, handleId, currentType })
  }, [])

  const onHandleTypeChange = useCallback((nodeId, handleId, newType) => {
    setNodes((nds) => nds.map((n) => {
      if (n.id !== nodeId) return n
      const ht = { ...n.data.handleTypes, [handleId]: newType }
      return { ...n, data: { ...n.data, handleTypes: ht } }
    }))
    setTimeout(() => updateNodeInternals(nodeId), 0)
  }, [setNodes, updateNodeInternals])

  const onRemoveHandle = useCallback((nodeId, handleId) => {
    setNodes((nds) => nds.map((n) => {
      if (n.id !== nodeId) return n
      const ah = n.data.activeHandles.filter((h) => h !== handleId)
      const ht = { ...n.data.handleTypes }
      delete ht[handleId]
      return { ...n, data: { ...n.data, activeHandles: ah, handleTypes: ht } }
    }))
    setEdges((eds) => eds.filter((e) => {
      if (e.source === nodeId && e.sourceHandle === handleId) return false
      if (e.target === nodeId && (e.targetHandle === handleId || e.targetHandle === `${handleId}-tgt`)) return false
      return true
    }))
    setTimeout(() => updateNodeInternals(nodeId), 0)
  }, [setNodes, setEdges, updateNodeInternals])

  /* ── Alignment to canvas ── */
  const alignNodes = useCallback((alignment) => {
    const sel = nodes.filter((n) => n.selected && !isSpecialNode(n))
    if (sel.length < 1) return
    takeSnapshot()

    const withDims = sel.map((n) => {
      const rfn = reactFlowInstance?.getNode(n.id)
      const w = rfn?.measured?.width ?? 250
      const h = rfn?.measured?.height ?? 80
      return { ...n, w, h }
    })

    // Canvas bounds: (0,0) to (canvasW, canvasH)
    setNodes((nds) => nds.map((n) => {
      const s = withDims.find((s) => s.id === n.id)
      if (!s) return n
      switch (alignment) {
        case 'left': return { ...n, position: { ...n.position, x: 0 } }
        case 'right': return { ...n, position: { ...n.position, x: canvasW - s.w } }
        case 'center-h': return { ...n, position: { ...n.position, x: (canvasW - s.w) / 2 } }
        case 'top': return { ...n, position: { ...n.position, y: 0 } }
        case 'bottom': return { ...n, position: { ...n.position, y: canvasH - s.h } }
        case 'center-v': return { ...n, position: { ...n.position, y: (canvasH - s.h) / 2 } }
        default: return n
      }
    }))
  }, [nodes, reactFlowInstance, setNodes, takeSnapshot, canvasW, canvasH])

  const undo = useCallback(() => {
    if (historyIdxRef.current <= 0) return
    historyIdxRef.current--
    const snap = historyRef.current[historyIdxRef.current]
    setNodes(JSON.parse(JSON.stringify(snap.nodes)))
    setEdges(JSON.parse(JSON.stringify(snap.edges)))
  }, [setNodes, setEdges])

  const redo = useCallback(() => {
    if (historyIdxRef.current >= historyRef.current.length - 1) return
    historyIdxRef.current++
    const snap = historyRef.current[historyIdxRef.current]
    setNodes(JSON.parse(JSON.stringify(snap.nodes)))
    setEdges(JSON.parse(JSON.stringify(snap.edges)))
  }, [setNodes, setEdges])

  /* Clipboard: copy/cut/paste/duplicate/delete (Figma-style) */
  const clipboardRef = useRef([])

  const onKeyDown = useCallback((event) => {
    const tag = event.target.tagName.toLowerCase()
    if (tag === 'input' || tag === 'textarea') return
    const mod = event.metaKey || event.ctrlKey

    // Cmd+Z — Undo
    if (mod && !event.shiftKey && event.key === 'z') { event.preventDefault(); undo(); return }
    // Cmd+Shift+Z — Redo
    if (mod && event.shiftKey && event.key === 'z') { event.preventDefault(); redo(); return }

    // Delete / Backspace
    if (event.key === 'Backspace' || event.key === 'Delete') {
      takeSnapshot()  // snapshot before delete
      // Remove selected bridges
      const selectedBridgeIds = nodes.filter((n) => n.selected && n.id.startsWith('bridge-')).map((n) => n.id)
      if (selectedBridgeIds.length) {
        setBridges((prev) => prev.filter((b) => !selectedBridgeIds.includes(b.id)))
      }
      setNodes((nds) => nds.filter((n) => !n.selected || n.id === CANVAS_ID))
      setEdges((eds) => eds.filter((e) => !e.selected))
      return
    }

    // Cmd+D — Duplicate
    if (mod && event.key === 'd') {
      event.preventDefault()
      duplicateSelected()
      return
    }

    // Cmd+C — Copy
    if (mod && !event.shiftKey && event.key === 'c') {
      event.preventDefault()
      const sel = nodes.filter((n) => n.selected && !isSpecialNode(n))
      if (sel.length) clipboardRef.current = sel.map((n) => JSON.parse(JSON.stringify(n)))
      return
    }

    // Cmd+X — Cut
    if (mod && event.key === 'x') {
      event.preventDefault()
      const sel = nodes.filter((n) => n.selected && !isSpecialNode(n))
      if (sel.length) {
        clipboardRef.current = sel.map((n) => JSON.parse(JSON.stringify(n)))
        const selIds = new Set(sel.map((n) => n.id))
        setNodes((nds) => nds.filter((n) => !selIds.has(n.id)))
        setEdges((eds) => eds.filter((e) => !selIds.has(e.source) && !selIds.has(e.target)))
      }
      return
    }

    // Cmd+V — Paste
    if (mod && event.key === 'v') {
      event.preventDefault()
      if (!clipboardRef.current.length) return
      setNodes((nds) => {
        const deselected = nds.map((n) => ({ ...n, selected: false }))
        const pasted = clipboardRef.current.map((n) => ({
          ...n,
          id: getId(),
          position: { x: n.position.x + 50, y: n.position.y + 50 },
          selected: true,
          data: { ...n.data, activeHandles: [...(n.data.activeHandles || [])], handleTypes: { ...(n.data.handleTypes || {}) } },
        }))
        // Update clipboard positions so repeated pastes cascade
        clipboardRef.current = pasted.map((n) => JSON.parse(JSON.stringify(n)))
        return deselected.concat(pasted)
      })
      return
    }
  }, [setNodes, setEdges, nodes, duplicateSelected, undo, redo, takeSnapshot])

  return (
    <ConnectorContext.Provider value={{ activeConnectorType, onHandleContextMenu, onAddHandle, onRemoveHandle, bridges }}>
      <div className="flex h-screen w-screen" onKeyDown={onKeyDown} tabIndex={0}>
        <div className="flex-1 h-full" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onConnectStart={onConnectStart}
            onConnectEnd={onConnectEnd}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeDragStart={onNodeDragStart}
            onNodeDrag={onNodeDrag}
            onNodeDragStop={onNodeDragStop}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            onPaneContextMenu={onPaneContextMenu}
            onNodeContextMenu={onNodeContextMenu}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            connectionMode={ConnectionMode.Loose}
            selectionOnDrag
            selectionMode={SelectionMode.Partial}
            panOnDrag={[1]}
            panOnScroll
            snapToGrid
            snapGrid={[5, 5]}
            fitView
            fitViewOptions={{ padding: 0.08, maxZoom: 0.8 }}
            deleteKeyCode={null}
            style={{ background: '#F5F3F0' }}
          >
            <Background variant={BackgroundVariant.Dots} gap={15} size={1} color="#D5D0CC" />
            {/* Bridge connectors rendered in flow-coordinate space */}
          </ReactFlow>
        </div>
        <RightPanel canvasW={canvasW} canvasH={canvasH} onCanvasChange={onCanvasChange}
          canvasBg={canvasBg} onCanvasBgChange={setCanvasBg}
          selectedNodes={selectedNodes} onFillChange={onFillChange} onStrokeChange={onStrokeChange}
          onAlign={alignNodes} />
        {selectedEdge && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setSelectedEdge(null)} />
            <EdgeLabelModal
              edge={selectedEdge}
              position={edgeModalPos}
              onClose={() => setSelectedEdge(null)}
              onSetLabel={onSetEdgeLabel}
              onDelete={onDeleteEdge}
            />
          </>
        )}
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x} y={contextMenu.y} nodeId={contextMenu.nodeId}
            currentFill={contextMenu.fill} currentStroke={contextMenu.stroke}
            onClose={() => setContextMenu(null)}
            onDelete={onDeleteNode} onDuplicate={onDuplicateNode}
            onRemoveAllHandles={onRemoveAllHandles}
            onFillChange={onFillChange} onStrokeChange={onStrokeChange}
          />
        )}
        {paneMenu && (
          <PaneContextMenu
            x={paneMenu.x} y={paneMenu.y}
            onSelect={onPaneAddNode}
            onClose={() => setPaneMenu(null)}
          />
        )}
        {handleMenu && (
          <HandleContextMenu
            x={handleMenu.x} y={handleMenu.y}
            currentType={handleMenu.currentType || 'plain'}
            onSelect={(type) => onHandleTypeChange(handleMenu.nodeId, handleMenu.handleId, type)}
            onRemove={() => onRemoveHandle(handleMenu.nodeId, handleMenu.handleId)}
            onClose={() => setHandleMenu(null)}
          />
        )}
        {bridgeMenu && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setBridgeMenu(null)} onContextMenu={(e) => { e.preventDefault(); setBridgeMenu(null) }} />
            <div style={{
              position: 'fixed', left: bridgeMenu.x, top: bridgeMenu.y, zIndex: 100,
              background: 'white', borderRadius: 8, border: '1px solid #E0DCDA',
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)', minWidth: 160, padding: '6px 0',
              fontFamily: 'SwissNow, Inter, sans-serif',
            }}>
              <div
                onClick={() => { removeBridge(bridgeMenu.bridgeId); setBridgeMenu(null) }}
                style={{ padding: '7px 16px', cursor: 'pointer', fontSize: 13, color: '#ff4444', display: 'flex', alignItems: 'center', gap: 8 }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 6L6 18M6 6l12 12"/></svg>
                Remove Bridge
              </div>
            </div>
          </>
        )}
      </div>
    </ConnectorContext.Provider>
  )
}

export default function App() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  )
}
