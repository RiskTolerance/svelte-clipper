class PolyfillDOMPoint {
	x: number
	y: number
	z: number
	w: number

	constructor(x = 0, y = 0, z = 0, w = 1) {
		this.x = x
		this.y = y
		this.z = z
		this.w = w
	}
}

class PolyfillDOMMatrix {
	a: number
	b: number
	c: number
	d: number
	e: number
	f: number

	constructor(init?: number[]) {
		if (!init) {
			this.a = 1
			this.b = 0
			this.c = 0
			this.d = 1
			this.e = 0
			this.f = 0
		} else {
			this.a = init[0]
			this.b = init[1]
			this.c = init[2]
			this.d = init[3]
			this.e = init[4]
			this.f = init[5]
		}
	}

	multiply(other: PolyfillDOMMatrix): PolyfillDOMMatrix {
		return new PolyfillDOMMatrix([
			this.a * other.a + this.c * other.b,
			this.b * other.a + this.d * other.b,
			this.a * other.c + this.c * other.d,
			this.b * other.c + this.d * other.d,
			this.a * other.e + this.c * other.f + this.e,
			this.b * other.e + this.d * other.f + this.f
		])
	}

	inverse(): PolyfillDOMMatrix {
		const det = this.a * this.d - this.b * this.c
		if (det === 0) throw new Error('Matrix is not invertible')
		const r = 1 / det
		return new PolyfillDOMMatrix([
			this.d * r,
			-this.b * r,
			-this.c * r,
			this.a * r,
			(this.c * this.f - this.d * this.e) * r,
			(this.b * this.e - this.a * this.f) * r
		])
	}

	transformPoint(point: PolyfillDOMPoint): PolyfillDOMPoint {
		return new PolyfillDOMPoint(
			this.a * point.x + this.c * point.y + this.e,
			this.b * point.x + this.d * point.y + this.f
		)
	}
}

;(globalThis as Record<string, unknown>).DOMMatrix = PolyfillDOMMatrix
;(globalThis as Record<string, unknown>).DOMPoint = PolyfillDOMPoint
