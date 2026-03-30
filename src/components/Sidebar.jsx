import { memo } from 'react'

const nodeTypes = [
  { type: 'largeTitleNode', label: 'Large Title', icon: (
    <div className="w-14 h-14 border-2 border-[#747474] rounded bg-white flex items-center justify-center">
      <span className="text-[11px] font-bold text-[#747474]">Title</span>
    </div>
  )},
  { type: 'titleNode', label: 'Small Title', icon: (
    <div className="w-full h-8 border-2 border-[#747474] rounded bg-white flex items-center justify-center">
      <span className="text-[10px] font-bold text-[#747474]">Title</span>
    </div>
  )},
  { type: 'textNode', label: 'Text Node', icon: (
    <div className="w-full h-14 border-2 border-[#747474] rounded bg-white flex flex-col p-1.5">
      <span className="text-[9px] font-bold text-[#747474]">Title</span>
      <span className="text-[7px] text-[#747474] mt-0.5">Body text...</span>
    </div>
  )},
  { type: 'logoNode', label: 'Logo Node', icon: (
    <div className="w-12 h-12 rounded bg-[#655343] flex items-center justify-center">
      <svg width="24" height="24" viewBox="0 0 250 250" fill="none">
        <path d="M126.365 58.1094L200.437 102.011L180.626 129.745L124.758 96.6309L68.8887 129.745L49.0781 102.011L124.758 57.1572L126.365 58.1094Z" fill="white"/>
        <path d="M129.001 108.437L175.968 136.271L156.159 164.005L124.761 145.397L93.3623 164.005L73.5537 136.271L124.761 105.92L129.001 108.437Z" fill="white"/>
        <path d="M124.859 154.743L151.495 170.531L135.766 192.555L124.76 186.033L113.754 192.555L98.0234 170.531L124.76 154.685L124.859 154.743Z" fill="white"/>
      </svg>
    </div>
  )},
  { type: 'imageNode', label: 'Image Node', icon: (
    <div className="w-full h-14 border-2 border-[#747474] rounded bg-white flex flex-col overflow-hidden">
      <span className="text-[9px] font-bold text-[#747474] px-1.5 pt-1">IMG</span>
      <div className="flex-1 mx-1.5 mb-1 rounded" style={{ background: '#E6D9CE' }} />
    </div>
  )},
]

const ArrowSvg = ({ rotate = 0 }) => (
  <svg width="13" height="11" viewBox="0 0 13 11" fill="none" style={{ transform: `rotate(${rotate}deg)` }}>
    <path d="M1.52653 0.101018L11.6158 4.60057C12.4249 4.96112 12.4249 6.0391 11.6158 6.39965L1.52653 10.8992C0.612929 11.3068-0.335502 10.4018 0.117325 9.55355L2.04352 5.9456C2.19324 5.66511 2.19324 5.3345 2.04352 5.05461L0.117326 1.44666C-0.33489 0.598454 0.612319-0.307199 1.52653 0.101018Z" fill="#655343"/>
  </svg>
)

const connectorTypes = [
  { id: 'plain', title: 'Plain', content: null },
  { id: 'arrow-right', title: '→', content: <ArrowSvg rotate={0} /> },
  { id: 'arrow-left', title: '←', content: <ArrowSvg rotate={180} /> },
  { id: 'arrow-up', title: '↑', content: <ArrowSvg rotate={-90} /> },
  { id: 'arrow-down', title: '↓', content: <ArrowSvg rotate={90} /> },
  { id: 'additive', title: '+', content: <span style={{ fontSize: 15, color: '#747474', fontWeight: 600 }}>+</span> },
  { id: 'black', title: 'Black', content: null, filled: true },
]

function Sidebar({ activeConnectorType, onConnectorTypeChange }) {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="w-[260px] h-full bg-white border-r flex flex-col" style={{ borderColor: '#E0DCDA' }}>
      <div className="p-5 border-b" style={{ borderColor: '#E0DCDA' }}>
        <h1 className="text-base font-bold text-[#655343]">Node System</h1>
        <p className="text-xs text-[#747474] mt-1">Drag nodes to canvas</p>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        <h2 className="text-xs font-semibold text-[#655343] uppercase tracking-wider mb-3">Nodes</h2>
        <div className="space-y-3">
          {nodeTypes.map((nt) => (
            <div
              key={nt.type}
              draggable
              onDragStart={(e) => onDragStart(e, nt.type)}
              className="p-3 rounded-lg border cursor-grab active:cursor-grabbing hover:border-[#655343] transition-colors"
              style={{ borderColor: '#E0DCDA' }}
            >
              <div className="mb-2">{nt.icon}</div>
              <span className="text-xs font-medium text-[#747474]">{nt.label}</span>
            </div>
          ))}
        </div>

        <h2 className="text-xs font-semibold text-[#655343] uppercase tracking-wider mb-3 mt-6">Connector Type</h2>
        <p className="text-[10px] text-[#747474] mb-2">Select, then + on node edge. Right-click connector to change.</p>
        <div className="flex gap-2 flex-wrap">
          {connectorTypes.map((ct) => (
            <div
              key={ct.id}
              onClick={() => onConnectorTypeChange?.(ct.id)}
              className="w-[30px] h-[30px] border-2 border-[#747474] rounded-[1.4px] flex items-center justify-center cursor-pointer transition-all"
              style={{
                background: ct.filled ? 'black' : 'white',
                outline: activeConnectorType === ct.id ? '2.5px solid #655343' : 'none',
                outlineOffset: 3,
              }}
              title={ct.title}
            >
              {ct.content}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t text-[10px] text-[#747474] space-y-1" style={{ borderColor: '#E0DCDA' }}>
        <div>Double-click text to edit</div>
        <div>Click images to replace</div>
        <div>Right-click node → delete / colors</div>
        <div>Right-click connector → change type</div>
      </div>
    </div>
  )
}

export default memo(Sidebar)
