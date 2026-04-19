<script lang="ts">
	import type { Snippet } from 'svelte'
	import { registerClipper, unregisterClipper, notifyClipper } from '$lib/core/clipperRegistry.js'
	import { SUPPORTED_SHAPE_TAGS } from '$lib/core/clipPath.js'

	type Props = {
		id: string
		/** Show a dashed outline around the shape for design-time debugging. */
		preview?: boolean
		/** Run a per-frame update loop — use when the ref is animated via CSS (transitions, keyframes). */
		live?: boolean
		children: Snippet
	}

	let { id, preview = false, live = false, children }: Props = $props()

	let wrapper: HTMLElement | undefined = $state()

	$effect(() => {
		if (!wrapper) return
		const shape = wrapper.querySelector(
			SUPPORTED_SHAPE_TAGS.join(',')
		) as SVGGraphicsElement | null
		if (!shape) return
		registerClipper(id, shape)
		const ro = new ResizeObserver(() => notifyClipper(id))
		ro.observe(shape)
		const mo = new MutationObserver(() => notifyClipper(id))
		mo.observe(shape, { attributes: true })
		return () => {
			ro.disconnect()
			mo.disconnect()
			unregisterClipper(id, shape)
		}
	})

	$effect(() => {
		if (!live) return
		let rafId: number
		const tick = () => {
			notifyClipper(id)
			rafId = requestAnimationFrame(tick)
		}
		rafId = requestAnimationFrame(tick)
		return () => cancelAnimationFrame(rafId)
	})
</script>

<div bind:this={wrapper} class:preview class="clipper">
	{@render children()}
</div>

<style>
	.clipper {
		display: contents;
	}

	.clipper :global(ellipse),
	.clipper :global(circle),
	.clipper :global(rect),
	.clipper :global(polygon),
	.clipper :global(polyline),
	.clipper :global(path) {
		fill: transparent;
		stroke: none;
	}

	.preview :global(ellipse),
	.preview :global(circle),
	.preview :global(rect),
	.preview :global(polygon),
	.preview :global(polyline),
	.preview :global(path) {
		fill: rgba(0, 0, 0, 0.04);
		stroke: rgba(0, 0, 0, 0.55);
		stroke-width: 2;
		stroke-dasharray: 6 4;
		vector-effect: non-scaling-stroke;
	}
</style>
