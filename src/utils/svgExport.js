// Generate true vector SVG from React Flow state — every element is a selectable/editable SVG object

const CANVAS_ID = '__canvas__'

// Node type → dimensions
const nodeDims = {
  titleNode: { w: 360, h: 100 },
  largeTitleNode: { w: 360, h: 311 },
  textNode: { w: 360, h: 311 },
  logoNode: { w: 250, h: 250 },
  imageNode: { w: 360, h: 311 },
}

function getHandleAbsPos(handleId, allHandles, nx, ny, nw, nh) {
  const side = handleId.split('-')[0]
  const sideHandles = allHandles.filter(h => h.startsWith(side + '-')).sort()
  const idx = sideHandles.indexOf(handleId)
  const pct = (idx + 1) / (sideHandles.length + 1)
  switch (side) {
    case 'top': return { x: nx + nw * pct, y: ny, side }
    case 'bottom': return { x: nx + nw * pct, y: ny + nh, side }
    case 'left': return { x: nx, y: ny + nh * pct, side }
    case 'right': return { x: nx + nw, y: ny + nh * pct, side }
    default: return { x: nx, y: ny, side }
  }
}

function escXml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// Wrap text into lines (rough estimate for SVG)
function wrapText(text, maxChars = 42) {
  const lines = []
  for (const paragraph of text.split('\n')) {
    if (paragraph.trim() === '') { lines.push(''); continue }
    const words = paragraph.split(' ')
    let line = ''
    for (const word of words) {
      if (line.length + word.length + 1 > maxChars && line) {
        lines.push(line)
        line = word
      } else {
        line = line ? line + ' ' + word : word
      }
    }
    if (line) lines.push(line)
  }
  return lines
}

function renderHandle(handleId, allHandles, handleTypes, nx, ny, nw, nh) {
  const pos = getHandleAbsPos(handleId, allHandles, nx, ny, nw, nh)
  const type = handleTypes[handleId] || 'plain'
  const hx = pos.x - 15, hy = pos.y - 15
  const fill = type === 'black' ? 'black' : 'white'

  let inner = ''
  if (type === 'additive') {
    inner = `<line x1="${pos.x - 5}" y1="${pos.y}" x2="${pos.x + 5}" y2="${pos.y}" stroke="#747474" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="${pos.x}" y1="${pos.y - 5}" x2="${pos.x}" y2="${pos.y + 5}" stroke="#747474" stroke-width="1.8" stroke-linecap="round"/>`
  } else if (type === 'arrow-right') {
    inner = `<g transform="translate(${pos.x - 6.5},${pos.y - 5.5})"><path d="M1.52653 0.101018L11.6158 4.60057C12.4249 4.96112 12.4249 6.0391 11.6158 6.39965L1.52653 10.8992C0.612929 11.3068-0.335502 10.4018 0.117325 9.55355L2.04352 5.9456C2.19324 5.66511 2.19324 5.3345 2.04352 5.05461L0.117326 1.44666C-0.33489 0.598454 0.612319-0.307199 1.52653 0.101018Z" fill="#655343"/></g>`
  } else if (type === 'arrow-left') {
    inner = `<g transform="translate(${pos.x + 6.5},${pos.y + 5.5}) rotate(180)"><path d="M1.52653 0.101018L11.6158 4.60057C12.4249 4.96112 12.4249 6.0391 11.6158 6.39965L1.52653 10.8992C0.612929 11.3068-0.335502 10.4018 0.117325 9.55355L2.04352 5.9456C2.19324 5.66511 2.19324 5.3345 2.04352 5.05461L0.117326 1.44666C-0.33489 0.598454 0.612319-0.307199 1.52653 0.101018Z" fill="#655343"/></g>`
  } else if (type === 'arrow-up') {
    inner = `<g transform="translate(${pos.x + 5.5},${pos.y - 6.5}) rotate(90)"><g transform="rotate(180,6.5,5.5)"><path d="M1.52653 0.101018L11.6158 4.60057C12.4249 4.96112 12.4249 6.0391 11.6158 6.39965L1.52653 10.8992C0.612929 11.3068-0.335502 10.4018 0.117325 9.55355L2.04352 5.9456C2.19324 5.66511 2.19324 5.3345 2.04352 5.05461L0.117326 1.44666C-0.33489 0.598454 0.612319-0.307199 1.52653 0.101018Z" fill="#655343"/></g></g>`
  } else if (type === 'arrow-down') {
    inner = `<g transform="translate(${pos.x - 5.5},${pos.y + 6.5}) rotate(-90)"><g transform="rotate(180,6.5,5.5)"><path d="M1.52653 0.101018L11.6158 4.60057C12.4249 4.96112 12.4249 6.0391 11.6158 6.39965L1.52653 10.8992C0.612929 11.3068-0.335502 10.4018 0.117325 9.55355L2.04352 5.9456C2.19324 5.66511 2.19324 5.3345 2.04352 5.05461L0.117326 1.44666C-0.33489 0.598454 0.612319-0.307199 1.52653 0.101018Z" fill="#655343"/></g></g>`
  }

  return `<rect x="${hx}" y="${hy}" width="30" height="30" rx="1.4" fill="${fill}" stroke="#747474" stroke-width="2"/>${inner}`
}

function renderEdge(edge, nodesMap) {
  const srcNode = nodesMap[edge.source]
  const tgtNode = nodesMap[edge.target]
  if (!srcNode || !tgtNode) return ''

  const srcData = srcNode.data
  const tgtData = tgtNode.data
  const srcDims = nodeDims[srcNode.type] || { w: 360, h: 311 }
  const tgtDims = nodeDims[tgtNode.type] || { w: 360, h: 311 }

  // Find source handle position
  const srcHandleId = edge.sourceHandle || 'bottom-0'
  const srcPos = getHandleAbsPos(srcHandleId, srcData.activeHandles || [], srcNode.position.x, srcNode.position.y, srcDims.w, srcDims.h)

  // Find target handle — strip -tgt suffix to find base handle
  let tgtHandleId = edge.targetHandle || 'top-0-tgt'
  const tgtBaseId = tgtHandleId.replace(/-tgt$/, '')
  const tgtPos = getHandleAbsPos(tgtBaseId, tgtData.activeHandles || [], tgtNode.position.x, tgtNode.position.y, tgtDims.w, tgtDims.h)

  // Bezier control points based on handle sides
  const offset = Math.min(120, Math.abs(tgtPos.y - srcPos.y) * 0.5 + 40)
  const cp = (pos, side) => {
    switch (side) {
      case 'bottom': return { x: pos.x, y: pos.y + offset }
      case 'top': return { x: pos.x, y: pos.y - offset }
      case 'right': return { x: pos.x + offset, y: pos.y }
      case 'left': return { x: pos.x - offset, y: pos.y }
      default: return pos
    }
  }
  const sc = cp(srcPos, srcPos.side)
  const tc = cp(tgtPos, tgtPos.side)

  let svg = `<path d="M${srcPos.x},${srcPos.y} C${sc.x},${sc.y} ${tc.x},${tc.y} ${tgtPos.x},${tgtPos.y}" fill="none" stroke="#747474" stroke-width="2"/>`

  // Edge label
  if (edge.label) {
    const mx = (srcPos.x + tgtPos.x) / 2
    const my = (srcPos.y + tgtPos.y) / 2
    const labelText = escXml(edge.label)
    const labelW = labelText.length * 10 + 32
    const labelH = 36
    svg += `<rect x="${mx - labelW / 2}" y="${my - labelH / 2}" width="${labelW}" height="${labelH}" rx="6" fill="white" stroke="#CFCBC8" stroke-width="2"/>
    <text x="${mx}" y="${my + 5}" text-anchor="middle" fill="#655343" font-size="18" font-weight="600" letter-spacing="0.05em" style="text-transform:uppercase">${labelText}</text>`
  }

  return svg
}

function renderNode(node) {
  const { type, position: { x, y }, data } = node
  const dims = nodeDims[type] || { w: 360, h: 311 }
  const { w, h } = dims
  const fill = data.fillColor || (type === 'logoNode' ? '#655343' : 'white')
  const stroke = data.strokeColor || (type === 'logoNode' ? '#655343' : '#747474')
  const radius = type === 'logoNode' ? 5.6 : 4.35
  const handles = data.activeHandles || []
  const hTypes = data.handleTypes || {}

  let svg = `<g id="node-${escXml(node.id)}">`

  // Node body
  svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`

  // Content based on type
  if (type === 'titleNode' || type === 'largeTitleNode') {
    const label = escXml(data.label || 'Title')
    svg += `<text x="${x + w / 2}" y="${y + h / 2 + 8}" text-anchor="middle" fill="#747474" font-size="23" font-weight="700">${label}</text>`
  } else if (type === 'textNode') {
    const label = escXml(data.label || 'Title')
    svg += `<text x="${x + 24}" y="${y + 40}" fill="#747474" font-size="23" font-weight="700">${label}</text>`
    if (data.body) {
      const lines = wrapText(data.body)
      lines.forEach((line, i) => {
        svg += `<text x="${x + 24}" y="${y + 72 + i * 29}" fill="#747474" font-size="18">${escXml(line)}</text>`
      })
    }
  } else if (type === 'logoNode') {
    // Default logo shape
    svg += `<g transform="translate(${x + 62.5},${y + 62.5}) scale(0.5)">
      <path d="M126.365 58.1094L200.437 102.011L180.626 129.745L124.758 96.6309L68.8887 129.745L49.0781 102.011L124.758 57.1572L126.365 58.1094Z" fill="white"/>
      <path d="M129.001 108.437L175.968 136.271L156.159 164.005L124.761 145.397L93.3623 164.005L73.5537 136.271L124.761 105.92L129.001 108.437Z" fill="white"/>
      <path d="M124.859 154.743L151.495 170.531L135.766 192.555L124.76 186.033L113.754 192.555L98.0234 170.531L124.76 154.685L124.859 154.743Z" fill="white"/>
    </g>`
  } else if (type === 'imageNode') {
    const label = escXml(data.label || 'Image')
    svg += `<text x="${x + 16}" y="${y + 34}" fill="#747474" font-size="23" font-weight="700">${label}</text>`
    svg += `<rect x="${x + 16}" y="${y + 50}" width="${w - 32}" height="${h - 66}" rx="6" fill="#E6D9CE" stroke="#655343" stroke-width="1"/>`
    // Image icon
    svg += `<g transform="translate(${x + w / 2 - 24},${y + h / 2 - 12})">
      <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="#655343" stroke-width="1.5"/>
      <circle cx="8.5" cy="8.5" r="1.5" fill="#655343"/>
      <path d="M21 15l-5-5L5 21" fill="none" stroke="#655343" stroke-width="1.5"/>
    </g>`
  }

  // Handles
  for (const hId of handles) {
    svg += renderHandle(hId, handles, hTypes, x, y, w, h)
  }

  svg += '</g>'
  return svg
}

export function generateVectorSvg(rfInstance, canvasW, canvasH) {
  const allNodes = rfInstance.getNodes()
  const edges = rfInstance.getEdges()
  const nodes = allNodes.filter(n => n.id !== CANVAS_ID)

  const nodesMap = {}
  for (const n of allNodes) nodesMap[n.id] = n

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${canvasW}" height="${canvasH}" viewBox="0 0 ${canvasW} ${canvasH}">
<defs>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&amp;display=swap');
    text { font-family: 'Inter', sans-serif; }
  </style>
</defs>
<rect width="${canvasW}" height="${canvasH}" fill="white"/>
`

  // Edges first (behind nodes)
  for (const edge of edges) {
    svg += renderEdge(edge, nodesMap) + '\n'
  }

  // Nodes
  for (const node of nodes) {
    svg += renderNode(node) + '\n'
  }

  svg += '</svg>'
  return svg
}
