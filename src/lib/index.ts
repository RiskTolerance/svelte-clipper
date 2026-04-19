export { default as Clipper } from './svelte/Clipper.svelte'
export { default as ClippedBy } from './svelte/ClippedBy.svelte'
export {
	registerClipper,
	unregisterClipper,
	getClipperEl,
	subscribeClipper,
	notifyClipper
} from './core/clipperRegistry.js'
export { shapeToPath, SUPPORTED_SHAPE_TAGS } from './core/clipPath.js'
export { observeLayout, type Cleanup } from './core/observe.js'
