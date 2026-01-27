<script lang="ts">
	import { LocalizeText } from '$lib/api';
	import { getNavigatorListener } from '$lib/listeners/NavigatorListener.svelte';
	import LoadingImage from '../../assets/images/loading.png';
	import BobbaWindow from "$lib/themes/default/generic/window/BobbaWindow.svelte";
	import BobbaTabs from '../../generic/window/tabs/BobbaTabs.svelte';
	import BobbaTabsItem from '../../generic/window/tabs/BobbaTabsItem.svelte';
	import Flex from '$lib/components/common/Flex.svelte';

	const navigatorListener = getNavigatorListener();
	const navigatorClose = () => { navigatorListener.visible = false; };
</script>

{#if navigatorListener.visible}
	<BobbaWindow class="min-h-135" unique="navigator" headerTitle={ LocalizeText('navigator.title') } onCloseClick={ navigatorClose }>
		<BobbaTabs>
			{#if navigatorListener.topLevelContexts && (navigatorListener.topLevelContexts.length > 0)}
				{#each navigatorListener.topLevelContexts as context, i (i)}
					<BobbaTabsItem class="items-center" active={ navigatorListener.topLevelContext === context } onclick={ () => navigatorListener.sendSearch('', context.code)}>
						{ LocalizeText('navigator.toplevelview.' + context.code) }
					</BobbaTabsItem>
				{/each}
			{/if}
		</BobbaTabs>
		<Flex column fullWidth fullHeight class="py-2 relative mb-3">
			{#if navigatorListener.loading}
				<Flex fullWidth fullHeight class="bg-[#FFFFFF10] rounded-md justify-center absolute items-center">
					<img src={LoadingImage} alt="loading" class="size-4 animate-spin"/>
				</Flex>
			{/if}
			asd
		</Flex>
	</BobbaWindow>
{/if}