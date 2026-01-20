<script lang="ts">
	import type { Snippet } from "svelte";
	import type { ClassValue } from "svelte/elements";
	import Flex from "../Flex.svelte";

    export interface ProgressBarProps {
        children?: Snippet,
        message?: string,
        percent: number,
        maxPercent: number,
		class?: ClassValue,
        innerBarClass?: ClassValue,
    }

    const {children, message = '', percent = 0, maxPercent = 100, ... p}: ProgressBarProps = $props();
</script>

<Flex column class={[ 'position-relative', 'justify-center', p.class]}>
    {#if message && (message.length > 0)}
        <Flex center class="position-absolute text-[14px] z-2">{message}</Flex> 
    {/if}
    <div class={[ 'h-full', 'z-1', p.innerBarClass]} style="width: {(~~((((percent - 0) * (100 - 0)) / (maxPercent - 0))) + 0)}%"></div>
    {#if children}
		{@render children()}
	{/if}
</Flex>
