<script lang="ts">
	import {onMount} from 'svelte';
	import { type INavigatorSearchFilter, RemoveLinkEventTracker, SendMessageComposer } from '$lib/api';
	import { getNavigatorListener } from '$lib/listeners/NavigatorListener.svelte';
	import { NavigatorInitComposer } from '@nitrots/nitro-renderer';
	import { SearchOptions } from '$lib/api/navigator/SearchOptions';

	const navigator = getNavigatorListener();

	onMount(() =>
	{
		getNavigatorListener();
		return () => {
			RemoveLinkEventTracker(getNavigatorListener());
		}
	});

	$effect(() => {
		if(!navigator.searchResult) return;

		const split = navigator.searchResult.data.split(':');

		let filter: INavigatorSearchFilter | undefined = undefined;
		let value: string = '';

		if(split.length >= 2)
		{
			const [ query, ...rest ] = split;

			filter = SearchOptions.find(option => (option.query === query));
			value = rest.join(':');
		}
		else
		{
			value = navigator.searchResult.data;
		}

		if(!filter) filter = SearchOptions[0];

		navigator.searchIndex = SearchOptions.findIndex(option => (option === filter));
		navigator.searchValue = value;
	});

	$effect(() =>
	{
		if(!navigator.visible || !navigator.needsInit) return;

		SendMessageComposer(new NavigatorInitComposer());

		navigator.needsInit = false;
	})

	$effect(() =>
	{
		if(!navigator.searchResult) return;

		navigator.loading = false;

		// need to be added to view
		// if(elementRef && elementRef.current) elementRef.current.scrollTop = 0;
	})

	$effect(() =>
	{
		if(!navigator.visible || !navigator.ready || !navigator.needsSearch) return;

		navigator.reloadCurrentSearch();

		navigator.needsSearch = false;
	})

	$effect(() =>
	{
		if(navigator.ready || !navigator.topLevelContext) return;

		navigator.ready = true;
	})

	$effect(() =>
	{
		if(!navigator.visible || !navigator.needsInit) return;

		SendMessageComposer(new NavigatorInitComposer());

		navigator.needsInit = false;
	})
</script>