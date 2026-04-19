<script lang="ts">
	import ClippedBy from '$lib/svelte/ClippedBy.svelte'

	let circle1: SVGEllipseElement | undefined = $state()
	let star1: SVGPolygonElement | undefined = $state()
	let circle2: SVGEllipseElement | undefined = $state()
	let star2: SVGPolygonElement | undefined = $state()

	const STAR_POINTS =
		'27.865 31.83 17.615 26.209 7.462 32.009 9.553 20.362 0.99 12.335 12.532 10.758 17.394 0 22.436 10.672 34 12.047 25.574 20.22'
</script>

<!-- Instance 1: star clipped by circle (orange star-shape visible only inside the circle) -->
<section class="stage">
	<svg class="ref circle" width="360" height="360" xmlns="http://www.w3.org/2000/svg">
		<ellipse bind:this={circle1} cx="180" cy="180" rx="180" ry="180" class="debug" />
	</svg>
	<svg class="ref star" width="260" height="260" viewBox="0 0 35 33" xmlns="http://www.w3.org/2000/svg">
		<polygon bind:this={star1} points={STAR_POINTS} fill="transparent" />
	</svg>
	<ClippedBy ref={circle1} mode="clip" width="100%" height="100%" class="clip-layer">
		<ClippedBy ref={star1} mode="clip" width="100%" height="100%" fill="#b5451b" />
	</ClippedBy>
</section>

<!-- Instance 2: circle clipped by star (inverted — blue circle with star-shaped hole) -->
<section class="stage">
	<svg class="ref circle" width="360" height="360" xmlns="http://www.w3.org/2000/svg">
		<ellipse bind:this={circle2} cx="180" cy="180" rx="180" ry="180" class="debug" />
	</svg>
	<svg class="ref star" width="260" height="260" viewBox="0 0 35 33" xmlns="http://www.w3.org/2000/svg">
		<polygon bind:this={star2} points={STAR_POINTS} fill="transparent" />
	</svg>
	<ClippedBy ref={circle2} mode="clip" width="100%" height="100%" class="clip-layer">
		<ClippedBy ref={star2} mode="subtract" width="100%" height="100%" fill="#1b5fa8" />
	</ClippedBy>
</section>

<style>
	.stage {
		position: relative;
		width: 100%;
		height: 560px;
		overflow: hidden;
	}

	.ref {
		position: absolute;
		pointer-events: none;
		left: 50%;
		top: 50%;
	}

	.circle {
		transform: translate(-50%, -50%);
	}

	.star {
		transform: translate(-20%, -40%);
	}

	.debug {
		fill: rgba(0, 0, 0, 0.04);
		stroke: rgba(0, 0, 0, 0.55);
		stroke-width: 2;
		stroke-dasharray: 6 4;
	}

	:global(.clip-layer) {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}
</style>
