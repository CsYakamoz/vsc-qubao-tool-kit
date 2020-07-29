import * as vscode from 'vscode';
import * as path from 'path';

import { init, changeText } from './status_bar';
import {
    getTargetConfig,
    getFolderConfig,
    addTargetConfig,
    updateFolderConfig,
} from './cpr_config';
import { getFolder, showQuickPick, execCommandOnShell } from '../utility';

export async function exec(uri: any) {
    if (uri === undefined) {
        return;
    }

    try {
        const folder = getFolder();
        const {
            id,
            remoteUser: user,
            remoteAddr: addr,
            remoteDir,
        } = getTargetConfig(folder);

        const fsPath = uri.fsPath as string;
        if (!fsPath.startsWith(folder)) {
            const fileName = path.basename(fsPath);
            throw new Error(
                `file(${fileName}) does not belong to the current workspace(${folder})`
            );
        }

        if (path.relative(folder, fsPath).startsWith('.git')) {
            throw new Error(`the file path should not include .git`);
        }

        const relativePath = path.relative(folder, fsPath);
        const remotePath = remoteDir + '/' + relativePath;

        await execCommandOnShell(
            `ssh ${user}@${addr} "mkdir -p ${path.dirname(remotePath)}"`
        );
        await execCommandOnShell(`scp ${fsPath} ${user}@${addr}:${remotePath}`);

        const relativePathAbbr = getAbbreviationPath(relativePath);
        await vscode.window.showInformationMessage(
            `Successfully copy the file(${relativePathAbbr}) to remote server with id(${id})`
        );
    } catch (error) {
        await vscode.window.showWarningMessage(error.message);
    }
}

function getAbbreviationPath(relativePath: string): string {
    const current = path.basename(relativePath);
    const parentDir = path.basename(path.dirname(relativePath));

    const list = relativePath.split('/');

    if (list.length > 2) {
        const prefix = list
            .slice(0, list.length - 2)
            .map((item) => item[0])
            .join('/');

        return prefix + '/' + parentDir + '/' + current;
    } else if (list.length === 2) {
        return parentDir + '/' + current;
    } else {
        return current;
    }
}

export async function reset() {
    try {
        const folder = getFolder();
        const folderConfig = getFolderConfigWithInit(folder);

        const selected = await showQuickPick(
            folderConfig.list.map((_) => _.id).concat('⊕')
        );

        if (selected === '⊕') {
            const { id } = await addTargetConfig(folder, folderConfig);
            changeText(id);
        } else {
            folderConfig.targetId = selected;
            await updateFolderConfig(folder, folderConfig);
            changeText(selected);
        }
    } catch (error) {
        await vscode.window.showWarningMessage(error.message);
    }
}

function getFolderConfigWithInit(folder: string) {
    const folderConfig = getFolderConfig(folder);

    if (folderConfig === undefined) {
        return { targetId: '', list: [] };
    }

    if (
        folderConfig.list === undefined ||
        !(folderConfig.list instanceof Array)
    ) {
        return { targetId: folderConfig.targetId, list: [] };
    }

    return folderConfig;
}

export const initStatusBar = init;
