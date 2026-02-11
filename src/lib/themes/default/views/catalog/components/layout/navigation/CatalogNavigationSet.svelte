<script lang="ts">
	import type { ICatalogNode } from '$lib/api';
	import CatalogNavigationItem
		from '$lib/themes/default/views/catalog/components/layout/navigation/CatalogNavigationItem.svelte';

	interface CatalogNavigationSetProps {
		node?: ICatalogNode;
	}

	let {node}: CatalogNavigationSetProps = $props();
</script>

{#if node && node.children.length > 0}
	{#each node.children as n, i (i)}
		{#if n.isVisible}
			<CatalogNavigationItem node={n} />
		{/if}
	{/each}
{/if}