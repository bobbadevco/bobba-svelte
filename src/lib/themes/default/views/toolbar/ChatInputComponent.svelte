<script lang="ts">
import ChatInputWidget from '$lib/components/widgets/ChatInputWidget.svelte';
import { getRoomSession, getUserLook } from '$lib/events';
import Button from '$lib/components/common/Button.svelte';
import AvatarImage from '$lib/components/common/layout/AvatarImage.svelte';
import Flex from '$lib/components/common/Flex.svelte';

const userLook = $derived(getUserLook());
</script>

{#if getRoomSession()}
	<Flex class="absolute bottom-2 w-full">
		<Flex class="ms-3 me-auto gap-2 items-center">
			<Button
				id="avatar-image-button"
				class="hover:-translate-y-0.5 hover:drop-shadow-[0px_2px_#00000080] w-13 border-[3px] outline-black outline-2 rounded-full border-solid overflow-hidden border-bright-primary bg-tertiary h-13 relative" center>
				<AvatarImage class="absolute -bottom-4" headOnly figure={ userLook }/>
			</Button>
			<ChatInputWidget type="text" class="w-100 h-11 p-2 bg-white rounded-md border-black border-2 focus:outline-0 text-black mx-auto" />
		</Flex>
	</Flex>
{/if}