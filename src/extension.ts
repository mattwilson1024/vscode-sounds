import * as vscode from 'vscode';
import { readFileSync } from 'fs';
import { join } from 'path';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
    vscode.commands.registerCommand('vscode-sounds.start', () => {
      const panel = vscode.window.createWebviewPanel(
        'vscodeSounds', // Identifies the type of the webview. Used internally
        'VSCode Sounds', // Title of the panel displayed to the user
        vscode.ViewColumn.Two, // Editor column to show the new webview panel in.
        {
					enableScripts: true
				} // Webview options. More on these later.
			);
			
			const filePath: vscode.Uri = vscode.Uri.file(join(context.extensionPath, 'src', 'index.html'));
			panel.webview.html = readFileSync(filePath.fsPath, 'utf8');


			vscode.window.onDidChangeTextEditorSelection((e => {
				const selection = e.selections.length ? e.selections[0] : null;
				if (selection && selection.isSingleLine && selection.start.character > 0) {
					const charBeforeRange = new vscode.Range(selection.start.line, selection.start.character - 1, selection.start.line, selection.start.character);
					const charBefore = e.textEditor.document.getText(charBeforeRange);
		
					const alphanumericCharPattern = /[A-Za-z0-9]/;
					const triggerChars = [' ', ';', '(', ')', '{', '}', ',', ':', `'`, '"', '`', '<', '>', '.'];
					// if (alphanumericCharPattern.test(charBefore)) {
					if (triggerChars.includes(charBefore)) {
						const lineUpToSelectionRange = new vscode.Range(selection.start.line, 0, selection.start.line, selection.start.character);
						const lineUpToSelection = e.textEditor.document.getText(lineUpToSelectionRange);
		
						const lineUpToSelectionSpeakable = lineUpToSelection.replace('===', 'equals').replace('==', 'equals').replace('=', 'equals').replace('>', 'greater than').replace('<', 'less than');
		
						const readableWordPattern  = /[A-Za-z0-9_]+/g;
						const readableWords = lineUpToSelectionSpeakable.match(readableWordPattern);
						if (readableWords && readableWords.length) {
							const word = readableWords[readableWords.length - 1];
							const firstLetter = word.substr(0, 1);
							
							const note = firstLetter === 'a' ? 'C4' : 'D4';

							panel.webview.postMessage({
								note: note
							});
						}
					}
				}
    	}));




			
		})
  );
}

export function deactivate() {}