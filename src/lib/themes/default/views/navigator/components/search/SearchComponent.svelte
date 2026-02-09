<script lang="ts">

	import { getNavigatorListener } from '$lib/listeners/NavigatorListener.svelte';
	import Flex from '$lib/components/common/Flex.svelte';
	import Select from '$lib/components/common/Select.svelte';
	import { LocalizeText } from '$lib/api';
	import { SearchOptions } from '$lib/api/navigator/SearchOptions';
	import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
	import { Fa } from 'svelte-fa';

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

<Flex fullWidth class="gap-3 items-center relative">
	<Flex>
		<Select
			class="h-7"
			options={filterOptions}
			bind:value={navigator.searchIndex} />
	</Flex>
	<Flex fullWidth class="pe-5 gap-2 relative items-center">
		<input 
			type="text" 
			class="bg-white w-full rounded-lg {navigator.searchValue && navigator.searchValue.length && 'me-4'} text-black focus:outline-0 px-3 py-0.5"
			placeholder={LocalizeText('navigator.filter.input.placeholder')}
			bind:value={navigator.searchValue} 
			{onkeydown} 
		/>
		{#if navigator.searchValue && navigator.searchValue.length > 0}
			<Flex onclick={ () => { navigator.searchValue = ''; navigator.reloadCurrentSearch(''); } } class="absolute right-11 cursor-pointer text-tertiary">
				<Fa icon={ faTimes } />
			</Flex>
		{:else}
			<Flex class="absolute right-2 text-tertiary me-4.5">
				<Fa icon={ faSearch } />
			</Flex>
		{/if}
	</Flex>
	<Flex pointer class="absolute end-0" onclick={() => navigator.reloadCurrentSearch(navigator.searchValue)}>
		{#if navigator.searchValue && navigator.searchValue.length > 0}
			<div class="bg-(image:--navigator-spritesheet) active:brightness-50 hover:brightness-125 w-6.25 bg-position-[-40px_0] h-5.75"></div>
		{/if}
	</Flex>
</Flex>

