import { GetRoomEngine } from "$lib/api/rooms";
import { type IRoomSession, RoomControllerLevel } from "@nitrots/nitro-renderer";
import { GetSessionDataManager } from "../..";
import { IsOwnerOfFurniture } from ".";


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
