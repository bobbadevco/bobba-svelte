<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { GetConfiguration } from '$lib/api/GetConfiguration';
	import { getIsReady, initialize } from '$lib/initialize.svelte';

	let MainView = $state<Snippet>();
	let LoadingView = $state<Snippet>();

	onMount(
		async () => {
			await initialize();
			const theme = GetConfiguration<string>('theme', 'default');
			const mainComponentPath = `/src/lib/themes/${theme}/MainView.svelte`;
			const loadingComponentPath = `/src/lib/themes/${theme}/components/LoadingView.svelte`;
			MainView = (await import(mainComponentPath)).default;
			LoadingView = (await import(loadingComponentPath)).default;
		}
	);
</script>

{#if LoadingView}
	{#if !getIsReady()}
		{@render LoadingView()}
	{/if}
{/if}

{#if MainView}
	{#if getIsReady()}
		{@render MainView()}
	{/if}
{/if}