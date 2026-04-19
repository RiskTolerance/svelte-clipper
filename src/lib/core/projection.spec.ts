import './dommatrix-polyfill.js'
import { describe, it, expect } from 'vitest'
import {
	composeProjection,
	projectPoint,
	extractScale,
	projectEllipse,
	isRotationFree
} from './projection.js'

const EPSILON = 1e-10
const near = (a: number, b: number) => Math.abs(a - b) < EPSILON

describe('projectPoint', () => {
	it('identity matrix returns same coordinates', () => {
		const result = projectPoint({ x: 10, y: 20 }, new DOMMatrix())
		expect(result.x).toBe(10)
		expect(result.y).toBe(20)
	})

	it('pure translation shifts point correctly', () => {
		const m = new DOMMatrix([1, 0, 0, 1, 50, 100])
		const result = projectPoint({ x: 10, y: 20 }, m)
		expect(result.x).toBe(60)
		expect(result.y).toBe(120)
	})

	it('non-uniform scale transforms point correctly', () => {
		const m = new DOMMatrix([2, 0, 0, 3, 0, 0])
		const result = projectPoint({ x: 5, y: 4 }, m)
		expect(result.x).toBe(10)
		expect(result.y).toBe(12)
	})
})

describe('extractScale', () => {
	it('returns sx=1, sy=1 for identity', () => {
		const { sx, sy } = extractScale(new DOMMatrix())
		expect(sx).toBe(1)
		expect(sy).toBe(1)
	})

	it('extracts non-uniform scale', () => {
		const { sx, sy } = extractScale(new DOMMatrix([3, 0, 0, 4, 0, 0]))
		expect(sx).toBe(3)
		expect(sy).toBe(4)
	})
})

describe('projectEllipse', () => {
	it('identity matrix returns same ellipse', () => {
		const result = projectEllipse({ cx: 100, cy: 200, rx: 50, ry: 30 }, new DOMMatrix())
		expect(result.cx).toBe(100)
		expect(result.cy).toBe(200)
		expect(result.rx).toBe(50)
		expect(result.ry).toBe(30)
	})

	it('pure translation shifts center, radii unchanged', () => {
		const m = new DOMMatrix([1, 0, 0, 1, 40, 80])
		const result = projectEllipse({ cx: 100, cy: 200, rx: 50, ry: 30 }, m)
		expect(result.cx).toBe(140)
		expect(result.cy).toBe(280)
		expect(result.rx).toBe(50)
		expect(result.ry).toBe(30)
	})

	it('non-uniform scale transforms center and radii', () => {
		const m = new DOMMatrix([2, 0, 0, 3, 10, 20])
		const result = projectEllipse({ cx: 100, cy: 50, rx: 40, ry: 25 }, m)
		expect(result.cx).toBe(210)
		expect(result.cy).toBe(170)
		expect(result.rx).toBe(80)
		expect(result.ry).toBe(75)
	})

	it('zero-size ellipse remains zero-size', () => {
		const result = projectEllipse({ cx: 0, cy: 0, rx: 0, ry: 0 }, new DOMMatrix([2, 0, 0, 2, 5, 10]))
		expect(result.rx).toBe(0)
		expect(result.ry).toBe(0)
	})

	it('negative scale produces positive radii', () => {
		const m = new DOMMatrix([-1, 0, 0, -1, 0, 0])
		const result = projectEllipse({ cx: 50, cy: 60, rx: 20, ry: 15 }, m)
		expect(result.rx).toBe(20)
		expect(result.ry).toBe(15)
	})
})

describe('composeProjection', () => {
	it('identity source and target returns identity-effect matrix', () => {
		const m = composeProjection(new DOMMatrix(), new DOMMatrix())
		const result = projectPoint({ x: 30, y: 40 }, m)
		expect(near(result.x, 30)).toBe(true)
		expect(near(result.y, 40)).toBe(true)
	})

	it('two translation matrices compound correctly', () => {
		// sourceCTM: SVG at viewport (100,200); targetCTM: SVG at viewport (50,80)
		// source-local (0,0) → viewport (100,200) → target-local (50,120)
		const m = composeProjection(
			new DOMMatrix([1, 0, 0, 1, 100, 200]),
			new DOMMatrix([1, 0, 0, 1, 50, 80])
		)
		const result = projectPoint({ x: 0, y: 0 }, m)
		expect(near(result.x, 50)).toBe(true)
		expect(near(result.y, 120)).toBe(true)
	})

	it('viewport-space source (identity CTM) projects into SVG at offset', () => {
		// Shape at viewport (500,300), SVG offset at (300,150) → local (200,150)
		const m = composeProjection(new DOMMatrix(), new DOMMatrix([1, 0, 0, 1, 300, 150]))
		const result = projectPoint({ x: 500, y: 300 }, m)
		expect(near(result.x, 200)).toBe(true)
		expect(near(result.y, 150)).toBe(true)
	})

	it('same viewport ellipse projects to correct local coords in two different SVG spaces', () => {
		const vpEllipse = { cx: 600, cy: 300, rx: 200, ry: 80 }
		const m1 = composeProjection(new DOMMatrix(), new DOMMatrix([1, 0, 0, 1, 100, 50]))
		const m2 = composeProjection(new DOMMatrix(), new DOMMatrix([1, 0, 0, 1, 700, 50]))

		const e1 = projectEllipse(vpEllipse, m1)
		const e2 = projectEllipse(vpEllipse, m2)

		expect(near(e1.cx, 500)).toBe(true)
		expect(near(e1.cy, 250)).toBe(true)
		expect(near(e2.cx, -100)).toBe(true)
		expect(near(e2.cy, 250)).toBe(true)
		expect(near(e1.rx, 200)).toBe(true)
		expect(near(e2.rx, 200)).toBe(true)
	})
})

describe('isRotationFree', () => {
	it('identity matrix has no rotation', () => {
		expect(isRotationFree(new DOMMatrix())).toBe(true)
	})

	it('pure translate+scale has no rotation', () => {
		expect(isRotationFree(new DOMMatrix([2, 0, 0, 3, 10, 20]))).toBe(true)
	})

	it('matrix with b/c components has rotation', () => {
		const cos30 = Math.cos(Math.PI / 6)
		const sin30 = Math.sin(Math.PI / 6)
		expect(isRotationFree(new DOMMatrix([cos30, sin30, -sin30, cos30, 0, 0]))).toBe(false)
	})
})
