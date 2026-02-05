<script lang="ts">
	import { GetConfiguration } from '$lib/api';
	import {type FlexProps} from '$lib/components/common/Flex.svelte';

	interface RoomThumbnailProps extends FlexProps
	{
		roomId?: number;
		customUrl?: string;
		defaultImage: string;
	}

	const {roomId, customUrl, defaultImage, children, class: classes = ''}: RoomThumbnailProps = $props();

	const imageUrl = $derived.by(() => {
		if(customUrl && customUrl.length) return (GetConfiguration<string>('image.library.url') + customUrl);

		return (GetConfiguration<string>('thumbnails.url').replace('%thumbnail%', (roomId || 0).toString()));
	});
</script>

<div style:background-image="url({defaultImage})" class={["relative bg-no-repeat bg-center size-27.5", classes]}>
	{#if imageUrl}
		<img src="{imageUrl}?{Date.now()}" alt="" />
	{/if}
	{@render children?.()}
</div>