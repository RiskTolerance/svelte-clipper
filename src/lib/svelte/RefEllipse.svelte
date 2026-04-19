<script lang="ts">
	type Props = {
		cx: number
		cy: number
		rx: number
		ry: number
		/** The inner <ellipse> element — bind to pass as a clip ref. */
		el?: SVGEllipseElement
		debug?: boolean
	}

	let { cx, cy, rx, ry, el = $bindable(), debug = false }: Props = $props()
</script>

<svg
	class="ref-layer"
	xmlns="http://www.w3.org/2000/svg"
	aria-hidden="true"
>
	<ellipse bind:this={el} {cx} {cy} {rx} {ry} class:debug class="ref" />
</svg>

<style>
	.ref-layer {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		pointer-events: none;
		z-index: 100;
	}

	.ref {
		fill: transparent;
		stroke: none;
	}

	.ref.debug {
		fill: rgba(0, 0, 0, 0.04);
		stroke: rgba(0, 0, 0, 0.55);
		stroke-width: 2;
		stroke-dasharray: 6 4;
	}
</style>
