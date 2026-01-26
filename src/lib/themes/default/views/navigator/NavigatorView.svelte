<script lang="ts">
	import { LocalizeText } from '$lib/api';
	import { getNavigatorListener } from '$lib/listeners/NavigatorListener.svelte';
	import LoadingImage from '../../assets/images/loading.png';
	import BobbaWindow from '../../generic/window/BobbaWindow.svelte';
	import BobbaTabs from '../../generic/window/tabs/BobbaTabs.svelte';
	import BobbaTabsItem from '../../generic/window/tabs/BobbaTabsItem.svelte';

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
		<div class="flex flex-col w-full h-full py-2">
			{#if navigatorListener.loading}
				<div class="w-full h-full bg-[#FFFFFF10] rounded-md justify-center items-center flex">
					<img src={LoadingImage} alt="loading" class="size-4 animate-spin"/>
				</div>
			{/if}
		</div>
	</BobbaWindow>
{/if}