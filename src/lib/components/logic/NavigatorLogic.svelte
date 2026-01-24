<script lang="ts">
	import {onMount} from 'svelte';
	import { RemoveLinkEventTracker, SendMessageComposer } from '$lib/api';
	import { getNavigatorListener } from '$lib/listeners/NavigatorListener.svelte';
	import { NavigatorInitComposer } from '@nitrots/nitro-renderer';

	onMount(() =>
	{
		getNavigatorListener();
		return () => {
			RemoveLinkEventTracker(getNavigatorListener());
		}
	});

	$effect(() =>
	{
		if(!getNavigatorListener().visible || !getNavigatorListener().needsInit) return;

        SendMessageComposer(new NavigatorInitComposer());

        getNavigatorListener().needsInit = false;
	})

	$effect(() =>
	{
		if(!getNavigatorListener().searchResult) return;

        getNavigatorListener().loading = false;

        // need to be added to view
		// if(elementRef && elementRef.current) elementRef.current.scrollTop = 0;
	})

	$effect(() =>
	{
		if(!getNavigatorListener().visible || !getNavigatorListener().ready || !getNavigatorListener().needsSearch) return;

        getNavigatorListener().reloadCurrentSearch();

        getNavigatorListener().needsSearch = false;
	})

	$effect(() =>
	{
		if(getNavigatorListener().ready || !getNavigatorListener().topLevelContext) return;

        getNavigatorListener().ready = true;
	})

	$effect(() =>
	{
		if(!getNavigatorListener().visible || !getNavigatorListener().needsInit) return;

        SendMessageComposer(new NavigatorInitComposer());

        getNavigatorListener().needsInit = false;
	})
</script>