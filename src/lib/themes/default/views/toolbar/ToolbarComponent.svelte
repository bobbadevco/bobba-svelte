<script lang="ts">
	import { CreateLinkEvent } from "$lib/api";
	import Button from "$lib/components/common/Button.svelte";
	import Flex from "$lib/components/common/Flex.svelte";
    
</script>


<Flex class="bg-white h-[45px] items- absolute bottom-0 left-0">
	<Button class="cursor-pointer" onclick={() => CreateLinkEvent("navigator/goto/home")}>Go To Home</Button>
	<Button class="cursor-pointer" onclick={() => CreateLinkEvent("navigator/toggle")}>Show</Button>
</Flex>

