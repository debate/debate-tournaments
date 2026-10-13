<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import TextAlign from '@tiptap/extension-text-align';
	import { Placeholder } from '@tiptap/extensions';
	import {
		Undo,
		Redo,
		Bold,
		Italic,
		Strikethrough,
		RemoveFormatting,
		Underline,
		TextAlignStart,
		TextAlignCenter,
		TextAlignEnd,
	} from '@lucide/svelte';

	let {
		content = $bindable(''),
		autoSaveFn = () => {},
		autoSaveDelay = 5000,
		label = 'Rich Text Editor',
		placeholder = '',
	}: {
		content?: string,
		autoSaveFn?: (content: string) => void,
		autoSaveDelay?: number,
		// Accessible name for the editor, e.g. what the text is for
		label?: string,
		// Shown while the editor is empty
		placeholder?: string,
	} = $props();

	let editorElement: HTMLDivElement;
	let editorState = $state({ editor: null as Editor | null });
	let autoSaveTimeout: ReturnType<typeof setTimeout> | null = null;

	onMount(() => {
		// Built before assigning: extensions like Placeholder dispatch a transaction while the
		// editor is constructed, and onTransaction replaces editorState, so assigning straight
		// to editorState.editor would set it on the replaced object and the toolbar never shows
		const editor = new Editor({
			element: editorElement,
			extensions: [
				StarterKit,
				TextAlign.configure({
					types: ['heading', 'paragraph'],
				}),
				// Read through a function so a changed placeholder shows on the next render
				Placeholder.configure({
					placeholder: () => placeholder,
				}),
			],
			content,
			editorProps: {
				attributes: {
					// A multiline textbox, so screen readers announce it as one
					'role': 'textbox',
					'aria-label': label,
					// editor accepts multiline input
					'aria-multiline': 'true',
					'aria-readonly': 'false',
				},
			},
			onTransaction: () => {
				// force re-render so `editor.isActive` works as expected
				editorState = { editor: editorState.editor };
			},
			onUpdate: ({ editor }) => {
				// Update the bindable content when editor changes
				content = editor.getHTML();

				// Debounce auto-save
				if (autoSaveTimeout) {
					clearTimeout(autoSaveTimeout);
				}
				autoSaveTimeout = setTimeout(() => {
					autoSaveFn(content);
				}, autoSaveDelay);
			},
		});
		editorState.editor = editor;
	});
	onDestroy(() => {
		if (autoSaveTimeout) {
			clearTimeout(autoSaveTimeout);
		}
		editorState.editor?.destroy();
	});

	function clearFormatting() {
		editorState.editor?.chain()
			.focus()
			.unsetAllMarks()
			.clearNodes()
			.run();
	}
</script>

<!-- Toolbar -->
{#if editorState.editor !== null }
	<div class="toolbar">

		<button
			disabled={!editorState.editor?.can().undo()}
			onclick={() => editorState.editor?.commands.undo()}
			title="Undo"
			type="button"
		>
			<Undo size="16" />
		</button>
		<button
			disabled={!editorState.editor?.can().redo()}
			onclick={() => editorState.editor?.commands.redo()}
			title="Redo"
			type="button"
		>
			<Redo size="16" />
		</button>

		<div class='divider'></div>

		<button
			class:active={editorState.editor?.isActive('bold')}
			onclick={() => editorState.editor?.chain().focus().toggleBold().run()}
			title="Bold"
			type="button"
		>
			<Bold size="16" />
		</button>

		<button
			class:active={editorState.editor?.isActive('italic')}
			onclick={() => editorState.editor?.chain().focus().toggleItalic().run()}
			title="Italic"
			type="button"
		>
			<Italic size="16" />
		</button>

		<button
			class:active={editorState.editor?.isActive('strike')}
			onclick={() => editorState.editor?.chain().focus().toggleStrike().run()}
			title="Strikethrough"
			type="button"
		>
			<Strikethrough size="16" />
		</button>

		<button
			class:active={editorState.editor?.isActive('underline')}
			onclick={() => editorState.editor?.chain().focus().toggleUnderline().run()}
			title="Underline"
			type="button"
		>
			<Underline size="16" />
		</button>

		<div class="divider"></div>

		<button
			class:active={editorState.editor?.isActive({ textAlign: 'left' })}
			onclick={() => editorState.editor?.chain().focus().setTextAlign('left').run()}
			title="Align Left"
			type="button"
		>
			<TextAlignStart size="16" />
		</button>

		<button
			class:active={editorState.editor?.isActive({ textAlign: 'center' })}
			onclick={() => editorState.editor?.chain().focus().setTextAlign('center').run()}
			title="Align Center"
			type="button"
		>
			<TextAlignCenter size="16" />
		</button>
		<button
			class:active={editorState.editor?.isActive({ textAlign: 'right' })}
			onclick={() => editorState.editor?.chain().focus().setTextAlign('right').run()}
			title="Align Right"
			type="button"
		>
			<TextAlignEnd size="16" />
		</button>
		<div class="divider"></div>
		<button onclick={clearFormatting} title="Clear formatting" type="button">
			<RemoveFormatting size="16" />
		</button>
	</div>
{/if}

<!-- Editor -->
<div bind:this={editorElement} class="editor"></div>

<style>
	.toolbar {
		display: flex;
		gap: 6px;
		padding: 8px;
		border: 1px solid var(--color-border-strong);
		border-bottom: none;
		border-radius: 6px 6px 0 0;
		background: var(--color-surface-alt);
		flex-wrap: wrap;
	}

	button {
		padding: 8px;
		min-width: 24px;
		min-height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--color-border-strong);
		background: var(--color-surface);
		cursor: pointer;
		border-radius: 4px;
		font-size: 13px;
	}

	button.active {
		background: var(--color-primary-strong);
		color: white;
		border-color: var(--color-primary-strong);
	}

	button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
		background: var(--color-surface-alt);
	}

	.divider {
		width: 1px;
		background: var(--color-border);
		margin: 0 4px;
	}

	.editor {
		border: 1px solid var(--color-border-strong);
		border-radius: 0 0 6px 6px;
		padding: 12px;
		min-height: 300px;
	}

	:global(.ProseMirror) {
		outline: none;
		min-height: 300px;
	}

	/* The Placeholder extension marks the empty first paragraph and puts the text in data-placeholder */
	:global(.ProseMirror p.is-editor-empty:first-child::before) {
		content: attr(data-placeholder);
		float: left;
		height: 0;
		pointer-events: none;
		color: var(--color-muted);
	}

	:global(.ProseMirror img) {
		max-width: 100%;
		height: auto;
	}
</style>