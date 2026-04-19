<script lang="ts">
	import Clipper from '$lib/svelte/Clipper.svelte';
	import ClippedBy from '$lib/svelte/ClippedBy.svelte';
	import img from '$lib/assets/img2.jpg';

	const STAR_POINTS =
		'150,20 179,109 272,109 197,163 226,252 150,198 74,252 103,163 28,109 121,109';
</script>

{#snippet starSvg()}
	<svg width="22vw" height="22vw" viewBox="0 0 300 280" xmlns="http://www.w3.org/2000/svg">
		<polygon points={STAR_POINTS} />
	</svg>
{/snippet}

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
	<h2>spinning star clipping an image (live)</h2>
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
			<img src={img} alt="" class="clipped-img" />
		</ClippedBy>
	</div>
</section>

<style>
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

	.clipped-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
</style>
