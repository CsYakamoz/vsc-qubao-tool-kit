import { window, Selection, TextEditorDecorationType } from 'vscode';
import { get } from './config';

let previousSelection: Selection | undefined;
let previousText: string | undefined;
let decorationType: TextEditorDecorationType | undefined;

export async function exec() {
    const editor = window.activeTextEditor;
    if (editor === undefined) {
        return;
    }

    const selection = editor.selection;
    const text = editor.document.getText(selection);

    if (previousSelection === undefined && previousText === undefined) {
        previousSelection = selection;
        previousText = text;

        editor.setDecorations(getType(), [selection]);
    } else {
        await editor.edit((editBuilder) => {
            editBuilder.replace(previousSelection as Selection, text);
            editBuilder.replace(selection, previousText as string);

            clear();
        });
    }
}

export async function clear() {
    const editor = window.activeTextEditor;
    if (editor === undefined || decorationType === undefined) {
        return;
    }

    editor.setDecorations(getType(), []);

    previousSelection = undefined;
    previousText = undefined;
    decorationType.dispose();
    decorationType = undefined;
}

function getType(): TextEditorDecorationType {
    const config = get();
    if (decorationType === undefined) {
        decorationType = window.createTextEditorDecorationType({
            color: config.color,
        });

        return decorationType;
    } else {
        return decorationType;
    }
}
