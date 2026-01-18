import { GetRoomEngine } from '$lib/api/rooms/GetRoomEngine';

export function SetActiveRoomId(roomId: number): void {
	GetRoomEngine().setActiveRoomId(roomId);
}
