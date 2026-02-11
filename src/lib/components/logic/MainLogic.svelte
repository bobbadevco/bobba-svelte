<script lang="ts">
	import { GetCommunication } from '$lib/api';
	import { onMount } from 'svelte';
	import NavigatorLogic from '$lib/components/logic/NavigatorLogic.svelte';
	import { RoomEngineEvent } from '@nitrots/nitro-renderer';
	import { registerRoomEngineEvent } from '$lib/events';
	import AlertLogic from '$lib/components/logic/AlertLogic.svelte';
	import ToolbarLogic from './ToolbarLogic.svelte';
	import RoomLogic from '$lib/components/logic/RoomLogic.svelte';
	import FriendsLogic from '$lib/components/logic/FriendsLogic.svelte';
	import MessengerLogic from '$lib/components/logic/MessengerLogic.svelte';
	import CatalogLogic from '$lib/components/logic/CatalogLogic.svelte';

	onMount(
		() => {
			registerRoomEngineEvent(RoomEngineEvent.ENGINE_INITIALIZED, () => setTimeout(() => GetCommunication().connection.onReady(), 300));
		}
	);
</script>

<RoomLogic />
<NavigatorLogic />
<AlertLogic />
<ToolbarLogic />
<FriendsLogic />
<MessengerLogic />
<CatalogLogic />