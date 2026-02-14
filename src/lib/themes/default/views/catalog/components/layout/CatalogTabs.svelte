<script lang="ts">
	import BobbaTabsItem from '$lib/themes/default/generic/window/tabs/BobbaTabsItem.svelte';
	import { getCatalogListener } from '$lib/listeners';
	import { GetConfiguration } from '$lib/api';
	import BobbaTabs from '$lib/themes/default/generic/window/tabs/BobbaTabs.svelte';
	import Flex from '$lib/components/common/Flex.svelte';

	const catalog = getCatalogListener();
	const {rootNode} = $derived(getCatalogListener());

	const iconUrl = GetConfiguration<string>('catalog.asset.icon.url');
	const showIcons = GetConfiguration('catalog.tab.icons');
</script>

<BobbaTabs>
	{#if rootNode && rootNode.children.length > 0}
		{#each rootNode.children as child, i (`${child.pageId}-${i}`)}
			<BobbaTabsItem active={child.isActive} onclick={() => {
						if (catalog.searchResult) {
							catalog.searchResult = undefined;
						}
						catalog.activateNode(child);
					 }}>
				<Flex class={[showIcons && "gap-1", "items-center"]}>
					{#if showIcons}
						<img src={iconUrl.replace("%name%", child.iconId.toString())}
								 class="size-5" alt="{child.localization} icon"
						/>
					{/if}
					<p>{child.localization}</p>
				</Flex>
			</BobbaTabsItem>
		{/each}
	{/if}
</BobbaTabs>
