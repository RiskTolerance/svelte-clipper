<script lang="ts">
	import { onMount, type Snippet } from 'svelte'
	import { composeProjection } from '$lib/core/projection.js'
	import { observeLayout } from '$lib/core/observe.js'
	import { shapeToPath } from '$lib/core/clipPath.js'

	type Props = {
		ref: SVGGraphicsElement | undefined
		mode?: 'clip' | 'subtract'
		width?: number | string
		height: number | string
		fill?: string
		class?: string
		children?: Snippet
	}

	let {
		ref,
		mode = 'clip',
		width = '100%',
		height,
		fill,
		class: className,
		children
	}: Props = $props()

	let svgEl: SVGSVGElement
	let w = $state(0)
	let h = $state(0)
	let shapeD = $state('')

	const clipId = `clip-${Math.random().toString(36).slice(2, 10)}`

	function update() {
		if (!svgEl || !ref) return
		const sourceCTM = ref.getScreenCTM()
		const targetCTM = svgEl.getScreenCTM()
		if (!sourceCTM || !targetCTM) return
		const m = composeProjection(sourceCTM, targetCTM)
		const rect = svgEl.getBoundingClientRect()
		w = rect.width
		h = rect.height
		shapeD = shapeToPath(ref, m)
	}

	function scheduleUpdate() {
		requestAnimationFrame(update)
	}

	onMount(scheduleUpdate)

	$effect(() => {
		void ref
		scheduleUpdate()
	})

	$effect(() => observeLayout(scheduleUpdate, svgEl ? [svgEl] : []))

	$effect(() => {
		if (!ref) return
		const mo = new MutationObserver(scheduleUpdate)
		mo.observe(ref, { attributes: true })
		return () => mo.disconnect()
	})

	let clipD = $derived(
		mode === 'subtract' ? `M 0,0 H ${w} V ${h} H 0 Z ${shapeD}` : shapeD
	)
</script>

<svg
	bind:this={svgEl}
	{width}
	{height}
	xmlns="http://www.w3.org/2000/svg"
	class={className}
>
	<defs>
		<clipPath id={clipId}><path clip-rule="evenodd" d={clipD} /></clipPath>
	</defs>
	<g clip-path="url(#{clipId})">
		{#if fill}
			<rect width="100%" height="100%" {fill} />
		{/if}
		{@render children?.()}
	</g>
</svg>
