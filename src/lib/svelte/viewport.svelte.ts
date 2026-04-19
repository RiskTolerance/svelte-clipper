export function viewport() {
	let width = $state(typeof window !== 'undefined' ? window.innerWidth : 0)
	let height = $state(typeof window !== 'undefined' ? window.innerHeight : 0)

	$effect(() => {
		const update = () => {
			width = window.innerWidth
			height = window.innerHeight
		}
		update()
		const ro = new ResizeObserver(update)
		ro.observe(document.documentElement)
		return () => ro.disconnect()
	})

	return {
		get width() {
			return width
		},
		get height() {
			return height
		},
		get cx() {
			return width / 2
		},
		get cy() {
			return height / 2
		}
	}
}
