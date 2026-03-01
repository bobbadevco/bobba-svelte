<script lang="ts">
	import Flex from '$lib/components/common/Flex.svelte';
	import BadgeImage from '$lib/components/common/layout/BadgeImage.svelte';

	interface BadgesComponentProps
	{
		badges: string[];
	}

	let { badges = [] }: BadgesComponentProps = $props();
</script>
<div class="grid min-h-13.75 bg-secondary p-2 rounded-sm grid-cols-5 gap-1">
	{#each badges as badge (badge)}
		<Flex column center>
			<BadgeImage badgeCode={badge} />
		</Flex>
	{/each}
</div>