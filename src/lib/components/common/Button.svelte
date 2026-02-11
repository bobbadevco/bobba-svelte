<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue, HTMLAttributes } from 'svelte/elements';

	export interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
		children?: Snippet,
		center?: boolean,
		wrap?: boolean,
		class?: ClassValue,
		pointer?: boolean,
        disabled?: boolean,
        onclick?: (event: MouseEvent) => void,
	}


	const {children, pointer = true, center = false, wrap = true, onclick, ... p }: ButtonProps = $props();
</script>

<button {onclick} onmousedown={(e) => e.stopPropagation()} 
class={[ "flex hover:brightness-125 active:brightness-75",
	pointer && "cursor-pointer",
	wrap && "flex-wrap", 
	center && "justify-center items-center", 
	p.class ]}>
	{#if children}
		{@render children()}
	{/if}
</button>