<script lang="ts">
	import { getNavigatorListener } from '$lib/listeners/NavigatorListener.svelte.js';
	import Flex from '$lib/components/common/Flex.svelte';
	import { NavigatorDisplayMode } from '$lib/api/navigator/NavigatorDisplayMode';
	import { LocalizeText, SendMessageComposer } from '$lib/api';
	import {
		type NavigatorSearchResultList,
		NavigatorSearchComposer,
		NavigatorSearchSaveComposer
	} from '@nitrots/nitro-renderer';
	import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
	import { Fa } from 'svelte-fa';
	import ThumbnailItemComponent
		from '$lib/themes/default/views/navigator/components/search/ThumbnailItemComponent.svelte';
	import ListItemComponent from '$lib/themes/default/views/navigator/components/search/ListItemComponent.svelte';

	interface SearchResultComponentProps {
		searchResult: NavigatorSearchResultList;
	}

	const { searchResult }: SearchResultComponentProps = $props();
	const navigator = getNavigatorListener();

	const getResultTitle = () =>
	{
		let name = searchResult.code;

		if(!name || !name.length || LocalizeText('navigator.searchcode.title.' + name) == ('navigator.searchcode.title.' + name)) return searchResult.data;

		if(name.startsWith('${')) return name.slice(2, (name.length - 1));

		return ('navigator.searchcode.title.' + name);
	}

	const toggleDisplayMode = (event: MouseEvent) =>
	{
		event.stopPropagation();
        if (displayMode === NavigatorDisplayMode.LIST) {
			displayMode = NavigatorDisplayMode.THUMBNAILS;
		} else {
			displayMode = NavigatorDisplayMode.LIST;
		}
	}

	const toggleExtended = () =>
	{
		isExtended = !isExtended;
	}

	const showMore = (event: MouseEvent) =>
	{
	event.stopPropagation();
			if(searchResult.action == 1) SendMessageComposer(new NavigatorSearchComposer(searchResult.code, ''));
			else if(searchResult.action == 2 && navigator.topLevelContext) SendMessageComposer(new NavigatorSearchComposer(navigator.topLevelContext.code,''));
	}

	let isExtended = $derived(!searchResult.closed);
	let displayMode = $derived(searchResult.mode);
	let rooms = $derived(searchResult.rooms);
	let gridHasTwoColumns = $derived(displayMode >= NavigatorDisplayMode.THUMBNAILS);

	let itemTitle = $derived.by(() =>
	{
		let name = searchResult.code;

		if(!name || !name.length || LocalizeText('navigator.searchcode.title.' + name) == ('navigator.searchcode.title.' + name)) return searchResult.data;

		if(name.startsWith('${')) return name.slice(2, (name.length - 1));

		return ('navigator.searchcode.title.' + name);
	});
	
	$effect(() =>
    {
        if(!searchResult) return;

        isExtended = !searchResult.closed;

        displayMode = searchResult.mode;
    });

</script>

<div class="flex flex-col text-white bg-primary {gridHasTwoColumns && isExtended && displayMode === NavigatorDisplayMode.THUMBNAILS ? 'p-2 pt-0' : gridHasTwoColumns && 'px-2'} rounded-sm w-full">
	<Flex fullWidth class="py-1 {!gridHasTwoColumns && 'px-2'} cursor-pointer justify-between" onclick={toggleExtended}>
		<Flex class="items-center gap-1">
			{#if isExtended}
				<Fa icon={ faMinus } />
			{:else}
				<Fa icon={ faPlus } />
			{/if}
			<span class="text-[14px]">{LocalizeText(itemTitle)}</span>
		</Flex>
		<Flex class="items-center gap-1 p-1">
			{#if displayMode === NavigatorDisplayMode.LIST}
				<Flex class="bg-(image:--navigator-spritesheet) bg-position-[-57px_-55px] pointer-events-auto size-2.75 cursor-pointer" onclick={ toggleDisplayMode } />
			{/if}
			{#if displayMode >= NavigatorDisplayMode.THUMBNAILS}
				<Flex class="bg-(image:--navigator-spritesheet) bg-position-[-45px_-55px] pointer-events-auto size-2.75 cursor-pointer" onclick={ toggleDisplayMode } />
			{/if}
			{#if searchResult.action > 0}
				{#if searchResult.action === 1}
					<Flex class="bg-(image:--navigator-spritesheet) bg-position-[-33px_-55px] pointer-events-auto size-2.75 cursor-pointer" onclick={ showMore } />
				{/if}
				{#if searchResult.action !== 1}
					<Flex class="bg-(image:--navigator-spritesheet) bg-position-[-77px_-55px] pointer-events-auto size-2.75 cursor-pointer" onclick={ showMore } />
				{/if}
			{/if}
			{#if navigator.topLevelContext?.code !== 'official_view'}
				<Flex pointer class="bg-(image:--navigator-spritesheet) bg-position-[-95px_-48px] size-[18px] pointer-events-auto" onclick={ () => SendMessageComposer(new NavigatorSearchSaveComposer(getResultTitle(), searchResult.data)) } />
			{/if}
	</Flex>
	</Flex>
	<div class="flex flex-col w-full">
		{#if isExtended}
			<div class='gap-1 {gridHasTwoColumns ? "grid grid-cols-3 justify-center" : "flex flex-col"}'>
					{#each rooms as roomData, roomIndex (roomData.roomId)}
							{#if gridHasTwoColumns}
									<ThumbnailItemComponent roomData={roomData} />
							{:else}
									<ListItemComponent class={roomIndex % 2 === 0 ? 'bg-tertiary' : ''} roomData={roomData} />
							{/if}
					{/each}
			</div>
		{/if}
	</div>
</div>
