<script lang="ts">
	import {onMount} from 'svelte';
	import { RemoveLinkEventTracker } from '$lib/api';
	import { getNavigatorListener } from '$lib/listeners/NavigatorListener.svelte';


	onMount(() =>
	{
		getNavigatorListener();
		return () => {
			RemoveLinkEventTracker(getNavigatorListener());
		}
	});
</script>