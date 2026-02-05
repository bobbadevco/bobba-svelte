<script lang="ts">
	import Flex from '$lib/components/common/Flex.svelte';
	import avatar_icon from '$lib/themes/default/assets/images/navigator/avatar_icon.png';
	import room_group from '$lib/themes/default/assets/images/navigator/room_group.png';
	import type { RoomDataParser } from '@nitrots/nitro-renderer';
	import { getNavigatorListener } from '$lib/listeners/NavigatorListener.svelte';
	interface ListItemProps
	{
		roomData: RoomDataParser
	}

	let {roomData}: ListItemProps = $props();
	const navigator = getNavigatorListener();
	const visitRoom = () => navigator.visitRoom(roomData);
</script>

<Flex pointer class="overflow-hidden gap-2 items-center" onclick={visitRoom}>
	<Flex class="justify-center items-center p-1 font-bold">
		<div class="w-1.75 h-2 bg-no-repeat" style:background-image="url({avatar_icon})" >
		</div>
		{roomData.userCount}
	</Flex>
	<p class="truncate grow">{roomData.roomName}</p>
	<Flex class="flex-row-reverse gap-1 items-center">
		{#if roomData.habboGroupId}
			<i style:background-image="url({room_group})" class="w-3.25 h-2.75" ></i>
		{/if}
	</Flex>
</Flex>