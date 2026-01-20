<script lang="ts">
    import { AvatarScaleType, AvatarSetType } from '@nitrots/nitro-renderer';
    import { GetAvatarRenderManager } from '$lib/api';
    import { onDestroy } from 'svelte';
    import type { HTMLAttributes, ClassValue } from 'svelte/elements';

    interface AvatarImageProps extends HTMLAttributes<HTMLDivElement> {
        figure?: string;
        gender?: string;
        headOnly?: boolean;
        direction?: number;
        scale?: number;
        class?: ClassValue,
    }

    let {
        figure = '',
        gender = 'M',
        headOnly = false,
        direction = 2,
        scale = 1,
        class: className = '',
        style = '',
        ...rest
    }: AvatarImageProps = $props();

    let avatarUrl = $state<string | null>(null);
    let randomValue = $state(-1);
    let isDisposed = false;
    

    $effect(() => {
        const currentFigure = figure;
        const currentGender = gender;
        const currentDirection = direction;
        const currentHeadOnly = headOnly;
        randomValue;

        const avatarImage = GetAvatarRenderManager().createAvatarImage(
            currentFigure,
            AvatarScaleType.LARGE,
            currentGender,
            {
                resetFigure: (f) => {
                    if (isDisposed) return;
                    randomValue = Math.random();
                },
                dispose: () => {},
                disposed: false
            },
            null
        );

        if (!avatarImage) return;

        let setType = AvatarSetType.FULL;
        if (currentHeadOnly) setType = AvatarSetType.HEAD;

        avatarImage.setDirection(setType, currentDirection);

        const image = avatarImage.getCroppedImage(setType);
        if (image) avatarUrl = image.src;

        return () => {
            avatarImage.dispose();
        };
    });

    onDestroy(() => {
        isDisposed = true;
    });

    let computedStyle = $derived.by(() => {
        let styles: string[] = [];
        
        if (avatarUrl && avatarUrl.length) {
            styles.push(`background-image: url('${avatarUrl}')`);
        }
        
        if (scale !== 1) {
            styles.push(`transform: scale(${scale})`);
            if (!(scale % 1)) {
                styles.push(`image-rendering: pixelated`);
            }
        }
        
        if (typeof style === 'string' && style.length > 0) {
            styles.push(style);
        }
        
        return styles.join('; ');
    });

    let computedClass = $derived(['w-[90px] h-[130px]', className].flat().filter(Boolean).join(' '));
</script>

<div class={computedClass} style={computedStyle} {...rest}></div>
