<script lang="ts">
    import Flex from '$lib/components/common/Flex.svelte';
    import type { Snippet } from 'svelte';

    let { class: classes = '', children = undefined }: { class?: string, children?: Snippet } = $props();
</script>

<Flex class={["pt-1", classes]}>
    {@render children?.()}
</Flex>