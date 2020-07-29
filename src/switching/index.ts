import * as path from 'path';
import * as vscode from 'vscode';
import { showQuickPick, execCommandOnShell } from '../utility';
import { get } from './config';
import { existsSync } from 'fs';

const FileType = {
    NONE: 0,
    SCHEMA: 1,
    HANDLER: 2,
};

const SchemaPattern = /(.*)\/schema\/([0-9a-z_\.]+)(?:[\/a-z0-9_\.]*)/;
const HandlerPattern = /(.*)\/handler\/([0-9a-z_\.]+)(?:[\/a-z0-9\.])+/;

export default async function switching(uri: any) {
    if (uri === undefined) {
        return;
    }

    try {
        const fsPath = uri.fsPath as string;
        const type = getFileType(fsPath);

        if (type === FileType.NONE) {
            await vscode.window.showInformationMessage(
                'neither schema or handler'
            );
            return;
        }

        if (type === FileType.SCHEMA) {
            const [, prefix, apiNameWithExt] = fsPath.match(
                SchemaPattern
            ) as RegExpMatchArray;

            const apiName = path.basename(apiNameWithExt, '.js');
            const handlerPath = `${prefix}/handler`;

            if (!existsSync(handlerPath)) {
                await vscode.window.showInformationMessage(
                    `no such path(${handlerPath})`
                );
                return;
            }

            const command = `find ${handlerPath} -type f | grep -E "^${handlerPath}/${apiName}\\b"`;
            await find(command)
                .then(select(prefix + '/handler'))
                .then(openFile);

            return;
        }

        if (type === FileType.HANDLER) {
            const [, prefix, apiName] = fsPath.match(
                HandlerPattern
            ) as RegExpMatchArray;

            const schemaPath = `${prefix}/schema`;

            if (!existsSync(schemaPath)) {
                await vscode.window.showInformationMessage(
                    `no such path(${schemaPath})`
                );
                return;
            }

            const command = `find ${schemaPath} -type f | grep -E "^${schemaPath}/${apiName}\\b"`;
            await find(command)
                .then(select(prefix + '/schema'))
                .then(openFile);

            return;
        }
    } catch (error) {
        await vscode.window.showWarningMessage(error.message);
    }
}

async function openFile(fsPath: string) {
    const config = get();
    return vscode.workspace.openTextDocument(fsPath).then((doc) =>
        vscode.window.showTextDocument(doc, {
            preview: config.preview,
            viewColumn: config.viewColumn,
            preserveFocus: config.preserveFocus,
        })
    );
}

async function find(command: string) {
    return execCommandOnShell(command)
        .then((str) => str.split('\n'))
        .then((arr) => arr.filter((_) => _ !== ''))
        .then((arr) => arr.sort((a, b) => a.length - b.length));
}

function getFileType(fsPath: string): number {
    if (SchemaPattern.test(fsPath)) {
        return FileType.SCHEMA;
    }

    if (HandlerPattern.test(fsPath)) {
        return FileType.HANDLER;
    }

    return FileType.NONE;
}

function select(prefix: string) {
    return async function (list: string[]) {
        if (list.length === 1) {
            return list[0];
        }

        const config = get();
        const relPathList = list.map((_) => path.relative(prefix, _));

        if (config.defaultPoint !== undefined) {
            const target = relPathList.find((_) => _ === config.defaultPoint);
            if (target !== undefined) {
                return path.join(prefix, target);
            }
        }

        const selected = await showQuickPick(relPathList);
        return path.join(prefix, selected);
    };
}
