import { GetNitroInstance } from '$lib/api/GetNitroInstance';
import type { IRoomSessionManager } from '@nitrots/nitro-renderer';

export function GetRoomSessionManager(): IRoomSessionManager {
	return GetNitroInstance().roomSessionManager;
}
