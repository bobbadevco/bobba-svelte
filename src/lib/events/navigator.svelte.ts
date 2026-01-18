import { registerMessageEvent } from '$lib/events';
import { GetGuestRoomResultEvent, NavigatorHomeRoomEvent } from '@nitrots/nitro-renderer';
import { CreateRoomSession } from '$lib/api';


let homeRoomId = $state(0);

export const getHomeRoomId = () => homeRoomId;

const onHomeRoom = (event: NavigatorHomeRoomEvent) => {
	const parser = event.getParser();
	homeRoomId = parser.homeRoomId;
};

const onGuestResult = (event: GetGuestRoomResultEvent) => {
	const parser = event.getParser();

	if (parser.roomForward) {
		CreateRoomSession(parser.data.roomId);
	}
};

export const registerNavigatorEvents = () => {
	registerMessageEvent(NavigatorHomeRoomEvent, onHomeRoom);
	registerMessageEvent(GetGuestRoomResultEvent, onGuestResult);
}
