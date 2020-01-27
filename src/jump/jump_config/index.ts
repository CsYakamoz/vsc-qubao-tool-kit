import { getConfig } from '../../utility';

const defaultOpt = {} as JumpSetting;

export function get(): JumpSetting {
    const config = getConfig('jump');

    return { ...defaultOpt, ...config };
}
