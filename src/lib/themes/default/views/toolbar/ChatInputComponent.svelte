<script lang="ts">

import ChatInputWidget from '$lib/components/widgets/ChatInputWidget.svelte';
import { getRoomSession } from '$lib/events';
</script>

{#if getRoomSession()}
	<div class="absolute bottom-2 w-full flex">
		<ChatInputWidget type="text" class="w-100 p-2 bg-white rounded-md border-black border-2 focus:outline-0 text-black mx-auto" />
	</div>
{/if}