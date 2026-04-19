<script lang="ts">
	import { onMount } from 'svelte'
	import { composeProjection, projectEllipse } from '$lib/core/projection.js'
	import type { Ellipse } from '$lib/core/shapes.js'

	// Reference ellipse lives in the ref-layer SVG, whose local coords === viewport coords.
	// Size is static. Center X tracks the viewport center (dynamic), center Y is fixed.
	const REF_RX = 320
	const REF_RY = 240
	const REF_CY = 400

	type TargetState = {
		width: number
		height: number
		ellipse: Ellipse
	}

	const zero: TargetState = { width: 0, height: 0, ellipse: { cx: 0, cy: 0, rx: 0, ry: 0 } }

	let refAnchor: SVGSVGElement
	let hero: SVGSVGElement
	let card: SVGSVGElement

	let refCx = $state(0)
	let heroState: TargetState = $state({ ...zero })
	let cardState: TargetState = $state({ ...zero })

	function project(target: SVGSVGElement, refEllipse: Ellipse): TargetState {
		const sourceCTM = refAnchor.getScreenCTM()
		const targetCTM = target.getScreenCTM()
		if (!sourceCTM || !targetCTM) return { ...zero }
		const m = composeProjection(sourceCTM, targetCTM)
		const rect = target.getBoundingClientRect()
		return {
			width: rect.width,
			height: rect.height,
			ellipse: projectEllipse(refEllipse, m)
		}
	}

	function update() {
		if (!refAnchor || !hero || !card) return
		refCx = window.innerWidth / 2
		const ref: Ellipse = { cx: refCx, cy: REF_CY, rx: REF_RX, ry: REF_RY }
		heroState = project(hero, ref)
		cardState = project(card, ref)
	}

	let rafId: number | undefined

	function scheduleUpdate() {
		if (rafId !== undefined) cancelAnimationFrame(rafId)
		rafId = requestAnimationFrame(update)
	}

	onMount(() => update())

	$effect(() => {
		const ro = new ResizeObserver(scheduleUpdate)
		ro.observe(document.documentElement)
		return () => {
			ro.disconnect()
			if (rafId !== undefined) cancelAnimationFrame(rafId)
		}
	})

	function ellipseSubpath(cx: number, cy: number, rx: number, ry: number): string {
		return `M ${cx - rx},${cy} A ${rx},${ry},0,1,0,${cx + rx},${cy} A ${rx},${ry},0,1,0,${cx - rx},${cy} Z`
	}

	function fillPath(s: TargetState): string {
		return ellipseSubpath(s.ellipse.cx, s.ellipse.cy, s.ellipse.rx, s.ellipse.ry)
	}

	function holePath(s: TargetState): string {
		const outer = `M 0,0 H ${s.width} V ${s.height} H 0 Z`
		return `${outer} ${ellipseSubpath(s.ellipse.cx, s.ellipse.cy, s.ellipse.rx, s.ellipse.ry)}`
	}
</script>

<!--
	The ref anchor: an ordinary SVG element positioned over the whole viewport.
	Its getScreenCTM() is the source of truth for "viewport space". The <ellipse>
	inside it is a real DOM node — visible for debugging, and its position drives
	what the targets project.
-->
<svg
	bind:this={refAnchor}
	class="ref-layer"
	xmlns="http://www.w3.org/2000/svg"
	aria-hidden="true"
>
	<ellipse cx={refCx} cy={REF_CY} rx={REF_RX} ry={REF_RY} class="ref-debug" />
</svg>

<div class="page">
	<svg
		bind:this={hero}
		class="svg-hero"
		height="380"
		xmlns="http://www.w3.org/2000/svg"
		aria-label="Hero clipped to the ref ellipse"
	>
		<defs>
			<clipPath id="clip-hero-ra"><path d={fillPath(heroState)} /></clipPath>
		</defs>
		<rect width="100%" height="100%" fill="#b5451b" clip-path="url(#clip-hero-ra)" />
		<text x="16" y="22" class="tag">hero ∩ ref (additive)</text>
	</svg>

	<svg
		bind:this={card}
		class="svg-card"
		height="320"
		xmlns="http://www.w3.org/2000/svg"
		aria-label="Card with the ref ellipse subtracted"
	>
		<defs>
			<clipPath id="clip-card-ra"><path clip-rule="evenodd" d={holePath(cardState)} /></clipPath>
		</defs>
		<rect width="100%" height="100%" fill="#1b5fa8" clip-path="url(#clip-card-ra)" />
		<text x="16" y="22" class="tag">card − ref (subtractive)</text>
	</svg>
</div>

<style>
	:global(body) {
		margin: 0;
		background: repeating-linear-gradient(
			-45deg,
			#ebebeb,
			#ebebeb 8px,
			#e0e0e0 8px,
			#e0e0e0 16px
		);
		font-family: system-ui, sans-serif;
	}

	/* The ref layer overlays the entire viewport. Its local coords match viewport coords. */
	.ref-layer {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		pointer-events: none;
		z-index: 100;
	}

	/* Visible debug outline of the ref ellipse — set opacity to 0 for production. */
	.ref-debug {
		fill: rgba(0, 0, 0, 0.04);
		stroke: rgba(0, 0, 0, 0.55);
		stroke-width: 2;
		stroke-dasharray: 6 4;
	}

	.page {
		display: flex;
		flex-direction: column;
	}

	.svg-hero {
		width: 100%;
		display: block;
	}

	.svg-card {
		width: 640px;
		display: block;
		margin: 0 auto;
	}

	.tag {
		font-size: 11px;
		font-family: monospace;
		fill: rgba(255, 255, 255, 0.45);
	}
</style>
