<script>
	import { getIsError, getIsReady, getMessage, getPercent } from '$lib/initialize.svelte';
</script>

<div class="text-white bg-black">
	{getPercent()}
	{getMessage()}
	{getIsError()}
	{getIsReady()}
</div>
