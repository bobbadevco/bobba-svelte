<script lang="ts">

	import type { ClassValue } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	let {x = $bindable(0), y = $bindable(0), moving = $bindable(false), class: classes = "", children = undefined}: {x?: number, y?: number, moving?: boolean, class?: ClassValue, children?: Snippet} = $props();

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

	function onmouseout() {
		moving = false;
	}
	function onblur() {
		moving = false;
	}
</script>

<div role="tab" tabindex="-1" aria-roledescription="draggable window" {onmousedown} {onmouseup} {onmousemove} {onmouseout} {onblur} class={[classes]}>
	{@render children?.()}
</div>