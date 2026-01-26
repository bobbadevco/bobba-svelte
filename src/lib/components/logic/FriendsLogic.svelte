<script lang="ts">
	import { getFriendListener } from '$lib/listeners/FriendListener.svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		getFriendListener();
		return () => getFriendListener().clearInterval();
	});
</script>