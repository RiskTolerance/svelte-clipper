<script lang="ts">
	import { onMount } from 'svelte'

	// Viewport-space ellipse definition — fixed center, fixed size.
	// Ellipse B is concentric with A and proportional (½ × A).
	const ELLIPSE_CX = 500
	const ELLIPSE_CY = 380
	const A_RX = 380
	const A_RY = 280
	const B_RATIO = 0.5
	const B_RX = A_RX * B_RATIO
	const B_RY = A_RY * B_RATIO

	type ClipState = {
		width: number
		height: number
		cx: number
		cy: number
		rx: number
		ry: number
	}

	const zero: ClipState = { width: 0, height: 0, cx: 0, cy: 0, rx: 0, ry: 0 }

	let svgHero: SVGSVGElement
	let svgCard: SVGSVGElement

	let heroClip: ClipState = $state({ ...zero })
	let cardClip: ClipState = $state({ ...zero })

	function ellipseSubpath(cx: number, cy: number, rx: number, ry: number): string {
		return `M ${cx - rx},${cy} A ${rx},${ry},0,1,0,${cx + rx},${cy} A ${rx},${ry},0,1,0,${cx - rx},${cy} Z`
	}

	// Additive: the ellipse alone — only the ellipse region of the element is visible.
	function fillPath(s: ClipState): string {
		return ellipseSubpath(s.cx, s.cy, s.rx, s.ry)
	}

	// Subtractive: outer rect with the ellipse carved out via evenodd — ellipse region is hidden.
	function holePath(s: ClipState): string {
		const rect = `M 0,0 H ${s.width} V ${s.height} H 0 Z`
		return `${rect} ${ellipseSubpath(s.cx, s.cy, s.rx, s.ry)}`
	}

	function update() {
		if (!svgHero || !svgCard) return

		const heroRect = svgHero.getBoundingClientRect()
		const cardRect = svgCard.getBoundingClientRect()

		heroClip = {
			width: heroRect.width,
			height: heroRect.height,
			cx: ELLIPSE_CX - heroRect.left,
			cy: ELLIPSE_CY - heroRect.top,
			rx: A_RX,
			ry: A_RY
		}

		cardClip = {
			width: cardRect.width,
			height: cardRect.height,
			cx: ELLIPSE_CX - cardRect.left,
			cy: ELLIPSE_CY - cardRect.top,
			rx: B_RX,
			ry: B_RY
		}
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
</script>

<div class="page">
	<svg
		bind:this={svgHero}
		class="svg-hero"
		height="380"
		xmlns="http://www.w3.org/2000/svg"
		aria-label="Hero clipped to Ellipse A"
	>
		<defs>
			<clipPath id="clip-hero">
				<path d={fillPath(heroClip)} />
			</clipPath>
		</defs>
		<rect width="100%" height="100%" fill="#b5451b" clip-path="url(#clip-hero)" />
		<text x="16" y="22" class="tag">hero ∩ ellipse A (additive)</text>
	</svg>

	<svg
		bind:this={svgCard}
		class="svg-card"
		height="300"
		xmlns="http://www.w3.org/2000/svg"
		aria-label="Card with Ellipse B subtracted"
	>
		<defs>
			<clipPath id="clip-card">
				<path clip-rule="evenodd" d={holePath(cardClip)} />
			</clipPath>
		</defs>
		<rect width="100%" height="100%" fill="#1b5fa8" clip-path="url(#clip-card)" />
		<text x="16" y="22" class="tag">card − ellipse B (½ × A, subtractive)</text>
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

	.page {
		display: flex;
		flex-direction: column;
	}

	/* Hero: full width, scales with viewport */
	.svg-hero {
		width: 100%;
		display: block;
	}

	/* Card: fixed width, centered. Stays 640px no matter the viewport. */
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
