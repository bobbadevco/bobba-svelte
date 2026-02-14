<script lang="ts">
	import { getFriendListener } from '$lib/listeners';
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