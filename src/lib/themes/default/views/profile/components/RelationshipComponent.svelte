<script lang="ts">
	import Flex from '$lib/components/common/Flex.svelte';
	import RelationshipItem from './relationships/RelationshipItem.svelte';
	import type { RelationshipStatusInfoMessageParser } from '@nitrots/nitro-renderer';
	import { RelationshipStatusEnum } from '@nitrots/nitro-renderer';
	import { LocalizeText } from '$lib/api';

	interface RelationshipComponentProps
	{
		relationships: RelationshipStatusInfoMessageParser | null;
		friendsCount: number;
	}

	let { relationships = null, friendsCount = 0 }: RelationshipComponentProps = $props();

</script>

<Flex column class="gap-2">
	<p class="font-bold text-[12px]">{LocalizeText('extendedprofile.friends.count')} {friendsCount}</p>
	<p class="font-bold text-[12px]">{ LocalizeText('extendedprofile.relstatus') }</p>
	<Flex column class="gap-1.5">
		<RelationshipItem type={RelationshipStatusEnum.HEART} {relationships} />
		<RelationshipItem type={RelationshipStatusEnum.SMILE} {relationships} />
		<RelationshipItem type={RelationshipStatusEnum.BOBBA} {relationships} />
	</Flex>
</Flex>
