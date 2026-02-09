<script lang="ts">
	import {
		GetGroupChatData,
		GetSessionDataManager, LocalizeText,
		MessengerGroupType,
		MessengerThreadSvelte, MessengerThreadChat,
		MessengerThreadChatGroup
	} from '$lib/api';
	import Flex from '$lib/components/common/Flex.svelte';
	import AvatarImage from '$lib/components/common/layout/AvatarImage.svelte';

	interface MessengerThreadGroupProps {
		thread: MessengerThreadSvelte;
		group: MessengerThreadChatGroup;
	}

	let {thread, group}: MessengerThreadGroupProps = $props();

	const groupChatData = $derived((group.type === MessengerGroupType.GROUP_CHAT) && GetGroupChatData(group.chats[0].extraData || ''));
	const isOwnChat = $derived.by(() => {
		if(!thread || !group) return false;

		if((group.type === MessengerGroupType.PRIVATE_CHAT) && (group.userId === GetSessionDataManager().userId)) return true;

		if(groupChatData && group.chats.length && (groupChatData.userId === GetSessionDataManager().userId)) return true;

		return false;
	});
</script>

<style>
    .nitro-friends-spritesheet {
        background: url('$lib/themes/default/assets/images/friends/friends-spritesheet.png') transparent no-repeat;
        &.icon-warning {
            width: 23px; height: 21px;
            background-position: -5px -5px;
        }
    }
    .messenger-notification-icon {
        background: url('$lib/themes/default/assets/images/friends/messenger_notification_icon.png') transparent no-repeat;
        width: 25px; height: 25px;
    }

		.messages-group {
				&:before {
						content: ' ';
				}
		}
</style>

{#if !group.userId}
	{#each group.chats as chat, i (i)}
		<Flex fullWidth class="gap-2 justify-start">
			<div class="w-full wrap-break-word">
				{#if chat.type === MessengerThreadChat.SECURITY_NOTIFICATION}
					<Flex class="items-center gap-2 bg-slate-900 rounded mb-2 px-2 py-1 text-sm text-active-accent">
						<div class="nitro-friends-spritesheet icon-warning shrink-0"></div>
						<p>{chat.message}</p>
					</Flex>
				{/if}
				{#if chat.type === MessengerThreadChat.ROOM_INVITE}
					<Flex class="items-center gap-2 text-slate-900 rounded mb-2 px-2 py-1 text-sm text-active">
						<div class="messenger-notification-icon shrink-0"></div>
						<p>{LocalizeText('messenger.invitation')} {chat.message}</p>
					</Flex>
				{/if}
			</div>
		</Flex>
	{/each}
{:else}
	<Flex fullWidth class={[isOwnChat ? 'justify-end' : 'justify-start', "gap-2"]}>
		<div class="shrink-0 relative size-12.5 overflow-hidden">
			{#if (group.type === MessengerGroupType.PRIVATE_CHAT) && !isOwnChat}
				<AvatarImage style="position: absolute; margin-left: -22px; margin-top: -35px;" figure={thread.participant.figure} direction={2} />
			{/if}
			{#if groupChatData && !isOwnChat}
				<AvatarImage style="position: absolute; margin-left: -22px; margin-top: -35px;" figure={groupChatData.figure} direction={2} />
			{/if}
		</div>
		<div class={[isOwnChat ? "before:border-l-8 before:border-l-slate-700 before:-right-2" : "before:border-r-8 before:border-r-slate-700 before:-left-2", "bg-slate-700 text-white rounded mb-2  py-1 px-2 relative before:absolute before:size-0 before:border-t-8 before:border-b-8 before:border-b-transparent before:border-t-transparent before:top-2.5 messages-group flex flex-col"]}>
			<p class="font-bold">
				{#if isOwnChat}
					{GetSessionDataManager().userName}
				{:else}
					{groupChatData ? groupChatData.username : thread.participant.name}
				{/if}
			</p>
			{#each group.chats as chat, i (i)}
				<p>{chat.message}</p>
			{/each}
		</div>
		{#if isOwnChat}
			<div class="shrink-0 relative overflow-hidden size-12.5">
				<AvatarImage style="position: absolute; margin-left: -22px; margin-top: -35px;" figure={GetSessionDataManager().figure} direction={4} />
			</div>
		{/if}
	</Flex>
{/if}