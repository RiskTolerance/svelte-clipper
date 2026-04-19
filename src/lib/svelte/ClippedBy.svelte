<script lang="ts">
	import type { Snippet } from 'svelte'
	import { shapeToPath } from '$lib/core/clipPath.js'
	import { observeLayout } from '$lib/core/observe.js'
	import { getClipperEl, subscribeClipper } from '$lib/core/clipperRegistry.js'

	type Props = {
		clipper: string | string[]
		mode?: 'clip' | 'subtract'
		class?: string
		children: Snippet
	}

	let { clipper, mode = 'clip', class: className, children }: Props = $props()

	let wrapper: HTMLElement | undefined = $state()
	let shapeD = $state('')
	let w = $state(0)
	let h = $state(0)

	const clipId = `clip-${Math.random().toString(36).slice(2, 10)}`
	let ids = $derived(Array.isArray(clipper) ? clipper : [clipper])

	function update() {
		if (!wrapper) return
		const rect = wrapper.getBoundingClientRect()
		w = rect.width
		h = rect.height
		let d = ''
		for (const id of ids) {
			const shape = getClipperEl(id)
			if (!shape) continue
			const sourceCTM = shape.getScreenCTM()
			if (!sourceCTM) continue
			const m = new DOMMatrix().translateSelf(-rect.left, -rect.top).multiply(sourceCTM)
			const part = shapeToPath(shape, m)
			if (part) d += (d ? ' ' : '') + part
		}
		shapeD = d
	}

	function scheduleUpdate() {
		requestAnimationFrame(update)
	}

	$effect(() => observeLayout(scheduleUpdate, wrapper ? [wrapper] : []))
	$effect(() => {
		const unsubs = ids.map((id) => subscribeClipper(id, scheduleUpdate))
		return () => unsubs.forEach((u) => u())
	})

	let clipD = $derived(mode === 'subtract' ? `M 0,0 H ${w} V ${h} H 0 Z ${shapeD}` : shapeD)
</script>

<div bind:this={wrapper} class={className} style="clip-path: url(#{clipId})">
	{@render children()}
</div>

<svg
	class="clip-defs"
	xmlns="http://www.w3.org/2000/svg"
	aria-hidden="true"
>
	<defs>
		<clipPath id={clipId} clipPathUnits="userSpaceOnUse">
			<path clip-rule="evenodd" d={clipD} />
		</clipPath>
	</defs>
</svg>

<style>
	.clip-defs {
		position: absolute;
		width: 0;
		height: 0;
		overflow: hidden;
		pointer-events: none;
	}
</style>
