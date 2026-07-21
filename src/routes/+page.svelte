<script lang="ts">
	import { GetNitroInstance } from '$lib/api';
	import { Nitro } from '@nitrots/nitro-renderer';
	import { initialize, initializeTruffle, getIsReady } from "$lib";
	import { type Snippet, onMount } from "svelte";
	import RoomView from "$lib/components/Room.svelte";
	import LandingView from '$lib/components/Landing.svelte';
	import MainLogic from '$lib/components/logic/MainLogic.svelte';

	let MainView = $state<Snippet>();
	let LoadingView = $state<Snippet>();
	let bootstrapped = $state(false);
	onMount(
		async () => {
			initializeTruffle();
			Nitro.bootstrap();
			bootstrapped = true;
			GetNitroInstance().core.configuration.init();
			initialize();
			const uiConfig = await fetch('/ui-config.json').then(r => r.json());
			const theme = uiConfig.theme || 'default';
			LoadingView = (await import(`../lib/themes/${theme}/LoadingView.svelte`)).default;
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