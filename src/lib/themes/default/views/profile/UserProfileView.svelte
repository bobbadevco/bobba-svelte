<script lang="ts">

	import { getProfileListener } from '$lib/listeners';
	import { GetSessionDataManager, GetUserProfile, LocalizeText } from '$lib/api';
	import BobbaWindow from '$lib/themes/default/generic/window/BobbaWindow.svelte';
	import Flex from '$lib/components/common/Flex.svelte';
	import UserDataComponent from '$lib/themes/default/views/profile/components/UserDataComponent.svelte';
	import RelationshipComponent from './components/RelationshipComponent.svelte';
	import BadgesComponent from '$lib/themes/default/views/profile/components/BadgesComponent.svelte';

	let profile = getProfileListener();

	let manualResized = $state(false);

	const onCloseClick = () =>
	{
		profile.userProfile = null;
		profile.userBadges = [];
		profile.userRelationships = null;
	}

	const onLeaveGroup = () =>
	{
		if(!profile.userProfile || (profile.userProfile.id !== GetSessionDataManager().userId)) return;

		GetUserProfile(profile.userProfile.id);
	}
</script>

{#if profile.userProfile}
	<BobbaWindow disableDrag class="min-w-150 min-h-138" bind:manualResized unique="user-profile" headerTitle={ LocalizeText('extendedprofile.caption') } {onCloseClick}>
		<Flex fullWidth fullHeight class="gap-2 pt-2 justify-around border-b border-bright-primary">
			<Flex column class="gap-3 w-[50%] mb-2">
				<UserDataComponent userProfile={profile.userProfile} />
				<BadgesComponent badges={profile.userBadges} />
			</Flex>
			<div class="w-px bg-bright-primary"></div>
			<Flex column class="w-[35%]">
				<RelationshipComponent friendsCount={profile.userProfile.friendsCount} relationships={profile.userRelationships} />
			</Flex>
		</Flex>
	</BobbaWindow>
{/if}