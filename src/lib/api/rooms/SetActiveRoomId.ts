import { GetRoomEngine } from '$lib/api/GetRoomEngine';

export function SetActiveRoomId(roomId: number): void {
	GetRoomEngine().setActiveRoomId(roomId);
}
