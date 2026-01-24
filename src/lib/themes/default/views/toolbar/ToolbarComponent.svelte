<script lang="ts">
	import { CreateLinkEvent, GoToHotelView } from "$lib/api";
	import Button from "$lib/components/common/Button.svelte";
	import Flex from "$lib/components/common/Flex.svelte";
	import { getRoomSession } from "$lib/events";
    
</script>


<Flex column class="bg-white w-13.75 items-center absolute bottom-0 gap-2 py-4 left-0">
	{#if !getRoomSession()}
		<Button class="bg-(image:--toolbar-spritesheet) w-8 h-7.5 bg-position-[-71px_-54px]" onclick={() => CreateLinkEvent("navigator/goto/home")} />
	{:else}
		<Button class="bg-(image:--toolbar-spritesheet) w-7 h-7 bg-position-[-77px_-26px]" onclick={() => GoToHotelView()} />
	{/if}
	<Button class="bg-(image:--toolbar-spritesheet) w-11 h-7.5 bg-position-[-77px_-127px]" onclick={() => CreateLinkEvent("navigator/toggle")} />
	
</Flex>

