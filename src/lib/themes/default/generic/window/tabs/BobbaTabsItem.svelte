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
    class={["px-3 py-2 cursor-pointer select-none hover:bg-gray-800", active && "bg-blue-500 font-bold", classes]} 
    {... rest}>
    {@render children?.()}
</Flex>