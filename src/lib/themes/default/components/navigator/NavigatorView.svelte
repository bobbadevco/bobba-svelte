<script lang="ts">
	import {
		type ILinkEventTracker,
	} from '@nitrots/nitro-renderer';
	import { AddEventLinkTracker, CreateLinkEvent, TryVisitRoom } from '$lib/api';
	import { onMount } from 'svelte';
	import { getHomeRoomId, registerNavigatorEvents } from '$lib/events/navigator.svelte';

	const initialize = () => {
		AddEventLinkTracker({
			linkReceived: (url: string) => {
				const parts = url.split('/');

				if(parts.length < 2) return;

				switch(parts[1]) {
					case 'goto':
						if(parts.length <= 2) return;

						switch(parts[2])
						{
							case 'home':
								if(getHomeRoomId() <= 0) return;

								TryVisitRoom(getHomeRoomId());
								break;
							default: {
								const roomId = parseInt(parts[2]);

								TryVisitRoom(roomId);
							}
						}
						return;
				}
			},
			eventUrlPrefix: 'navigator/',
		} as ILinkEventTracker);
	};

	onMount(() => {
		registerNavigatorEvents();
		initialize();
	});
</script>
<div class="cursor-pointer absolute bottom-0 left-0">
	<button class="cursor-pointer" onclick={() => CreateLinkEvent("navigator/goto/home")}>Go To Home</button>
</div>
