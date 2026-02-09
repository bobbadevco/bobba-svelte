<script lang="ts">
	import Flex from '$lib/components/common/Flex.svelte';
	import { RoomData, RoomDataParser } from '@nitrots/nitro-renderer';
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


<Flex pointer class={['overflow-hidden gap-2 items-center w-full', classes]} onclick={visitRoom}>
	<Flex fullWidth class="overflow-hidden gap-2 items-center">
		<Flex class="justify-center items-center rounded-sm p-0 px-2 gap-2 font-bold" style="background-color: {occupancyColor()}">
			<div class="bg-(image:--navigator-spritesheet) bg-position-[-69px_-58px] w-1.75 h-2 bg-no-repeat"></div>
			<p class="text-[12px]">
				{roomData.userCount}
			</p>
		</Flex>
		<p class="truncate max-w-75 grow text-start text-[14px]">{roomData.roomName}</p>
	</Flex>
	<Flex reverse class="flex-row-reverse gap-1 items-center me-1.5">
		{#if roomData.habboGroupId}
			<i class="bg-(image:--navigator-spritesheet) bg-position-[-19px_-54px] w-3.25 h-2.75"></i>
		{/if}
		{#if (roomData.doorMode !== RoomDataParser.OPEN_STATE) }
			<i class="bg-(image:--navigator-spritesheet) w-3.25 h-4 {roomData.doorMode === RoomDataParser.DOORBELL_STATE && 'bg-position-[-38px_-24px]'} {roomData.doorMode === RoomDataParser.INVISIBLE_STATE && 'bg-position-[-52px_-24px]'} {roomData.doorMode === RoomDataParser.PASSWORD_STATE && 'bg-position-[-66px_-24px]'}"></i>
		{/if}
	</Flex>
</Flex>
