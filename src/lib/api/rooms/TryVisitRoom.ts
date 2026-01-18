import { SendMessageComposer } from '$lib/api';
import { GetGuestRoomMessageComposer } from '@nitrots/nitro-renderer';

export function TryVisitRoom(roomId: number): void {
	SendMessageComposer(new GetGuestRoomMessageComposer(roomId, false, true));
}
