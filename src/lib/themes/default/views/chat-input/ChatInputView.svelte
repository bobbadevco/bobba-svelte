<script lang="ts">

import ChatInputWidget from '$lib/components/widgets/ChatInputWidget.svelte';
import { getRoomSession } from '$lib/events';
</script>

{#if getRoomSession()}
	<div class="absolute bottom-0 w-full flex">
		<ChatInputWidget type="text" class="w-100 p-4 bg-white rounded-lg text-black mx-auto" />
	</div>
{/if}