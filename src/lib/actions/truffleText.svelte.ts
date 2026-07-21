import { onTruffleReady } from '$lib/initialize.svelte';
import { createTruffleEditable } from 'truffle-text/editable';
import type { PackedTruffleText } from 'truffle-text/packed';
import type { TextStyle } from 'truffle-text';
import type { TruffleEditable } from 'truffle-text/editable';

const SKIP_TAGS = new Set([
	'SCRIPT', 'STYLE', 'CANVAS', 'SVG', 'TEXTAREA',
	'VIDEO', 'AUDIO', 'IMG', 'PICTURE', 'SOURCE',
	'IFRAME', 'OBJECT', 'EMBED', 'SELECT', 'OPTION',
	'INPUT'
])

const SKIP_ROLES = new Set(['img', 'presentation', 'none', 'alert'])

const PROCESSED_ATTR = 'data-truffled'

function isEditableInput(el: Element): el is HTMLInputElement {
	return el instanceof HTMLInputElement && [
		'text', 'search', 'email', 'url', 'tel', 'number', 'password'
	].includes(el.type)
}

function shouldSkip(node: Node): boolean {
	if (node.nodeType !== Node.ELEMENT_NODE) return false
	const el = node as HTMLElement
	if (SKIP_TAGS.has(el.tagName)) return true
	const role = el.getAttribute('role')
	if (role && SKIP_ROLES.has(role)) return true
	return false
}

function hexToNumber(hex: string): number {
	hex = hex.trim()
	if (hex.startsWith('#')) {
		return parseInt(hex.slice(1), 16) || 0
	}
	if (hex.startsWith('rgb')) {
		const m = hex.match(/\d+/g)
		if (m) return (parseInt(m[0]) << 16) | (parseInt(m[1]) << 8) | parseInt(m[2])
	}
	return 0
}

function sanitizeFontFamily(fontFamily: string): string {
	const first = fontFamily.split(',')[0]
	return first.replace(/['"]/g, '').trim()
}

function mapCSSToTruffle(el: HTMLElement): TextStyle {
	const cs = getComputedStyle(el)
	return {
		fontSize: parseFloat(cs.fontSize) || 12,
		bold: parseInt(cs.fontWeight) >= 700 || cs.fontWeight === 'bold',
		italic: cs.fontStyle === 'italic',
		color: hexToNumber(cs.color),
		fontFamily: sanitizeFontFamily(cs.fontFamily)
	}
}

function renderTextOnCanvas(
	text: string,
	truffle: PackedTruffleText,
	style: TextStyle,
): HTMLCanvasElement | null {
	let baseStyle: TextStyle
	try {
		baseStyle = truffle.resolveStyle('u_regular', style)
	} catch (e) {
		return null
	}
	const layout = truffle.measure(text, baseStyle)

	const cw = Math.max(1, Math.ceil(layout.width || layout.textWidth || 1))
	const ch = Math.max(1, Math.ceil(layout.height || layout.textHeight || 1))

	const canvas = document.createElement('canvas')
	canvas.width = cw
	canvas.height = ch
	canvas.style.width = `${cw}px`
	canvas.style.height = `${ch}px`
	canvas.setAttribute('aria-hidden', 'true')

	const ctx = canvas.getContext('2d')
	if (!ctx) return null

	truffle.drawText(ctx, text, { x: 0, y: 0, style: baseStyle })
	return canvas
}

const editableInstances: TruffleEditable[] = []

function processInput(
	el: HTMLInputElement | HTMLTextAreaElement,
	truffle: PackedTruffleText
) {
	const style = mapCSSToTruffle(el)
	const baseStyle = truffle.resolveStyle('u_regular', style)
	const bg = getComputedStyle(el).backgroundColor || 'transparent'

	const editable = createTruffleEditable(el, truffle, {
		style: baseStyle,
		placeholder: el.placeholder,
		multiline: el instanceof HTMLTextAreaElement,
		background: bg,
		ariaLabel: el.getAttribute('aria-label') || el.name || undefined
	})

	editableInstances.push(editable)
}

function makePositioned(el: HTMLElement) {
	const cs = getComputedStyle(el)
	if (cs.position === 'static') {
		el.style.position = 'relative'
	}
}

function overlayCanvas(
	el: HTMLElement,
	canvas: HTMLCanvasElement
) {
	el.style.color = 'transparent'
	canvas.style.position = 'absolute'
	canvas.style.top = '0'
	canvas.style.left = '0'
	canvas.style.pointerEvents = 'none'
	makePositioned(el)
	el.appendChild(canvas)
}

// Wrap orphan text nodes inside mixed-content elements so they get processed too
function wrapOrphanTextNodes(el: HTMLElement) {
	const children = Array.from(el.childNodes)
	const hasElementChild = children.some(c => c.nodeType === Node.ELEMENT_NODE)
	if (!hasElementChild) return

	for (const child of children) {
		if (child.nodeType === Node.TEXT_NODE) {
			const text = (child.textContent || '').trim()
			if (text) {
				const wrap = document.createElement('span')
				wrap.style.display = 'inline'
				wrap.textContent = text
				el.replaceChild(wrap, child)
			}
		}
	}
}

function processElement(
	el: HTMLElement,
	truffle: PackedTruffleText
) {
	if (shouldSkip(el)) return
	if (el.hasAttribute(PROCESSED_ATTR)) return

	if (isEditableInput(el) || el instanceof HTMLTextAreaElement) {
		processInput(el, truffle)
		return
	}

	// First pass: wrap orphan text nodes so they become processable elements
	wrapOrphanTextNodes(el)

	// Get direct text from this element
	const childNodes = Array.from(el.childNodes)
	const directTextNodes = childNodes.filter(c => c.nodeType === Node.TEXT_NODE)

	if (directTextNodes.length > 0) {
		const fullText = directTextNodes.map(t => t.textContent || '').join('').trim()
		if (fullText) {
			const style = mapCSSToTruffle(el)
			const canvas = renderTextOnCanvas(fullText, truffle, style)
			if (canvas) {
				el.setAttribute(PROCESSED_ATTR, '')
				overlayCanvas(el, canvas)
			}
		}
	}

	// Recurse into element children
	for (const child of childNodes) {
		if (child.nodeType === Node.ELEMENT_NODE) {
			processElement(child as HTMLElement, truffle)
		}
	}
}

function processTree(root: HTMLElement, truffle: PackedTruffleText) {
	// Wrap orphan text nodes across the entire tree first
	const allWalker = document.createTreeWalker(
		root,
		NodeFilter.SHOW_ELEMENT,
		null
	)
	let walkNode: Node | null = allWalker.firstChild()
	while (walkNode) {
		wrapOrphanTextNodes(walkNode as HTMLElement)
		walkNode = allWalker.nextSibling()
	}
	wrapOrphanTextNodes(root)

	processElement(root, truffle)

	// Find and process standalone inputs
	const walker = document.createTreeWalker(
		root,
		NodeFilter.SHOW_ELEMENT,
		null
	)
	let node: Node | null = walker.firstChild()
	while (node) {
		const el = node as HTMLElement
		if (!el.hasAttribute(PROCESSED_ATTR) &&
			(isEditableInput(el) || el instanceof HTMLTextAreaElement)) {
			processInput(el as HTMLInputElement | HTMLTextAreaElement, truffle)
		}
		node = walker.nextSibling()
	}
}

const observerConfig: MutationObserverInit = {
	childList: true,
	subtree: true,
	characterData: true
}

export function truffleText(node: HTMLElement) {
	let truffle: PackedTruffleText | null = null
	let observer: MutationObserver | null = null

	const run = async () => {
		try {
			truffle = await new Promise<PackedTruffleText>((resolve) => {
				onTruffleReady((t) => resolve(t))
			})

			processTree(node, truffle)

			observer = new MutationObserver((mutations) => {
				let needsProcess = false
				for (const mut of mutations) {
					for (const added of mut.addedNodes) {
						if (added.nodeType === Node.ELEMENT_NODE) {
							const el = added as HTMLElement
							if (!el.hasAttribute(PROCESSED_ATTR) && !shouldSkip(el)) {
								needsProcess = true
								break
							}
						}
					}
					if (mut.type === 'characterData') {
						const target = mut.target
						if (target.parentElement && !shouldSkip(target.parentElement)) {
							needsProcess = true
						}
					}
					if (needsProcess) break
				}

				if (needsProcess && truffle) {
					for (const mut of mutations) {
						for (const removed of mut.removedNodes) {
							if (removed.nodeType === Node.ELEMENT_NODE) {
								(removed as HTMLElement).removeAttribute(PROCESSED_ATTR)
							}
						}
					}
					processTree(node, truffle)
				}
			})

			observer.observe(node, observerConfig)
		} catch (e) {
			console.error('[truffleText] Failed', e)
		}
	}

	run()

	return {
		destroy() {
			if (observer) observer.disconnect()
			for (const editable of editableInstances) {
				editable.destroy()
			}
			editableInstances.length = 0
		}
	}
}
