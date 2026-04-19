<script lang="ts">
	import { page } from '$app/state'
	let { children } = $props()

	const links = [
		{ href: '/', label: 'home' },
		{ href: '/demo', label: 'demo (inline math)' },
		{ href: '/ref-anchor', label: 'ref-anchor (projection lib)' },
		{ href: '/library', label: 'library (ClippedBy)' },
		{ href: '/sandbox', label: 'sandbox' }
	]
</script>

<nav>
	{#each links as link (link.href)}
		<a href={link.href} class:active={page.url.pathname === link.href}>{link.label}</a>
	{/each}
</nav>

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
	nav {
		position: fixed;
		top: 8px;
		left: 8px;
		z-index: 1000;
		display: flex;
		gap: 6px;
		padding: 6px 8px;
		background: rgba(255, 255, 255, 0.9);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 6px;
		font-family: monospace;
		font-size: 11px;
	}
	a {
		text-decoration: none;
		color: #333;
		padding: 2px 6px;
		border-radius: 3px;
	}
	a:hover {
		background: rgba(0, 0, 0, 0.06);
	}
	a.active {
		background: #1b5fa8;
		color: white;
	}
</style>
