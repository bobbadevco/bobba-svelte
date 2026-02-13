<script lang="ts">
	import { getCatalogListener } from '$lib/listeners/CatalogListener.svelte';
	import BobbaWindow from '$lib/themes/default/generic/window/BobbaWindow.svelte';
	import CatalogTabs from '$lib/themes/default/views/catalog/components/layout/CatalogTabs.svelte';
	import CatalogHeader from '$lib/themes/default/views/catalog/components/layout/CatalogHeader.svelte';
	import CatalogNavigation from '$lib/themes/default/views/catalog/components/layout/CatalogNavigation.svelte';

	const catalog = getCatalogListener();
</script>

{#if catalog.visible}
	<BobbaWindow headerTitle="Catalog" unique="catalog" class="min-w-80 h-120 pb-1" onCloseClick={() => catalog.visible = false}>
		<CatalogTabs />
		<CatalogHeader />
		<div class="grid grid-cols-12 h-[calc(100%-10rem)]">
			<CatalogNavigation />
		</div>
	</BobbaWindow>
{/if}