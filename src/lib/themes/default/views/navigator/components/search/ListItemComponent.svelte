<script lang="ts">
	import Flex from '$lib/components/common/Flex.svelte';
	import avatar_icon from '$lib/themes/default/assets/images/navigator/avatar_icon.png';
	import room_group from '$lib/themes/default/assets/images/navigator/room_group.png';
	import type { RoomDataParser } from '@nitrots/nitro-renderer';
	import { getNavigatorListener } from '$lib/listeners/NavigatorListener.svelte';
	import type { ClassValue } from 'svelte/elements';

	interface ListItemProps
	{
		roomData: RoomDataParser;
		class?: ClassValue;
	}

	let { roomData, class: classes = '' }: ListItemProps = $props();
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


<Flex pointer class={['overflow-hidden gap-2 items-center', classes]} onclick={visitRoom}>
	<Flex class="justify-center items-center rounded-sm p-0 px-2 gap-2 font-bold" style="background-color: {occupancyColor()}">
		<div class="w-1.75 h-2 bg-no-repeat" style:background-image="url({avatar_icon})"></div>
		<p class="text-[12px]">
			{roomData.userCount}
		</p>
	</Flex>
	<p class="truncate grow text-start">{roomData.roomName}</p>
	<Flex class="flex-row-reverse gap-1 items-center">
		{#if roomData.habboGroupId}
			<i style:background-image="url({room_group})" class="w-3.25 h-2.75"></i>
		{/if}
	</Flex>
</Flex>
