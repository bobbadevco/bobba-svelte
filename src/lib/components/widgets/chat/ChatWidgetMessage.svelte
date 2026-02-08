<script lang="ts">
	import { ChatBubbleMessage, GetRoomEngine } from '$lib/api';
	import { RoomChatSettings, RoomObjectCategory } from '@nitrots/nitro-renderer';
	import { onMount } from 'svelte';

	interface ChatWidgetMessageProps
	{
		chat: ChatBubbleMessage;
		makeRoom: (chat: ChatBubbleMessage) => void;
		bubbleWidth?: number;
		parentHeight: number;
	}

	let {chat, makeRoom, parentHeight, bubbleWidth}: ChatWidgetMessageProps = $props();

	const maxWidth = $derived.by(() => {
		switch(bubbleWidth)
		{
			default:
			case RoomChatSettings.CHAT_BUBBLE_WIDTH_NORMAL:
				return 350;
			case RoomChatSettings.CHAT_BUBBLE_WIDTH_THIN:
				return 240;
			case RoomChatSettings.CHAT_BUBBLE_WIDTH_WIDE:
				return 2000;
		}
	});


	let isVisible = $state(false);
	let offsetWidth = $state<number>();
	let offsetHeight = $state<number>();

	$effect(() => {
		if (chat && !chat.left && !chat.top) {
			chat.left = ((chat.location?.x || 0) - ((offsetWidth || 0) / 2));
			chat.top = ((parentHeight || 0) - (offsetHeight || 0));
			setTimeout(() => isVisible = true, 20);
		}
	});

	let bubbles = import.meta.glob("/src/lib/assets/images/chat/chatbubbles/*.png");
	let bubble = $state<string>();
	onMount(async () => {
		makeRoom(chat);
		bubble = (await bubbles[`/src/lib/assets/images/chat/chatbubbles/bubble_${chat.styleId}.png`]() as {default: string}).default;
	});

</script>

<style>
    .bubble-container.visible {
        position: absolute;
        width: fit-content;
        transition: top 0.2s ease 0s;
        user-select: none;
        pointer-events: all;
    }

		.chat-bubble {
				position: relative;
				z-index: 1;
				word-break: break-word;
				max-width: 350px;
				min-height: 19px;
				font-size: 13px;

				border-image-slice: 17 6 6 29 fill;
				border-image-width: 17px 6px 6px 29px;
				border-image-outset: 2px 0px 0px 0px;
				border-image-repeat: repeat repeat;
		}


    .user-container {
        z-index: 3;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        max-height: 24px;
        overflow: hidden;

        .user-image {
            position: absolute;
            top: -25px;
            left: -8.25px;
            width: 45px;
            height: 85px;
            background-repeat: no-repeat;
            background-position: center;
            transform: scale(0.5);
            overflow: hidden;
        }
    }

    .chat-content {
        padding: 2px 6px 3px 4px;
        margin-left: 27px;
        line-height: 1;
        color: #000;
        min-height: 24px;
    }
</style>

<div bind:offsetWidth={() => offsetWidth, (width) => {
	offsetWidth = width;
	chat.width = width || 0;
}} bind:offsetHeight={() => offsetHeight, (height) => {
	offsetHeight = height;
	chat.height = height || 0;
}} style:top="{chat.top}px" style:left="{chat.left}px" tabindex="-1" role="button" onkeydown={() =>{}} class={ `bubble-container ${ isVisible ? 'visible' : 'invisible' }` }
		 onclick={ () => GetRoomEngine().selectRoomObject(chat.roomId, chat.senderId, RoomObjectCategory.UNIT) }>
	{#if (chat.styleId === 0)}
		<div class="user-container-bg" style:background-color={chat.color}>
		</div>
	{/if}
	<div style:border-image-source="url({bubble})" class={ `chat-bubble bubble-${ chat.styleId } type-${ chat.type }` } style:max-width="{maxWidth}px">
		<div class="user-container">
			{#if chat.imageUrl && (chat.imageUrl.length > 0)}
			<div class="user-image" style:background-image="url({ chat.imageUrl })">
			</div>
			{/if}
		</div>
		<div class="chat-content h-full items-center flex">
			<span class="mr-1 flex min-h-full items-start justify-start gap-1">
				<span class="username min-w-fit font-bold" >
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html chat.username}:
				</span>
				<span class="message" >
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html chat.formattedText}
				</span>
			</span>
		</div>
		<div class="cursor-pointer">
		</div>
	</div>
</div>
