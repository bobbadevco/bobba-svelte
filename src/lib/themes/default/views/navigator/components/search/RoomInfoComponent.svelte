<script lang="ts">
import Flex from '$lib/components/common/Flex.svelte';
import Portal from 'svelte-portal';
import type { RoomDataParser } from '@nitrots/nitro-renderer';
import { getRoomInfoState } from '$lib/api/navigator/RoomInfoState.svelte';

interface RoomInfoComponentProps
{
	roomData: RoomDataParser;
}

let { roomData }: RoomInfoComponentProps = $props()
const navigatorTheme = getRoomInfoState();

const instanceId = Math.random();
let iconElement = $state<HTMLElement | null>(null);
let portalPosition = $state({ top: 0, left: 0 });

$effect(() => {
	return () => {
		navigatorTheme.clearCloseDelay();
	};
});

$effect(() => {
	let frame: number;
	
	const updatePosition = () => {
		if (navigatorTheme.roomInfoId === instanceId && iconElement) {
			const rect = iconElement.getBoundingClientRect();
			const newTop = rect.top + rect.height - 55;
			const newLeft = rect.left + 33;
			
			if (portalPosition.top !== newTop || portalPosition.left !== newLeft) {
				portalPosition = { top: newTop, left: newLeft };
			}
		}
		frame = requestAnimationFrame(updatePosition);
	};

	frame = requestAnimationFrame(updatePosition);

	return () => {
		cancelAnimationFrame(frame);
	};
});

const onMouseEnter = () =>
{
	navigatorTheme.clearCloseDelay();
	if (navigatorTheme.roomInfoData)
	{
		navigatorTheme.roomInfoData = roomData;
		navigatorTheme.roomInfoId = instanceId;
	}
}

const onMouseLeave = (e: MouseEvent) =>
{
	const relatedTarget = e.relatedTarget as HTMLElement;
	if (relatedTarget && relatedTarget.closest('[role="tooltip"]')) return;
	
	navigatorTheme.closeWithDelay();
}

const onPortalMouseLeave = (e: MouseEvent) =>
{
	const relatedTarget = e.relatedTarget as HTMLElement;
	if (relatedTarget && relatedTarget.closest('.room-info-icon')) return;

	navigatorTheme.closeWithDelay();
}

const toggleInfo = (e: MouseEvent) =>
{
	e.stopPropagation();
	if (navigatorTheme.roomInfoId === instanceId)
	{
		navigatorTheme.roomInfoData = null;
		navigatorTheme.roomInfoId = null;
		navigatorTheme.clearCloseDelay();
	}
	else
	{
		navigatorTheme.clearCloseDelay();
		navigatorTheme.roomInfoData = roomData;
		navigatorTheme.roomInfoId = instanceId;
	}
}
</script>

<Flex 
	bind:element={iconElement}
	class="size-4.5 bg-(image:--navigator-spritesheet) bg-position-[-68px_-2px] cursor-pointer pointer-events-auto room-info-icon"
	onclick={toggleInfo}
	onmouseenter={onMouseEnter}
	onmouseleave={onMouseLeave}>
	{#if (navigatorTheme.roomInfoId === instanceId)}
		<Portal target="body">
			<div 
				role="tooltip"
				class="fixed items-center z-999 w-60 bg-bright-primary rounded p-2 text-white pointer-events-auto"
				style="left: {portalPosition.left}px; top: {portalPosition.top}px;"
				onmouseenter={() => { 
					navigatorTheme.clearCloseDelay();
					if (!navigatorTheme.roomInfoData) {
						navigatorTheme.roomInfoData = roomData;
						navigatorTheme.roomInfoId = instanceId;
					}
				}}
				onmouseleave={onPortalMouseLeave}
			>
				<div class="absolute size-5 -left-2 z-0 top-[38%] rotate-135 bg-bright-primary"></div>
				<Flex column class="gap-1 relative z-10">
					<p class="font-bold pb-1 truncate">{roomData.roomName}</p>
					<p class="text-xs text-gray-600 truncate">{roomData.ownerName}</p>
					<p class="text-sm mt-1">{roomData.description || 'Sin descripción'}</p>
				</Flex>
			</div>
		</Portal>
	{/if}
</Flex>