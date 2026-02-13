<script lang="ts">
import Flex from '$lib/components/common/Flex.svelte';
import { LocalizeText, SendMessageComposer } from '$lib/api';
import { NavigatorDeleteSavedSearchComposer, NavigatorSavedSearch, NavigatorSearchComposer } from '@nitrots/nitro-renderer';

interface SearchSavesResultItemProps {
	search: NavigatorSavedSearch;
}

let { search }: SearchSavesResultItemProps = $props();

let isHover = $state(false);
let currentIndex = $state(0);

const onmouseenter = (searchId: number) =>
{
	currentIndex = searchId;
	isHover = true;
}

const onmouseleave = () =>
{
	currentIndex = 0;
	isHover = false;
}

const getResultTitle = () =>
{
	let name = search.code;

	if(!name || !name.length || LocalizeText('navigator.searchcode.title.' + name) == ('navigator.searchcode.title.' + name)) return search.code;

	if(name.startsWith('${')) return name.slice(2, (name.length - 1));

	return ('navigator.searchcode.title.' + name);
}
</script>

<Flex grow pointer class="items-center justify-between gap-2" onmouseenter={() => onmouseenter(search.id)} onmouseleave={() => onmouseleave()}>
	<Flex class="text-[12px] cursor-pointer text-white" title={ LocalizeText('navigator.tooltip.open.saved.search') } onclick={ () => SendMessageComposer(new NavigatorSearchComposer(search.code.split('.').reverse()[0], search.filter)) }>{ LocalizeText(getResultTitle()) }</Flex>
	{#if (isHover && currentIndex === search.id)}
		<Flex pointer class="bg-(image:--navigator-spritesheet) bg-position-[-111px_-16px] hover:bg-position-[-128px_-16px] active:bg-position-[-145px_-16px] size-4" title={ LocalizeText('navigator.tooltip.remove.saved.search') } onclick={ () => SendMessageComposer(new NavigatorDeleteSavedSearchComposer(search.id)) } ></Flex>
	{/if}
</Flex>