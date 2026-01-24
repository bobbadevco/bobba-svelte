<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';

	export interface FlexProps {
		children?: Snippet,
		fit?: boolean,
		fullWidth?: boolean,
		fullHeight?: boolean,
		column?: boolean,
		reverse?: boolean,
		center?: boolean,
		wrap?: boolean,
		shrink?: boolean,
		inline?: boolean,
		grow?: boolean,
		class?: ClassValue,
		
		pointer?: boolean,
	}


	const {children, pointer = false, column = false, reverse = false, center = false, wrap = true, shrink = false, inline = false, fit = false, fullWidth = false, fullHeight = false, grow = false, ... p }: FlexProps = $props();
</script>

<div class={[ "flex", 
	column ? "flex-col" : "flex-row", 
	pointer && "cursor-pointer",
	wrap && "flex-wrap", 
	inline && "inline-flex", 
	shrink && "shrink-0", 
	fit || fullWidth && "w-full", 
	fit || fullHeight && "h-full", 
	grow && "grow", 
	reverse && (column ? "flex-col-reverse" : "flex-row-reverse"), 
	center && "justify-center items-center", 
	p.class ]}>
	{#if children}
		{@render children()}
	{/if}
</div>