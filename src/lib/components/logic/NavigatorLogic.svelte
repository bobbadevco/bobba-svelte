<script lang="ts">
	import {onMount} from 'svelte';
	import { AddEventLinkTracker, RemoveLinkEventTracker } from '$lib/api';
	import { getNavigatorListener } from '$lib/listeners/NavigatorListener.svelte';
	import { registerMainEvent } from '$lib/events';
	import { NitroCommunicationDemoEvent, type NitroEvent } from '@nitrots/nitro-renderer';

	const initialize = (e: NitroEvent)	=> {
		AddEventLinkTracker(getNavigatorListener());
		getNavigatorListener().init(e);
	}

	onMount(() =>
	{
		registerMainEvent(NitroCommunicationDemoEvent.CONNECTION_AUTHENTICATED, initialize);
		return () => {
			RemoveLinkEventTracker(getNavigatorListener());
		}
	});
</script>