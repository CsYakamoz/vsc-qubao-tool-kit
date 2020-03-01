import * as vscode from 'vscode';
import { init, changeText } from './status_bar';
import { get, update, addConfig, isCorrect } from './pmr_config';
import { showQuickPick, execCommandOnShell } from '../utility';

export async function exec() {
    try {
        const target = getTarget();
        const listCommand = `ssh ${target.remoteUser}@${target.remoteAddr} "pm2 ls | awk '{print \\\$2}' | grep -E '[^(App)|\\\s+|(\\\`pm2)]'"`;
        const list = await execCommandOnShell(listCommand)
            .then(str => str.split('\n'))
            .then(arr => arr.filter(_ => _ !== ''));

        if (list.length === 0) {
            await vscode.window.showInformationMessage(
                'no pm2 process is running'
            );
            return;
        }

        const selected = await showQuickPick(list);

        const restartCommand = `ssh ${target.remoteUser}@${target.remoteAddr} "pm2 restart ${selected}"`;
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

    const target = config.list.find(_ => _.id === config.targetId) as Base;

    return target;
}

export async function reset() {
    try {
        const config = getConfigWithInit();

        const selected = await showQuickPick(
            config.list.map(_ => _.id).concat('⊕')
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
