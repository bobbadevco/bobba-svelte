<script lang="ts">
	import { GetConfiguration } from "$lib/api";
	import RoomView from "$lib/components/rooms/RoomView.svelte";
	import { initialize, getIsReady } from "$lib/initialize.svelte";
	import { type Snippet, onMount } from "svelte";

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
<div class="w-screen h-screen overflow-hidden" style:image-rendering="pixelated">
	{#if LoadingView}
		{#if !getIsReady()}
			{@render LoadingView()}
		{/if}
	{/if}
	{#if getIsReady()}
		<RoomView	/>
	{/if}
	{#if MainView}
		{#if getIsReady()}
			{@render MainView()}
		{/if}
	{/if}
</div>