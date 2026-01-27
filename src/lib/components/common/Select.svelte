<svelte:window onscroll={ handleScrollOrResize } onresize={ handleScrollOrResize } />
<svelte:document {onclick}/>

<script lang="ts">

	import type { ClassValue } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import Flex from '$lib/components/common/Flex.svelte';
	import Portal from 'svelte-portal';

	export interface ISelectOptions {
		value: string | number;
		label: string;
		colorA?: string | number;
		colorB?: string | number;
	}

	export interface SelectProps
	{
		options: ISelectOptions[];
		value: string | number;
		setValue: (value: string | number) => void;
		disabled?: boolean;
		class?: ClassValue;
		dropdownClass?: ClassValue;
		fullWidth?: boolean;
		style?: CSSStyleValue;
		dropdownStyle?: CSSStyleValue;
		children?: Snippet;
	}

	let { options = [], value = '', setValue = () => {}, disabled = false, class: classes = '', dropdownClass = '', fullWidth = false, style = {}, dropdownStyle = {}, children }: SelectProps = $props();

	let element: HTMLElement | undefined = $state<HTMLDivElement>();
	let listElement: HTMLElement | undefined = $state<HTMLUListElement>();
	let isOpen = $state(false);
	let anchorRect = $state<{ left: number, top: number, width: number, height: number }>({} as { left: number, top: number, width: number, height: number });

	const safeOptions = $derived(options ?? []);
	const selectedOption = $derived(safeOptions.find(option => option.value === value));

	const getDropdownStyle = (): string => {
		type CSSObject = Record<string, string | number | undefined>;

		const dropdownStyleObj: CSSObject = (typeof dropdownStyle === 'object' && dropdownStyle !== null) ? dropdownStyle as CSSObject : {};

		const parseNum = (v: unknown) => typeof v === 'number' ? v : (typeof v === 'string' ? (parseFloat(v) || 0) : 0);

		const extraTop = parseNum(dropdownStyleObj.top);
		const extraLeft = parseNum(dropdownStyleObj.left);

		// separar top/left y dejar el resto tipado
		const { top: _top, left: _left, ...rest } = dropdownStyleObj;
		const restStyles: CSSObject = rest as CSSObject;

		const base: Record<string, string | number> = {
			position: 'fixed',
			top: anchorRect ? anchorRect.top + anchorRect.height - 20 + extraTop : 0,
			left: anchorRect ? anchorRect.left + extraLeft : 0,
			zIndex: (typeof dropdownStyleObj.zIndex === 'number') ? dropdownStyleObj.zIndex : 2000,
			minWidth: 'max-content',
			width: fullWidth ? '100%' : (anchorRect ? anchorRect.width : 'auto'),
		};

		const toKebab = (s: string) => s.replace(/[A-Z]/g, m => '-' + m.toLowerCase());

		const valueToString = (v: string | number | undefined, key: string) => {
			if (typeof v === 'number' && key !== 'zIndex') return `${v}px`;
			return String(v ?? '');
		};

		const merged: Record<string, string | number | undefined> = { ...base, ...restStyles };

		return Object.entries(merged)
			.map(([k, v]) => `${toKebab(k)}: ${valueToString(v, k)}`)
			.join('; ');
	};

	const getOptionLabel = (val: string | number) =>
	{
		const option = safeOptions.find(o => o.value === val);
		return option ? option.label : '';
	}

	const handleClick = () =>
	{
		if(disabled) return;
		const rect = element?.getBoundingClientRect();
		if(rect) anchorRect = ({ left: rect.left, top: rect.top, width: rect.width, height: rect.height });
		isOpen = !isOpen;
	};

	const onclick = (event: MouseEvent) =>
	{
		const target = event.target as Node;
		if(element && element.contains(target)) return;
		if(listElement && listElement.contains(target)) return;

		isOpen = false;
	}

	const handleScrollOrResize = (event: Event) =>
	{
		if(event.type === 'scroll' && listElement && listElement.contains(event.target as Node)) return;

		isOpen = false;
	}
</script>
<Flex class={[`relative items-center ${fullWidth && 'w-full'}`, classes]} style="z-index: 2000;">
	<Flex {style} pointer onclick={handleClick}>
		<Flex class="items-center justify-between" fullWidth>
			<Flex class="items-center">
				<p class="max-w-25 text-white truncate">{getOptionLabel(value)}</p>
			</Flex>
			{#if children}
				{@render children()}
			{/if}
			<Flex class="items-center justify-between">
				{#if selectedOption?.colorA}
					<Flex class="overflow-hidden w-5.25 h-3.5 right-7.5 absolute">
						<div class="h-full w-5" style="backgroundColor: '#{selectedOption?.colorA}';"></div>
						<div class="h-full w-5" style="backgroundColor: '#{selectedOption?.colorB}';"></div>
					</Flex>
				{/if}
				<img src="si" alt="dropdown icon"/>
			</Flex>
		</Flex>
	</Flex>
	{#if isOpen && anchorRect}
		<Portal target="body">
			<ul bind:this={listElement} class="{dropdownClass}" style={getDropdownStyle()}>
				{#each safeOptions as option, i (i)}
					<li class={ `relative dropdown-item pointer ${ value === option.value ? 'active' : '' }` }>
						<button onclick={ () => { setValue(option.value); isOpen = false; } }>
							{ option.label }
							{#if option.colorA}
								<Flex class="overflow-hidden w-5.25 h-3.5 right-7.5 absolute border">
									<div class="h-full w-5" style="backgroundColor: '#{selectedOption?.colorA}';"></div>
									<div class="h-full w-5" style="backgroundColor: '#{selectedOption?.colorB}';"></div>
								</Flex>
							{/if}
						</button>
					</li>
				{/each}
			</ul>
		</Portal>
	{/if}
</Flex>


