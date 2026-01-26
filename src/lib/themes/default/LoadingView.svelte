<script>
	import { getIsError, getIsReady, getMessage, getPercent } from '$lib/initialize.svelte.ts';
</script>

<div class="text-white">
	{getPercent()}
	{getMessage()}
	{getIsError()}
	{getIsReady()}
</div>
