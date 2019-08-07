import * as vscode from 'vscode';
import { exec } from 'child_process';
import { Subject, interval } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

let latestLineWords = '';
const textToSpeak$ = new Subject<string>();

textToSpeak$.pipe(
  debounceTime(25),
  distinctUntilChanged()
).subscribe(
  word => {
    console.log(word);
    exec(`say "${word}"`, (err, stdout, stderr) => {});
  }
);

export function startSpeakingCode() {
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
          textToSpeak$.next(word);
          latestLineWords = readableWords.join(' ');
        }
      }
    }
  }));
}

export function repeatLatestLineWords() {
  interval(2500)
    .subscribe(
      () => {
        exec(`say "${latestLineWords}"`, (err, stdout, stderr) => {});
      }
    );
}