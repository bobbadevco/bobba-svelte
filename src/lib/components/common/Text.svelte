<script lang="ts">
	import { onMount } from 'svelte';
	import { getTruffle, onTruffleReady } from '$lib/initialize.svelte';
	import type { ClassValue } from 'svelte/elements';

	export interface HabboTextProps {
		text: string
		styleName?: string
		fontSize?: number
		bold?: boolean
		italic?: boolean
		pointer?: boolean
		underline?: boolean
		color?: string | number
		fontFamily?: string
		wordWrap?: boolean
		width?: number
		textAlign?: 'left' | 'center' | 'right'
		leading?: number
		class?: ClassValue
		element?: HTMLCanvasElement | null
	}

	let {
		text,
		styleName = 'u_regular',
		fontSize = 12,
		bold = false,
		italic = false,
		underline = false,
		color = '#ffffff' as string | number,
		fontFamily = 'Ubuntu',
		wordWrap = false,
		pointer = false,
		width = undefined as number | undefined,
		textAlign = 'left' as 'left' | 'center' | 'right',
		leading = undefined as number | undefined,
		class: classes = '',
		element = $bindable<HTMLCanvasElement | null>(null),
	}: HabboTextProps = $props()

	let isReady = $state(false)

	onMount(async () => {
		await new Promise<void>(resolve => onTruffleReady(() => resolve()))
		isReady = true
	})

	const hexToNumber = (hex: string | number): number => {
		if (typeof hex === 'number') return hex
		hex = hex.trim()
		if (hex.startsWith('#')) return parseInt(hex.slice(1), 16) || 0xffffff
		if (hex.startsWith('rgb')) {
			const m = hex.match(/\d+/g)
			if (m) return (parseInt(m[0]) << 16) | (parseInt(m[1]) << 8) | parseInt(m[2])
		}
		return 0xffffff
	}

	$effect(() => {
		if (!isReady) return
		const truffle = getTruffle()
		if (!truffle) return

		const el = element
		if (!el) return

		const style = {
			fontSize,
			bold,
			italic,
			underline,
			cursor: pointer ? 'pointer' : 'default',
			color: hexToNumber(color),
			fontFamily,
			wordWrap,
			...(width !== undefined ? { width } : {}),
			textAlign,
			...(leading !== undefined ? { leading } : {})
		}

		const baseStyle = truffle.resolveStyle(styleName, style)
		const layout = truffle.measure(text, baseStyle)

		const cw = Math.max(1, Math.ceil(layout.width || layout.textWidth || 1))
		const ch = Math.max(1, Math.ceil(layout.height || layout.textHeight || 1))

		el.width = cw
		el.height = ch
		el.style.width = `${cw}px`
		el.style.height = `${ch}px`

		const ctx = el.getContext('2d')
		if (!ctx) return

		truffle.drawText(ctx, text, { x: 0, y: 0, style: baseStyle })
	})
</script>

<canvas bind:this={element} class={['inline-block', classes].filter(Boolean).join(' ')}></canvas>
