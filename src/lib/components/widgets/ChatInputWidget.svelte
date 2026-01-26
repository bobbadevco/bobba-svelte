<script lang="ts">
	import { getChatInputListener } from '$lib/listeners/rooms/ChatInputListener.svelte';
	import { ChatMessageTypeEnum, GetConfiguration, LocalizeText } from '$lib/api';
	import type { HTMLInputAttributes } from 'svelte/elements';

	let props: HTMLInputAttributes = $props();

	let element = $state<HTMLInputElement | undefined>();
	let chatValue = $state('');

	const chatModeIdWhisper = LocalizeText('widgets.chatinput.mode.whisper');
	const chatModeIdShout = LocalizeText('widgets.chatinput.mode.shout');
	const chatModeIdSpeak = LocalizeText('widgets.chatinput.mode.speak');
	const maxChatLength = GetConfiguration<number>('chat.input.maxlength', 100);

	const sendChatValue = (value: string, shiftKey: boolean = false) =>
	{
		if(!value || (value === '')) return;

		let chatType = (shiftKey ? ChatMessageTypeEnum.CHAT_SHOUT : ChatMessageTypeEnum.CHAT_DEFAULT);
		let text = value;

		const parts = text.split(' ');

		let recipientName = '';
		let append = '';

		switch(parts[0])
		{
			case chatModeIdWhisper:
				chatType = ChatMessageTypeEnum.CHAT_WHISPER;
				recipientName = parts[1];
				append = (chatModeIdWhisper + ' ' + recipientName + ' ');

				parts.shift();
				parts.shift();
				break;
			case chatModeIdShout:
				chatType = ChatMessageTypeEnum.CHAT_SHOUT;

				parts.shift();
				break;
			case chatModeIdSpeak:
				chatType = ChatMessageTypeEnum.CHAT_DEFAULT;

				parts.shift();
				break;
		}

		text = parts.join(' ');

		getChatInputListener().isTyping = false;
		getChatInputListener().isIdle = false;

		if(text.length <= maxChatLength)
		{
			if(/%CC%/g.test(encodeURIComponent(text)))
			{
				chatValue = '';
			}
			else
			{
				chatValue = '';
				getChatInputListener().sendChat(text, chatType, recipientName, 0);
			}
		}

		chatValue = append;
	};

	const anotherInputHasFocus = () =>
	{
		const activeElement = document.activeElement;

		if(!activeElement) return false;

		if(element && (element === activeElement)) return false;

		if(!(activeElement instanceof HTMLInputElement) && !(activeElement instanceof HTMLTextAreaElement)) return false;

		return true;
	};

	const checkSpecialKeywordForInput = () =>
	{
		if((chatValue !== chatModeIdWhisper) || !getChatInputListener().selectedUsername.length) return;

		chatValue = `${ chatValue } ${ getChatInputListener().selectedUsername }`;
	};

	const setInputFocus = () =>
	{
		if (!element) return;
		element.focus();

		element.setSelectionRange((element.value.length * 2), (element.value.length * 2));
	};

	const onkeydown = (event: KeyboardEvent) =>
	{
		if(getChatInputListener().floodBlocked || anotherInputHasFocus()) return;

		if(document.activeElement !== element) setInputFocus();

		const value = (event.target as HTMLInputElement).value;

		switch(event.key)
		{
			case ' ':
			case 'Space':
				checkSpecialKeywordForInput();
				return;
			case 'NumpadEnter':
			case 'Enter':
				sendChatValue(value, event.shiftKey);
				return;
			case 'Backspace':
				if(value)
				{
					const parts = value.split(' ');

					if((parts[0] === chatModeIdWhisper) && (parts.length === 3) && (parts[2] === ''))
					{
						chatValue = '';
					}
				}
				return;
		}

	}
	const updateChatInput = (value: string) =>
	{
		if(!value || !value.length)
		{
			getChatInputListener().isTyping = false;
		}
		else
		{
			getChatInputListener().isTyping = true;
			getChatInputListener().isIdle = true;
		}

		chatValue = value;
	};
</script>
<svelte:body {onkeydown} />

<input {... props} bind:value={() => chatValue, updateChatInput} bind:this={element} />