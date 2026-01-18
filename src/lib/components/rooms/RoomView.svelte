<script lang="ts">
	import { GetNitroInstance } from '$lib/api/GetNitroInstance';

	function attachView(node: HTMLElement) {
		const canvas = GetNitroInstance().application.renderer.view;
		if (!canvas) return;
		node.appendChild(canvas);
	}


</script>

<div class="max-w-screen max-h-screen" use:attachView></div>