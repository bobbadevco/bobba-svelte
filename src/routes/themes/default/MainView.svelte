<script>
	import { onMount } from 'svelte';
	import { GetCommunication } from '$lib/api/GetCommunication';

	onMount(() => {
		GetCommunication().connection.onReady();
	});
</script>