import { getConfig } from '../../utility';
import { ViewColumn } from 'vscode';

const defaultSetting = {
    viewColumn: ViewColumn.Active,
    preserveFocus: false,
    preview: true
} as SwitchingSetting;

export function get(): SwitchingSetting {
    const config = getConfig('switching');

    return { ...defaultSetting, ...config };
}
