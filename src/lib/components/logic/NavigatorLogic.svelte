<script lang="ts">
	import {onMount} from 'svelte';
	import { AddEventLinkTracker, RemoveLinkEventTracker } from '$lib/api';
	import { getNavigatorListener } from '$lib/listeners/NavigatorListener.svelte';

	onMount(() =>
	{
		AddEventLinkTracker(getNavigatorListener().linkTracker);
		return () => {
			RemoveLinkEventTracker(getNavigatorListener().linkTracker);
		}
	});
</script>