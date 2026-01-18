import { GetRoomSessionManager } from '$lib/api/session/room/GetRoomSessionManager';

export function CreateRoomSession(roomId: number, password: string | undefined = undefined): void {
	GetRoomSessionManager().createSession(roomId, password);
}
