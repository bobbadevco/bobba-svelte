<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { getCatalogListener } from '$lib/listeners/CatalogListener.svelte';
	import { RemoveLinkEventTracker, RequestedPage, SendMessageComposer } from '$lib/api';
	import {
		BuildersClubQueryFurniCountMessageComposer,
		GetCatalogIndexComposer,
		GetClubGiftInfo,
		GetGiftWrappingConfigurationComposer
	} from '@nitrots/nitro-renderer';

	onMount(() => {
		getCatalogListener();
		return () => {
			RemoveLinkEventTracker(getCatalogListener());
			if (getCatalogListener().roomPreviewer) {
				getCatalogListener().roomPreviewer?.dispose();
				getCatalogListener().roomPreviewer = undefined;
			}
		}
	});

	$effect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		getCatalogListener().currentPage;
		return () => {
			untrack(() => getCatalogListener().currentOffer = undefined);
		}
	});

	$effect(() => {
		const rootNode = getCatalogListener().rootNode;
		const requestedPage = getCatalogListener().requestedPage;
		if(!getCatalogListener().visible || !rootNode || !getCatalogListener().offersToNodes || !requestedPage) return;

		untrack(() => {
			switch(getCatalogListener().requestedPage.requestType)
			{
				case RequestedPage.REQUEST_TYPE_NONE:
					if(getCatalogListener().currentPage) return;

					if(rootNode)
					{
						for(const child of rootNode.children)
						{
							if(child && child.isVisible)
							{
								getCatalogListener().activateNode(child);

								return;
							}
						}
					}
					return;
				case RequestedPage.REQUEST_TYPE_ID:
					getCatalogListener().openPageById(getCatalogListener().requestedPage.requestById);
					getCatalogListener().requestedPage.resetRequest();
					return;
				case RequestedPage.REQUEST_TYPE_OFFER:
					getCatalogListener().openPageByOfferId(getCatalogListener().requestedPage.requestedByOfferId);
					getCatalogListener().requestedPage.resetRequest();
					return;
				case RequestedPage.REQUEST_TYPE_NAME:
					getCatalogListener().openPageByName(requestedPage.requestByName || '');
					requestedPage.resetRequest();
					return;
			}
		});
	});

	$effect(() => {
		if(!getCatalogListener().searchResult && getCatalogListener().currentPage && (getCatalogListener().currentPage?.pageId === -1)) untrack(() => getCatalogListener().openPageById(getCatalogListener().previousPageId));
	});

	$effect(() => {
		if (!getCatalogListener().currentOffer) return;
		untrack(() => getCatalogListener().purchaseOptions = { quantity: 1, extraData: undefined, extraParamRequired: false, previewStuffData: undefined });
	});

	$effect(() => {
		if(!getCatalogListener().visible || getCatalogListener().rootNode) return;

		SendMessageComposer(new GetGiftWrappingConfigurationComposer());
		SendMessageComposer(new GetClubGiftInfo());
		SendMessageComposer(new GetCatalogIndexComposer(getCatalogListener().currentType));
		SendMessageComposer(new BuildersClubQueryFurniCountMessageComposer());
	});
</script>