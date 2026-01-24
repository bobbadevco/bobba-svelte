<script lang="ts">
	import ChatLogic from '$lib/components/logic/rooms/ChatLogic.svelte';
	import { handleRoomState, registerRoomEvents } from '$lib/events';
	import { onMount } from 'svelte';

	onMount(() => {
		registerRoomEvents();
	});

	$effect(handleRoomState);
</script>

<ChatLogic />