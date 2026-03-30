import { memo } from 'react'

const nodeTypes = [
  { type: 'titleNode', label: 'Title Node', icon: (
    <div className="w-full h-8 border border-border rounded bg-white flex items-center justify-center">
      <span className="text-[10px] font-semibold text-border">Title</span>
    </div>
  )},
  { type: 'textNode', label: 'Text Node', icon: (
    <div className="w-full h-14 border border-border rounded bg-white flex flex-col p-1.5">
      <span className="text-[9px] font-bold text-border">Title</span>
      <span className="text-[7px] text-border mt-0.5">Body text...</span>
    </div>
  )},
  { type: 'logoNode', label: 'Logo Node', icon: (
    <div className="w-12 h-12 rounded bg-accent flex items-center justify-center">
      <svg width="24" height="24" viewBox="0 0 250 250" fill="none">
        <path d="M126.365 58.1094L200.437 102.011L180.626 129.745L124.758 96.6309L68.8887 129.745L49.0781 102.011L124.758 57.1572L126.365 58.1094Z" fill="white"/>
        <path d="M129.001 108.437L175.968 136.271L156.159 164.005L124.761 145.397L93.3623 164.005L73.5537 136.271L124.761 105.92L129.001 108.437Z" fill="white"/>
        <path d="M124.859 154.743L151.495 170.531L135.766 192.555L124.76 186.033L113.754 192.555L98.0234 170.531L124.76 154.685L124.859 154.743Z" fill="white"/>
      </svg>
    </div>
  )},
  { type: 'imageNode', label: 'Image Node', icon: (
    <div className="w-full h-14 border border-border rounded bg-white flex flex-col overflow-hidden">
      <span className="text-[9px] font-bold text-border px-1.5 pt-1">IMG</span>
      <div className="flex-1 mx-1.5 mb-1 rounded" style={{ background: '#E6D9CE' }} />
    </div>
  )},
]

const connectorTypes = [
  { id: 'plain', title: 'Plain', content: null },
  { id: 'arrow', title: 'Arrow', content: (
    <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
      <path d="M2 3.5L9 3.5M9 3.5L6.5 1M9 3.5L6.5 6" stroke="#655343" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )},
  { id: 'additive', title: 'Additive', content: <span className="text-sm text-border font-medium">+</span> },
  { id: 'black', title: 'Black', content: null, filled: true },
]

function Sidebar({ activeConnectorType, onConnectorTypeChange }) {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="w-[260px] h-full bg-white border-r border-gray-200 flex flex-col" style={{ borderColor: '#E0DCDA' }}>
      <div className="p-5 border-b" style={{ borderColor: '#E0DCDA' }}>
        <h1 className="text-base font-bold text-accent">Node System</h1>
        <p className="text-xs text-border mt-1">Drag nodes to canvas</p>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        <h2 className="text-xs font-semibold text-accent uppercase tracking-wider mb-3">Nodes</h2>
        <div className="space-y-3">
          {nodeTypes.map((nt) => (
            <div
              key={nt.type}
              draggable
              onDragStart={(e) => onDragStart(e, nt.type)}
              className="p-3 rounded-lg border cursor-grab active:cursor-grabbing hover:border-accent transition-colors"
              style={{ borderColor: '#E0DCDA' }}
            >
              <div className="mb-2">{nt.icon}</div>
              <span className="text-xs font-medium text-border">{nt.label}</span>
            </div>
          ))}
        </div>

        <h2 className="text-xs font-semibold text-accent uppercase tracking-wider mb-3 mt-6">Connectors</h2>
        <div className="flex gap-2">
          {connectorTypes.map((ct) => (
            <div
              key={ct.id}
              onClick={() => onConnectorTypeChange?.(ct.id)}
              className="w-[30px] h-[30px] border-2 border-border rounded-[1.4px] flex items-center justify-center cursor-pointer transition-all"
              style={{
                background: ct.filled ? 'black' : 'white',
                outline: activeConnectorType === ct.id ? '2px solid #655343' : 'none',
                outlineOffset: 2,
              }}
              title={ct.title}
            >
              {ct.content}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t text-[10px] text-border" style={{ borderColor: '#E0DCDA' }}>
        Double-click text to edit · Click images to replace
      </div>
    </div>
  )
}

export default memo(Sidebar)
