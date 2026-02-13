<script lang="ts">
	import type { ClassValue } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { GetUserProfile } from '$lib/api/user/GetUserProfile';

	let {class: classes = '', userId = 0, children}: {class?: ClassValue, userId?: number, children?: Snippet} = $props();
</script>

<button type="button" onclick={(event) => {
	event.stopPropagation();
	GetUserProfile(userId);
}} class={['bg-(image:--friends-spritesheet) bg-position-[-51px_-91px] hover:bg-position-[-74px_-91px] w-3.25 h-2.75', classes]}>
	{@render children?.()}
</button>