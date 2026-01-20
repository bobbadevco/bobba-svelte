<script lang="ts">
	import { onMount } from 'svelte';
	import { GetCommunication } from '$lib/api';
	import NavigatorView from './views/navigator/NavigatorView.svelte';

	onMount(
		() => {
			setTimeout(() => GetCommunication().connection.onReady(), 500);
		}
	);
</script>


<NavigatorView />