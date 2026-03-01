<script lang="ts">
	import { BadgeImageReadyEvent, NitroSprite, TextureUtils } from '@nitrots/nitro-renderer';
	import type { ClassValue, HTMLAttributes } from 'svelte/elements';
	import {
		GetConfiguration,
		GetSessionDataManager, LocalizeBadgeDescription,
		LocalizeBadgeName,
		LocalizeText
	} from '$lib/api';

	interface BadgeImageProps extends HTMLAttributes<HTMLDivElement> {
		class?: ClassValue;
		badgeCode: string;
		isGroup?: boolean;
		showInfo?: boolean;
		customTitle?: string;
		isGrayscale?: boolean;
		scale?: number;
	}

	let {
		class: classes,
		badgeCode = '',
		isGroup = false,
		showInfo = false,
		customTitle = '',
		isGrayscale = false,
		scale = 1,
		style = '',
		children,
		...rest
	}: BadgeImageProps = $props();

	let imageElement = $state<HTMLImageElement | null>(null);

	const getStyle = $derived.by(() => {
		let newStyle = '';

		if (imageElement) {
			const url = isGroup
				? imageElement.src
				: GetConfiguration<string>('badge.asset.url').replace('%badgename%', badgeCode.toString());
			newStyle += `background-image: url(${url});`;
			let width = imageElement.width;
			let height = imageElement.height;

			if (scale !== 1) {
				newStyle += `transform: scale(${scale});`;

				if (!(scale % 1)) newStyle += `image-rendering: pixelated;`;

				width = imageElement.width * scale;
				height = imageElement.height * scale;
			}
			newStyle += `width: ${width}px; height: ${height}px;`;
		}

		return newStyle + style;
	});

	$effect(() => {
		if (!badgeCode || !badgeCode.length) return;

		let didSetBadge = false;

		const onBadgeImageReadyEvent = (event: BadgeImageReadyEvent) => {
			if (event.badgeId !== badgeCode) return;

			const element = TextureUtils.generateImage(new NitroSprite(event.image));

			element.onload = () => (imageElement = element);

			didSetBadge = true;

			GetSessionDataManager().events.removeEventListener(
				BadgeImageReadyEvent.IMAGE_READY,
				onBadgeImageReadyEvent
			);
		};

		GetSessionDataManager().events.addEventListener(
			BadgeImageReadyEvent.IMAGE_READY,
			onBadgeImageReadyEvent
		);

		const texture = isGroup
			? GetSessionDataManager().getGroupBadgeImage(badgeCode)
			: GetSessionDataManager().getBadgeImage(badgeCode);

		if (texture && !didSetBadge) {
			const element = TextureUtils.generateImage(new NitroSprite(texture));

			element.onload = () => (imageElement = element);
		}

		return () =>
			GetSessionDataManager().events.removeEventListener(
				BadgeImageReadyEvent.IMAGE_READY,
				onBadgeImageReadyEvent
			);
	});
</script>

<div class={['size-10 relative bg-no-repeat bg-center', isGrayscale && 'grayscale', classes]} style={getStyle} {...rest}>
	{#if showInfo && GetConfiguration('badge.descriptions.enabled', true)}
		<div class="badge-information text-black py-1 px-2 small">
			<div class="fw-bold mb-1">{isGroup ? customTitle : LocalizeBadgeName(badgeCode)}</div>
			<div>{isGroup ? LocalizeText('group.badgepopup.body') : LocalizeBadgeDescription(badgeCode)}</div>
		</div>
	{/if}
	{@render children?.()}
</div>
