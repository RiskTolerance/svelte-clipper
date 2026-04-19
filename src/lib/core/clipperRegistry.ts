type Entry = {
	el: SVGGraphicsElement | null
	subscribers: Set<() => void>
}

const entries = new Map<string, Entry>()

function ensure(id: string): Entry {
	let e = entries.get(id)
	if (!e) {
		e = { el: null, subscribers: new Set() }
		entries.set(id, e)
	}
	return e
}

export function registerClipper(id: string, el: SVGGraphicsElement): void {
	const e = ensure(id)
	e.el = el
	e.subscribers.forEach((s) => s())
}

export function unregisterClipper(id: string, el: SVGGraphicsElement): void {
	const e = entries.get(id)
	if (!e || e.el !== el) return
	e.el = null
	e.subscribers.forEach((s) => s())
}

export function getClipperEl(id: string): SVGGraphicsElement | null {
	return entries.get(id)?.el ?? null
}

export function subscribeClipper(id: string, cb: () => void): () => void {
	const e = ensure(id)
	e.subscribers.add(cb)
	if (e.el) queueMicrotask(cb)
	return () => {
		e.subscribers.delete(cb)
	}
}

export function notifyClipper(id: string): void {
	entries.get(id)?.subscribers.forEach((s) => s())
}
