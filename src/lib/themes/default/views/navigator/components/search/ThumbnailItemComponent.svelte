<script lang="ts">
	import type { RoomDataParser } from '@nitrots/nitro-renderer';
	import { getNavigatorListener } from '$lib/listeners/NavigatorListener.svelte.js';
	import Flex from '$lib/components/common/Flex.svelte';
	import defaultImage from "$lib/themes/default/assets/images/navigator/room_thumbnail.png";
	import RoomThumbnail from '$lib/components/common/layout/RoomThumbnail.svelte';
	import RoomInfoComponent from '$lib/themes/default/views/navigator/components/search/RoomInfoComponent.svelte';


 	interface ThumbnailItemProps
	{
		roomData: RoomDataParser
	}

	let {roomData}: ThumbnailItemProps = $props();

	const navigator = getNavigatorListener();
	const visitRoom = () => navigator.visitRoom(roomData);

	const occupancyColor = () =>
	{
		if (roomData.userCount === 0){
			return '#959595';
		}
		const percentage = roomData.userCount / roomData.maxUserCount;

		if (percentage <= 0.5){
			return '#269900';
		}
		if (percentage <= 0.9){
			return '#cda100';
		}
		return '#cd0000';
	};
</script>

<Flex 
	class="bg-secondary rounded-md p-2 max-w-31.5 relative"
	data-room-id={roomData.roomId}
	onclick={visitRoom} 
	pointer 
	column 
>
	<RoomThumbnail {defaultImage} roomId={roomData.roomId} customUrl={roomData.officialRoomPicRef} class="flex bg-tertiary rounded-sm flex-col items-center justify-end mb-1">
		<Flex class="justify-center items-center rounded-sm p-0 px-2 mb-1 gap-2 font-bold" style="background-color: {occupancyColor()}">
			<div class="bg-(image:--navigator-spritesheet) bg-position-[-69px_-58px] w-1.75 h-2 bg-no-repeat"></div>
			<p class="text-[12px]">
				{roomData.userCount}
			</p>
		</Flex>
	</RoomThumbnail>
	<Flex fullWidth class="items-center justify-between gap-1">
		<p class="grow truncate">{roomData.roomName}</p>
		<div role="presentation" onmouseleave={(e) => e.stopPropagation()}>
			<RoomInfoComponent {roomData} />
		</div>
	</Flex>
</Flex>
