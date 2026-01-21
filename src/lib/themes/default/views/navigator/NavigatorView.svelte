<script lang="ts">
	import { CreateLinkEvent } from '$lib/api';
	import DraggableWindow from '$lib/themes/default/generic/DraggableWindow.svelte';
	import {componentState} from '$lib/events/navigator.svelte';
</script>

<div class="absolute bottom-0 left-0">
	<button class="cursor-pointer" onclick={() => CreateLinkEvent("navigator/goto/home")}>Go To Home</button>
	<button class="cursor-pointer" onclick={() => CreateLinkEvent("navigator/toggle")}>Show</button>
	{#if componentState.visible}
		<button class="cursor-pointer" onclick={() => CreateLinkEvent("navigator/goto/325")}>test</button>
	{/if}
</div>
<DraggableWindow title="Navigator" bind:visible={componentState.visible} >
	<div class="size-full min-h-40 min-w-40">
		<p class="text-white">
			testinggg
		</p>
	</div>
</DraggableWindow>
