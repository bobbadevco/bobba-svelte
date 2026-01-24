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
	let bootstrapped = $state(false);
	onMount(
		async () => {
			Nitro.bootstrap();
			bootstrapped = true;
			GetNitroInstance().core.configuration.init();
			initialize();
			
			const theme = GetConfiguration<string>('theme', 'default');
			const mainComponentPath = `/src/lib/themes/${theme}/MainView.svelte`;
			MainView = (await import(/* @vite-ignore */ mainComponentPath)).default;
		}
	);
</script>
<div class="w-screen h-screen overflow-hidden bg-black" style:image-rendering="pixelated">
	{#if !getIsReady()}
		<LoadingView />
	{/if}
	{#if bootstrapped}
		<MainLogic />
	{/if}
	{#if getIsReady() }
		<LandingView />
		<RoomView />
	{/if}
	{#if MainView && getIsReady()}
		{@render MainView()}
	{/if}
</div>