<script lang="ts">
	import Draggable from '$lib/components/commons/layout/Draggable.svelte';
	import type { ClassValue } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	let {visible = $bindable(false), title='', class: classes = '', children = undefined}: { visible?: boolean, class?: ClassValue, children?: Snippet, title: string } = $props();

	let x = $state(0);
	let y = $state(0);
	let width = $state(0);
	let height = $state(0);
</script>

{#if visible}
	<div style:width="{width}px" style:height="{height}px" style:left="{x}px" style:top="{y}px" class={["absolute rounded-lg  px-4 text-white bg-default-primary flex flex-col min-w-fit min-h-fit", classes]} bind:clientWidth={null, (w) => w && w >= width ? width = w : null} bind:clientHeight={null, (h) =>h && h >= height ? height = h : null}>
		<Draggable bind:x={x} bind:y={y} class="h-12 w-full flex flex-row justify-between items-center border-b border-b-default-tertiary">
			<p class="w-full text-center font-semibold">
				{title}
			</p>
			<button aria-label="close" class="bg-default-inactive hover:bg-default-active border border-black border-b-[3px] rounded-md size-7 m-auto cursor-pointer p-0.75 pb-1" type="button" onclick={() => visible = false}>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="4" stroke="currentColor" class="size-full">
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
				</svg>
			</button>
		</Draggable>
		<div class="h-[calc(100%-3rem)] min-h-fit relative flex flex-col">
				{@render children?.()}
		</div>
		<Draggable bind:x={width} bind:y={height} class="absolute -bottom-5 -right-5 cursor-se-resize size-10" />
	</div>
{/if}