<script lang="ts">
	import { MessengerFriend } from '$lib/api';
	import Flex from '$lib/components/common/Flex.svelte';
	import AvatarImage from '$lib/components/common/layout/AvatarImage.svelte';
	import ProfileButton from '$lib/themes/default/views/friends/components/ProfileButton.svelte';

	interface FriendListItemProps {
		friend: MessengerFriend;
	}

	let {friend}: FriendListItemProps = $props();
</script>

<Flex>
	<Flex class="items-center gap-0">
		{#if friend.id > 0 && friend.online}
			<Flex center pointer class="w-7.25 h-0 mt-4 -ml-3.75 relative left-1 top-0.5">
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
</Flex>