<script lang="ts">
	import { GetConfiguration, GetNitroInstance } from '$lib/api';
	import { Nitro } from '@nitrots/nitro-renderer';
	import { initialize, getIsReady } from "$lib";
	import { type Snippet, onMount } from "svelte";
	import RoomView from "$lib/components/Room.svelte";
	import LandingView from '$lib/components/Landing.svelte';
	import MainLogic from '$lib/components/logic/MainLogic.svelte';

	let MainView = $state<Snippet>();
	let LoadingView = $state<Snippet>();
	let bootstrapped = $state(false);
	onMount(
		async () => {
			Nitro.bootstrap();
			bootstrapped = true;
			GetNitroInstance().core.configuration.init();
			const theme = GetConfiguration<string>('theme', 'default');
			LoadingView = (await import(`../lib/themes/${theme}/LoadingView.svelte`)).default;
			initialize();
			MainView = (await import(`../lib/themes/${theme}/MainView.svelte`)).default;
		}
	);
</script>
<div class="w-screen h-screen overflow-hidden bg-black" style:image-rendering="pixelated">
	{#if !getIsReady() && LoadingView}
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