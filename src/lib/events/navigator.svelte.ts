import { registerMessageEvent } from '$lib/events';
import {
	GetGuestRoomResultEvent,
	type ILinkEventTracker,
	NavigatorHomeRoomEvent
} from '@nitrots/nitro-renderer';
import {
	AddEventLinkTracker,
	CreateRoomSession,
	RemoveLinkEventTracker,
	TryVisitRoom
} from '$lib/api';


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


export const componentState = $state({visible: false});

const linkTracker: ILinkEventTracker = {
	linkReceived: (url: string) => {
		const parts = url.split('/');

		let method = parts[0];
		let value = parts.length > 1 ? parts[1] : undefined;

		if (method === 'navigator' && parts.length > 1) {
			method = parts[1];
			value = parts.length > 2 ? parts[2] : undefined;
		}

		switch (method) {
			case 'show':
				componentState.visible = true;
				return;
			case 'hide':
				componentState.visible = false;
				return;
			case 'toggle':
				componentState.visible = !componentState.visible;
				return;
			case 'goto':
				if (!value) return;

				if (value === 'home') {
					if (getHomeRoomId() > 0) TryVisitRoom(getHomeRoomId());
				} else {
					const roomId = parseInt(value);
					if (!isNaN(roomId)) TryVisitRoom(roomId);
				}
				return;
		}
	},
	eventUrlPrefix: 'navigator/'
};

const registerNavigatorEvents = () => {
	registerMessageEvent(NavigatorHomeRoomEvent, onHomeRoom);
	registerMessageEvent(GetGuestRoomResultEvent, onGuestResult);
};

export const initialize = () => {
	registerNavigatorEvents();
	AddEventLinkTracker(linkTracker);
	return () => RemoveLinkEventTracker(linkTracker);
}
