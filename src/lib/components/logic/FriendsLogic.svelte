<script lang="ts">
	import { getFriendListener } from '$lib/listeners/FriendListener.svelte';
	import { onMount } from 'svelte';
	import { RemoveLinkEventTracker } from '$lib/api';

	onMount(() => {
		getFriendListener();
		return () => {
			getFriendListener().clearInterval();
			RemoveLinkEventTracker(getFriendListener());
		}
	});
</script>