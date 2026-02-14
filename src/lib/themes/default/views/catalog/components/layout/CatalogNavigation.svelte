<script lang="ts">
	import { getCatalogListener } from '$lib/listeners';
	import Flex from '$lib/components/common/Flex.svelte';
	import CatalogNavigationItem
		from '$lib/themes/default/views/catalog/components/layout/navigation/CatalogNavigationItem.svelte';
	import CatalogNavigationSet
		from '$lib/themes/default/views/catalog/components/layout/navigation/CatalogNavigationSet.svelte';

	const catalog = getCatalogListener();
</script>

{#if !catalog.navigationHidden}
	<Flex column fullHeight class="gap-1 col-span-4 overflow-hidden">
		{#if catalog.activeNodes && catalog.activeNodes.length > 0}
			<Flex column fullHeight class="text-shadow-none gap-px bg-tertiary inset-ring-1 inset-ring-primary overflow-hidden">
				<div class="grid grid-cols-1 gap-0 overflow-auto h-full">
					{#if catalog.searchResult && catalog.searchResult.filteredNodes.length > 0}
						{#each catalog.searchResult.filteredNodes as n, i (i)}
							<CatalogNavigationItem node={n} />
						{/each}
					{/if}
					{#if !catalog.searchResult}
						<CatalogNavigationSet node={catalog.activeNodes[0]} />
					{/if}
				</div>
			</Flex>
		{/if}
	</Flex>
{/if}