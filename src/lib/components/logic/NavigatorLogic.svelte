<script lang="ts">
	import {onMount} from 'svelte';
	import {initialize} from '$lib/events/navigator.svelte';

	onMount(
		initialize
	);
</script>