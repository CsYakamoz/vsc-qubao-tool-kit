import { window, Selection, TextEditorDecorationType } from 'vscode';
import { get } from './config';

interface PreviousMark {
    doc: string;
    selection: Selection;
    text: string;
    decorationType: TextEditorDecorationType;
}
const markDict: Map<string, PreviousMark> = new Map();

export async function exec() {
    const editor = window.activeTextEditor;
    if (editor === undefined) {
        return;
    }

    const doc = editor.document.fileName;
    const selection = editor.selection;
    const text = editor.document.getText(selection);

    if (markDict.has(doc)) {
        const {
            selection: previousSelection,
            text: previousText,
            decorationType,
        } = markDict.get(doc) as PreviousMark;

        await editor.edit((editBuilder) => {
            editBuilder.replace(previousSelection, text);
            editBuilder.replace(selection, previousText);

            editor.setDecorations(decorationType, []);
            markDict.delete(doc);
        });
    } else {
        const config = get();
        const decorationType = window.createTextEditorDecorationType({
            color: config.color,
        });

        markDict.set(doc, {
            doc,
            selection,
            text,
            decorationType,
        });

        editor.setDecorations(decorationType, [selection]);
    }
}

export async function clear() {
    const editor = window.activeTextEditor;
    if (editor === undefined) {
        return;
    }

    const doc = editor.document.fileName;
    if (!markDict.has(doc)) {
        return;
    }

    const { decorationType } = markDict.get(doc) as PreviousMark;
    editor.setDecorations(decorationType, []);
    markDict.delete(doc);
}
