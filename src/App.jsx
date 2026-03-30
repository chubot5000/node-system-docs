import { createContext, useCallback, useRef, useState } from 'react'
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

const nodeTypes = {
  canvasFrame: CanvasFrame,
  largeTitleNode: LargeTitleNode,
  titleNode: TitleNode,
  textNode: TextNode,
  logoNode: LogoNode,
  imageNode: ImageNode,
}

const CANVAS_ID = '__canvas__'
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
  { id: '1', type: 'titleNode', position: { x: 780, y: 490 }, data: { label: 'New Title', activeHandles: ['bottom-0'], handleTypes: {} } },
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
  const [canvasW, setCanvasW] = useState(DEFAULT_W)
  const [canvasH, setCanvasH] = useState(DEFAULT_H)
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
    const label = type === 'largeTitleNode' ? 'Large Title' : type === 'titleNode' ? 'New Title' : type === 'textNode' ? 'New Section' : type === 'imageNode' ? 'Image' : ''
    setNodes((nds) => nds.concat({
      id: getId(), type, position,
      data: {
        label,
        body: type === 'textNode' ? 'Double-click to edit this text content.' : undefined,
        activeHandles: ['bottom-0'], handleTypes: {},
      },
    }))
  }, [reactFlowInstance, setNodes])

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
  }, [])

  const onPaneContextMenu = useCallback((event) => {
    event.preventDefault()
    setPaneMenu({ x: event.clientX, y: event.clientY, flowPos: reactFlowInstance?.screenToFlowPosition({ x: event.clientX, y: event.clientY }) })
  }, [reactFlowInstance])

  const onPaneAddNode = useCallback((type) => {
    if (!paneMenu?.flowPos) return
    const label = type === 'largeTitleNode' ? 'Large Title' : type === 'titleNode' ? 'New Title' : type === 'textNode' ? 'New Section' : type === 'imageNode' ? 'Image' : ''
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
      ? { ...n, data: { ...n.data, width: w, height: h } }
      : n
    ))
    // Fit view to new canvas bounds after a tick
    requestAnimationFrame(() => {
      reactFlowInstance?.fitBounds({ x: 0, y: 0, width: w, height: h }, { padding: 0.1 })
    })
  }, [setNodes, reactFlowInstance])

  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault()
    // Canvas frame → show pane context menu instead
    if (node.id === CANVAS_ID) {
      setPaneMenu({ x: event.clientX, y: event.clientY, flowPos: reactFlowInstance?.screenToFlowPosition({ x: event.clientX, y: event.clientY }) })
      return
    }
    if (event.target.closest('.react-flow__handle')) return
    setHandleMenu(null)
    setContextMenu({ x: event.clientX, y: event.clientY, nodeId: node.id, fill: node.data.fillColor, stroke: node.data.strokeColor })
  }, [reactFlowInstance])

  const onDuplicateNode = useCallback((nodeId) => {
    setNodes((nds) => {
      const original = nds.find((n) => n.id === nodeId)
      if (!original || original.id === CANVAS_ID) return nds
      return nds.concat({
        ...original,
        id: getId(),
        position: { x: original.position.x + 30, y: original.position.y + 30 },
        selected: false,
        data: { ...original.data, activeHandles: [...original.data.activeHandles], handleTypes: { ...original.data.handleTypes } },
      })
    })
  }, [setNodes])

  const onDeleteNode = useCallback((nodeId) => {
    if (nodeId === CANVAS_ID) return
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

  const onKeyDown = useCallback((event) => {
    if (event.key === 'Backspace' || event.key === 'Delete') {
      const tag = event.target.tagName.toLowerCase()
      if (tag === 'input' || tag === 'textarea') return
      setNodes((nds) => nds.filter((n) => !n.selected || n.id === CANVAS_ID))
      setEdges((eds) => eds.filter((e) => !e.selected))
    }
  }, [setNodes, setEdges])

  return (
    <ConnectorContext.Provider value={{ activeConnectorType, onHandleContextMenu, onAddHandle, onRemoveHandle }}>
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
            snapGrid={[15, 15]}
            fitView
            fitViewOptions={{ padding: 0.08, maxZoom: 0.8 }}
            deleteKeyCode={null}
            style={{ background: '#F5F3F0' }}
          >
            <Background variant={BackgroundVariant.Dots} gap={15} size={1} color="#D5D0CC" />
          </ReactFlow>
        </div>
        <RightPanel canvasW={canvasW} canvasH={canvasH} onCanvasChange={onCanvasChange} />
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
