<script lang="ts">
    import {getAlertListener} from "$lib/listeners/AlertListener.svelte";
	import DraggableWindow from "../../generic/card/BobbaWindow.svelte";
</script>

{#each getAlertListener().alerts as alert}
    {@const title = alert.title || 'Alert'}
    <DraggableWindow {title} bind:visible={() => true, (v) => {
        if (!v) {
            getAlertListener().closeAlert(alert);
        }
    }}>
        <div class="flex flex-col min-h-40 min-w-100">
            {#each alert.messages as message}
                <p>{message}</p>
            {/each}
        </div>
    </DraggableWindow>
{/each}