import { ItemView, Plugin } from 'obsidian';
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
	}

	// onunload() runs when the plugin is disabled, any resources that your plugin is using must be released here to avoid affecting the performance of Obsidian after your plugin has been disabled
	onunload() { }
}
