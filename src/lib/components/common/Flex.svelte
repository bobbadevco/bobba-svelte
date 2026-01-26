<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue, HTMLAttributes } from 'svelte/elements';

	export interface FlexProps extends HTMLAttributes<HTMLDivElement> {
		children?: Snippet,
		fit?: boolean,
		fullWidth?: boolean,
		fullHeight?: boolean,
		column?: boolean,
		reverse?: boolean,
		center?: boolean,
		onclick?: (e: MouseEvent) => void,
		wrap?: boolean,
		shrink?: boolean,
		inline?: boolean,
		grow?: boolean,
		class?: ClassValue,
		pointer?: boolean,
	}


	const {children, pointer = false, onclick = (() => {}), column = false, reverse = false, center = false, wrap = true, shrink = false, inline = false, fit = false, fullWidth = false, fullHeight = false, grow = false, ... p }: FlexProps = $props();
</script>

<button class={[ "flex", 
	column ? "flex-col" : "flex-row", 
	pointer && "cursor-pointer",
	wrap ? "flex-wrap" : 'flex-nowrap', 
	inline && "inline-flex", 
	shrink && "shrink-0", 
	fit || fullWidth && "w-full", 
	fit || fullHeight && "h-full", 
	grow && "grow", 
	reverse && (column ? "flex-col-reverse" : "flex-row-reverse"), 
	center && "justify-center items-center", 
	p.class ]} {onclick}>
	{#if children}
		{@render children()}
	{/if}
</button>