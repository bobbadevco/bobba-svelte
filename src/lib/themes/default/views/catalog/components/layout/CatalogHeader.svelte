<script lang="ts">
	import Flex from '$lib/components/common/Flex.svelte';
	import { getCatalogListener } from '$lib/listeners';
	import { GetConfiguration, LocalizeText } from '$lib/api';
	const catalog = getCatalogListener();

	const iconUrl = GetConfiguration<string>('catalog.asset.icon.url');
	const desc = $derived(!catalog.searchResult ? (catalog.currentPage && catalog.currentPage.localization.getText(0)) : LocalizeText('catalog.search.results', [ 'count', 'needle' ], [ catalog.searchResult?.offers.length.toString() || '', catalog.searchResult?.searchValue || '' ]) );
</script>

<Flex class="min-h-30 border-l border-r border-l-black border-r-black relative
						overflow-hidden z-1 -mt-px shadow-[inset_0px_0px_0px_3px_#ffffff40] bg-tertiary">
	<Flex column class="absolute mt-5">
		{#if catalog.currentPage && catalog.rootNode}
			<img
				src={iconUrl.replace("%name%", catalog.getNodeById(catalog.currentPage.pageId, catalog.rootNode)?.iconId.toString() || "")}
				alt="Page icon"
				class="scale-200 size-5 absolute top-3.75 left-8.75 drop-shadow-[2px_1px_0_rgba(0,0,0,.239216)]"
			/>
			<p class="text-base h-full font-bold pl-20 -mt-1.25">
				{#if catalog.searchResult}
					{LocalizeText('catalog.search.header')}
				{:else}
					{catalog.getNodeById(catalog.currentPage.pageId, catalog.rootNode)?.localization}
				{/if}
			</p>
		{/if}
		<p class="text-xs pl-20 pr-2.5">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html desc}
		</p>
	</Flex>
	<div class="bg-cover bg-no-repeat bg-position-[50%] size-full opacity-10 grayscale"
			 style:background-image="url({catalog.currentPage && catalog.currentPage.localization.getImage(0)})"></div>
</Flex>