<script>
	import { onMount } from 'svelte';
	import { GetCommunication } from '$lib/api/GetCommunication.ts';

	onMount(() => {
		GetCommunication().connection.onReady();
	});
</script>