<script lang="ts">
	import NavigatorView from './views/navigator/NavigatorView.svelte';
  import AlertView from "$lib/themes/default/views/alert/AlertView.svelte";
	import ToolbarView from './views/toolbar/ToolbarView.svelte';
	import FriendsView from '$lib/themes/default/views/friends/FriendsView.svelte';
	import MessengerView from '$lib/themes/default/views/messenger/MessengerView.svelte';
	import CatalogView from '$lib/themes/default/views/catalog/CatalogView.svelte';
</script>

<AlertView />
<NavigatorView />
<ToolbarView />
<FriendsView />
<MessengerView />
<CatalogView />