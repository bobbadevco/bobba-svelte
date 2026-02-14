<script lang="ts">
	import {onMount} from 'svelte';
	import { getToolbarListener } from '$lib/listeners';

	onMount(() =>
	{
		getToolbarListener();
	});
</script>