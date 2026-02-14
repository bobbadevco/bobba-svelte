<script lang="ts">
	import Flex from '$lib/components/common/Flex.svelte';
	import { GetConfiguration, type ICatalogNode } from '$lib/api';
	import CatalogNavigationSet
		from '$lib/themes/default/views/catalog/components/layout/navigation/CatalogNavigationSet.svelte';
	import { getCatalogListener } from '$lib/listeners';

	interface CatalogNavigationItemProps {
		node: ICatalogNode;
	}

	let {node}: CatalogNavigationItemProps = $props();
	const iconUrl = GetConfiguration<string>('catalog.asset.icon.url');
</script>

<Flex style="padding-left: {(node.depth - 2) * 10}px;" pointer
			onclick={() => getCatalogListener().activateNode(node)}
>
	<img src={iconUrl.replace("%name%", node.iconId.toString())}
			 class="size-5" alt="{node.localization} icon"
	/>
	<p>{node.localization}</p>

</Flex>
{#if node.isOpen && node.isBranch}
	<CatalogNavigationSet {node} />
{/if}