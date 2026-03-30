import { createContext, useCallback, useRef, useState } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  ConnectionMode,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import Sidebar from './components/Sidebar'
import TitleNode from './components/TitleNode'
import TextNode from './components/TextNode'
import LogoNode from './components/LogoNode'
import ImageNode from './components/ImageNode'
import EdgeLabelModal from './components/EdgeLabelModal'
import ContextMenu from './components/ContextMenu'
import HandleContextMenu from './components/HandleContextMenu'

export const ConnectorContext = createContext('plain')

const nodeTypes = {
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
  { id: '1', type: 'titleNode', position: { x: 350, y: 60 }, data: { label: 'Data Center', activeHandles: ['bottom'], handleTypes: {} } },
  { id: '2', type: 'textNode', position: { x: 350, y: 220 }, data: { label: 'Data Center', activeHandles: ['top', 'bottom'], handleTypes: {}, body: 'Choose from a collection of ready-made templates, made by creative professionals and ready for you to customize.\n\nChoose from a collection of ready-made templates, made by creative professionals.' } },
  { id: '3', type: 'logoNode', position: { x: 800, y: 60 }, data: { activeHandles: ['bottom'], handleTypes: {} } },
  { id: '4', type: 'imageNode', position: { x: 800, y: 370 }, data: { label: 'GPU', activeHandles: ['bottom'], handleTypes: {} } },
]

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', sourceHandle: 'bottom', targetHandle: 'top', label: 'OWNS', labelBgPadding: [16, 10] },
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
  const [handleMenu, setHandleMenu] = useState(null) // { x, y, nodeId, edge, currentType }

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({ ...params, style: { stroke: '#747474', strokeWidth: 2 }, labelBgPadding: [16, 10] }, eds))
  }, [setEdges])

  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback((event) => {
    event.preventDefault()
    const type = event.dataTransfer.getData('application/reactflow')
    if (!type || !reactFlowInstance) return
    const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY })
    setNodes((nds) => nds.concat({
      id: getId(), type, position,
      data: {
        label: type === 'titleNode' ? 'New Title' : type === 'textNode' ? 'New Section' : type === 'imageNode' ? 'Image' : '',
        body: type === 'textNode' ? 'Double-click to edit this text content.' : undefined,
        activeHandles: ['bottom'], handleTypes: {},
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
  }, [])

  // Right-click on node (not on handle)
  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault()
    // Check if right-click was on a handle — if so, don't show node menu
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

  // Handle context menu — called from within node components
  const onHandleContextMenu = useCallback((event, nodeId, edge, currentType) => {
    setContextMenu(null)
    setHandleMenu({ x: event.clientX, y: event.clientY, nodeId, edge, currentType })
  }, [])

  const onHandleTypeChange = useCallback((nodeId, edge, newType) => {
    setNodes((nds) => nds.map((n) => {
      if (n.id !== nodeId) return n
      const ht = { ...n.data.handleTypes, [edge]: newType }
      return { ...n, data: { ...n.data, handleTypes: ht } }
    }))
  }, [setNodes])

  const onRemoveHandle = useCallback((nodeId, edge) => {
    setNodes((nds) => nds.map((n) => {
      if (n.id !== nodeId) return n
      const ah = n.data.activeHandles.filter((e) => e !== edge)
      const ht = { ...n.data.handleTypes }
      delete ht[edge]
      return { ...n, data: { ...n.data, activeHandles: ah, handleTypes: ht } }
    }))
    // Also remove edges connected to that handle
    setEdges((eds) => eds.filter((e) => {
      if (e.source === nodeId && e.sourceHandle === edge) return false
      if (e.target === nodeId && e.targetHandle === edge) return false
      return true
    }))
  }, [setNodes, setEdges])

  const onKeyDown = useCallback((event) => {
    if (event.key === 'Backspace' || event.key === 'Delete') {
      const tag = event.target.tagName.toLowerCase()
      if (tag === 'input' || tag === 'textarea') return
      setNodes((nds) => nds.filter((n) => !n.selected))
      setEdges((eds) => eds.filter((e) => !e.selected))
    }
  }, [setNodes, setEdges])

  return (
    <ConnectorContext.Provider value={{ activeConnectorType, onHandleContextMenu }}>
      <div className="flex h-screen w-screen" onKeyDown={onKeyDown} tabIndex={0}>
        <Sidebar activeConnectorType={activeConnectorType} onConnectorTypeChange={setActiveConnectorType} />
        <div className="flex-1 h-full" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
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
        {handleMenu && (
          <HandleContextMenu
            x={handleMenu.x} y={handleMenu.y}
            currentType={handleMenu.currentType || 'plain'}
            onSelect={(type) => onHandleTypeChange(handleMenu.nodeId, handleMenu.edge, type)}
            onRemove={() => onRemoveHandle(handleMenu.nodeId, handleMenu.edge)}
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
