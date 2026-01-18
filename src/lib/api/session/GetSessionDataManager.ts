import { GetNitroInstance } from '$lib/api/GetNitroInstance';
import type { ISessionDataManager } from '@nitrots/nitro-renderer';

export function GetSessionDataManager(): ISessionDataManager {
	return GetNitroInstance().sessionDataManager;
}
