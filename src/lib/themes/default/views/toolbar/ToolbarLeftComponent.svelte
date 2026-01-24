<script lang="ts">
	import { CreateLinkEvent, GoToHotelView } from "$lib/api";
	import { getRoomSession, getUserLook } from "$lib/events";
	import Button from "$lib/components/common/Button.svelte";
	import Flex from "$lib/components/common/Flex.svelte";
	import AvatarImage from "$lib/components/common/layout/AvatarImage.svelte";
	import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
	import Fa from "svelte-fa";
    
	let userLook = $derived(getUserLook());
	let isVisible = $state(false);
</script>


<Flex center class="absolute z-1 transition-all duration-300 top-[30vh] {isVisible ? '-left-18.25' : 'left-0'}">
	<Flex column class="w-18">
		<Flex class="w-full bg-default-primary shadow-[1px_0px_black,0px_-1px_black] border-t-2 border-r-2 border-solid border-default-hover rounded-tr-full h-9" />
		<Flex center column class="bg-default-primary border-r-2 border-solid border-default-hover shadow-[1px_0px_black] gap-2">
			<Flex center class="w-full h-7.5">
				{#if !getRoomSession()}
					<Button class="bg-(image:--toolbar-spritesheet) hover:-translate-0.5 w-8 h-7.5 bg-position-[-71px_-54px]" onclick={() => CreateLinkEvent("navigator/goto/home")} />
				{:else}
					<Button class="bg-(image:--toolbar-spritesheet) hover:-translate-0.5 w-7 h-7 bg-position-[-77px_-26px]" onclick={() => GoToHotelView()} />
				{/if}
			</Flex>
			<Button class="bg-(image:--toolbar-spritesheet) hover:-translate-0.5 w-11 h-7.5 bg-position-[-77px_-127px]" />
			<Button class="bg-(image:--toolbar-spritesheet) hover:-translate-0.5 w-9.25 h-9.25 bg-position-[-2px_-38px]" />
			<Button class="bg-(image:--toolbar-spritesheet) hover:-translate-0.5 w-11 h-10.25 bg-position-[-63px_-85px]" />
			<Button class="bg-(image:--toolbar-spritesheet) hover:-translate-0.5 w-9.75 h-11.25 bg-position-[-38px_0px]" />
			<Button center class="hover:-translate-y-0.5 hover:drop-shadow-[0px_2px_black] w-13 border-[3px] outline-black outline-2 rounded-full border-solid overflow-hidden border-default-hover bg-default-primary h-13 relative">
				<AvatarImage class="absolute -bottom-4" headOnly figure={ userLook }/>
			</Button>
		</Flex>
		<Flex class="w-full bg-default-primary shadow-[1px_0px_black,0px_1px_black] border-b-2 border-r-2 border-solid border-default-hover rounded-br-full h-9" />
	</Flex>
	<Button class="shadow-[1px_0px_black,0px_-1px_black,0px_1px_black] px-1.5 right-0.5 rounded-r-md border-2 border-l-0 border-solid border-default-hover relative bg-default-primary h-15" onclick={() => isVisible = !isVisible} center>
		<Fa color="white" class="size-full {isVisible ? 'rotate-180 transition-transform duration-300' : 'rotate-0 transition-transform duration-300'}" icon={ faAngleRight } />
	</Button>
</Flex>

