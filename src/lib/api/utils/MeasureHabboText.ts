import { getTruffle } from '$lib/initialize.svelte';
import type { TextStyle } from 'truffle-text';

export interface HabboTextMeasureResult {
	width: number
	height: number
	textWidth: number
	textHeight: number
}

const hexToNumber = (hex: string | number): number =>
{
	if (typeof hex === 'number') return hex
	hex = hex.toString().trim()
	if (hex.startsWith('#')) return parseInt(hex.slice(1), 16) || 0
	if (hex.startsWith('rgb'))
	{
		const m = hex.match(/\d+/g)
		if (m) return (parseInt(m[0]) << 16) | (parseInt(m[1]) << 8) | parseInt(m[2])
	}
	return 0
}

export const MeasureHabboText = (text: string, overrides?: Partial<TextStyle>): HabboTextMeasureResult =>
{
	const truffle = getTruffle()
	if (!truffle) return { width: 0, height: 0, textWidth: 0, textHeight: 0 }

	const style: TextStyle = {
		fontSize: overrides?.fontSize ?? 12,
		bold: overrides?.bold ?? false,
		italic: overrides?.italic ?? false,
		color: overrides?.color !== undefined ? hexToNumber(overrides.color) : 0xffffff,
		fontFamily: overrides?.fontFamily ?? 'Ubuntu',
		wordWrap: overrides?.wordWrap ?? false,
		width: overrides?.width,
		textAlign: overrides?.textAlign ?? 'left',
		leading: overrides?.leading,
	}

	const baseStyle = truffle.resolveStyle('u_regular', style)
	const layout = truffle.measure(text, baseStyle)

	return {
		width: layout.width || 0,
		height: layout.height || 0,
		textWidth: layout.textWidth || 0,
		textHeight: layout.textHeight || 0,
	}
}
