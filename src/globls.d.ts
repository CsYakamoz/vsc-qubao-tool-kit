interface Base {
    id: string;
    remoteAddr: string;
    remoteUser: string;
}

interface CprBase extends Base {
    remoteDir: string;
}

interface CprFolderConfig {
    targetId: string;
    list: CprBase[];
}

interface PmrSetting {
    targetId: string;
    list: Base[];
}

interface CprSetting {
    [key: string]: CprFolderConfig;
}

interface JumpSetting {
    defaultPoint: string;
}
