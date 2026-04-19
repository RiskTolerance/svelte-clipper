<script lang="ts">
	let { children } = $props()
</script>

{@render children()}

<style>
	:global(html, body) {
		min-height: 100vh;
	}
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
</style>
