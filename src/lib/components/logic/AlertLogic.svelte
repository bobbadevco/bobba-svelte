<script lang="ts">
	import { onMount } from 'svelte';
	import { getAlertListener } from '$lib/listeners';

	onMount(
		() => {
			getAlertListener();
		}
	);
</script>