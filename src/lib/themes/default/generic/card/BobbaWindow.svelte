<script lang="ts">
	import type { ClassValue } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { Fa } from 'svelte-fa';
	import Draggable from '$lib/components/common/draggable-window/Draggable.svelte';
	import draggableImg from '../../assets/images/draggable.png';
	import Button from '$lib/components/common/Button.svelte';
	import { faXmark } from '@fortawesome/free-solid-svg-icons';

	let {onCloseClick = () => {}, disableDrag = false, headerTitle='', class: classes = '', children = undefined}: { onCloseClick?: () => void, disableDrag?: boolean, class?: ClassValue, children?: Snippet, headerTitle: string } = $props();

	let x = $state(0);
	let y = $state(0);
	let width = $state(0);
	let height = $state(0);
</script>

<div style:width="{width}px" style:height="{height}px" style:left="calc({x}px + 45%)" style:top="calc({y}px + 30%)" class={["absolute rounded-lg cursor-auto  px-4 text-white bg-default-primary flex flex-col min-w-fit min-h-fit", classes]} bind:clientWidth={null, (w) => w && w >= width ? width = w : null} bind:clientHeight={null, (h) =>h && h >= height ? height = h : null}>
	<Draggable bind:x={x} bind:y={y} class="h-12 w-full flex flex-row justify-between items-center border-b border-b-default-tertiary">
		<p class="w-full text-center font-semibold">
			{headerTitle}
		</p>
		<Button aria-label="close" class="absolute right-3 bg-default-inactive hover:bg-default-hover active:bg-default-active border border-black border-b-[3px] rounded-[5px] size-6 m-auto p-0.5" onclick={ onCloseClick }>
			<Fa class="size-full" icon={ faXmark } />
		</Button>
	</Draggable>
	<div class="h-[calc(100%-3rem)] min-h-fit relative flex flex-col">
			{@render children?.()}
	</div>
	
	{#if !disableDrag}
		<Draggable bind:x={width} bind:y={height} class="absolute bottom-0 right-0 cursor-se-resize size-4.75">
			<img src={draggableImg} alt="draggable resize icon " class="pointer-events-none relative right-0.75 bottom-0.75 size-full"/>
		</Draggable>
	{/if}
</div>