<script lang="ts">
	import NavigatorView from './views/navigator/NavigatorView.svelte';
    import AlertView from "$lib/themes/default/views/alert/AlertView.svelte";
	import ToolbarLeftComponent from './views/toolbar/ToolbarLeftComponent.svelte';
	import ChatInputView from '$lib/themes/default/views/chat-input/ChatInputView.svelte';
</script>

<AlertView />
<NavigatorView />
<ToolbarLeftComponent />
<ChatInputView />