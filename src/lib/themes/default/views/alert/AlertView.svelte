<script lang="ts">
    import {getAlertListener} from "$lib/listeners/AlertListener.svelte";
	import BobbaWindow from "../../generic/card/BobbaWindow.svelte";
</script>

{#each getAlertListener().alerts as alert (alert.id)}
    {@const headerTitle = alert.title || 'Alert'}
    <BobbaWindow {headerTitle} onCloseClick={() => getAlertListener().closeAlert(alert)}>
        <div class="flex flex-col min-h-40 min-w-100">
            {#each alert.messages as message, i (i)}
                <p>{message}</p>
            {/each}
        </div>
    </BobbaWindow>
{/each}