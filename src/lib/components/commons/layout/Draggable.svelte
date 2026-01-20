<script lang="ts">

	import type { ClassValue } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	let {x = $bindable(0), y = $bindable(0), class: classes = "", children = undefined}: {x?: number, y?: number, class?: ClassValue, children?: Snippet} = $props();

	let moving = $state(false);

	function onmousedown() {
		moving = true;
	}

	function onmouseup() {
		moving = false;
	}

	function onmousemove(e: MouseEvent) {
		if (moving) {
			x += e.movementX;
			y += e.movementY;
		}
	}
</script>

<div role="tab" tabindex="-1" aria-roledescription="draggable window" {onmousedown} {onmouseup} {onmousemove} class={[classes]}>
	{@render children?.()}
</div>