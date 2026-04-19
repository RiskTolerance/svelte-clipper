export type Cleanup = () => void

export function observeLayout(callback: () => void, targets: Element[] = []): Cleanup {
	let rafId: number | undefined
	const schedule = () => {
		if (rafId !== undefined) cancelAnimationFrame(rafId)
		rafId = requestAnimationFrame(callback)
	}
	const ro = new ResizeObserver(schedule)
	ro.observe(document.documentElement)
	for (const t of targets) ro.observe(t)
	window.addEventListener('scroll', schedule, { passive: true, capture: true })
	return () => {
		ro.disconnect()
		window.removeEventListener('scroll', schedule, { capture: true } as EventListenerOptions)
		if (rafId !== undefined) cancelAnimationFrame(rafId)
	}
}
