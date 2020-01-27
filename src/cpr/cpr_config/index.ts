import { getConfig, showInputBox, updateConfig } from '../../utility';

export function getTargetConfig(folder: string): CprBase {
    const folderConfig = getFolderConfig(folder);

    if (!isCorrect(folderConfig)) {
        throw new Error(
            'the configuration of current workspace has not been set or is a misconfiguration, ignore'
        );
    }

    const target = folderConfig.list.find(
        _ => _.id === folderConfig.targetId
    ) as CprBase;

    return target;
}

export async function addTargetConfig(
    folder: string,
    folderConfig: CprFolderConfig
) {
    const base = await requiredInput();

    folderConfig.targetId = base.id;
    folderConfig.list.push(base);

    await updateFolderConfig(folder, folderConfig);

    return base;
}

export function getFolderConfig(folder: string) {
    const config = getConfig('cpr') as CprSetting;

    return config[folder];
}

export async function updateFolderConfig(
    folder: string,
    folderConfig: CprFolderConfig
) {
    const config = getConfig('cpr') as CprSetting;
    config[folder] = folderConfig;

    await updateConfig('cpr', config);
}

export function isCorrect(folderConfig: CprFolderConfig) {
    if (
        folderConfig === undefined ||
        folderConfig.targetId === undefined ||
        folderConfig.list === undefined ||
        !(folderConfig.list instanceof Array) ||
        folderConfig.list.length === 0
    ) {
        return false;
    }

    const target = folderConfig.list.find(_ => _.id === folderConfig.targetId);

    return target !== undefined;
}

async function requiredInput(): Promise<CprBase> {
    const id = await showInputBox(
        'please input the id of this environment(it should be unique)'
    );
    const remoteAddr = await showInputBox('please input remote address');
    const remoteUser = await showInputBox('please input remote user');
    const remoteDir = await showInputBox('please input remote project dir');

    return { id, remoteAddr, remoteUser, remoteDir };
}
