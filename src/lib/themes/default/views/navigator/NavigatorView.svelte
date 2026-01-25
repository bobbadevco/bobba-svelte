<script lang="ts">
	import { LocalizeText, TryVisitRoom } from '$lib/api';
	import { getNavigatorListener } from '$lib/listeners/NavigatorListener.svelte';
	import BobbaWindow from '../../generic/window/BobbaWindow.svelte';
	import BobbaTabs from '../../generic/window/tabs/BobbaTabs.svelte';
	import BobbaTabsItem from '../../generic/window/tabs/BobbaTabsItem.svelte';

	const navigatorListener = getNavigatorListener();
	const navigatorClose = () => { getNavigatorListener().visible = false; };
</script>

{#if navigatorListener.visible}
	<BobbaWindow unique="navigator" headerTitle={ LocalizeText('navigator.title') } onCloseClick={ navigatorClose }>
		<BobbaTabs>
			{#if navigatorListener.topLevelContexts && (navigatorListener.topLevelContexts.length > 0) }
				{#each navigatorListener.topLevelContexts as context}
					<BobbaTabsItem active={ navigatorListener.topLevelContext === context } onclick={ () => navigatorListener.sendSearch('', context.code)}>
						{ LocalizeText('navigator.toplevelview.' + context.code) }
					</BobbaTabsItem>
				{/each}
			{/if}
		</BobbaTabs>
		<div class="size-full min-h-40 min-w-40">
			<button onclick={() => TryVisitRoom(325)} class="text-white">
				testinggg
			</button>
		</div>
	</BobbaWindow>
{/if}