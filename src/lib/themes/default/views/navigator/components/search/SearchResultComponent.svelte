<script lang="ts">
	import { getNavigatorListener } from '$lib/listeners/NavigatorListener.svelte';
	import Flex from '$lib/components/common/Flex.svelte';
	import ListItemComponent from '$lib/themes/default/views/navigator/components/search/ListItemComponent.svelte';
	import ThumbnailItemComponent from '$lib/themes/default/views/navigator/components/search/ThumbnailItemComponent.svelte';
	import { NavigatorDisplayMode } from '$lib/api/navigator/NavigatorDisplayMode';
	import { LocalizeText, SendMessageComposer } from '$lib/api';
	import { type NavigatorSearchResultList, NavigatorSearchComposer } from '@nitrots/nitro-renderer';
	import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	
	interface SearchResultComponentProps {
		searchResult: NavigatorSearchResultList;
	}

	const { searchResult }: SearchResultComponentProps = $props();

	let isExtended = $derived(!searchResult.closed);
	let displayMode = $derived(searchResult.mode);
    let rooms = $derived(searchResult.rooms);

	const navigator = getNavigatorListener();

	let itemTitle = $derived.by(() =>
    {
        let name = searchResult.code;

        if(!name || !name.length || LocalizeText('navigator.searchcode.title.' + name) == ('navigator.searchcode.title.' + name)) return searchResult.data;

        if(name.startsWith('${')) return name.slice(2, (name.length - 1));

        return ('navigator.searchcode.title.' + name);
    });

	const toggleDisplayMode = () =>
    {
        if (displayMode === NavigatorDisplayMode.LIST) {
			displayMode = NavigatorDisplayMode.THUMBNAILS;
		} else {
			displayMode = NavigatorDisplayMode.LIST;
		}
    }

	const showMore = () =>
    {
        if(searchResult.action == 1) SendMessageComposer(new NavigatorSearchComposer(searchResult.code, ''));
        else if(searchResult.action == 2 && navigator.topLevelContext) SendMessageComposer(new NavigatorSearchComposer(navigator.topLevelContext.code,''));
    }

	let gridHasTwoColumns = $derived(displayMode >= NavigatorDisplayMode.THUMBNAILS);
	
	$effect(() =>
    {
        if(!searchResult) return;

        isExtended = !searchResult.closed;

        displayMode = searchResult.mode;
    });

</script>

<div class="flex flex-col text-white w-full">
	<Flex fullWidth class="py-1 cursor-pointer" onclick={() => isExtended = !isExtended}>
		<Flex class="items-center gap-1">
			{#if isExtended}
				<Fa icon={ faMinus } />
			{:else}
				<Fa icon={ faPlus } />
			{/if}
			<span class="text-[14px]">{LocalizeText(itemTitle)}</span>
		</Flex>
		<Flex class="items-center gap-2">
			{#if displayMode === NavigatorDisplayMode.LIST}
				<Flex class="icon icon-thumbnail-view cursor-pointer" onclick={ toggleDisplayMode } />
			{/if}
			{#if displayMode >= NavigatorDisplayMode.THUMBNAILS}
				<Flex class="icon icon-inline-view cursor-pointer" onclick={ toggleDisplayMode } />
			{/if}
			{#if (searchResult.action > 0)}
				{#if (searchResult.action === 1)}
					<Flex class="icon icon-show-more cursor-pointer" onclick={ showMore } />
				{/if}
				{#if (searchResult.action !== 1)}
					<Flex class="icon icon-show-more active cursor-pointer" onclick={ showMore } />
				{/if}
			{/if}
			<!--{ (topLevelContext.code !== 'official_view') && <LayoutSearchSavesView title={ LocalizeText('navigator.tooltip.add.saved.search') } onClick={ () => SendMessageComposer(new NavigatorSearchSaveComposer(getResultTitle(), searchResult.data)) } /> }-->
		</Flex>
	</Flex>
	<div class="flex flex-col w-full min-h-5">
		{#if isExtended}
            <div class={gridHasTwoColumns ? "grid grid-cols-3 gap-1" : "flex flex-col gap-1"}>
                {#each rooms as roomData, roomIndex}
                    {#if gridHasTwoColumns}
                        <ThumbnailItemComponent roomData={roomData} />
                    {:else}
                        <ListItemComponent class={roomIndex % 2 === 0 ? 'bg-secondary' : ''} roomData={roomData} />
                    {/if}
				{:else}
					<div class="p-1 text-xs">No rooms found.</div>
                {/each}
            </div>
		{/if}
	</div>
</div>
