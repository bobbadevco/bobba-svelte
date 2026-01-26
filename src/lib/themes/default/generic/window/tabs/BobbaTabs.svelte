<script lang="ts">
    import Flex from '$lib/components/common/Flex.svelte';
    import type { Snippet } from 'svelte';

    let { class: classes = '', children = undefined }: { class?: string, children?: Snippet } = $props();
</script>

<div class="w-fit mx-auto">
    <Flex class={["mt-1 min-h-11 rounded-md overflow-hidden w-full gap-px border-b-3 bg-secondary border border-secondary", classes]}>
        {@render children?.()}
    </Flex>
</div>