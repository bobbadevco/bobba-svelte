<script lang="ts">
	import { GetConfiguration, GetNitroInstance } from '$lib/api';
	import { Nitro } from '@nitrots/nitro-renderer';
	import { initialize, getIsReady } from "$lib";
	import { type Snippet, onMount } from "svelte";
	import RoomView from "$lib/components/Room.svelte";
	import LoadingView from "$lib/themes/default/views/loading/LoadingView.svelte";
	import LandingView from '$lib/components/Landing.svelte';
	import MainLogic from '$lib/components/logic/MainLogic.svelte';

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
<div class="w-screen h-screen overflow-hidden bg-black" style:image-rendering="pixelated">
	{#if !getIsReady()}
		<LoadingView />
	{/if}
	{#if getIsReady() }
		<LandingView />
		<RoomView />
		<MainLogic />
	{/if}
	{#if MainView && getIsReady()}
		{@render MainView()}
	{/if}
</div>