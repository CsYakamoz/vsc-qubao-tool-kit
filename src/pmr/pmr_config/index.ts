import { getConfig, updateConfig, showInputBox } from '../../utility';

export function get() {
    return getConfig('pmr') as PmrSetting;
}

export async function update(config: PmrSetting) {
    await updateConfig('pmr', config);
}

export async function addConfig(config: PmrSetting) {
    const base = await requiredInput();

    config.targetId = base.id;
    config.list.push(base);

    await update(config);
    return base;
}

async function requiredInput(): Promise<PmrBase> {
    const id = await showInputBox(
        'please input the id of this environment(it should be unique)'
    );
    const remoteAddr = await showInputBox('please input remote address');
    const remoteUser = await showInputBox('please input remote user');

    return { id, remoteAddr, remoteUser };
}

export function isCorrect(config: PmrSetting) {
    if (
        config === undefined ||
        config.targetId === undefined ||
        config.list === undefined ||
        !(config.list instanceof Array)
    ) {
        return false;
    }

    const target = config.list.find(_ => _.id === config.targetId);

    return target !== undefined;
}
