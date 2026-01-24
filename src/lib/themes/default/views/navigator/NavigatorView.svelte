<script lang="ts">
	import { CreateLinkEvent, TryVisitRoom } from '$lib/api';
	import { getNavigatorListener } from '$lib/listeners/NavigatorListener.svelte';
	import BobbaWindow from '../../generic/card/BobbaWindow.svelte';

	const navigatorClose = () => { CreateLinkEvent("navigator/hide"); };
</script>

{#if getNavigatorListener().visible}
	<BobbaWindow headerTitle="Navigator" onCloseClick={ navigatorClose }>
		<div class="size-full min-h-40 min-w-40">
			<button onclick={() => TryVisitRoom(325)} class="text-white">
				testinggg
			</button>
		</div>
	</BobbaWindow>
{/if}
