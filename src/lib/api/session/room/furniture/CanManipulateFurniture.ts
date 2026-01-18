import { GetSessionDataManager } from '$lib/api/session/GetSessionDataManager';
import { GetRoomEngine } from '$lib/api/GetRoomEngine';
import { RoomControllerLevel, type IRoomSession } from '@nitrots/nitro-renderer';
import { IsOwnerOfFurniture } from '$lib/api/session/room/furniture/IsOwnerOfFuniture';

export function CanManipulateFurniture(
	roomSession: IRoomSession,
	objectId: number,
	category: number
): boolean {
	if (!roomSession) return false;

	return (
		roomSession.isRoomOwner ||
		roomSession.controllerLevel >= RoomControllerLevel.GUEST ||
		GetSessionDataManager().isModerator ||
		IsOwnerOfFurniture(GetRoomEngine().getRoomObject(roomSession.roomId, objectId, category))
	);
}
