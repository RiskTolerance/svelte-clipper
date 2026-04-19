<script lang="ts">
	import Clipper from '$lib/svelte/Clipper.svelte';
	import ClippedBy from '$lib/svelte/ClippedBy.svelte';
</script>

<!-- Instance 1: a star, clipped by a circle. -->
<section class="stage">
	<div class="ref circle">
		<Clipper id="c1" preview>
			<svg width="360" height="360" xmlns="http://www.w3.org/2000/svg">
				<ellipse cx="180" cy="180" rx="180" ry="180" />
			</svg>
		</Clipper>
	</div>
	<div class="ref star">
		<ClippedBy clipper="c1" mode="clip">
			<svg width="260" height="260" viewBox="0 0 35 33" xmlns="http://www.w3.org/2000/svg">
				<polygon
					points="27.865 31.83 17.615 26.209 7.462 32.009 9.553 20.362 0.99 12.335 12.532 10.758 17.394 0 22.436 10.672 34 12.047 25.574 20.22"
					fill="#b5451b"
				/>
			</svg>
		</ClippedBy>
	</div>
</section>

<!-- Instance 2: a circle, clipped by a star (subtract — circle with star-shaped hole). -->
<section class="stage">
	<div class="ref star">
		<Clipper id="s2" preview>
			<svg width="260" height="260" viewBox="0 0 35 33" xmlns="http://www.w3.org/2000/svg">
				<polygon
					points="27.865 31.83 17.615 26.209 7.462 32.009 9.553 20.362 0.99 12.335 12.532 10.758 17.394 0 22.436 10.672 34 12.047 25.574 20.22"
				/>
			</svg>
		</Clipper>
	</div>
	<div class="ref circle">
		<ClippedBy clipper="s2" mode="subtract">
			<svg width="360" height="360" xmlns="http://www.w3.org/2000/svg">
				<ellipse cx="180" cy="180" rx="180" ry="180" fill="#1b5fa8" />
			</svg>
		</ClippedBy>
	</div>
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
</style>
