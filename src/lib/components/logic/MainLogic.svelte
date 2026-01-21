<script lang="ts">
	import { GetCommunication } from '$lib/api';
	import { onMount } from 'svelte';
	import NavigatorLogic from '$lib/components/logic/NavigatorLogic.svelte';
	import { RoomEngineEvent } from '@nitrots/nitro-renderer';
	import { registerRoomEngineEvent } from '$lib/events';

	onMount(
		() => {
			console.log("main mount");
			registerRoomEngineEvent(RoomEngineEvent.ENGINE_INITIALIZED, () => setTimeout(() => GetCommunication().connection.onReady(), 300));
		}
	);
</script>

<NavigatorLogic />