<script lang="ts">
	import { CreateLinkEvent } from '$lib/api';
	import { getNavigatorListener } from '$lib/listeners/NavigatorListener.svelte';
	import BobbaWindow from '../../generic/card/BobbaWindow.svelte';

</script>

<div class="absolute bottom-0 left-0">
	<button class="cursor-pointer" onclick={() => CreateLinkEvent("navigator/goto/home")}>Go To Home</button>
	<button class="cursor-pointer" onclick={() => CreateLinkEvent("navigator/toggle")}>Show</button>
	{#if getNavigatorListener().isVisible}
		<button class="cursor-pointer" onclick={() => CreateLinkEvent("navigator/goto/325")}>test</button>
	{/if}
</div>
<BobbaWindow headerTitle="Navigator" bind:visible={() => getNavigatorListener().isVisible, (v) => getNavigatorListener().isVisible = v} >
	<div class="size-full min-h-40 min-w-40">
		<p class="text-white">
			testinggg
		</p>
	</div>
</BobbaWindow>
