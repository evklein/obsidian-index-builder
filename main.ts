import { App, Editor, getIconIds, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface IndexBuilderSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: IndexBuilderSettings = {
	mySetting: 'default'
}

export default class IndexBuilderPlugin extends Plugin {
	settings: IndexBuilderSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('lucide-blocks', 'Build Indices', async (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');

            const indexFiles = app.plugins.plugins.dataview.api
                .pages()
                .where(page => {
                    return page.doctype && page.doctype === 'index';
                });
            
            indexFiles.forEach(async indexFile => {
let fileContents = `---
doctype: ${indexFile.doctype}
curates: ${indexFile.curates}
idx_filter_property: ${indexFile.idx_filter_property}
idx_filter_value: ${indexFile.idx_filter_value}
idx_columns:\n${indexFile.idx_columns.reduce((list: string, c: string) => list + `  - ${c}\n`, '\n')}
idx_columns_as:\n${indexFile.idx_columns_as.reduce((list: string, c: string) => list + `  - ${c}\n`, '\n')}
---\n`;
console.log('hmmmmm');
                const curatedFilesForIndex = app.plugins.plugins.dataview.api
                    .pages()
                    .where(page => {
                        return page.doctype &&
                            page.doctype === indexFile.curates &&
                            page[page.idx_filter_property] === page.idx_filter_value
                    });

                fileContents += `${indexFile.idx_columns_as.join('|')}\n`
                fileContents += new Array(indexFile.idx_columns.length).fill('--').join('|') + '\n';
                curatedFilesForIndex.forEach(doc => {
                    fileContents += `${doc.unit} | ${doc.subunit} | [[${doc.file.link.path}\\|${doc.file.name}]] | ${doc.lecturers?.join(", ")}\n`;
                });

                try {
                    await this.app.vault.adapter.write(indexFile.file.path, fileContents);
                    console.log('writing done.');
                }
                catch (error) {
                    console.error('I cant :(');
                }
            });

            // const lectureNoteDocs = app.plugins.plugins.dataview.api
            //     .pages()
            //     .where(page => {
            //         return page.doctype &&
            //             page.doctype == "grad-school-lecture-note" &&
            //             page.class &&
            //             page.class == "S580";
            //     });

            // let results = "Lec. No. | Topic | Lecturer(s) | Tags\n";
            // results += "-- | -- | -- | --\n";
            // lectureNoteDocs.sort(doc => Number(doc.subunit), "asc")
            //             .forEach((doc) => {
            //     console.log(doc);
            //     results += `${doc.subunit} | [[${doc.file.link.path}\\|${doc.file.name}]] | ${doc.lecturers.join(", ")} | hm \n`; // ${doc.tags.join(", ")}
            // });
            // console.log(results);

            // const filePath = "grad-school/S580/⭐ Index S580.md";
            // try {
            //     await this.app.vault.adapter.write(filePath, results);
            //     console.log('writing done.');
            // }
            // catch (error) {
            //     console.error('I cant :(');
            // }
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

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
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: IndexBuilderPlugin;

	constructor(app: App, plugin: IndexBuilderPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

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
