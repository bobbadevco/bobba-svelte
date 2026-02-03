<script lang="ts">
	import { LocalizeText } from '$lib/api';
	import { getNavigatorListener } from '$lib/listeners/NavigatorListener.svelte';
	import LoadingImage from '../../assets/images/loading.png';
	import BobbaWindow from "$lib/themes/default/generic/window/BobbaWindow.svelte";
	import BobbaTabs from '../../generic/window/tabs/BobbaTabs.svelte';
	import BobbaTabsItem from '../../generic/window/tabs/BobbaTabsItem.svelte';
	import Flex from '$lib/components/common/Flex.svelte';
	import SearchComponent from '$lib/themes/default/views/navigator/components/search/SearchComponent.svelte';

	const navigator = getNavigatorListener();
	const navigatorClose = () => { navigator.visible = false; };
</script>

{#if navigator.visible}
	<BobbaWindow class="min-h-135" unique="navigator" headerTitle={ LocalizeText('navigator.title') } onCloseClick={ navigatorClose }>
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
			<Flex fullWidth fullHeight class="bg-[#FFFFFF10] rounded-md justify-center absolute items-center">
				<img src={LoadingImage} alt="loading" class="size-4 animate-spin"/>
			</Flex>
		{/if}
		<Flex column class="overflow-hidden">
			<Flex column fullWidth fullHeight class="py-2 relative mb-3">
				<SearchComponent />
				<Flex column class="overflow-auto">
					<!--{#if navigator.searchResult}
							{#each navigator.searchResult.results as result, i (i)}
								<SearchResultView searchResult={ result }/>
						{/each}
					{/if} -->
				</Flex>
			</Flex>
		</Flex>
	</BobbaWindow>
{/if}