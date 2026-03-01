<script lang="ts">
	import Flex from '$lib/components/common/Flex.svelte';
	import type { RelationshipStatusInfoMessageParser } from '@nitrots/nitro-renderer';
	import { RelationshipStatusEnum } from '@nitrots/nitro-renderer';
	import { GetUserProfile, LocalizeText } from '$lib/api';
	import AvatarImage from '$lib/components/common/layout/AvatarImage.svelte';

	interface RelationshipItemProps
	{
		type: number;
		relationships: RelationshipStatusInfoMessageParser | null;
	}

	let { type = 0, relationships = null }: RelationshipItemProps = $props();

	let relationshipInfo = $derived(relationships?.relationshipStatusMap?.getValue(type));
	let relationshipName = $derived(RelationshipStatusEnum.RELATIONSHIP_NAMES[type].toLocaleLowerCase());

	const getIcon = (type: number) =>
	{
		switch(type)
		{
			case RelationshipStatusEnum.HEART: return 'bg-position-[-7px_-66px] min-w-3.25 h-3.75';
			case RelationshipStatusEnum.SMILE: return 'bg-position-[-59px_-66px] min-w-3.25 h-3.75';
			case RelationshipStatusEnum.BOBBA: return 'bg-position-[-98px_-4px] min-w-3.25 h-3.75';
			default: return '';
		}
	}
</script>

<Flex fullHeight fullWidth class="gap-1">
	<i class="bg-(image:--friends-spritesheet) mt-0.5 { getIcon(type) }"></i>
	<Flex column fullWidth fullHeight>
		<Flex class="bg-secondary rounded-sm py-px px-2 items-center justify-between">
			{#if (relationshipInfo && (relationshipInfo.friendCount >= 1))}
				<Flex onclick={ () => GetUserProfile(relationshipInfo?.randomFriendId) } class="cursor-pointer text-[12px] font-bold underline">{ relationshipInfo.randomFriendName }</Flex>
			{:else}
				<Flex class="text-[12px] underline font-bold">{ LocalizeText(`extendedprofile.add.friends`) }</Flex>
			{/if}
			<Flex class="relative">
				<AvatarImage class="absolute h-4 w-12.5 -top-15 -right-5" headOnly direction={ 4 } figure={ relationshipInfo?.randomFriendFigure } />
			</Flex>
		</Flex>
		<Flex class="min-h-2">
			<p class="pr-2 text-[12px] text-bright-accent italic">
				{#if !relationshipInfo}{ LocalizeText('extendedprofile.no.friends.in.this.category') }{/if}
				{#if (relationshipInfo && (relationshipInfo.friendCount > 1))}{ LocalizeText(`extendedprofile.relstatus.others.${ relationshipName }`, [ 'count' ], [ (relationshipInfo.friendCount - 1).toString() ]) } }{/if}
			</p>
		</Flex>
	</Flex>
</Flex>