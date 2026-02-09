<script lang="ts">
	import { getMessengerListener } from '$lib/listeners/MessengerListener.svelte';
	import BobbaWindow from '$lib/themes/default/generic/window/BobbaWindow.svelte';
	import Flex from '$lib/components/common/Flex.svelte';
	import AvatarImage from '$lib/components/common/layout/AvatarImage.svelte';
	import ProfileButton from '$lib/themes/default/views/friends/components/ProfileButton.svelte';
	import { GetSessionDataManager, LocalizeText } from '$lib/api';
	import MessengerThreadGroup from '$lib/themes/default/views/messenger/components/MessengerThreadGroup.svelte';

	const messenger = getMessengerListener();
	let messageText = $state('');
	$inspect(messenger.activeThread && messenger.activeThread.groups[0].chats);
</script>

{#if messenger.visible}
<BobbaWindow class="min-h-fit min-w-40" headerTitle="Messenger">
	<Flex fullWidth column>
		<Flex class="gap-2">
			{#each messenger.visibleThreads as thread (thread.threadId)}
				<button onclick={() => messenger.activeThreadId = thread.threadId} class={[thread === messenger.activeThread && "bg-secondary rounded-t-md size-12 pb-1", messenger.activeThread !== thread && "bg-tertiary rounded-md mb-1 w-12 h-11", "cursor-pointer flex relative"]}>
					<Flex fullWidth class="items-center gap-1">
						{#if thread.participant.id > 0}
							<AvatarImage style="background-position-y: -10px; background-position-x: -22px;" figure={thread.participant.figure} headOnly direction={3} />
						{/if}
					</Flex>
				</button>
			{/each}
		</Flex>

		{#if messenger.activeThread}
			<Flex fullWidth column fit class={[(messenger.activeThread && messenger.activeThread.threadId === messenger.visibleThreads[0].threadId) && "rounded-tl-none!", "bg-secondary p-2 rounded overflow-y-auto"]}>
				<Flex fullWidth class="justify-between gap-2">
					<Flex fullWidth class="gap-2 justify-center items-center bg-primary px-2 py-1 italic rounded-sm">
						<p class="text-sm">You're talking with {messenger.activeThread.participant.name}</p>
						<ProfileButton class="cursor-pointer" />
					</Flex>
				</Flex>
				<Flex column fullWidth class="overlow-auto">
					{#if messenger.activeThread}
						{#each messenger.activeThread.groups as group, i (i)}
							<MessengerThreadGroup thread={messenger.activeThread} group={group} />
						{/each}
					{/if}
				</Flex>
				<Flex fullWidth>
					<input class="p-2 w-full bg-white rounded-lg text-black" type="text" bind:value={messageText} maxlength="255" placeholder={LocalizeText('messenger.window.input.default', [ 'FRIEND_NAME' ], [ messenger.activeThread.participant.name || '' ])}
								 onkeydown={(event) => {
								 if (event.key === 'Enter' && messenger.activeThread) {
									 messenger.sendMessage(messenger.activeThread, GetSessionDataManager().userId, messageText);
									 messageText = '';
								 }
							 }}
					/>
				</Flex>
			</Flex>
		{/if}
	</Flex>
</BobbaWindow>
{/if}