<script lang="ts">
	import { getNavigatorListener } from '$lib/listeners/NavigatorListener.svelte';
	import Flex from '$lib/components/common/Flex.svelte';
	import ListItemComponent from '$lib/themes/default/views/navigator/components/search/ListItemComponent.svelte';

	const navigator = getNavigatorListener();
</script>

<Flex column class="text-white">
	<div class="flex flex-col">
		{#if navigator.searchResult}
			{#each navigator.searchResult.results as results, i (i)}
				{#each results.rooms as roomData, roomIndex (roomData.roomId)}
					<ListItemComponent class="{roomIndex % 2 === 0 ? 'bg-secondary' : ''}" roomData={roomData} />
				{/each}
			{/each}
		{/if}
	</div>
</Flex>