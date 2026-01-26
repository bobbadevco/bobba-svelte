<script lang="ts">
	import { GetNitroInstance, DispatchTouchEvent, DispatchMouseEvent } from '$lib/api';
	import { getRoomSession } from '$lib/events';
	import Widgets from '$lib/components/Widgets.svelte';

	function attachView(node: HTMLElement) {
		const canvas = GetNitroInstance().application.renderer.view;
		if (!canvas) return;
		canvas.onclick = event => DispatchMouseEvent(event);
		canvas.onmousemove = event => DispatchMouseEvent(event);
		canvas.onmousedown = event => DispatchMouseEvent(event);
		canvas.onmouseup = event => DispatchMouseEvent(event);

		canvas.ontouchstart = event => DispatchTouchEvent(event);
		canvas.ontouchmove = event => DispatchTouchEvent(event);
		canvas.ontouchend = event => DispatchTouchEvent(event);
		canvas.ontouchcancel = event => DispatchTouchEvent(event);
		node.appendChild(canvas);
	}
</script>

<div class={["max-w-screen max-h-screen", !getRoomSession() && "hidden"]} use:attachView></div>
{#if getRoomSession()}
	<Widgets />
{/if}