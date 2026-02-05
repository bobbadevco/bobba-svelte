<script lang="ts">
	import type { RoomDataParser } from '@nitrots/nitro-renderer';
	import { getNavigatorListener } from '$lib/listeners/NavigatorListener.svelte';
	import Flex from '$lib/components/common/Flex.svelte';
	import defaultImage from "$lib/themes/default/assets/images/navigator/room_thumbnail.png";
	import RoomThumbnail from '$lib/components/common/layout/RoomThumbnail.svelte';
	import Fa from 'svelte-fa';
	import {faUser} from '@fortawesome/free-solid-svg-icons/faUser';

	interface ThumbnailItemProps
	{
		roomData: RoomDataParser
	}

	let {roomData}: ThumbnailItemProps = $props();
	const navigator = getNavigatorListener();
	const visitRoom = () => navigator.visitRoom(roomData);
</script>

<Flex onclick={visitRoom} pointer column >
	<RoomThumbnail {defaultImage} roomId={roomData.roomId} customUrl={roomData.officialRoomPicRef} class="flex flex-col items-center justify-end mb-1">
		<Flex center class="absolute m-1 p-1 inline-block">
			<Fa icon={faUser} />
			{roomData.userCount}
		</Flex>
	</RoomThumbnail>
	<Flex fullWidth>
		<p class="grow truncate">{roomData.roomName}</p>
	</Flex>
</Flex>