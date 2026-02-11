<svelte:window onscroll={ handleScrollOrResize } onresize={ handleScrollOrResize } />
<svelte:document onpointerdown={onclick}/>

<script lang="ts">
	import type { ClassValue } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { tick } from 'svelte';
	import Flex from '$lib/components/common/Flex.svelte';
	import Portal from 'svelte-portal';
	import Fa from 'svelte-fa';
	import { faAngleDown } from '@fortawesome/free-solid-svg-icons';

	export interface ISelectOptions {
		value: string | number;
		label: string;
		colorA?: string | number;
		colorB?: string | number;
	}

	export interface SelectProps {
		options: ISelectOptions[];
		value: string | number;
		setValue?: (value: string | number) => void;
		disabled?: boolean;
		class?: ClassValue;
		dropdownClass?: ClassValue;
		fullWidth?: boolean;
		style?: string;
		dropdownStyle?: Record<string, string | number | undefined>;
		children?: Snippet;
	}

	let { 
		options = [], 
		value = $bindable(''), 
		setValue, 
		disabled = false, 
		class: classes = '', 
		dropdownClass = '', 
		fullWidth = false, 
		style = '', 
		dropdownStyle = {}, 
		children 
	}: SelectProps = $props();

	let element = $state<HTMLElement | null>(null);
	let listElement = $state<HTMLUListElement>();
	let isOpen = $state(false);
	let anchorRect = $state({ left: 0, top: 0, width: 0, height: 0 });
	let focusedIndex = $state(-1);

	const safeOptions = $derived(options ?? []);
	const selectedOption = $derived(safeOptions.find(option => option.value === value));

	const dropdownStyles = $derived.by(() => {
		const dropdownStyleObj = (typeof dropdownStyle === 'object' && dropdownStyle !== null) ? dropdownStyle : {};

		const parseNum = (v: unknown) => typeof v === 'number' ? v : (typeof v === 'string' ? (parseFloat(v) || 0) : 0);

		const extraTop = parseNum(dropdownStyleObj.top);
		const extraLeft = parseNum(dropdownStyleObj.left);

		const { top: _top, left: _left, ...rest } = dropdownStyleObj;

		const base: Record<string, string | number> = {
			position: 'fixed',
			top: anchorRect ? anchorRect.top + anchorRect.height - 26 + extraTop : 0,
			left: anchorRect ? anchorRect.left - 8 + extraLeft : 0,
			zIndex: (typeof dropdownStyleObj.zIndex === 'number') ? dropdownStyleObj.zIndex : 2000,
			minWidth: 'max-content',
			width: anchorRect ? anchorRect.width : 'auto',
		};

		const toKebab = (s: string) => s.replace(/[A-Z]/g, m => '-' + m.toLowerCase());

		const valueToString = (v: string | number | undefined, key: string) => {
			if (typeof v === 'number' && key !== 'zIndex') return `${v}px`;
			return String(v ?? '');
		};

		const merged = { ...base, ...rest };

		return Object.entries(merged)
			.map(([k, v]) => `${toKebab(k)}: ${valueToString(v, k)}`)
			.join('; ');
	});

	const getOptionLabel = (val: string | number) => {
		const option = safeOptions.find(o => o.value === val);
		return option ? option.label : '';
	}

	const updateAnchor = () => {
		if (element) {
			const rect = element.getBoundingClientRect();
			anchorRect = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
		}
	};

	const toggleOpen = async () => {
		if (disabled) return;
		updateAnchor();
		isOpen = !isOpen;
		
		if (isOpen) {
			focusedIndex = safeOptions.findIndex(o => o.value === value);
			await tick();
			if (listElement && focusedIndex >= 0) {
				const selectedEl = listElement.children[focusedIndex] as HTMLElement;
				selectedEl?.scrollIntoView({ block: 'nearest' });
			}
			listElement?.focus();
		}
	};

	const handleSelect = (val: string | number) => {
		value = val;
		setValue?.(val);
		isOpen = false;
	};

	function onclick(event: MouseEvent) {
		const target = event.target as Node;
		if (element && element.contains(target)) return;
		if (listElement && listElement.contains(target)) return;

		isOpen = false;
	}

	function handleScrollOrResize(event: Event) {
		if (event.type === 'scroll' && listElement && listElement.contains(event.target as Node)) return;
		isOpen = false;
	}

	function onKeyDown(e: KeyboardEvent) {
		if (disabled) return;

		if (!isOpen) {
			if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
				e.preventDefault();
				toggleOpen();
			}
			return;
		}

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				focusedIndex = (focusedIndex + 1) % safeOptions.length;
				scrollToOption(focusedIndex);
				break;
			case 'ArrowUp':
				e.preventDefault();
				focusedIndex = (focusedIndex - 1 + safeOptions.length) % safeOptions.length;
				scrollToOption(focusedIndex);
				break;
			case 'Enter':
			case ' ':
				e.preventDefault();
				if (focusedIndex >= 0 && focusedIndex < safeOptions.length) {
					handleSelect(safeOptions[focusedIndex].value);
				}
				break;
			case 'Escape':
				e.preventDefault();
				isOpen = false;
				element?.focus();
				break;
			case 'Tab':
				isOpen = false;
				break;
		}
	}

	function scrollToOption(index: number) {
		if (!listElement) return;
		const el = listElement.children[index] as HTMLElement;
		el?.scrollIntoView({ block: 'nearest' });
	}
</script>

<Flex 
	class={[`relative items-center ps-2 bg-white rounded-md ${fullWidth && 'w-full'}`, classes]} 
	style="z-index: 2000;"
	onkeydown={onKeyDown}>
	<Flex 
		class="min-w-25 h-5.75 focus:outline-none focus:ring-1 relative focus:ring-black/20 rounded-md"
		pointer 
		onclick={toggleOpen} 
		bind:element={element}
		role="combobox"
		aria-controls="select-dropdown"
		aria-expanded={isOpen}
		aria-haspopup="listbox"
		tabindex={disabled ? -1 : 0}
		fullWidth={fullWidth}>
		<Flex class="items-center justify-between" fullWidth>
			<Flex class="items-center">
				<p class="text-tertiary truncate">{getOptionLabel(value)}</p>
			</Flex>
			{#if children}
				{@render children()}
			{/if}
			<Flex class="items-center justify-between">
				{#if selectedOption?.colorA}
					<Flex class="overflow-hidden w-5.25 h-3.5 right-7.5 absolute">
						<div class="h-full w-5" style="background-color: #{selectedOption?.colorA};"></div>
						<div class="h-full w-5" style="background-color: #{selectedOption?.colorB};"></div>
					</Flex>
				{/if}
				<Fa icon={ faAngleDown } class="me-2 text-black"/>
			</Flex>
		</Flex>
	</Flex>
	{#if isOpen && anchorRect}
		<Portal target="body">
			<ul
				bind:this={listElement}
				class="{dropdownClass} bg-white rounded-sm overflow-auto min-w-25 focus:outline-none"
				style={dropdownStyles}
				role="listbox"
				id="select-dropdown"
				tabindex="-1"
				onkeydown={onKeyDown}>
				{#each safeOptions as option, i (option.value)}
					<li
						class={`relative dropdown-item px-2 hover:bg-blue-300 cursor-pointer ${value === option.value ? 'bg-blue-100' : ''} ${focusedIndex === i ? 'bg-blue-200' : ''}`}
						role="option"
						aria-selected={value === option.value}>
						<button
							class="cursor-pointer w-full text-start focus:outline-none"
							onclick={() => handleSelect(option.value)}
							tabindex="-1">
							{option.label}
							{#if option.colorA}
								<Flex class="overflow-hidden w-5.25 h-3.5 right-7.5 absolute border">
									<div class="h-full w-5" style="background-color: #{option.colorA};"></div>
									<div class="h-full w-5" style="background-color: #{option.colorB};"></div>
								</Flex>
							{/if}
						</button>
					</li>
				{/each}
			</ul>
		</Portal>
	{/if}
</Flex>
