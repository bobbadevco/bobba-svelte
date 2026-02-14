<script lang="ts">
	import { onMount } from 'svelte';
	import { getProfileListener } from '$lib/listeners';

	onMount(() =>
	{
		getProfileListener();
	});
</script>
