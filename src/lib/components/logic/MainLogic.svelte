<script lang="ts">
	import { GetCommunication } from '$lib/api';
	import { onMount } from 'svelte';
	import NavigatorLogic from '$lib/components/logic/NavigatorLogic.svelte';

	onMount(
		() => {
			setTimeout(() => GetCommunication().connection.onReady(), 500);
		}
	);
</script>

<NavigatorLogic />