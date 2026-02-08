<script lang="ts">
	import type { ClassValue } from 'svelte/elements';
	import Flex, { type FlexProps } from '$lib/components/common/Flex.svelte';

	interface AccordionSetProps extends FlexProps {
		headerText: string;
		isOpen?: boolean;
		class: ClassValue;
		name: string;
		current: string;
	}

	let {headerText, name, current = $bindable(''), children, class: classes = '', ...props}: AccordionSetProps = $props();
</script>

<Flex fullWidth wrap={false} column class={[name === current && 'flex-1', classes]} {...props}>
	<Flex class="shrink-0" pointer onclick={() => current = (name === current) ? '' : name}>
		<p class="text-white">{headerText}</p>
	</Flex>
	{#if name === current}
		<Flex column class="gap-0 flex-1">
			{@render children?.()}
		</Flex>
	{/if}
</Flex>