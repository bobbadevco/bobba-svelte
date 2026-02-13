<script lang="ts">
	import { MessengerFriend, OpenMessengerChat } from '$lib/api';
	import Flex from '$lib/components/common/Flex.svelte';
	import AvatarImage from '$lib/components/common/layout/AvatarImage.svelte';
	import ProfileButton from '$lib/components/common/layout/ProfileButton.svelte';
	import { getFriendListener } from '$lib/listeners/FriendListener.svelte';

	interface FriendListItemProps {
		friend: MessengerFriend;
	}

	let {friend}: FriendListItemProps = $props();

	const friends = getFriendListener();
</script>

<Flex class="justify-between">
	<Flex class="items-center gap-0">
		{#if friend.id > 0 && friend.online}
			<Flex center pointer class="w-7.25 h-0 -ml-3.75 relative left-1 top-0.5">
				<AvatarImage class="absolute w-[90px!important] h-[130px!important]" figure={friend.figure} headOnly scale={0.5} direction={2} />
			</Flex>
		{/if}
		{#if friend.id > 0}
		<div class="relative" style:margin-left={(friend.id < 0 || !friend.online) ? '14px' : ''}>
			<ProfileButton class="cursor-pointer" userId={friend.id} />
		</div>
		{/if}
		<p>{friend.name}</p>
	</Flex>
	<Flex class="gap-1">
		{#if friend.followingAllowed}
			<button title="follow" class="size-4 bg-(image:--friends-spritesheet) bg-position-[-96px_-29px] cursor-pointer" onclick={() => friends.followFriend(friend)}>
			</button>
		{/if}
		<button title="message" class="size-4 bg-(image:--friends-spritesheet) bg-position-[-77px_-53px] cursor-pointer" onclick={(event) => {
			event.stopPropagation();
			OpenMessengerChat(friend.id);
		}}>
		</button>
	</Flex>
</Flex>