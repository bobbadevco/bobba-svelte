import { GetRoomSessionManager } from '../..';

export function CreateRoomSession(roomId: number, password: string | undefined = undefined): void {
	GetRoomSessionManager().createSession(roomId, password);
}
