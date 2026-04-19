import type { Point, Ellipse } from './shapes.js'

const ROTATION_EPSILON = 1e-10

export function composeProjection(sourceCTM: DOMMatrix, targetCTM: DOMMatrix): DOMMatrix {
	return targetCTM.inverse().multiply(sourceCTM)
}

export function projectPoint(point: Point, matrix: DOMMatrix): Point {
	return {
		x: matrix.a * point.x + matrix.c * point.y + matrix.e,
		y: matrix.b * point.x + matrix.d * point.y + matrix.f
	}
}

export function extractScale(matrix: DOMMatrix): { sx: number; sy: number } {
	return { sx: matrix.a, sy: matrix.d }
}

export function projectEllipse(ellipse: Ellipse, matrix: DOMMatrix): Ellipse {
	return {
		cx: matrix.a * ellipse.cx + matrix.e,
		cy: matrix.d * ellipse.cy + matrix.f,
		rx: ellipse.rx * Math.abs(matrix.a),
		ry: ellipse.ry * Math.abs(matrix.d)
	}
}

export function isRotationFree(matrix: DOMMatrix): boolean {
	return Math.abs(matrix.b) < ROTATION_EPSILON && Math.abs(matrix.c) < ROTATION_EPSILON
}
