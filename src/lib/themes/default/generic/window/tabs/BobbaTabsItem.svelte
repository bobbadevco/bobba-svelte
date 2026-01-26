<script lang="ts">
    import Flex, { type FlexProps } from '$lib/components/common/Flex.svelte';

    interface BobbaCardItemProps extends FlexProps {
        active?: boolean;
        count?: number;
        class?: string;
    }

    let { pointer = true, count = 0, active = false, class: classes = '', children, ... rest }: BobbaCardItemProps = $props();
</script>

<Flex 
    pointer={pointer} 
    class={["px-3 font-bold py-1 cursor-pointer select-none", active ? "bg-bright-primary hover:bg-bright-primary" : "bg-base-primary hover:bg-quaternary active:bg-dark-primary", classes]} 
    {... rest}>
    {@render children?.()}
</Flex>