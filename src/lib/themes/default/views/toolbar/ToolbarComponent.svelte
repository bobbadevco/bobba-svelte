<script lang="ts">
	import { CreateLinkEvent } from "$lib/api";
    
</script>


<div class="absolute bottom-0 left-0">
	<button class="cursor-pointer" onclick={() => CreateLinkEvent("navigator/goto/home")}>Go To Home</button>
	<button class="cursor-pointer" onclick={() => CreateLinkEvent("navigator/toggle")}>Show</button>
</div>

