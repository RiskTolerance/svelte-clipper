<script lang="ts">
	type AbsoluteOffsets = {
		top?: string
		right?: string
		bottom?: string
		left?: string
	}

	export type DomSpacePosition = {
		top: number
		left: number
		right: number
		bottom: number
	}

	type Props = {
		color?: string
		offsets?: AbsoluteOffsets
		/** The inner <polygon> element — bind to pass this star as a clip ref. */
		shape?: SVGPolygonElement
		/** Distances from this element to the document box (scrollable layout), not the viewport. */
		domSpacePosition?: DomSpacePosition
	}

	let {
		color = '#FF6E6E',
		offsets,
		shape = $bindable(),
		domSpacePosition = $bindable()
	}: Props = $props()

	let svgEl: SVGSVGElement | undefined = $state()

	function measureDomSpacePosition(el: Element): DomSpacePosition {
		const rect = el.getBoundingClientRect()
		const docEl = document.documentElement
		const body = document.body
		const docWidth = Math.max(docEl.scrollWidth, body?.scrollWidth ?? 0, docEl.clientWidth)
		const docHeight = Math.max(docEl.scrollHeight, body?.scrollHeight ?? 0, docEl.clientHeight)
		return {
			top: Math.round(rect.top + window.scrollY),
			left: Math.round(rect.left + window.scrollX),
			right: Math.round(docWidth - (rect.right + window.scrollX)),
			bottom: Math.round(docHeight - (rect.bottom + window.scrollY))
		}
	}

	let offsetStyles = $derived.by(() => {
		if (!offsets) return ''
		const parts: string[] = []
		if (offsets.top !== undefined) parts.push(`top:${offsets.top}`)
		if (offsets.right !== undefined) parts.push(`right:${offsets.right}`)
		if (offsets.bottom !== undefined) parts.push(`bottom:${offsets.bottom}`)
		if (offsets.left !== undefined) parts.push(`left:${offsets.left}`)
		if (parts.length === 0) return ''
		return `position:absolute;${parts.join(';')}`
	})

	$effect(() => {
		if (!svgEl) return
		const update = () => {
			if (svgEl) domSpacePosition = measureDomSpacePosition(svgEl)
		}
		update()
		const ro = new ResizeObserver(update)
		ro.observe(document.documentElement)
		ro.observe(svgEl)
		return () => ro.disconnect()
	})
</script>

<svg
	bind:this={svgEl}
	style={offsetStyles}
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 35 33"
	fill={color}
	fill-rule="evenodd"
>
	<polygon
		bind:this={shape}
		points="27.865 31.83 17.615 26.209 7.462 32.009 9.553 20.362 0.99 12.335 12.532 10.758 17.394 0 22.436 10.672 34 12.047 25.574 20.22"
	/>
</svg>
