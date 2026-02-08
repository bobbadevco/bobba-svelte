<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { getMessengerListener } from '$lib/listeners/MessengerListener.svelte';
	import { CloneObject } from '$lib/api/utils/CloneObject';
	import { RemoveLinkEventTracker } from '$lib/api';

	onMount(() => {
		getMessengerListener();
		return () => RemoveLinkEventTracker(getMessengerListener());
	});

	$effect(() => {
		if(getMessengerListener().activeThreadId <= 0) return;

		untrack(() => {
			const index = getMessengerListener().messageThreads.findIndex(newThread => (newThread.threadId === getMessengerListener().activeThreadId));
			if(index >= 0)
			{
				getMessengerListener().messageThreads[index] = CloneObject(getMessengerListener().messageThreads[index]);

				getMessengerListener().messageThreads[index].setRead();
			}
		});
	});
</script>