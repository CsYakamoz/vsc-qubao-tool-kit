import { getConfig } from '../../utility';

const defaultSetting = {
    color: '#FFBD2A',
} as ExchangeSetting;

export function get(): ExchangeSetting {
    const config = getConfig('exchange');

    return { ...defaultSetting, ...config };
}
