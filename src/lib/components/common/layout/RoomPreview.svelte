<script lang="ts">
	import {
		GetTicker,
		type IRoomRenderingCanvas,
		type RoomPreviewer,
		TextureUtils
	} from '@nitrots/nitro-renderer';
	import { type Snippet, untrack } from 'svelte';

	interface RoomPreviewProps {
		roomPreviewer: RoomPreviewer;
		height?: number;
		children?: Snippet;
	}

	let {roomPreviewer, height = 0, children = undefined}: RoomPreviewProps = $props();

	let renderingCanvas = $state<IRoomRenderingCanvas>();
	let backgroundImage = $state('');
	let width = $state(0);

	function update(_time: number)	 {
		if (!roomPreviewer || !renderingCanvas) {
			return;
		}
		roomPreviewer.updatePreviewRoomView();

		if (!renderingCanvas.canvasUpdated) return;
		backgroundImage = `url(${ TextureUtils.generateImageUrl(renderingCanvas.master) })`;
	}

	$effect(() => {
		if (!roomPreviewer) return;
		if (!renderingCanvas) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			//@ts-expect-error
			roomPreviewer["backgroundColor"] = null;
			roomPreviewer.getRoomCanvas(width, height);

			const canvas = roomPreviewer.getRenderingCanvas();

			renderingCanvas = canvas;

			canvas.canvasUpdated = true;

			update(-1);
		}
		GetTicker().add(update);

		return () => GetTicker().remove(update);
	});

	$effect(() => {
		if (!roomPreviewer) return;
		roomPreviewer.modifyRoomCanvas(width, height);
		untrack(() => update(-1));
	});
</script>

<div class="relative w-full">
	<div bind:clientWidth={width} style:background-image={backgroundImage} style:height="{height}px" class="relative top-0 left-0 w-full h-full bg-no-repeat overflow-hidden"></div>
	{@render children?.()}
</div>