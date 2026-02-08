<script lang="ts">
	import { getFriendListener } from '$lib/listeners/FriendListener.svelte';
	import BobbaWindow from '$lib/themes/default/generic/window/BobbaWindow.svelte';
	import friend_all from '$lib/themes/default/assets/images/friends/friend_all.png';
	import { CreateLinkEvent, LocalizeText } from '$lib/api';
	import AccordionItem from '$lib/themes/default/generic/accordion/AccordionItem.svelte';
	import Flex from '$lib/components/common/Flex.svelte';
	import { untrack } from 'svelte';
	import FriendListItem from '$lib/themes/default/views/friends/components/FriendListItem.svelte';

	const friends = getFriendListener();
	let current = $state('friends');

	$effect(() => {
		if (current == '') {
			untrack(() => current = 'friends');
		}
	});
</script>

{#if friends.visible}
	<BobbaWindow headerTitle="Friends" class="min-h-70" onCloseClick={() => friends.visible = false}>
		<Flex fullWidth column fullHeight class="justify-between">
			<AccordionItem class="" headerText={LocalizeText('friendlist.friends.all')} name="friends" bind:current={current}>
				<AccordionItem headerText="{LocalizeText('friendlist.friends')} ({friends.onlineFriends.length})" class="max-h-fit" name="friends_online" current="friends_online">
					{#each friends.onlineFriends as friend (friend.id)}
						<FriendListItem {friend} />
					{/each}
				</AccordionItem>
				<AccordionItem class="max-h-fit" headerText="{LocalizeText('friendlist.friends.offlinecaption')} ({friends.offlineFriends.length})" name="friends_offline" current="friends_offline">
					{#each friends.offlineFriends as friend (friend.id)}
						<FriendListItem {friend} />
					{/each}
				</AccordionItem>
			</AccordionItem>
			<AccordionItem class="" headerText={LocalizeText('friendlist.tab.friendrequests')} name="requests" bind:current={current}>

			</AccordionItem>
			<AccordionItem class="" headerText={LocalizeText('people.search.title')} name="search" bind:current={current}>

			</AccordionItem>
		</Flex>
	</BobbaWindow>
{/if}

<button class="absolute bottom-0 right-0 size-10" onclick={() => CreateLinkEvent('friends/toggle')}>
	<img src={friend_all} alt="Friends All" />
</button>