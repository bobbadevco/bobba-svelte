<script lang="ts">
	import './app.css';
	import favicon from '$lib/assets/favicon.ico';
	import { truffleText } from '$lib/actions/truffleText.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div use:truffleText class="contents">
	{@render children()}
</div>
