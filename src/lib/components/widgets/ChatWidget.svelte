<script lang="ts">
	import { getChatListener } from '$lib/listeners';
	import { DoChatsOverlap, GetConfiguration } from '$lib/api';
	import ChatWidgetMessage from '$lib/components/widgets/chat/ChatWidgetMessage.svelte';
	import { RoomChatSettings } from '@nitrots/nitro-renderer';
	import type { ChatBubbleMessage } from '$lib/api/rooms/widgets/ChatBubbleMessage.svelte';
	import { onMount } from 'svelte';
	import IntervalWebWorker from '$lib/workers/IntervalWebWorker';
	import { WorkerBuilder } from '$lib/workers/WorkerBuilder';

	let offsetHeight = $state<number>();

	let height = $state(0);

	const onresize = (): void => {
		if (!offsetHeight) return;
		const currentHeight = offsetHeight;
		height = Math.round(document.body.offsetHeight * GetConfiguration<number>('chat.viewer.height.percentage'));
		for (let message of getChatListener().chatMessages) {
			message.top -= (currentHeight - height);
		}
	}

	const removeHiddenChats = () => {
		const newMessages = getChatListener().chatMessages.filter((chat) => ((chat.top > (-(chat.height) * 2))));
		if(newMessages.length !== getChatListener().chatMessages.length) getChatListener().chatMessages = newMessages;
	}

	const checkOverlappingChats = (chat: ChatBubbleMessage, moved: number, tempChats: ChatBubbleMessage[]) =>
	{
		for(let i = (getChatListener().chatMessages.indexOf(chat) - 1); i >= 0; i--)
		{
			const collides = getChatListener().chatMessages[i];

			if(!collides || (chat === collides) || (tempChats.indexOf(collides) >= 0) || (((collides.top + collides.height) - moved) > (chat.top + chat.height))) continue;

			if(DoChatsOverlap(chat, collides, -moved, 0))
			{
				const amount = Math.abs((collides.top + collides.height) - chat.top);

				tempChats.push(collides);

				collides.top -= amount;
				collides.skipMovement = true;

				checkOverlappingChats(collides, amount, tempChats);
			}
		}
	}

	const makeRoom = (chat: ChatBubbleMessage) => {
		if (getChatListener().chatSettings.mode === RoomChatSettings.CHAT_MODE_FREE_FLOW) {
			chat.skipMovement = true;

			checkOverlappingChats(chat, 0, [chat]);

			removeHiddenChats();
		} else {
			const lowestPoint = (chat.top + chat.height);
			const requiredSpace = chat.height;
			const spaceAvailable = (offsetHeight || 0) - lowestPoint;
			const amount = (requiredSpace - spaceAvailable);

			if (spaceAvailable < requiredSpace) {
				for (const currChat of getChatListener().chatMessages) {
					if (currChat === chat) break;

					currChat.top -= amount;
				}

				removeHiddenChats();
			}
		}
	}

	const moveAllChatsUp = $derived((amount: number) => {
		for (const chat of getChatListener().chatMessages) {
			if(chat.skipMovement)
			{
				chat.skipMovement = false;

				return;
			}

			chat.top -= amount;
		}

		removeHiddenChats();
	});

	onMount(() => {
		onresize();
		const worker = new WorkerBuilder(IntervalWebWorker);

		worker.onmessage = () => moveAllChatsUp(15);

		worker.postMessage({ action: 'START', content: getChatListener().scrollSpeed });

		return () =>
		{
			worker.postMessage({ action: 'STOP' });
		}
	});
</script>

<svelte:window {onresize} />

<div style:pointer-events="none" style:height="{height}px" bind:offsetHeight={offsetHeight} class="absolute flex justify-center items-center w-full top-0 min-h-px bg-transparent rounded-none shadow-none">
	{#each getChatListener().chatMessages as message (message.id)}
		<ChatWidgetMessage chat={message} parentHeight={offsetHeight} {makeRoom} />
	{/each}
</div>