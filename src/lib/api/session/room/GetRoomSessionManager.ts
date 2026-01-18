import { GetNitroInstance } from '../..';
import type { IRoomSessionManager } from '@nitrots/nitro-renderer';

export function GetRoomSessionManager(): IRoomSessionManager {
	return GetNitroInstance().roomSessionManager;
}
