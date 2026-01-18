<script lang="ts">
	import { onMount } from 'svelte';
	import NavigatorView from '$lib/themes/default/components/NavigatorView.svelte';
	import { GetCommunication } from '$lib/api';

	onMount(
		() => {
			setTimeout(() => GetCommunication().connection.onReady(), 500);
		}
	);
</script>


<NavigatorView />