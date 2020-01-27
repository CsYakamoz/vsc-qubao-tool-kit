import * as vscode from 'vscode';

export async function showInputBox(placeHolder: string) {
    const result = await vscode.window.showInputBox({ placeHolder });

    if (result === undefined) {
        throw new Error('cancelled');
    }

    return result as string;
}

export async function showQuickPick(items: string[]) {
    if (items.length === 0) {
        throw new Error('nothing to be chosen');
    }

    const result = await vscode.window.showQuickPick(items);

    if (result === undefined) {
        throw new Error('cancelled');
    }

    return result as string;
}

export function getFolder() {
    const folderList = vscode.workspace.workspaceFolders;
    if (folderList === undefined) {
        throw new Error('no folder was opened');
    }

    if (folderList.length !== 1) {
        throw new Error('multiple workspace, ignore...');
    }

    return folderList[0].uri.fsPath;
    // if (folderList.length === 1) {
    //     return folderList[0].uri.fsPath;
    // } else {
    //     const selected = await showQuickPick(folderList.map(_ => _.uri.fsPath));

    //     const target = folderList.find(
    //         _ => _.uri.fsPath === selected
    //     ) as vscode.WorkspaceFolder;

    //     return target.uri.fsPath;
    // }
}

export function getConfig(configName: string): CprSetting | PmrSetting {
    const config = vscode.workspace.getConfiguration().get('qtk', {}) as any;

    return config[configName] || {};
}

export async function updateConfig(configName: string, value: any) {
    const config = vscode.workspace.getConfiguration().get('qtk', {}) as any;
    config[configName] = value;

    await vscode.workspace
        .getConfiguration()
        .update('qtk', config, vscode.ConfigurationTarget.Global);
}
