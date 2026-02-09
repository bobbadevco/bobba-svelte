<script lang="ts">

	import { getNavigatorListener } from '$lib/listeners/NavigatorListener.svelte';
	import Flex from '$lib/components/common/Flex.svelte';
	import Select from '$lib/components/common/Select.svelte';
	import { LocalizeText } from '$lib/api';
	import { SearchOptions } from '$lib/api/navigator/SearchOptions';
	import Fa from 'svelte-fa';
	import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';

	const navigator = getNavigatorListener();

	const onkeydown = (e: KeyboardEvent) =>
	{
		if(e.key !== 'Enter') return;

		navigator.processSearch();
	};

	const filterOptions = $derived(SearchOptions.map((filter, index) => ({ 
		value: index, 
		label: LocalizeText('navigator.filter.' + filter.name) 
	})));
</script>

<Flex fullWidth class="gap-3">
	<Flex>
		<Select
			options={filterOptions}
			bind:value={navigator.searchIndex} />
	</Flex>
	<Flex fullWidth class="pe-5 gap-2 relative items-center">
		<input 
			type="text" 
			class="bg-white w-full rounded-lg text-black focus:outline-0 px-3 py-0.5"
			placeholder={LocalizeText('navigator.filter.input.placeholder')}
			bind:value={navigator.searchValue} 
			{onkeydown} 
		/>
		{#if navigator.searchValue && navigator.searchValue.length > 0}
			<Flex onclick={ () => navigator.searchValue = '' } class="absolute right-7 cursor-pointer text-tertiary">
				<Fa icon={ faTimes } />
			</Flex>
		{:else}
			<Flex class="absolute right-2 text-tertiary me-4.5">
				<Fa icon={ faSearch } />
			</Flex>
		{/if}
	</Flex>
</Flex>

