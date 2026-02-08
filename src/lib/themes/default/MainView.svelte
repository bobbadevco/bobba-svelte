<script lang="ts">
	import NavigatorView from './views/navigator/NavigatorView.svelte';
  import AlertView from "$lib/themes/default/views/alert/AlertView.svelte";
	import ToolbarView from './views/toolbar/ToolbarView.svelte';
	import FriendsView from '$lib/themes/default/views/friends/FriendsView.svelte';
</script>

<AlertView />
<NavigatorView />
<ToolbarView />
<FriendsView />