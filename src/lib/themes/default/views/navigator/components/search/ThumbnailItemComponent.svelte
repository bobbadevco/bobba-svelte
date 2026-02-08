<script lang="ts">
	import type { RoomDataParser } from '@nitrots/nitro-renderer';
	import { getNavigatorListener } from '$lib/listeners/NavigatorListener.svelte';
	import Flex from '$lib/components/common/Flex.svelte';
	import defaultImage from "$lib/themes/default/assets/images/navigator/room_thumbnail.png";
	import RoomThumbnail from '$lib/components/common/layout/RoomThumbnail.svelte';
	import Fa from 'svelte-fa';
	import { faUser } from '@fortawesome/free-solid-svg-icons';

	interface ThumbnailItemProps
	{
		roomData: RoomDataParser
	}

	let {roomData}: ThumbnailItemProps = $props();
	const navigator = getNavigatorListener();
	const visitRoom = () => navigator.visitRoom(roomData);
</script>

<Flex class="bg-secondary rounded-md p-2 max-w-31.5" onclick={visitRoom} pointer column >
	<RoomThumbnail {defaultImage} roomId={roomData.roomId} customUrl={roomData.officialRoomPicRef} class="flex bg-tertiary rounded-sm flex-col items-center justify-end mb-1">
		<Flex center class="absolute m-1 p-1">
			<Fa icon={faUser} />
			<span class="ml-1 text-xs">{roomData.userCount}</span>
		</Flex>
	</RoomThumbnail>
	<Flex fullWidth>
		<p class="grow truncate">{roomData.roomName}</p>
	</Flex>
</Flex>
