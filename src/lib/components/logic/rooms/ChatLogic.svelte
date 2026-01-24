<script lang="ts">
	import { onMount } from 'svelte';
	import { getChatListener } from '$lib/listeners/rooms/ChatListener.svelte';

	onMount(
		() => {
			getChatListener();
		}
	);
</script>