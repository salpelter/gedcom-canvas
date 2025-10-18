import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// TODO: rename classes and interfaces

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	// onload() runs whenever the user starts using the plugin in Obsidian, this is where you'll configure most of the plugin's capabilities
	async onload() {
		await this.loadSettings();

		// creates an icon in the left ribbon that shows a notice on click
		const ribbonIconEl = this.addRibbonIcon('dice', 'Show a notice', (_evt: MouseEvent) => {
			new Notice('This is a notice!');
		});

		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// adds a status bar item to the bottom of the app (does not work on mobile)
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Sample status bar text');

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

		// adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// if the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin),
		// using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('A click has just been triggered.', evt); // this will be called any time a click event happens on the document
		});

		// when registering intervals, this function will automatically clear the interval when the plugin is disabled
		this.registerInterval(window.setInterval(() => console.log('5 minute interval has passed.'), 5 * 60 * 1000));
	}

	// onunload() runs when the plugin is disabled, any resources that your plugin is using must be released here to avoid affecting the performance of Obsidian after your plugin has been disabled
	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
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

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
