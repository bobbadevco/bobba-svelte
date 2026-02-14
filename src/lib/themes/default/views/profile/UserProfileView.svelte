<script lang="ts">

	import { getProfileListener } from '$lib/listeners';
	import { GetSessionDataManager, GetUserProfile, LocalizeText } from '$lib/api';
	import BobbaWindow from '$lib/themes/default/generic/window/BobbaWindow.svelte';

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
	<BobbaWindow disableDrag class="min-w-154.25 min-h-138.75" bind:manualResized unique="user-profile" headerTitle={ LocalizeText('extendedprofile.caption') } {onCloseClick}>
		asd
	</BobbaWindow>
{/if}