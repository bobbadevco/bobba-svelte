<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';

	export interface FlexProps {
		children?: Snippet,
		column?: boolean,
		reverse?: boolean,
		center?: boolean,
		class?: ClassValue,
	}


	const {children, column = false, reverse = false, center = false, ... p }: FlexProps = $props();
</script>

<div class={["flex", column ? "flex-col" : "flex-row", reverse && (column ? "flex-col-reverse" : "flex-row-reverse"), center && "justify-center items-center", p.class]}>
	{#if children}
		{@render children()}
	{/if}
</div>