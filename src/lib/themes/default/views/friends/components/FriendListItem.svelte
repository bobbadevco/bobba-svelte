<script lang="ts">
	import { MessengerFriend, OpenMessengerChat } from '$lib/api';
	import Flex from '$lib/components/common/Flex.svelte';
	import AvatarImage from '$lib/components/common/layout/AvatarImage.svelte';
	import ProfileButton from '$lib/themes/default/views/friends/components/ProfileButton.svelte';
	import { getFriendListener } from '$lib/listeners/FriendListener.svelte';

	interface FriendListItemProps {
		friend: MessengerFriend;
	}

	let {friend}: FriendListItemProps = $props();

	const friends = getFriendListener();
</script>

<style>
    .icon-friend_message {
        background-image: url('$lib/themes/default/assets/images/friends/friend_message.png');
        width: 16px;
        height: 14px;
    }
    .nitro-friends-spritesheet {
        background: url('$lib/themes/default/assets/images/friends/friends-spritesheet.png') transparent no-repeat;

        &.icon-follow {
            width: 16px;
            height: 14px;
            background-position: -96px -29px;
        }
    }
</style>

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
	<Flex>
		{#if friend.followingAllowed}
			<button title="follow" class="nitro-friends-spritesheet icon-follow cursor-pointer" onclick={() => friends.followFriend(friend)}>
			</button>
		{/if}
		<button title="message" class="icon icon-friend_message cursor-pointer" onclick={(event) => {
			event.stopPropagation();
			OpenMessengerChat(friend.id);
		}}>
		</button>
	</Flex>
</Flex>