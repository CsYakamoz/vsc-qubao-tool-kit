import * as vscode from 'vscode';
import * as CpR from './cpr';
import * as PmR from './pmr';
import Switching from './switching';
import Jump from './jump';
import * as Exchange from './exchange';

const config = {
    'extension.qtk.cpr.exec': (uri: any) => CpR.exec(uri),
    'extension.qtk.cpr.reset': () => CpR.reset(),
    'extension.qtk.pmr.exec': () => PmR.exec(),
    'extension.qtk.pmr.reset': () => PmR.reset(),
    'extension.qtk.switching': (uri: any) => Switching(uri),
    'extension.qtk.exchange.exec': () => Exchange.exec(),
    'extension.qtk.exchange.clear': () => Exchange.clear(),
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

    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(['javascript'], {
            provideDefinition: Jump,
        })
    );

    init();
}

// this method is called when your extension is deactivated
export function deactivate() {}
