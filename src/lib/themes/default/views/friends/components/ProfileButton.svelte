<script lang="ts">
	import type { ClassValue } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { GetUserProfile } from '$lib/api/user/GetUserProfile';

	let {class: classes = '', userId = 0, children}: {class?: ClassValue, userId?: number, children?: Snippet} = $props();
</script>

<style>
	.nitro-friends-spritesheet {
      background: url('$lib/themes/default/assets/images/friends/friends-spritesheet.png') transparent no-repeat;
      &.icon-profile-sm {
          width: 13px; height: 11px;
          background-position: -51px -91px;

          &:hover {
              width: 13px; height: 11px;
              background-position: -74px -91px;
          }
      }
	}
</style>

<button type="button" onclick={(event) => {
	event.stopPropagation();
	GetUserProfile(userId);
}} class={['nitro-friends-spritesheet icon-profile-sm', classes]}>
	{@render children?.()}
</button>