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
    class={["px-5.5 text-[13px] font-bold cursor-pointer select-none", active ? "bg-bright-primary shadow-[inset_0_1px_#505050] hover:bg-bright-primary" : "bg-base-primary shadow-[inset_0_1px_#404040] hover:bg-quaternary active:bg-dark-primary", classes]}
    {... rest}>
    {@render children?.()}
</Flex>