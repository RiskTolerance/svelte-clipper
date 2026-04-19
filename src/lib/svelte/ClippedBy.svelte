<script lang="ts">
	import type { Snippet } from 'svelte'
	import '../core/process-shim.js'
	import { shapeToPath } from '$lib/core/clipPath.js'
	import { observeLayout } from '$lib/core/observe.js'
	import { getClipperEl, subscribeClipper } from '$lib/core/clipperRegistry.js'
	import {
		pathFromPathData,
		pathToPathData,
		pathBoolean,
		PathBooleanOperation,
		FillRule
	} from 'path-bool'

	type CombineOp =
		| 'concat'
		| 'union'
		| 'difference'
		| 'intersection'
		| 'exclusion'
		| 'division'
		| 'fracture'

	type Props = {
		clipper: string | string[]
		mode?: 'clip' | 'subtract'
		combine?: CombineOp
		class?: string
		children: Snippet
	}

	let {
		clipper,
		mode = 'clip',
		combine = 'concat',
		class: className,
		children
	}: Props = $props()

	const OP_MAP: Record<Exclude<CombineOp, 'concat'>, PathBooleanOperation> = {
		union: PathBooleanOperation.Union,
		difference: PathBooleanOperation.Difference,
		intersection: PathBooleanOperation.Intersection,
		exclusion: PathBooleanOperation.Exclusion,
		division: PathBooleanOperation.Division,
		fracture: PathBooleanOperation.Fracture
	}

	let wrapper: HTMLElement | undefined = $state()
	let shapeD = $state('')
	let w = $state(0)
	let h = $state(0)

	const clipId = `clip-${Math.random().toString(36).slice(2, 10)}`
	let ids = $derived(Array.isArray(clipper) ? clipper : [clipper])

	let lastSig = ''
	function update() {
		if (!wrapper) return
		const rect = wrapper.getBoundingClientRect()
		const matrices: Array<{ shape: SVGGraphicsElement; m: DOMMatrix }> = []
		let sig = `${rect.width}x${rect.height}`
		for (const id of ids) {
			const shape = getClipperEl(id)
			if (!shape) continue
			const sourceCTM = shape.getScreenCTM()
			if (!sourceCTM) continue
			const m = new DOMMatrix().translateSelf(-rect.left, -rect.top).multiply(sourceCTM)
			matrices.push({ shape, m })
			sig += `|${id}:${m.a.toFixed(3)},${m.b.toFixed(3)},${m.c.toFixed(3)},${m.d.toFixed(3)},${m.e.toFixed(2)},${m.f.toFixed(2)}`
		}
		if (sig === lastSig) return
		lastSig = sig
		w = rect.width
		h = rect.height
		const parts: string[] = []
		for (const { shape, m } of matrices) {
			const part = shapeToPath(shape, m)
			if (part) parts.push(part)
		}
		if (combine !== 'concat' && parts.length > 1) {
			try {
				const op = OP_MAP[combine]
				let acc = pathFromPathData(parts[0])
				for (let i = 1; i < parts.length; i++) {
					const b = pathFromPathData(parts[i])
					const res = pathBoolean(acc, FillRule.EvenOdd, b, FillRule.EvenOdd, op)
					acc = res.flat()
				}
				shapeD = pathToPathData(acc)
			} catch {
				shapeD = parts.join(' ')
			}
		} else {
			shapeD = parts.join(' ')
		}
	}

	let rafId: number | undefined
	function scheduleUpdate() {
		if (rafId !== undefined) return
		rafId = requestAnimationFrame(() => {
			rafId = undefined
			update()
		})
	}

	$effect(() => observeLayout(scheduleUpdate, wrapper ? [wrapper] : []))
	$effect(() => {
		const unsubs = ids.map((id) => subscribeClipper(id, scheduleUpdate))
		return () => unsubs.forEach((u) => u())
	})

	let clipD = $derived(mode === 'subtract' ? `M 0,0 H ${w} V ${h} H 0 Z ${shapeD}` : shapeD)
</script>

<div bind:this={wrapper} class={className} style="clip-path: url(#{clipId})">
	{@render children()}
</div>

<svg
	class="clip-defs"
	xmlns="http://www.w3.org/2000/svg"
	aria-hidden="true"
>
	<defs>
		<clipPath id={clipId} clipPathUnits="userSpaceOnUse">
			<path clip-rule="evenodd" d={clipD} />
		</clipPath>
	</defs>
</svg>

<style>
	.clip-defs {
		position: absolute;
		width: 0;
		height: 0;
		overflow: hidden;
		pointer-events: none;
	}
</style>
