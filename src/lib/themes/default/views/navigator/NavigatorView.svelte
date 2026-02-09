<script lang="ts">
	import { CreateLinkEvent, LocalizeText, SendMessageComposer } from '$lib/api';
	import { getNavigatorListener } from '$lib/listeners/NavigatorListener.svelte';
	import LoadingImage from '../../assets/images/loading.png';
	import BobbaWindow from "$lib/themes/default/generic/window/BobbaWindow.svelte";
	import BobbaTabs from '../../generic/window/tabs/BobbaTabs.svelte';
	import BobbaTabsItem from '../../generic/window/tabs/BobbaTabsItem.svelte';
	import Flex from '$lib/components/common/Flex.svelte';
	import SearchComponent from '$lib/themes/default/views/navigator/components/search/SearchComponent.svelte';
	import SearchResultComponent from '$lib/themes/default/views/navigator/components/search/SearchResultComponent.svelte';
	import { untrack } from 'svelte';
	import { FindNewFriendsMessageComposer } from '@nitrots/nitro-renderer';

	const navigator = getNavigatorListener();
    
    let searchResults = $derived.by(() => {
        if (!navigator.searchResult) return [];
        return navigator.searchResult.results;
    });

	let elementRef: HTMLElement | null = $state(null);

	$effect(() => {
		if(elementRef) elementRef.scrollTop = 0;
	});

	$effect(() => {
		if (navigator.visible) {
			untrack(() => navigator.reloadCurrentSearch());
		}
	});

	const navigatorClose = () => { navigator.visible = false; };
</script>

{#if navigator.visible}
	<BobbaWindow class="min-h-140 min-w-107" unique="navigator" headerTitle={ LocalizeText('navigator.title') } onCloseClick={ navigatorClose }>
		<BobbaTabs>
			{#if navigator.topLevelContexts && (navigator.topLevelContexts.length > 0)}
				{#each navigator.topLevelContexts as context, i (i)}
					<BobbaTabsItem class="items-center" active={ navigator.topLevelContext === context } onclick={ () => navigator.sendSearch('', context.code)}>
						{ LocalizeText('navigator.toplevelview.' + context.code) }
					</BobbaTabsItem>
				{/each}
			{/if}
		</BobbaTabs>
		{#if navigator.loading}
			<Flex fullWidth fullHeight class="bg-[#FFFFFF10] rounded-md justify-center absolute items-center z-50">
				<img src={LoadingImage} alt="loading" class="size-4 animate-spin"/>
			</Flex>
		{/if}
		<Flex column grow class="overflow-hidden">
			<Flex column fullWidth fullHeight class="py-2 relative gap-2">
				<SearchComponent  />
				<Flex fullWidth column grow class="overflow-auto gap-2" bind:element={elementRef}>
					{#if searchResults.length > 0}
						{#each searchResults as result, index (index)}
							<SearchResultComponent searchResult={result} />
						{/each}
					{/if}
				</Flex>
				<Flex fullWidth class="relative">
					<Flex fullWidth class="justify-between">
						<Flex class="bg-(image:--navigator-spritesheet) items-center justify-center bg-position-[0_-67px] h-15 w-52.5 float-left cursor-pointer" onclick={ undefined }>
							<p class="text-white font-bold ms-14 text-[14px]">
								{ LocalizeText('navigator.createroom.create') }
							</p>
						</Flex>
						{#if (navigator.searchResult?.code !== 'myworld_view' && navigator.searchResult?.code !== 'roomads_view')}
							<Flex class="bg-(image:--navigator-spritesheet) items-center justify-center bg-position-[0_-128px] h-15 w-52.5 float-left cursor-pointer" onclick={ () => SendMessageComposer(new FindNewFriendsMessageComposer()) }>
								<p class="text-white font-bold ms-17 text-[14px]">
									{ LocalizeText('navigator.random.room') }
								</p>
							</Flex>
						{/if}
						{#if (navigator.searchResult?.code === 'myworld_view' || navigator.searchResult?.code === 'roomads_view')}
							<Flex class="bg-(image:--navigator-spritesheet) items-center justify-center bg-position-[0_-189px] h-15 w-52.5 float-left cursor-pointer" onclick={ () => SendMessageComposer(new FindNewFriendsMessageComposer()) }>
								<p class="text-white font-bold ms-14 text-[14px]">
									{ LocalizeText('navigator.promote.room') }
								</p>
							</Flex>
						{/if}
					</Flex>
				</Flex>
			</Flex>
		</Flex>
	</BobbaWindow>
{/if}
