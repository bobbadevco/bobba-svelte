<script lang="ts">
	import {
		ColorConverter,
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
	let element = $state<HTMLDivElement>();
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
		if (!roomPreviewer || !element) return;
		if (!renderingCanvas) {
			const computed = window.getComputedStyle(element, null);

			let backgroundColor = computed.backgroundColor;

			backgroundColor = ColorConverter.rgbStringToHex(backgroundColor);
			backgroundColor = backgroundColor.replace('#', '0x');

			roomPreviewer.backgroundColor = parseInt(backgroundColor, 16);
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
	<div bind:this={element} bind:clientWidth={width} style:background-image={backgroundImage} style:height="{height}px" class="relative top-0 left-0 w-full h-full bg-black bg-no-repeat overflow-hidden"></div>
	{@render children?.()}
</div>