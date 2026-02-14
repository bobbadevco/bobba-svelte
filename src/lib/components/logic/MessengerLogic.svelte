<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { getMessengerListener } from '$lib/listeners';
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

	$effect(() => {
		if (getMessengerListener().visibleThreads.length == 0) {
			untrack(() => getMessengerListener().visible = false);
		}
	});

	$effect(() => {
		if(getMessengerListener().visible && !getMessengerListener().activeThread)
		{
			if(getMessengerListener().lastThreadId > 0)
			{
				untrack(() => getMessengerListener().activeThreadId = getMessengerListener().lastThreadId);
			}
			else
			{
				if(getMessengerListener().visibleThreads.length > 0) untrack(() => getMessengerListener().activeThreadId = getMessengerListener().visibleThreads[0].threadId);
			}

			return;
		}
		const activeThread = getMessengerListener().activeThread;
		if(!getMessengerListener().visible && activeThread)
		{
			untrack(() => {
				getMessengerListener().lastThreadId = activeThread.threadId
				getMessengerListener().activeThreadId = -1;
			});
		}
	});
</script>