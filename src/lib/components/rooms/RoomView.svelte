<script lang="ts">
	import { GetNitroInstance } from '$lib/api/GetNitroInstance';
	import { getRoomSession, handleRoomState, registerRoomEvents } from '$lib/events/room.svelte';
	import { onMount } from 'svelte';
	import { DispatchMouseEvent } from '$lib/api/rooms/DispatchMouseEvent';
	import { DispatchTouchEvent } from '$lib/api/rooms/DispatchTouchEvent';

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

	onMount(() => {
		registerRoomEvents();
	});

	$effect(handleRoomState);
</script>

<div class={["max-w-screen max-h-screen", !getRoomSession() && "hidden"]} use:attachView></div>