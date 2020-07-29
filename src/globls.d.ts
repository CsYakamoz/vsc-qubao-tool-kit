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

interface PmrBase extends Base {
    regex?: string;
}

interface PmrSetting {
    targetId: string;
    list: Base[];
}

interface CprSetting {
    [key: string]: CprFolderConfig;
}

interface SwitchingSetting {
    defaultPoint: string;
    viewColumn: number;
    preview: boolean;
    preserveFocus: boolean;
}
