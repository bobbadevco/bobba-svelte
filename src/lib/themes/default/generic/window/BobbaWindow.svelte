<script lang="ts">
	import type { ClassValue } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { Fa } from 'svelte-fa';
	import Draggable from '$lib/components/common/draggable-window/Draggable.svelte';
	import draggableImg from '../../assets/images/draggable.png';
	import Button from '$lib/components/common/Button.svelte';
	import { faXmark } from '@fortawesome/free-solid-svg-icons';
	import { getWindowListener } from '$lib/listeners/WindowListener.svelte';

	let {onCloseClick = () => {}, unique, disableDrag = false, headerTitle='', class: classes = '', children = undefined}: { onCloseClick?: () => void, unique: string, disableDrag?: boolean, class?: ClassValue, children?: Snippet, headerTitle: string } = $props();

	let x = $state(0);
	let y = $state(0);
	let width = $state(0);
	let height = $state(0);

	const id = $state(getWindowListener().getId());
	const zIndex = $derived(getWindowListener().windows.indexOf(id) + 500);
	const onClick = () => getWindowListener().pushToTop(id);


</script>

<style>
    :global(.bobba-window) {
        scrollbar-color: var(--color-primary) transparent;
    }

    :global(.bobba-window:hover) {
        scrollbar-color: var(--color-secondary) transparent;
    }

    :global(.bobba-window::-webkit-scrollbar) {
        width: 8px;
        height: 8px;
        background: transparent;
    }

    :global(.bobba-window::-webkit-scrollbar-track) {
        background: transparent;
    }

    :global(.bobba-window::-webkit-scrollbar-thumb) {
        background-color: var(--color-primary);
        border-radius: 9999px;
        border: 2px solid transparent;
        background-clip: content-box;
    }

    :global(.bobba-window::-webkit-scrollbar-thumb:hover) {
        background-color: var(--color-secondary);
    }
</style>

<div style:width="{width}px" style:z-index={zIndex} style:height="{height}px" style:left="calc({x}px + 45%)" style:top="calc({y}px + 30%)" class="absolute shadow-[0_2px_15px_#000000c9] rounded-lg cursor-auto px-3 py-1 text-white bg-tertiary flex flex-col min-w-fit min-h-fit" bind:clientWidth={null, (w) => w && w >= width ? width = w : null} bind:clientHeight={null, (h) =>h && h >= height ? height = h : null}>
	<Draggable {unique} bind:x={x} {onClick} bind:y={y} class="h-12 w-full flex flex-row justify-between items-center border-b shadow-[inset_0_-1px_#1D1D1E] border-b-[#242424]">
		<p class="w-full text-center text-[15px] font-semibold">
			{headerTitle}
		</p>
		<Button aria-label="close" class="absolute right-3 bg-base-primary hover:bg-bright-primary active:bg-dark-primary border border-[#0E0E0E] border-b-[3px] rounded-[5px] size-6 m-auto p-0.5" onclick={ onCloseClick }>
			<Fa class="size-full" icon={ faXmark } />
		</Button>
	</Draggable>
	<div class={["h-[calc(100%-3rem)] pt-1 relative flex flex-col bobba-window", classes]}>
		{@render children?.()}
	</div>
	{#if !disableDrag}
		<Draggable {unique} bind:x={width} bind:y={height} class="absolute bottom-0 right-0 cursor-se-resize size-4.75">
			<img src={draggableImg} alt="draggable resize icon " class="pointer-events-none relative right-0.75 bottom-0.75 size-full"/>
		</Draggable>
	{/if}
</div>
