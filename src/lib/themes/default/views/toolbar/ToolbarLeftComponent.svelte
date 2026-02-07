<script lang="ts">
	import { CreateLinkEvent, GoToHotelView } from "$lib/api";
	import { getRoomSession } from "$lib/events";
	import Button from "$lib/components/common/Button.svelte";
	import Flex from "$lib/components/common/Flex.svelte";
	import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
	import { Fa } from 'svelte-fa';

	let isVisible = $state(false);
</script>


<Flex center class="absolute z-1 transition-all duration-300 top-[30vh] {isVisible ? '-left-18.25' : 'left-0'}">
	<Flex column class="w-18">
		<Flex class="w-full bg-tertiary shadow-[1px_0px_black,0px_-1px_black] border-t-2 border-r-2 border-solid border-bright-primary rounded-tr-full h-7.5" />
		<Flex center column class="bg-tertiary border-r-2 border-solid border-bright-primary shadow-[1px_0px_black] gap-3 justify-center items-center w-full">
			<Flex id="hotel-view" center class="w-full h-7.5">
				{#if !getRoomSession()}
					<Button 
						id="home-button" 
						class="bg-(image:--toolbar-spritesheet) hover:-translate-0.5 w-8 h-7.5 bg-position-[-71px_-54px]" 
						onclick={() => CreateLinkEvent("navigator/goto/home")} />
				{:else}
					<Button 
					id="hotel-view-button" 
					class="bg-(image:--toolbar-spritesheet) hover:-translate-0.5 w-7 h-7 bg-position-[-77px_-26px]" 
					onclick={() => GoToHotelView()} />
				{/if}
			</Flex>
			<Button 
				id="rooms-button" 
				class="bg-(image:--toolbar-spritesheet) hover:-translate-0.5 w-11 h-7.5 bg-position-[-77px_-127px]" 
				onclick={() => CreateLinkEvent("navigator/toggle")}/>
			<Button 
				id="catalog-button" 
				class="bg-(image:--toolbar-spritesheet) hover:-translate-0.5 w-9.25 h-9.25 bg-position-[-2px_-38px]" />
			<Button 
				id="inventory-button" 
				class="bg-(image:--toolbar-spritesheet) hover:-translate-0.5 w-11 h-10.25 bg-position-[-63px_-85px]" />
			<Button 
				id="camera-button" 
				class="bg-(image:--toolbar-spritesheet) hover:-translate-0.5 w-9.75 h-11.25 bg-position-[-38px_0px]" />
		</Flex>
		<Flex class="w-full bg-tertiary shadow-[1px_0px_black,0px_1px_black] border-b-2 border-r-2 border-solid border-bright-primary rounded-br-full h-7.5" />
	</Flex>
	<Button 
		class="shadow-[1px_0px_black,0px_-1px_black,0px_1px_black] px-1.5 right-0.5 rounded-r-md border-2 border-l-0 border-solid border-bright-primary relative bg-tertiary h-15"
		onclick={() => isVisible = !isVisible} center>
		<Fa color="white" class="size-full {isVisible ? 'rotate-0 transition-transform duration-300' : 'rotate-180 transition-transform duration-300'}" icon={ faAngleRight } />
	</Button>
</Flex>

