// Generate true vector SVG from React Flow state

const CANVAS_ID = '__canvas__'

const nodeDims = {
  miniTitleNode: { w: 90, h: 40 },
  titleNode: { w: 160, h: 40 },
  largeTitleNode: { w: 160, h: 160 },
  textNode: { w: 180, h: 160 },
  logoNode: { w: 130, h: 130 },
  imageNode: { w: 200, h: 160 },
  smallImageNode: { w: 200, h: 50 },
}

function getHandleAbsPos(handleId, allHandles, nx, ny, nw, nh) {
  const side = handleId.split('-')[0]
  const sideHandles = allHandles.filter(h => h.startsWith(side + '-')).sort()
  const idx = sideHandles.indexOf(handleId)
  const count = sideHandles.length
  // Match the compression formula from handleUtils.js
  const evenPct = (idx + 1) / (count + 1)
  const pct = evenPct + (count > 1 ? (0.5 - evenPct) * 0.07 : 0)
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

function wrapText(text, maxChars = 42) {
  const lines = []
  for (const paragraph of text.split('\n')) {
    if (paragraph.trim() === '') { lines.push(''); continue }
    const words = paragraph.split(' ')
    let line = ''
    for (const word of words) {
      if (line.length + word.length + 1 > maxChars && line) { lines.push(line); line = word }
      else { line = line ? line + ' ' + word : word }
    }
    if (line) lines.push(line)
  }
  return lines
}

const arrowPath = 'M1.52653 0.101018L11.6158 4.60057C12.4249 4.96112 12.4249 6.0391 11.6158 6.39965L1.52653 10.8992C0.612929 11.3068-0.335502 10.4018 0.117325 9.55355L2.04352 5.9456C2.19324 5.66511 2.19324 5.3345 2.04352 5.05461L0.117326 1.44666C-0.33489 0.598454 0.612319-0.307199 1.52653 0.101018Z'

function renderHandle(handleId, allHandles, handleTypes, nx, ny, nw, nh) {
  const pos = getHandleAbsPos(handleId, allHandles, nx, ny, nw, nh)
  const type = handleTypes[handleId] || 'plain'
  const hx = pos.x - 6, hy = pos.y - 6
  const fill = type === 'black' ? '#333' : 'white'
  let inner = ''

  if (type === 'additive') {
    inner = `<line x1="${pos.x - 3}" y1="${pos.y}" x2="${pos.x + 3}" y2="${pos.y}" stroke="#A99482" stroke-width="1" stroke-linecap="round"/>
    <line x1="${pos.x}" y1="${pos.y - 3}" x2="${pos.x}" y2="${pos.y + 3}" stroke="#A99482" stroke-width="1" stroke-linecap="round"/>`
  } else if (type === 'arrow-right') {
    inner = `<g transform="translate(${pos.x - 4},${pos.y - 3.5}) scale(0.6)"><path d="${arrowPath}" fill="#655343"/></g>`
  } else if (type === 'arrow-left') {
    inner = `<g transform="translate(${pos.x + 4},${pos.y + 3.5}) scale(0.6) rotate(180)"><path d="${arrowPath}" fill="#655343"/></g>`
  } else if (type === 'arrow-up') {
    inner = `<g transform="translate(${pos.x + 3.5},${pos.y + 4}) scale(0.6) rotate(-90)"><path d="${arrowPath}" fill="#655343"/></g>`
  } else if (type === 'arrow-down') {
    inner = `<g transform="translate(${pos.x - 3.5},${pos.y - 4}) scale(0.6) rotate(90)"><path d="${arrowPath}" fill="#655343"/></g>`
  }

  return `<rect x="${hx}" y="${hy}" width="12" height="12" rx="1" fill="${fill}" stroke="#A99482" stroke-width="1"/>${inner}`
}

function renderEdge(edge, nodesMap) {
  const srcNode = nodesMap[edge.source]
  const tgtNode = nodesMap[edge.target]
  if (!srcNode || !tgtNode) return ''

  const srcDims = nodeDims[srcNode.type] || { w: 250, h: 250 }
  const tgtDims = nodeDims[tgtNode.type] || { w: 250, h: 250 }

  const srcHandleId = edge.sourceHandle || 'bottom-0'
  const srcPos = getHandleAbsPos(srcHandleId, srcNode.data.activeHandles || [], srcNode.position.x, srcNode.position.y, srcDims.w, srcDims.h)

  const tgtBaseId = (edge.targetHandle || 'top-0-tgt').replace(/-tgt$/, '')
  const tgtPos = getHandleAbsPos(tgtBaseId, tgtNode.data.activeHandles || [], tgtNode.position.x, tgtNode.position.y, tgtDims.w, tgtDims.h)

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

  let svg = `<path d="M${srcPos.x},${srcPos.y} C${sc.x},${sc.y} ${tc.x},${tc.y} ${tgtPos.x},${tgtPos.y}" fill="none" stroke="#A99482" stroke-width="1"/>`

  if (edge.label) {
    const mx = (srcPos.x + tgtPos.x) / 2
    const my = (srcPos.y + tgtPos.y) / 2
    const labelText = escXml(edge.label)
    const labelW = labelText.length * 7 + 16
    const labelH = 22
    svg += `<rect x="${mx - labelW / 2}" y="${my - labelH / 2}" width="${labelW}" height="${labelH}" rx="3" fill="white" stroke="#C5B9AC" stroke-width="1"/>
    <text x="${mx}" y="${my + 5}" text-anchor="middle" fill="#655343" font-size="11" font-weight="600" letter-spacing="0.05em" style="text-transform:uppercase">${labelText}</text>`
  }

  return svg
}

function renderNode(node) {
  const { type, position: { x, y }, data } = node
  const dims = nodeDims[type]
  if (!dims) return '' // unknown type — skip
  const { w, h } = dims
  const fill = data.fillColor || (type === 'logoNode' ? '#655343' : 'white')
  const stroke = data.strokeColor || (type === 'logoNode' ? '#655343' : '#A99482')
  const radius = type === 'logoNode' ? 5.6 : 4.35
  const handles = data.activeHandles || []
  const hTypes = data.handleTypes || {}

  let svg = `<g id="node-${escXml(node.id)}">`
  svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`

  if (type === 'smallImageNode') {
    const imgSize = 50
    svg += `<rect x="${x}" y="${y}" width="${imgSize}" height="${h}" rx="3" fill="#DBD0C6"/>`
    svg += `<line x1="${x + imgSize}" y1="${y}" x2="${x + imgSize}" y2="${y + h}" stroke="${stroke}" stroke-width="1"/>`
    if (data.imageSrc) {
      const clipId = `clip-simg-${node.id}`
      svg += `<clipPath id="${clipId}"><rect x="${x}" y="${y}" width="${imgSize}" height="${h}" rx="3"/></clipPath>`
      svg += `<image x="${x}" y="${y}" width="${imgSize}" height="${h}" href="${escXml(data.imageSrc)}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clipId})"/>`
    } else {
      svg += `<g transform="translate(${x + imgSize / 2 - 12},${y + h / 2 - 12})">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="#A99482" stroke-width="1.5"/>
        <circle cx="8.5" cy="8.5" r="1.5" fill="#A99482"/>
        <path d="M21 15l-5-5L5 21" fill="none" stroke="#A99482" stroke-width="1.5"/>
      </g>`
    }
    // Title on right
    const label = escXml(data.label || '')
    if (label) {
      svg += `<text x="${x + imgSize + (w - imgSize) / 2}" y="${y + h / 2 + 8}" text-anchor="middle" fill="#655343" font-size="13" font-weight="700">${label}</text>`
    }
  } else if (type === 'miniTitleNode' || type === 'titleNode' || type === 'largeTitleNode') {
    const label = escXml(data.label || '')
    if (label) {
      svg += `<text x="${x + w / 2}" y="${y + h / 2 + 8}" text-anchor="middle" fill="#655343" font-size="13" font-weight="700">${label}</text>`
    }
  } else if (type === 'textNode') {
    // Clip content to node bounds
    const clipId = `clip-${node.id}`
    svg += `<clipPath id="${clipId}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}"/></clipPath>`
    svg += `<g clip-path="url(#${clipId})">`
    const label = escXml(data.label || '')
    if (label) svg += `<text x="${x + 14}" y="${y + 26}" fill="#655343" font-size="13" font-weight="700">${label}</text>`
    if (data.body) {
      wrapText(data.body, 24).forEach((line, i) => {
        svg += `<text x="${x + 14}" y="${y + 46 + i * 16}" fill="#7A6E63" font-size="11">${escXml(line)}</text>`
      })
    }
    svg += `</g>`
  } else if (type === 'logoNode') {
    if (data.imageSrc) {
      // Embed uploaded image
      svg += `<image x="${x + 25}" y="${y + 25}" width="${w - 50}" height="${h - 50}" href="${escXml(data.imageSrc)}" preserveAspectRatio="xMidYMid meet"/>`
    } else {
      // Default chevron logo
      svg += `<g transform="translate(${x},${y}) scale(${w / 250})">
        <path d="M126.365 58.1094L200.437 102.011L180.626 129.745L124.758 96.6309L68.8887 129.745L49.0781 102.011L124.758 57.1572L126.365 58.1094Z" fill="white" stroke="#1D1A19"/>
        <path d="M129.001 108.437L175.968 136.271L156.159 164.005L124.761 145.397L93.3623 164.005L73.5537 136.271L124.761 105.92L129.001 108.437Z" fill="white" stroke="#1D1A19"/>
        <path d="M124.859 154.743L151.495 170.531L135.766 192.555L124.76 186.033L113.754 192.555L98.0234 170.531L124.76 154.685L124.859 154.743Z" fill="white" stroke="#1D1A19"/>
        <line x1="125.588" y1="57.305" x2="125.588" y2="97.572" stroke="#1D1A19"/>
        <line x1="125.588" y1="106.383" x2="125.588" y2="146.751" stroke="#1D1A19"/>
        <line x1="125.588" y1="155.406" x2="125.588" y2="187.721" stroke="#1D1A19"/>
      </g>`
    }
  } else if (type === 'imageNode') {
    const label = escXml(data.label || '')
    if (label) svg += `<text x="${x + 12}" y="${y + 22}" fill="#655343" font-size="13" font-weight="700">${label}</text>`
    if (data.imageSrc) {
      svg += `<rect x="${x + 10}" y="${y + 34}" width="${w - 20}" height="${h - 44}" rx="3" fill="#EDE7E0" stroke="#A99482" stroke-width="1"/>`
      const clipId = `clip-img-${node.id}`
      svg += `<clipPath id="${clipId}"><rect x="${x + 10}" y="${y + 34}" width="${w - 20}" height="${h - 44}" rx="6"/></clipPath>`
      svg += `<image x="${x + 10}" y="${y + 34}" width="${w - 20}" height="${h - 44}" href="${escXml(data.imageSrc)}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clipId})"/>`
    } else {
      svg += `<rect x="${x + 10}" y="${y + 34}" width="${w - 20}" height="${h - 44}" rx="3" fill="#EDE7E0" stroke="#A99482" stroke-width="1"/>`
      svg += `<g transform="translate(${x + w / 2 - 24},${y + h / 2 - 12})">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="#A99482" stroke-width="1.5"/>
        <circle cx="8.5" cy="8.5" r="1.5" fill="#655343"/>
        <path d="M21 15l-5-5L5 21" fill="none" stroke="#A99482" stroke-width="1.5"/>
      </g>`
    }
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

  // Filter out canvas frame, bridge nodes, and any unknown special nodes
  const nodes = allNodes.filter(n =>
    n.id !== CANVAS_ID &&
    !n.id?.startsWith('bridge-') &&
    nodeDims[n.type]
  )

  const nodesMap = {}
  for (const n of allNodes) nodesMap[n.id] = n

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${canvasW}" height="${canvasH}" viewBox="0 0 ${canvasW} ${canvasH}">
<defs>
  <style>
    text { font-family: 'Inter', 'SwissNow', sans-serif; }
  </style>
</defs>
<rect width="${canvasW}" height="${canvasH}" fill="white"/>
`

  // Edges behind nodes
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
