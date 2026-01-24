<script lang="ts">
    import { AvatarScaleType, AvatarSetType, type IAvatarImage } from '@nitrots/nitro-renderer';
    import { GetAvatarRenderManager } from '$lib/api';
		import type { ClassValue, HTMLAttributes } from 'svelte/elements';

    interface AvatarImageProps extends HTMLAttributes<HTMLDivElement> {
				class?: ClassValue;
        figure?: string;
        gender?: string;
        headOnly?: boolean;
        direction?: number;
        scale?: number;
    }

    let {
				class: classes,
        figure = '',
        gender = 'M',
        headOnly = false,
        direction = 2,
        scale = 1,
        style = '',
        ...rest
    }: AvatarImageProps = $props();

		let avatarUrl = $state('');

		const resetFigure = (f: string) => {
			let avatarImage: undefined | IAvatarImage;
			avatarImage = getAvatarImage(f, gender);
			if (!avatarImage) return;
			const img = avatarImage.getCroppedImage(headOnly ? AvatarSetType.HEAD : AvatarSetType.FULL);
			if (img) avatarUrl = img.src;
			avatarImage.dispose();
		};

		const getAvatarImage = (f: string, g: string) => {
			const out = GetAvatarRenderManager().createAvatarImage(
				f,
				AvatarScaleType.LARGE,
				g,
				{
					resetFigure,
					dispose: () => {},
					disposed: false
				},
				undefined
			);
			let setType = AvatarSetType.FULL;
			if (!out) return;

			out.setDirection(setType, direction);
			return out;
		};

		$effect(
			() => {
				resetFigure(figure);
			}
		);

</script>

<div class={['w-[90px] h-[130px]', classes]} style:background-image="url('{avatarUrl}')" style:image-rendering={scale % 1 ? 'pixelated' : ''} style:transform="scale({scale})" {style} {...rest}></div>
