<script lang="ts">
	import type { NavigatorSavedSearch } from '@nitrots/nitro-renderer';
	import Flex from '$lib/components/common/Flex.svelte';
	import { Fa } from 'svelte-fa';
	import { faBolt } from '@fortawesome/free-solid-svg-icons';
	import { LocalizeText } from '$lib/api';
	import SearchSavesItemComponent
		from '$lib/themes/default/views/navigator/components/saves/SearchSavesItemComponent.svelte';

	interface SearchSavesResultComponentProps {
		search?: NavigatorSavedSearch[];
	}

	let { search = [] }: SearchSavesResultComponentProps = $props();
</script>

<Flex column class="w-full bg-primary p-2 h-full rounded-md">
	<Flex class="bg-[#FAA700] gap-2 px-2 py-0.5 rounded-sm items-center justify-between">
		<p>{LocalizeText('navigator.quick.links.title')}</p>
		<Fa class="text-white" icon={ faBolt }/>
	</Flex>
	<Flex column class="p-1 overflow-x-hidden overflow-y-auto">
		{#if search && search.length > 0}
			{#each search as search (search.id)}
				<SearchSavesItemComponent {search} />
			{/each}
		{/if}
	</Flex>
</Flex>