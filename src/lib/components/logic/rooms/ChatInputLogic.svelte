<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { getChatInputListener } from '$lib/listeners/rooms/ChatInputListener.svelte';
	import { getRoomSession } from '$lib/events';

	$effect(() => {
		const roomSession = getRoomSession();
		if (!roomSession) return;

		if(getChatInputListener().isTyping)
		{
			if(!getChatInputListener().typingStartedSent)
			{
				getChatInputListener().typingStartedSent = true;

				roomSession.sendChatTypingMessage(getChatInputListener().isTyping);
			}
		}
		else
		{
			if(getChatInputListener().typingStartedSent)
			{
				getChatInputListener().typingStartedSent = false;

				roomSession.sendChatTypingMessage(getChatInputListener().isTyping);
			}
		}
	});

	$effect(() => {
		if(!getChatInputListener().floodBlocked) return;

		let seconds = 0;

		const interval = setInterval(() =>
		{
			untrack(() => getChatInputListener().floodBlockedSeconds = (prevValue =>
			{
				seconds = ((prevValue || 0) - 1);

				return seconds;
			})(getChatInputListener().floodBlockedSeconds));

			if(seconds < 0)
			{
				clearInterval(interval);

				getChatInputListener().floodBlocked = false;
			}
		}, 1000);

		return () => clearInterval(interval);
	});

	$effect(() => {
		if(!getChatInputListener().isIdle) return;

		let timeout: ReturnType<typeof setTimeout>;

		if(getChatInputListener().isIdle)
		{
			timeout = setTimeout(() =>
			{
				untrack(() => getChatInputListener().isIdle = false);
				untrack(() => getChatInputListener().isTyping = false);
			}, 10000);
		}

		return () => clearTimeout(timeout);
	});

	onMount(() => {
		getChatInputListener();
	});
</script>