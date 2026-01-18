import { GetNitroInstance } from '..';
import type { ISessionDataManager } from '@nitrots/nitro-renderer';

export function GetSessionDataManager(): ISessionDataManager {
	return GetNitroInstance().sessionDataManager;
}
