import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { observeLayout } from './observe.js'

type ROCallback = (entries: ResizeObserverEntry[], observer: ResizeObserver) => void

class MockResizeObserver {
	static instances: MockResizeObserver[] = []
	callback: ROCallback
	observed: Element[] = []
	disconnected = false

	constructor(cb: ROCallback) {
		this.callback = cb
		MockResizeObserver.instances.push(this)
	}
	observe(el: Element) {
		this.observed.push(el)
	}
	unobserve(el: Element) {
		this.observed = this.observed.filter((e) => e !== el)
	}
	disconnect() {
		this.disconnected = true
	}
	trigger() {
		this.callback([], this as unknown as ResizeObserver)
	}
}

describe('observeLayout', () => {
	let rafCallbacks: FrameRequestCallback[] = []
	let cancelledIds: number[] = []

	beforeEach(() => {
		MockResizeObserver.instances = []
		rafCallbacks = []
		cancelledIds = []
		vi.stubGlobal('ResizeObserver', MockResizeObserver)
		vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
			rafCallbacks.push(cb)
			return rafCallbacks.length
		})
		vi.stubGlobal('cancelAnimationFrame', (id: number) => {
			cancelledIds.push(id)
		})
		vi.stubGlobal('document', { documentElement: {} as Element })
	})

	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it('observes document.documentElement plus provided targets', () => {
		const t1 = {} as Element
		const t2 = {} as Element
		observeLayout(() => {}, [t1, t2])
		const ro = MockResizeObserver.instances[0]
		expect(ro.observed).toHaveLength(3)
		expect(ro.observed).toContain(t1)
		expect(ro.observed).toContain(t2)
	})

	it('schedules callback via rAF when observer fires', () => {
		const cb = vi.fn()
		observeLayout(cb)
		const ro = MockResizeObserver.instances[0]
		ro.trigger()
		expect(cb).not.toHaveBeenCalled()
		rafCallbacks[0](0)
		expect(cb).toHaveBeenCalledOnce()
	})

	it('coalesces multiple triggers into a single rAF', () => {
		const cb = vi.fn()
		observeLayout(cb)
		const ro = MockResizeObserver.instances[0]
		ro.trigger()
		ro.trigger()
		ro.trigger()
		expect(cancelledIds).toHaveLength(2)
		rafCallbacks[rafCallbacks.length - 1](0)
		expect(cb).toHaveBeenCalledOnce()
	})

	it('cleanup disconnects observer and cancels pending rAF', () => {
		const cleanup = observeLayout(() => {})
		const ro = MockResizeObserver.instances[0]
		ro.trigger()
		cleanup()
		expect(ro.disconnected).toBe(true)
		expect(cancelledIds).toContain(1)
	})
})
