import { GetRoomSessionManager } from '$lib/api/session/room/GetRoomSessionManager';
import type { IRoomSession } from '@nitrots/nitro-renderer';

export function GetRoomSession(): IRoomSession {
	return GetRoomSessionManager().getSession(-1);
}
