<script lang="ts">
	import { onMount } from 'svelte';
	import { handleRoomState, registerRoomEngineEvent, registerRoomEvents } from '$lib/events';
	import { RoomEngineEvent } from '@nitrots/nitro-renderer';
	import ChatLogic from '$lib/components/logic/rooms/ChatLogic.svelte';

	onMount(() => {
		registerRoomEngineEvent(RoomEngineEvent.ENGINE_INITIALIZED, () => setTimeout(() => registerRoomEvents(), 300));
	});

	$effect(handleRoomState);
</script>

<ChatLogic />