<script lang="ts">
	import { getChatListener } from '$lib/listeners/rooms/ChatListener.svelte';
	import { GetConfiguration } from '$lib/api';

	let offsetHeight = $state<number>();
	let height = $state(0);

	const onresize = (_event: UIEvent): void => {
		if (!offsetHeight) return;
		const currentHeight = offsetHeight;
		height = Math.round(document.body.offsetHeight * GetConfiguration<number>('chat.viewer.height.percentage'));
		for (let message of getChatListener().chatMessages) {
			message.top -= (currentHeight - height);
		}
	}

</script>

<svelte:window {onresize} />

<div bind:offsetHeight={offsetHeight}>
	{#each getChatListener().chatMessages as message}
		
	{/each}
</div>