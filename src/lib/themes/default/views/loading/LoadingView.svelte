<script>
	import { getIsError, getIsReady, getMessage, getPercent } from '$lib/initialize.svelte';
</script>

{getPercent()}
{getMessage()}
{getIsError()}
{getIsReady()}
