<script lang="ts">
	import { type ILinkEventTracker } from '@nitrots/nitro-renderer';
	import { AddEventLinkTracker, CreateLinkEvent, TryVisitRoom, RemoveLinkEventTracker } from '$lib/api';
	import { onMount } from 'svelte';
	import { getHomeRoomId, registerNavigatorEvents } from '$lib/events/navigator.svelte';
	import DraggableWindow from '$lib/themes/default/generic/DraggableWindow.svelte';

	let isVisible = $state(false);

	const linkTracker: ILinkEventTracker = {
		linkReceived: (url: string) => {
			const parts = url.split('/');

			let method = parts[0];
			let value = parts.length > 1 ? parts[1] : undefined;

			if (method === 'navigator' && parts.length > 1) {
				method = parts[1];
				value = parts.length > 2 ? parts[2] : undefined;
			}

			switch (method) {
				case 'show':
					isVisible = true;
					return;
				case 'hide':
					isVisible = false;
					return;
				case 'toggle':
					isVisible = !isVisible;
					return;
				case 'goto':
					if (!value) return;

					if (value === 'home') {
						if (getHomeRoomId() > 0) TryVisitRoom(getHomeRoomId());
					} else {
						const roomId = parseInt(value);
						if (!isNaN(roomId)) TryVisitRoom(roomId);
					}
					return;
			}
		},
		eventUrlPrefix: 'navigator/',
	};

	onMount(() => {
		registerNavigatorEvents();
		AddEventLinkTracker(linkTracker);
		return () => RemoveLinkEventTracker(linkTracker);
	});
</script>
<div class="absolute bottom-0 left-0">
	<button class="cursor-pointer" onclick={() => CreateLinkEvent("navigator/goto/home")}>Go To Home</button>
	<button class="cursor-pointer" onclick={() => CreateLinkEvent("navigator/toggle")}>Show</button>
	{#if isVisible}
		<button class="cursor-pointer" onclick={() => CreateLinkEvent("navigator/goto/325")}>test</button>
	{/if}
</div>
<DraggableWindow bind:visible={isVisible} >
	<div class="h-40 flex flex-col bg-black">
		<p class="text-white">
			testinggg
		</p>
	</div>
</DraggableWindow>
