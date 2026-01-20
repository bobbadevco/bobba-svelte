<script lang="ts">
	import Draggable from '$lib/components/commons/layout/Draggable.svelte';
	import type { ClassValue } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	let {visible = $bindable(false), class: classes = '', children = undefined}: { visible?: boolean, class?: ClassValue, children?: Snippet } = $props();

	let x = $state(0);
	let y = $state(0);
</script>

{#if visible}
	<div style:left="{x}px" style:top="{y}px" class={["absolute flex flex-col border border-red-500", classes]}>
		<Draggable bind:x={x} bind:y={y} class="h-20 w-full flex bg-black text-white flex-row justify-between items-center px-4 border border-blue-500">
			test
			<button class="rounded-md border bg-rose-800 text-white p-2" type="button" onclick={() => visible = false}>x</button>
		</Draggable>

		{@render children?.()}
	</div>
{/if}