import { getConfig } from '../../utility';
import { ViewColumn } from 'vscode';

const defaultSetting = {
    viewColumn: ViewColumn.Active,
    preserveFocus: false,
    preview: true
} as JumpSetting;

export function get(): JumpSetting {
    const config = getConfig('switching');

    return { ...defaultSetting, ...config };
}
