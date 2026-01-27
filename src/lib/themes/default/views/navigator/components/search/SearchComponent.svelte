<script lang="ts">

import { getNavigatorListener } from '$lib/listeners/NavigatorListener.svelte';
import Flex from '$lib/components/common/Flex.svelte';
import Select from '$lib/components/common/Select.svelte';
import { LocalizeText } from '$lib/api';
import { SearchOptions } from '$lib/api/navigator/SearchOptions';

const navigator = getNavigatorListener();

const onkeydown = (e: KeyboardEvent) =>
{
	if(e.key !== 'Enter') return;

	navigator.processSearch();
};

const handleInput = (event: Event) =>
{
	const target = event.target as HTMLInputElement | null;
	if (!target) return;
	navigator.searchValue = target.value;
};
</script>

<Flex fullWidth class="gap-2">
	<Flex shrink>
		<Select
			style="height: 23px;"
			dropdownStyle="top: -4px;"
			fullWidth
			options={ SearchOptions.map((filter, index) => ({ value: index, label: LocalizeText('navigator.filter.' + filter.name) })) }
			value={ navigator.searchIndex }
			setValue={ (val) => navigator.searchIndex = Number(val) } />
	</Flex>
	<Flex class="pe-5 gap-2" fullWidth>
		<input type="text" style="width: 235px" class="border border-black"
					 placeholder={LocalizeText('navigator.filter.input.placeholder')}
					 value={navigator.searchValue} onchange={ handleInput } {onkeydown} />
		{#if (!navigator.searchValue || !navigator.searchValue.length)}
			<Flex class="icon icon-pen position-absolute navigator-search-button"/> }
		{/if}
		{#if navigator.searchValue && !!navigator.searchValue.length}
			<Flex onclick={ () => navigator.searchValue = '' } class="icon icon-clear position-absolute navigator-clear-button cursor-pointer"/>
		{/if}
		{#if navigator.searched && navigator.searchValue && !!navigator.searchValue.length}
			<Flex onclick={ navigator.processSearch } class="icon icon-reload-navigator cursor-pointer" />
		{/if}
	</Flex>
</Flex>