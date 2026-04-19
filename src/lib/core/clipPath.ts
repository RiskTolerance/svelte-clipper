import { projectPoint, projectEllipse } from './projection.js'

function ellipseSubpath(cx: number, cy: number, rx: number, ry: number): string {
	return `M ${cx - rx},${cy} A ${rx},${ry},0,1,0,${cx + rx},${cy} A ${rx},${ry},0,1,0,${cx - rx},${cy} Z`
}

function parsePoints(attr: string | null): number[] {
	if (!attr) return []
	return attr
		.trim()
		.split(/[\s,]+/)
		.filter(Boolean)
		.map(Number)
}

/**
 * Convert an SVG shape element's geometry into a path `d` string, projected
 * through the given affine matrix. Supports: ellipse, circle, rect, polygon, polyline.
 * Returns empty string for unsupported element types.
 */
export const SUPPORTED_SHAPE_TAGS = [
	'ellipse',
	'circle',
	'rect',
	'polygon',
	'polyline',
	'path'
] as const

export function shapeToPath(el: SVGGraphicsElement, matrix: DOMMatrix): string {
	const tag = el.tagName.toLowerCase()

	if (tag === 'svg' || tag === 'g') {
		const shapes = (el as Element).querySelectorAll(SUPPORTED_SHAPE_TAGS.join(','))
		let out = ''
		for (const s of Array.from(shapes)) {
			const part = shapeToPath(s as SVGGraphicsElement, matrix)
			if (part) out += (out ? ' ' : '') + part
		}
		return out
	}

	if (tag === 'ellipse') {
		const cx = parseFloat(el.getAttribute('cx') || '0')
		const cy = parseFloat(el.getAttribute('cy') || '0')
		const rx = parseFloat(el.getAttribute('rx') || '0')
		const ry = parseFloat(el.getAttribute('ry') || '0')
		const p = projectEllipse({ cx, cy, rx, ry }, matrix)
		return ellipseSubpath(p.cx, p.cy, p.rx, p.ry)
	}

	if (tag === 'circle') {
		const cx = parseFloat(el.getAttribute('cx') || '0')
		const cy = parseFloat(el.getAttribute('cy') || '0')
		const r = parseFloat(el.getAttribute('r') || '0')
		const p = projectEllipse({ cx, cy, rx: r, ry: r }, matrix)
		return ellipseSubpath(p.cx, p.cy, p.rx, p.ry)
	}

	if (tag === 'rect') {
		const x = parseFloat(el.getAttribute('x') || '0')
		const y = parseFloat(el.getAttribute('y') || '0')
		const w = parseFloat(el.getAttribute('width') || '0')
		const h = parseFloat(el.getAttribute('height') || '0')
		const p1 = projectPoint({ x, y }, matrix)
		const p2 = projectPoint({ x: x + w, y }, matrix)
		const p3 = projectPoint({ x: x + w, y: y + h }, matrix)
		const p4 = projectPoint({ x, y: y + h }, matrix)
		return `M ${p1.x},${p1.y} L ${p2.x},${p2.y} L ${p3.x},${p3.y} L ${p4.x},${p4.y} Z`
	}

	if (tag === 'path') {
		const dAttr = el.getAttribute('d') || ''
		const subpaths = dAttr.match(/[Mm][^Mm]*/g) || []
		if (!subpaths.length) return ''
		const ns = 'http://www.w3.org/2000/svg'
		const scale = Math.max(
			Math.hypot(matrix.a, matrix.b),
			Math.hypot(matrix.c, matrix.d)
		)
		let out = ''
		for (const sub of subpaths) {
			const temp = document.createElementNS(ns, 'path') as SVGPathElement
			temp.setAttribute('d', sub)
			const total = temp.getTotalLength?.() ?? 0
			if (total <= 0) continue
			const projectedLength = total * scale
			const samples = Math.max(32, Math.ceil(projectedLength / 2))
			for (let i = 0; i <= samples; i++) {
				const pt = temp.getPointAtLength((i / samples) * total)
				const p = projectPoint({ x: pt.x, y: pt.y }, matrix)
				out += (i === 0 ? ' M' : ' L') + ` ${p.x},${p.y}`
			}
			out += ' Z'
		}
		return out.trim()
	}

	if (tag === 'polygon' || tag === 'polyline') {
		const pts = parsePoints(el.getAttribute('points'))
		if (pts.length < 4) return ''
		let d = ''
		for (let i = 0; i < pts.length - 1; i += 2) {
			const p = projectPoint({ x: pts[i], y: pts[i + 1] }, matrix)
			d += (i === 0 ? 'M' : ' L') + ` ${p.x},${p.y}`
		}
		return d + (tag === 'polygon' ? ' Z' : '')
	}

	return ''
}
