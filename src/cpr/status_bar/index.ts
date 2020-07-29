import * as vscode from 'vscode';
import { getFolderConfig, isCorrect } from '../config';
import { getFolder } from '../../utility';

const button = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left
);

button.command = 'extension.qtk.cpr.reset';
button.tooltip = 'cpr-reset';

export async function init() {
    const folder = getFolder();
    const folderConfig = getFolderConfig(folder);

    if (isCorrect(folderConfig)) {
        const target = folderConfig.list.find(
            _ => _.id === folderConfig.targetId
        ) as CprBase;
        button.text = `CpR-${target.id}`;
    } else {
        button.text = 'CpR-🤔';
    }

    button.show();
}

export function changeText(text: string) {
    button.text = `CpR-${text}`;
    button.show();
}
