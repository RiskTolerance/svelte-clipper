<script lang="ts">
	import Clipper from '$lib/svelte/Clipper.svelte'
	import ClippedBy from '$lib/svelte/ClippedBy.svelte'
	import CatSvg from '$lib/svgs/CatSvg.svelte'

	const img1 = 'https://picsum.photos/id/1015/1200/800'
	const img2 = 'https://picsum.photos/id/1035/1200/800'

	const STAR_POINTS =
		'150,20 179,109 272,109 197,163 226,252 150,198 74,252 103,163 28,109 121,109'

	let lensA = $state({ x: 60, y: 60 })
	let lensB = $state({ x: 180, y: 180 })

	function startDrag(e: PointerEvent, target: { x: number; y: number }) {
		e.preventDefault()
		const onMove = (ev: PointerEvent) => {
			target.x += ev.movementX
			target.y += ev.movementY
		}
		const onUp = () => {
			window.removeEventListener('pointermove', onMove)
			window.removeEventListener('pointerup', onUp)
			window.removeEventListener('pointercancel', onUp)
		}
		window.addEventListener('pointermove', onMove)
		window.addEventListener('pointerup', onUp)
		window.addEventListener('pointercancel', onUp)
	}
</script>

{#snippet starSvg()}
	<svg width="22vw" height="22vw" viewBox="0 0 300 280" xmlns="http://www.w3.org/2000/svg">
		<polygon points={STAR_POINTS} />
	</svg>
{/snippet}

<header class="intro">
	<h1>svelte-clipper</h1>
	<p>
		Responsive, reactive SVG clip paths for Svelte 5. Clipper shape and target live in independent
		DOM branches, coordinate systems, transforms, and animations — they always line up.
	</p>
</header>

<section class="stage">
	<h2>multi-subpath svg (battery) clipping a div</h2>
	<div class="ref battery-ref">
		<Clipper id="battery" preview>
			<svg width="480" height="480" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
				<path
					d="M0 20q0 2.496 1.76 4.256t4.256 1.76h17.984q2.496 0 4.256-1.76t1.76-4.256h1.984v-8h-1.984q0-2.464-1.76-4.224t-4.256-1.76h-17.984q-2.496 0-4.256 1.76t-1.76 4.224v8zM4 20v-8q0-0.832 0.576-1.408t1.44-0.576h17.984q0.832 0 1.408 0.576t0.608 1.408v8q0 0.832-0.608 1.44t-1.408 0.576h-17.984q-0.832 0-1.44-0.576t-0.576-1.44zM6.016 20h1.984v-8h-1.984v8zM10.016 20h1.984v-8h-1.984v8zM14.016 20h1.984v-8h-1.984v8zM18.016 20h1.984v-8h-1.984v8zM22.016 20h1.984v-8h-1.984v8z"
				/>
			</svg>
		</Clipper>
	</div>
	<div class="ref target">
		<ClippedBy clipper="battery" mode="clip" class="fill">
			<div class="content">
				<p>green div clipped by a battery</p>
				<p>seven subpaths: case outline, inner hole, five bars</p>
			</div>
		</ClippedBy>
	</div>
</section>

<section class="stage">
	<h2>spinning stars clipping an image (live)</h2>
	<div class="ref star-ref star-ref-center">
		<Clipper id="star-spin-1" live>
			{@render starSvg()}
		</Clipper>
	</div>
	<div class="ref star-ref star-ref-left">
		<Clipper id="star-spin-2" live>
			{@render starSvg()}
		</Clipper>
	</div>
	<div class="ref star-ref star-ref-right">
		<Clipper id="star-spin-3" live>
			{@render starSvg()}
		</Clipper>
	</div>
	<div class="ref img-target">
		<ClippedBy clipper={['star-spin-1', 'star-spin-2', 'star-spin-3']} mode="clip" class="fill">
			<img src={img1} alt="" class="clipped-img" />
		</ClippedBy>
	</div>
</section>

<section class="stage">
	<h2>complex multi-path svg (cat) clipping a div</h2>
	<div class="ref cat-ref">
		<Clipper id="cat" preview>
			<CatSvg width="460" height="460" />
		</Clipper>
	</div>
	<div class="ref target">
		<ClippedBy clipper="cat" mode="clip" class="fill">
			<div class="cat-content"></div>
		</ClippedBy>
	</div>
</section>

<section class="stage lens-stage">
	<h2>cross-dom: drag lenses in the panel to punch holes in the image</h2>
	<div class="lens-split">
		<div class="lens-panel">
			<p class="lens-label">drag me →</p>
			<div
				class="lens-handle lens-a"
				style="transform: translate({lensA.x}px, {lensA.y}px)"
				onpointerdown={(e) => startDrag(e, lensA)}
			>
				<Clipper id="lensA" live>
					<svg width="90" height="90" viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg">
						<circle cx="45" cy="45" r="45" />
					</svg>
				</Clipper>
			</div>
			<div
				class="lens-handle lens-b"
				style="transform: translate({lensB.x}px, {lensB.y}px)"
				onpointerdown={(e) => startDrag(e, lensB)}
			>
				<Clipper id="lensB" live>
					<svg width="70" height="70" viewBox="0 0 70 70" xmlns="http://www.w3.org/2000/svg">
						<circle cx="35" cy="35" r="35" />
					</svg>
				</Clipper>
			</div>
		</div>
		<div class="lens-reveal">
			<div class="lens-under">
				<span>👀 you found me</span>
			</div>
			<ClippedBy
				clipper={['lensA', 'lensB']}
				mode="subtract"
				combine="union"
				class="lens-cover"
			>
				<img src={img2} alt="" class="clipped-img" />
			</ClippedBy>
		</div>
	</div>
</section>

<style>
	.intro {
		max-width: 720px;
		margin: 32px auto 8px;
		padding: 0 24px;
		font-family: system-ui, sans-serif;
		color: #222;
	}
	.intro h1 {
		margin: 0 0 8px;
		font-size: 32px;
	}
	.intro p {
		margin: 0;
		color: #555;
		line-height: 1.5;
	}

	.stage {
		position: relative;
		width: 100%;
		height: 600px;
		overflow: hidden;
	}

	.stage h2 {
		position: absolute;
		top: 16px;
		left: 16px;
		margin: 0;
		font-family: monospace;
		font-size: 14px;
		color: #444;
		z-index: 10;
	}

	.ref {
		position: absolute;
	}

	.battery-ref {
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		pointer-events: none;
		z-index: 2;
	}

	.target {
		left: 50%;
		top: 50%;
		width: 560px;
		height: 520px;
		transform: translate(-50%, -50%);
	}

	:global(.fill) {
		width: 100%;
		height: 100%;
	}

	.content {
		width: 100%;
		height: 100%;
		background: #2f9e44;
		color: #fff;
		font-family: system-ui, sans-serif;
		padding: 20px;
		box-sizing: border-box;
	}

	.star-ref {
		top: 50%;
		pointer-events: none;
		z-index: 2;
		transform-origin: center;
	}

	.star-ref-center {
		left: 50%;
		animation: spin-c 6s linear infinite;
	}
	.star-ref-left {
		left: calc(50% - 24vw);
		animation: spin-l 5s linear infinite;
	}
	.star-ref-right {
		left: calc(50% + 24vw);
		animation: spin-r 7s linear infinite reverse;
	}

	@keyframes spin-c {
		from {
			transform: translate(-50%, -50%) rotate(0deg);
		}
		to {
			transform: translate(-50%, -50%) rotate(360deg);
		}
	}
	@keyframes spin-l {
		from {
			transform: translate(-50%, -50%) rotate(0deg);
		}
		to {
			transform: translate(-50%, -50%) rotate(360deg);
		}
	}
	@keyframes spin-r {
		from {
			transform: translate(-50%, -50%) rotate(0deg);
		}
		to {
			transform: translate(-50%, -50%) rotate(360deg);
		}
	}

	.img-target {
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
	}

	.cat-ref {
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		pointer-events: none;
		z-index: 2;
	}

	.cat-content {
		width: 100%;
		height: 100%;
		background: #c2255c;
	}

	.lens-stage {
		height: 560px;
		touch-action: none;
	}
	.lens-split {
		position: absolute;
		inset: 60px 20px 20px;
		display: flex;
		gap: 24px;
	}
	.lens-panel {
		position: relative;
		width: 320px;
		background: #1f2937;
		border-radius: 8px;
		overflow: hidden;
		flex-shrink: 0;
	}
	.lens-label {
		position: absolute;
		top: 8px;
		left: 12px;
		margin: 0;
		color: #9ca3af;
		font-family: monospace;
		font-size: 12px;
	}
	.lens-handle {
		position: absolute;
		top: 0;
		left: 0;
		cursor: grab;
		touch-action: none;
	}
	.lens-handle:active {
		cursor: grabbing;
	}
	.lens-a :global(circle) {
		fill: #f59e0b;
	}
	.lens-b :global(circle) {
		fill: #10b981;
	}

	.lens-reveal {
		position: relative;
		flex: 1;
		border-radius: 8px;
		overflow: hidden;
		background: #111;
	}
	.lens-under {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		background: linear-gradient(135deg, #f472b6, #f59e0b, #10b981);
		color: #111;
		font-family: system-ui, sans-serif;
		font-weight: 800;
		font-size: 48px;
		letter-spacing: 2px;
	}
	:global(.lens-cover) {
		position: absolute;
		inset: 0;
	}

	.clipped-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
</style>
