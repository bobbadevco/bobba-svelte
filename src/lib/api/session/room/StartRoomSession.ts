import { GetRoomSessionManager } from '../..';
import type { IRoomSession } from '@nitrots/nitro-renderer';

export function StartRoomSession(session: IRoomSession): void {
	GetRoomSessionManager().startSession(session);
}
