<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue, HTMLAttributes } from 'svelte/elements';

	export interface FlexProps extends HTMLAttributes<HTMLDivElement> {
		children?: Snippet,
		element?: HTMLElement | null,
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

	let {children, element = $bindable<HTMLElement | null>(null), pointer = false, onclick = undefined, column = false, reverse = false, center = false, wrap = false, shrink = false, inline = false, fit = false, fullWidth = false, fullHeight = false, grow = false, ...p }: FlexProps = $props();
</script>

<svelte:element
	this={onclick ? 'button' : 'div'}
	type={onclick ? 'button' : undefined}
	bind:this={element}
	onclick={onclick}
	{...p}
	class={[ "flex",
  column ? "flex-col" : "flex-row",
  pointer && "cursor-pointer",
  wrap ? "flex-wrap" : 'flex-nowrap',
  inline && "inline-flex",
  shrink && "shrink-0",
  fullWidth && "w-full",
  fullHeight && "h-full",
  fit && 'w-fit h-fit',
  grow && "grow",
  reverse && (column ? "flex-col-reverse" : "flex-row-reverse"),
  center && "justify-center items-center",
  p.class ]}>
	{#if children}
		{@render children()}
	{/if}
</svelte:element>
