import { useCallback, useRef, useState } from 'react'
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
}

const initialNodes = [
  { id: '1', type: 'titleNode', position: { x: 350, y: 60 }, data: { label: 'Data Center' } },
  { id: '2', type: 'textNode', position: { x: 350, y: 220 }, data: { label: 'Data Center', body: 'Choose from a collection of ready-made templates, made by creative professionals and ready for you to customize.\n\nChoose from a collection of ready-made templates, made by creative professionals.' } },
  { id: '3', type: 'logoNode', position: { x: 800, y: 60 }, data: {} },
  { id: '4', type: 'imageNode', position: { x: 800, y: 370 }, data: { label: 'GPU' } },
]

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', sourceHandle: 'bottom', targetHandle: 'top', label: 'OWNS' },
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

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({ ...params, style: { stroke: '#747474', strokeWidth: 2 } }, eds))
  }, [setEdges])

  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback((event) => {
    event.preventDefault()
    const type = event.dataTransfer.getData('application/reactflow')
    if (!type || !reactFlowInstance) return

    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    })

    const newNode = {
      id: getId(),
      type,
      position,
      data: {
        label: type === 'titleNode' ? 'New Title' : type === 'textNode' ? 'New Section' : type === 'imageNode' ? 'Image' : '',
        body: type === 'textNode' ? 'Double-click to edit this text content.' : undefined,
      },
    }
    setNodes((nds) => nds.concat(newNode))
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
  }, [])

  return (
    <div className="flex h-screen w-screen">
      <Sidebar />
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
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          connectionMode={ConnectionMode.Loose}
          snapToGrid
          snapGrid={[15, 15]}
          fitView
          style={{ background: '#F5F3F0' }}
        >
          <Background variant={BackgroundVariant.Dots} gap={15} size={1} color="#D5D0CC" />
          <Controls />
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
    </div>
  )
}

export default function App() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  )
}
