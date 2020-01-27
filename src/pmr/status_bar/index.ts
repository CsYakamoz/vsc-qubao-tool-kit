import * as vscode from 'vscode';
import { get, isCorrect } from '../pmr_config';

const button = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left
);

button.command = 'extension.qtk.pmr.reset';
button.tooltip = 'pmr-reset';

export async function init() {
    const config = get();

    if (isCorrect(config)) {
        const target = config.list.find(_ => _.id === config.targetId) as Base;
        button.text = `PmR-${target.id}`;
    } else {
        button.text = 'PmR-🤔';
    }

    button.show();
}

export function changeText(text: string) {
    button.text = `PmR-${text}`;
    button.show();
}
