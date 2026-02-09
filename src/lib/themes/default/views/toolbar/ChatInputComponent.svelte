<script lang="ts">
import ChatInputWidget from '$lib/components/widgets/ChatInputWidget.svelte';
import { getRoomSession, getUserLook } from '$lib/events';
import Button from '$lib/components/common/Button.svelte';
import AvatarImage from '$lib/components/common/layout/AvatarImage.svelte';
import Flex from '$lib/components/common/Flex.svelte';

const userLook = $derived(getUserLook());

let inputSize = $state(20);
let lastKnownLength = 0;
let blankTimeoutId: ReturnType<typeof setTimeout> | undefined;

function resetSize()
{
    inputSize = 1;
}

function scheduleBlankReset(currentLen: number)
{
    if(currentLen === 0)
    {
        if(blankTimeoutId) clearTimeout(blankTimeoutId);
        blankTimeoutId = setTimeout(() =>
        {
            if(lastKnownLength === 0) resetSize();
        }, 300);
    }
    else if(blankTimeoutId)
    {
        clearTimeout(blankTimeoutId);
        blankTimeoutId = undefined;
    }
}

function handleInput(e: Event)
{
    const el = (e.target as HTMLInputElement);
    const valueLen = el?.value?.length ?? 0;
    const MAX_SIZE_CH = 40;
    lastKnownLength = valueLen;
    inputSize = Math.min(Math.max(valueLen + 1, 1), MAX_SIZE_CH);
    scheduleBlankReset(valueLen);
}

function handleKeyDown(e: KeyboardEvent)
{
    if(e.key === 'Enter' || e.key === 'NumpadEnter')
    {
        resetSize();
    }
}
</script>

{#if getRoomSession()}
	<Flex class="absolute bottom-2 w-full">
		<Flex class="ms-3 me-auto gap-2 items-center w-full justify-center">
			<Button
				id="avatar-image-button"
				class="hover:-translate-y-0.5 hover:drop-shadow-[0px_2px_#00000080] w-13 border-[3px] outline-black outline-2 rounded-full border-solid overflow-hidden border-bright-primary bg-tertiary h-13 relative" center>
				<AvatarImage class="absolute -bottom-4" headOnly figure={ userLook }/>
			</Button>
			<Flex>
					<div class="bg-(image:--toolbar-spritesheet) w-4.5 h-11 bg-position-[-178px_0]"></div>
					<ChatInputWidget
							type="text"
							size={inputSize}
							oninput={handleInput}
							onkeydown={handleKeyDown}
							class="w-auto min-w-78.75 max-w-100 h-11 p-2 bg-[#ECECECFF] shadow-[inset_0_-5px_#c6c6c6,inset_0_9px_white] border-black border-2 border-x-0 focus:outline-0 text-black mx-auto" />
					<div class="bg-(image:--toolbar-spritesheet) w-4.5 h-11 bg-position-[-185px_-45px]"></div>
			</Flex>
		</Flex>
	</Flex>
{/if}