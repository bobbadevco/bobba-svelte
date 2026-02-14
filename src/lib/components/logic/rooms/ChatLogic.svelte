<script lang="ts">
	import { onMount } from 'svelte';
	import { getChatListener } from '$lib/listeners';

	onMount(
		() => {
			getChatListener();
		}
	);
</script>