<script lang="ts">
	import { onMount } from 'svelte';
	import { GetCommunication } from '$lib/api/GetCommunication';
	import { GetGuestRoomMessageComposer, NavigatorHomeRoomEvent, GetGuestRoomResultEvent } from '@nitrots/nitro-renderer';
	import { SendMessageComposer } from '$lib/api/communication/SendMessageComposer';
	import { registerMessageEvent } from '$lib/events/registration';
	import { CreateRoomSession } from '$lib/api/session/room/CreateRoomSession';

	let homeRoomId = $state(0);

	const onHomeRoom = (event: NavigatorHomeRoomEvent)	=> {
		const parser = event.getParser();

		homeRoomId = parser.homeRoomId;
	}

	const onGuestResult = (event: GetGuestRoomResultEvent)	=> {
		const parser = event.getParser();

		if (parser.roomForward) {
			CreateRoomSession(parser.data.roomId);
		}
	};

	onMount(() => {
		registerMessageEvent(GetGuestRoomResultEvent, onGuestResult);
		registerMessageEvent(NavigatorHomeRoomEvent, onHomeRoom);
		GetCommunication().connection.onReady();
	});
</script>


<button class="absolute bottom-0 left-0 px-4 py-2" onclick={() => {
	SendMessageComposer(new GetGuestRoomMessageComposer(homeRoomId, false, true));
}}>Go To Room ({homeRoomId})</button>