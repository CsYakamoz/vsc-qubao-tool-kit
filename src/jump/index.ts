import * as path from 'path';
import * as vscode from 'vscode';
import * as childProcess from 'child_process';
import { showQuickPick, getFolder } from '../utility';
import { get } from './jump_config';

const FileType = {
    NONE: 0,
    SCHEMA: 1,
    HANDLER: 2
};

const SchemaPattern = /(.*)\/schema\/([0-9a-z_\.]+)(?:[\/a-z0-9_\.]*)/;
const HandlerPattern = /(.*)\/handler\/([0-9a-z_\.]+)(?:[\/a-z0-9\.])+/;

export default async function jump(uri: any) {
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
            const command = `find ${prefix}/handler -type f | grep ${apiName}`;
            await find(command)
                .then(select(prefix + '/handler'))
                .then(openFile);

            return;
        }

        if (type === FileType.HANDLER) {
            const [, prefix, apiName] = fsPath.match(
                HandlerPattern
            ) as RegExpMatchArray;

            const command = `find ${prefix}/schema -type f | grep ${apiName}`;
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
    return vscode.workspace
        .openTextDocument(fsPath)
        .then(doc => vscode.window.showTextDocument(doc, { preview: false }));
}

async function find(command: string) {
    return execCommand(command)
        .then(str => str.split('\n'))
        .then(arr => arr.filter(_ => _ !== ''))
        .then(arr => arr.sort((a, b) => a.length - b.length));
}

function execCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        childProcess.exec(command, (error, stdout) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout);
            }
        });
    });
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
    return async function(list: string[]) {
        if (list.length === 1) {
            return list[0];
        }

        const config = get();
        const relPathList = list.map(_ => path.relative(prefix, _));

        if (config.defaultPoint !== undefined) {
            const target = relPathList.find(_ => _ === config.defaultPoint);
            if (target !== undefined) {
                return path.join(prefix, target);
            }
        }

        const selected = await showQuickPick(relPathList);
        return path.join(prefix, selected);
    };
}
