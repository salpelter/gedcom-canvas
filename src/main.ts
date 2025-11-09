import { App, Editor, ItemView, MarkdownView, Modal, Plugin } from 'obsidian';
import { CanvasViewCanvasNode, CanvasView, CanvasViewCanvas } from 'obsidian-typings';

export default class MyPlugin extends Plugin {

	getCurrentCanvasView(): CanvasView | null {
		const view = this.app.workspace.getActiveViewOfType(ItemView);
		if (view?.getViewType() !== 'canvas')
			return null

		// safe cast via unknown to satisfy TypeScript structural mismatch warning
		return view as unknown as CanvasView;
	}

	getCurrentCanvas(): CanvasViewCanvas | null {
		return this.getCurrentCanvasView()?.canvas || null;
	}

	// onload() runs whenever the user starts using the plugin in Obsidian, this is where you'll configure most of the plugin's capabilities
	async onload() {
		// adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});

		// adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, _view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});

		// adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {

				// conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);

				if (markdownView) {

					// when checking is true, we're simply "checking" if the command should even be run in the current circumstances
					// when checking is false, then we actually perform the operation
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// the command will only show up in Command Palette when the first preliminary check function call returns true (available)
					return true;
				}
				return false; // unavailable (optional, falls through as undefined otherwise)
			}
		});

		this.addCommand({
			id: 'add-node',
			name: 'Add a node',
			checkCallback: (checking: boolean) => {

				const canvas = this.getCurrentCanvas();

				if (canvas) {

					if (!checking) {
						// @ts-ignore
						const node: CanvasViewCanvasNode = canvas.createTextNode({
							pos: {
								x: 0,
								y: 0,
							},
							size: {
								height: 300,
								width: 300,
							},
							text: "",
							focus: true,
							save: true,
						});

						canvas.addNode(node);
						canvas.requestSave();

						if (!node)
							return;
					}

					return true;
				}
				return false;
			}
		})

		// if the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin),
		// using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('A click has just been triggered.', evt); // this will be called any time a click event happens on the document
		});
	}

	// onunload() runs when the plugin is disabled, any resources that your plugin is using must be released here to avoid affecting the performance of Obsidian after your plugin has been disabled
	onunload() { }
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText('This is a sample modal!');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
