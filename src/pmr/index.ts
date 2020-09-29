import * as vscode from 'vscode';
import { init, changeText } from './status_bar';
import { get, update, addConfig, isCorrect } from './config';
import { showQuickPick, execCommandOnShell } from '../utility';

export async function exec() {
    try {
        const target = getTarget();
        const filterReg = new RegExp(target.regex ? target.regex : '.*');
        const list = await getList(target, filterReg);

        if (list.length === 0) {
            await vscode.window.showInformationMessage('no process is running');
            return;
        }

        const selected = await showQuickPick(list);

        const restartCommand = getRestartCommand(target, selected);
        await execCommandOnShell(restartCommand);

        await vscode.window.showInformationMessage(
            `Successfully restart remote process - ${selected}`
        );
    } catch (error) {
        await vscode.window.showWarningMessage(error.message);
    }
}

function getTarget() {
    const config = get();
    if (!isCorrect(config)) {
        throw new Error(
            'the configuration of current workspace has not been set or is a misconfiguration, ignore'
        );
    }

    const target = config.list.find((_) => _.id === config.targetId) as PmrBase;

    return target;
}

async function getList(target: PmrBase, filterReg: RegExp): Promise<string[]> {
    const processingCmdOutput = (str: string) =>
        str.split('\n').filter((item) => item !== '' && filterReg.test(item));

    if (target.commandList === undefined) {
        const command = `ssh ${target.remoteUser}@${target.remoteAddr} "pm2 jlist | jq -c 'map(.name)'" | jq -r "join(\\"\\n\\")"`;

        return execCommandOnShell(command).then(processingCmdOutput);
    }

    const result = await Promise.all(
        target.commandList.map((item) => {
            const command = `ssh ${target.remoteUser}@${target.remoteAddr} ${item.list}`;

            return execCommandOnShell(command)
                .then(processingCmdOutput)
                .then((list) =>
                    list.map((name) => `${getPrefix(item.id)}${name}`)
                );
        })
    );

    return result.reduce((acc, curr) => acc.concat(curr), []);
}

function getRestartCommand(target: PmrBase, selected: string): string {
    if (target.commandList === undefined) {
        return `ssh ${target.remoteUser}@${target.remoteAddr} "pm2 restart ${selected}"`;
    }

    const result = target.commandList.find((item) =>
        selected.startsWith(getPrefix(item.id))
    );
    if (result === undefined) {
        throw new Error(
            `can not find any restart command, selected: ${selected}`
        );
    }

    const name = result.restart.replace(
        '${selected}',
        selected.replace(getPrefix(result.id), '')
    );
    return `ssh ${target.remoteUser}@${target.remoteAddr} ` + `${name}`;
}

function getPrefix(id: string) {
    return `[${id}]`;
}

export async function reset() {
    try {
        const config = getConfigWithInit();

        const selected = await showQuickPick(
            config.list.map((_) => _.id).concat('⊕')
        );

        if (selected === '⊕') {
            const { id } = await addConfig(config);
            changeText(id);
        } else {
            config.targetId = selected;
            await update(config);
            changeText(selected);
        }
    } catch (error) {}
}

function getConfigWithInit(): PmrSetting {
    const config = get();

    if (config === undefined) {
        return { targetId: '', list: [] };
    }

    if (config.list === undefined || !(config.list instanceof Array)) {
        return { targetId: '', list: [] };
    }

    return config;
}

export const initStatusBar = init;
