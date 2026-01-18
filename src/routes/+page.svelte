<script lang="ts">
	import { GetConfiguration, GetNitroInstance } from '$lib/api';
	import RoomView from "$lib/components/rooms/RoomView.svelte";
	import { initialize, getIsReady } from "$lib/initialize.svelte";
	import { type Snippet, onMount } from "svelte";
	import LoadingView from "$lib/themes/default/components/LoadingView.svelte";
	import { Nitro } from '@nitrots/nitro-renderer';

	let MainView = $state<Snippet>();

	onMount(
		async () => {
			Nitro.bootstrap();
			GetNitroInstance().core.configuration.init();
			initialize();
			const theme = GetConfiguration<string>('theme', 'default');
			const mainComponentPath = `/src/lib/themes/${theme}/MainView.svelte`;
			MainView = (await import(mainComponentPath)).default;
		}
	);
</script>
<div class="w-screen h-screen overflow-hidden" style:image-rendering="pixelated">
	{#if !getIsReady()}
		<LoadingView />
	{/if}
	{#if getIsReady()}
		<RoomView	/>
	{/if}
	{#if MainView && getIsReady()}
		{@render MainView()}
	{/if}
</div>