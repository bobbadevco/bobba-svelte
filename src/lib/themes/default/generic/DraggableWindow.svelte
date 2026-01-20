<script lang="ts">
	import Draggable from '$lib/components/commons/layout/Draggable.svelte';
	import type { ClassValue } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	let {visible = $bindable(false), class: classes = '', children = undefined}: { visible?: boolean, class?: ClassValue, children?: Snippet } = $props();

	let x = $state(0);
	let y = $state(0);
	let width = $state(0);
	let height = $state(0);
	let resizing = $state(false);

	function onmousedown() {
		resizing = true;
	}

	function onmouseup() {
		resizing = false;
	}

	function onmousemove(e: MouseEvent) {
		if (resizing) {
			width += e.movementX;
			height += e.movementY;
		}
	}

	function onmouseout() {
		resizing = false;
	}
	function onblur() {}
</script>

{#if visible}
	<div style:width="{width}px" style:height="{height}px" style:left="{x}px" style:top="{y}px" class={["absolute flex flex-col min-w-fit min-h-fit border border-red-500", classes]} bind:clientWidth={null, (w) => w && w >= width ? width = w : null} bind:clientHeight={null, (h) =>h && h >= height ? height = h : null}>
		<Draggable bind:x={x} bind:y={y} class="h-20 w-full flex bg-black text-white flex-row justify-between items-center px-4 border border-blue-500">
			test
			<button class="rounded-md border bg-rose-800 text-white p-2" type="button" onclick={() => visible = false}>x</button>
		</Draggable>

		{@render children?.()}

		<div tabindex="-1" role="button" class="absolute bottom-0 right-0 size-10 cursor-se-resize" {onblur} {onmousedown} {onmouseup} {onmousemove} {onmouseout}>

		</div>
	</div>
{/if}