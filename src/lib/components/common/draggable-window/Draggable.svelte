<script lang="ts">

	import type { ClassValue } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	let {x = $bindable(0), y = $bindable(0), moving = $bindable(false), class: classes = "", unique = '', windowPos = '', children = undefined}: {x?: number, y?: number, moving?: boolean, unique: string, windowPos?: string, class?: ClassValue, children?: Snippet} = $props();

	let lastX = 0;
	let lastY = 0;

	function onmousedown(e: MouseEvent) {
		moving = true;
		lastX = e.clientX;
		lastY = e.clientY;
	}

	function onmouseup() {
		moving = false;
	}

	function onmousemove(e: MouseEvent) {
		if (moving) {
			x += e.clientX - lastX;
			y += e.clientY - lastY;
			lastX = e.clientX;
			lastY = e.clientY;
		}
	}

	function onblur() {
		moving = false;
	}
</script>
<svelte:window {onmouseup} {onmousemove} {onblur} />
<div role="tab" tabindex="-1" aria-roledescription="draggable window" {onmousedown}  {onblur} class={[classes]}>
	{@render children?.()}
</div>