<script lang="ts">
	import { GetNitroInstance } from '$lib/api/GetNitroInstance';
	import { getRoomSession, handleRoomState, registerRoomEvents } from '$lib/events/room.svelte';
	import { onMount } from 'svelte';

	function attachView(node: HTMLElement) {
		const canvas = GetNitroInstance().application.renderer.view;
		if (!canvas) return;
		node.appendChild(canvas);
	}

	onMount(() => {
		registerRoomEvents();
	});

	$effect(handleRoomState);
</script>

<div class={["max-w-screen max-h-screen", !getRoomSession() && "hidden"]} use:attachView></div>