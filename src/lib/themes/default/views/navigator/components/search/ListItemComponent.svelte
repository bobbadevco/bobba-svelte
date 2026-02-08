<script lang="ts">
	import Flex from '$lib/components/common/Flex.svelte';
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
		<div class="bg-(image:--navigator-spritesheet) bg-position-[-50px_-58px] w-1.75 h-2 bg-no-repeat"></div>
		<p class="text-[12px]">
			{roomData.userCount}
		</p>
	</Flex>
	<p class="truncate grow text-start text-[14px]">{roomData.roomName}</p>
	<Flex class="flex-row-reverse gap-1 items-center">
		{#if roomData.habboGroupId}
			<i class="bg-(image:--navigator-spritesheet) bg-position-[0px_-54px] w-3.25 h-2.75 me-2"></i>
		{/if}
	</Flex>
</Flex>
