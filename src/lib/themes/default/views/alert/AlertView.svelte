<script lang="ts">
    import {getAlertListener} from "$lib/listeners";
	import BobbaWindow from "$lib/themes/default/generic/window/BobbaWindow.svelte";
    import Flex from '$lib/components/common/Flex.svelte';
</script>

{#each getAlertListener().alerts as alert (alert.id)}
    {@const headerTitle = alert.title || 'Alert'}
    <BobbaWindow unique={alert.alertType} {headerTitle} onCloseClick={() => getAlertListener().closeAlert(alert)}>
        <Flex column class="min-h-40 min-w-100">
            {#each alert.messages as message, i (i)}
                <p>{message}</p>
            {/each}
        </Flex>
    </BobbaWindow>
{/each}