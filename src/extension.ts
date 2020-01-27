import * as vscode from 'vscode';
import * as CpR from './cpr';
import * as PmR from './pmr';
import Jump from './jump';

const config = {
    'extension.qtk.cpr.exec': (uri: any) => CpR.exec(uri),
    'extension.qtk.cpr.reset': () => CpR.reset(),
    'extension.qtk.pmr.exec': () => PmR.exec(),
    'extension.qtk.pmr.reset': () => PmR.reset(),
    'extension.qtk.jump': (uri: any) => Jump(uri)
};

async function init() {
    CpR.initStatusBar();
    PmR.initStatusBar();
}

export function activate(context: vscode.ExtensionContext) {
    Object.entries(config).forEach(([command, func]) =>
        context.subscriptions.push(
            vscode.commands.registerCommand(command, func)
        )
    );

    init();
}

// this method is called when your extension is deactivated
export function deactivate() {}
