<script lang="ts">
	import { ChatBubbleMessage, GetRoomEngine } from '$lib/api';
	import { RoomChatSettings, RoomObjectCategory } from '@nitrots/nitro-renderer';

	interface ChatWidgetMessageProps
	{
		chat: ChatBubbleMessage;
		makeRoom: (chat: ChatBubbleMessage) => void;
		bubbleWidth?: number;
	}

	let {chat, makeRoom, bubbleWidth}: ChatWidgetMessageProps = $props();

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

</script>

<div tabindex="-1" role="button" onkeydown={() =>{}} class={ `bubble-container ${ isVisible ? 'visible' : 'invisible' }` }
		 onclick={ () => GetRoomEngine().selectRoomObject(chat.roomId, chat.senderId, RoomObjectCategory.UNIT) }>
	{#if (chat.styleId === 0)}
		<div class="user-container-bg" style:background-color={chat.color}>
		</div>
	{/if}
	<div class={ `chat-bubble bubble-${ chat.styleId } type-${ chat.type }` } style:max-width="{maxWidth}px">
		<div class="user-container">
			{#if chat.imageUrl && (chat.imageUrl.length > 0)}
			<div class="user-image" style:background-image="url(${ chat.imageUrl })">
			</div>
			{/if}
		</div>
		<div class="chat-content">
			<span class="username mr-1">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html chat.username}
			</span>
			<span class="message" >
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html chat.formattedText}
			</span>
		</div>
		<div class="cursor-pointer">
		</div>
	</div>
</div>
