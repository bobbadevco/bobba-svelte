<script lang="ts">
	import Flex from '$lib/components/common/Flex.svelte';
	import { FriendlyTime, RequestFriendComposer, type UserProfileParser } from '@nitrots/nitro-renderer';
	import { GetSessionDataManager, LocalizeText, SendMessageComposer } from '$lib/api';
	import AvatarImage from '$lib/components/common/layout/AvatarImage.svelte';
	import Button from '$lib/components/common/Button.svelte';

	interface UserDataComponentProps
	{
		userProfile: UserProfileParser;
	}

	let { userProfile = null }: UserDataComponentProps = $props();
	let requestSent = $derived(userProfile?.requestSent);
	let isOwnProfile = $derived(userProfile?.id === GetSessionDataManager().userId);
	let canSendRequest = $derived(!requestSent && (!isOwnProfile && !userProfile.isMyFriend && !userProfile.requestSent));

	const addFriend = () =>
	{
		requestSent = true;

		SendMessageComposer(new RequestFriendComposer(userProfile.username));
	}

	$effect (() =>
	{
		if (userProfile) {
			requestSent = userProfile.requestSent;
		}
	});
</script>

<Flex class="gap-2">
	<Flex column class="w-22.5 h-32.5">
		<AvatarImage figure={userProfile?.figure} direction={2} />
	</Flex>
	<Flex class="pt-2" column>
		<Flex column class="gap-0">
			<p class="font-bold">{userProfile?.username}</p>
			<p class="italic break-normal text-[12px]">{ userProfile.motto }&nbsp;</p>
		</Flex>
		<Flex column class="mt-2 gap-1">
			<p class="text-[12px]">
				<b>{ LocalizeText('extendedprofile.created') }</b> { userProfile.registration }
			</p>
			<p class="text-[12px]">
				<b>{ LocalizeText('extendedprofile.last.login') }</b> { FriendlyTime.format(userProfile.secondsSinceLastVisit, '.ago', 2) }
			</p>
			<p class="text-[12px]">
				<b>{ LocalizeText('extendedprofile.achievementscore') }</b> { userProfile.achievementPoints }
			</p>
		</Flex>
		<Flex class="mt-1 gap-2">
			{#if !userProfile.isOnline}
				<i class="bg-(image:--profiles-spritesheet) bg-position-[0_0] w-9.75 h-4"></i>
			{/if}
			{#if userProfile.isOnline}
				<i class="bg-(image:--profiles-spritesheet) bg-position-[0_-18px] w-9.25 h-4"></i>
			{/if}
			<Flex class="items-center gap-1">
				{#if canSendRequest}
					<Button class="text-[12px] underline cursor-pointer" onclick={ addFriend }>{ LocalizeText('extendedprofile.addasafriend') }</Button>
					{:else}
						{#if isOwnProfile}
							<i class="bg-(image:--profiles-spritesheet) bg-position-[-39px_-1px] w-4 h-3.25"></i>
							<p class="text-[12px] font-bold">{ LocalizeText('extendedprofile.me') }</p>
						{/if}
						{#if userProfile.isMyFriend}
							<i class="bg-(image:--profiles-spritesheet) bg-position-[-39px_-1px] w-4 h-3.25"></i>
							<p class="text-[12px] font-bold">{ LocalizeText('extendedprofile.friend') }</p>
						{/if}
						{#if (requestSent || userProfile.requestSent)}
							<p class="text-[12px] font-bold">{ LocalizeText('extendedprofile.friendrequestsent') }</p>
						{/if}
				{/if}

			</Flex>
		</Flex>
	</Flex>
</Flex>