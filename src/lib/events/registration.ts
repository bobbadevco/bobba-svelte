import { GetNitroInstance } from '$lib/api/GetNitroInstance';
import { GetConfigurationManager } from '$lib/api/GetConfigurationManager';
import { GetRoomEngine } from '$lib/api/rooms/GetRoomEngine';
import {
	EventDispatcher,
	MessageEvent,
	type IEventDispatcher,
	type IMessageEvent,
	type NitroEvent
} from '@nitrots/nitro-renderer';
import { GetRoomSessionManager } from '$lib/api/session/room/GetRoomSessionManager';
import { GetCommunication } from '$lib/api/GetCommunication';

const UI_EVENT_DISPATCHER: IEventDispatcher = new EventDispatcher();

export const registerNitroEvent = <T extends NitroEvent>(
	type: string | string[],
	eventDispatcher: IEventDispatcher,
	handler: (evt: T) => void
) => {
	if (Array.isArray(type)) {
		type.map((name) => eventDispatcher.addEventListener(name, handler));
	} else {
		eventDispatcher.addEventListener(type, handler);
	}
};
export const DispatchEvent = (eventDispatcher: IEventDispatcher, event: NitroEvent) =>
	eventDispatcher.dispatchEvent(event);

export const registerUiEvent = <T extends NitroEvent>(
	type: string | string[],
	handler: (evt: T) => void
) => registerNitroEvent(type, UI_EVENT_DISPATCHER, handler);

export const DispatchUiEvent = (event: NitroEvent) => DispatchEvent(UI_EVENT_DISPATCHER, event);

export const registerMainEvent = <T extends NitroEvent>(
	type: string | string[],
	handler: (evt: T) => void
) => registerNitroEvent(type, GetNitroInstance().events, handler);

export const registerConfigurationEvent = <T extends NitroEvent>(
	type: string | string[],
	handler: (evt: T) => void
) => registerNitroEvent(type, GetConfigurationManager().events, handler);

export const registerRoomEngineEvent = <T extends NitroEvent>(
	type: string | string[],
	handler: (evt: T) => void
) => registerNitroEvent(type, GetRoomEngine().events, handler);

export const registerLocalizationEvent = <T extends NitroEvent>(
	type: string | string[],
	handler: (evt: T) => void
) => registerNitroEvent(type, GetNitroInstance().localization.events, handler);


export const registerRoomSessionManagerEvent = <T extends NitroEvent>(
	type: string | string[],
	handler: (evt: T) => void
) => registerNitroEvent(type, GetRoomSessionManager().events, handler);

export const registerMessageEvent = <T extends IMessageEvent>(
	eventType: typeof MessageEvent,
	handler: (evt: T) => void
) => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error
	const event = new eventType(handler);

	GetCommunication().registerMessageEvent(event);
}