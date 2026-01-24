<script lang="ts">
	import {onMount} from 'svelte';
	import { getToolbarListener } from '$lib/listeners/ToolbarListener.svelte';

	onMount(() =>
	{
		getToolbarListener();
	});
</script>