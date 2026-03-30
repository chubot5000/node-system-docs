import { createContext, useCallback, useRef, useState } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  useUpdateNodeInternals,
  Controls,
  Background,
  BackgroundVariant,
  ConnectionMode,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import Sidebar from './components/Sidebar'
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
  largeTitleNode: LargeTitleNode,
  titleNode: TitleNode,
  textNode: TextNode,
  logoNode: LogoNode,
  imageNode: ImageNode,
}

const defaultEdgeOptions = {
  type: 'default',
  style: { stroke: '#747474', strokeWidth: 2 },
  animated: false,
  labelBgPadding: [16, 10],
  labelBgBorderRadius: 6,
}

const initialNodes = [
  { id: '1', type: 'titleNode', position: { x: 350, y: 60 }, data: { label: 'Data Center', activeHandles: ['bottom-0'], handleTypes: {} } },
  { id: '2', type: 'textNode', position: { x: 350, y: 220 }, data: { label: 'Data Center', activeHandles: ['top-0', 'bottom-0'], handleTypes: {}, body: 'Choose from a collection of ready-made templates, made by creative professionals and ready for you to customize.\n\nChoose from a collection of ready-made templates, made by creative professionals.' } },
  { id: '3', type: 'logoNode', position: { x: 800, y: 60 }, data: { activeHandles: ['bottom-0'], handleTypes: {} } },
  { id: '4', type: 'imageNode', position: { x: 800, y: 370 }, data: { label: 'GPU', activeHandles: ['bottom-0'], handleTypes: {} } },
]

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', sourceHandle: 'bottom-0', targetHandle: 'top-0-tgt', label: 'OWNS', labelBgPadding: [16, 10] },
]

let id = 5
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

    const targetNode = nodes.find((n) => n.id === targetNodeId)
    if (!targetNode) return

    const maxPerSide = targetNode.type === 'titleNode' ? 1 : 3

    const flowPos = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY })
    const zoom = reactFlowInstance.getZoom()
    const nodeRect = {
      x: targetNode.position.x,
      y: targetNode.position.y,
      w: nodeEl.offsetWidth / zoom,
      h: nodeEl.offsetHeight / zoom,
    }
    const cx = nodeRect.x + nodeRect.w / 2
    const cy = nodeRect.y + nodeRect.h / 2
    const dx = flowPos.x - cx
    const dy = flowPos.y - cy

    let side
    const ratioX = Math.abs(dx) / (nodeRect.w / 2)
    const ratioY = Math.abs(dy) / (nodeRect.h / 2)
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
    setTimeout(() => updateNodeInternals(targetNodeId), 0)

    setTimeout(() => {
      setEdges((eds) => addEdge({
        source: from.nodeId,
        sourceHandle: from.handleId,
        target: targetNodeId,
        targetHandle: `${newHandleId}-tgt`,
        style: { stroke: '#747474', strokeWidth: 2 },
        labelBgPadding: [16, 10],
      }, eds))
    }, 50)
  }, [reactFlowInstance, nodes, setNodes, setEdges, activeConnectorType, updateNodeInternals])

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

  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault()
    if (event.target.closest('.react-flow__handle')) return
    setHandleMenu(null)
    setContextMenu({ x: event.clientX, y: event.clientY, nodeId: node.id, fill: node.data.fillColor, stroke: node.data.strokeColor })
  }, [])

  const onDeleteNode = useCallback((nodeId) => {
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
      setNodes((nds) => nds.filter((n) => !n.selected))
      setEdges((eds) => eds.filter((e) => !e.selected))
    }
  }, [setNodes, setEdges])

  return (
    <ConnectorContext.Provider value={{ activeConnectorType, onHandleContextMenu, onAddHandle, onRemoveHandle }}>
      <div className="flex h-screen w-screen" onKeyDown={onKeyDown} tabIndex={0}>
        <Sidebar activeConnectorType={activeConnectorType} onConnectorTypeChange={setActiveConnectorType} />
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
            snapToGrid
            snapGrid={[15, 15]}
            fitView
            fitViewOptions={{ padding: 0.5, maxZoom: 0.6 }}
            deleteKeyCode={null}
            style={{ background: '#F5F3F0' }}
          >
            <Background variant={BackgroundVariant.Dots} gap={15} size={1} color="#D5D0CC" />
            <Controls position="top-right" />
          </ReactFlow>
        </div>
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
            onDelete={onDeleteNode} onFillChange={onFillChange} onStrokeChange={onStrokeChange}
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
