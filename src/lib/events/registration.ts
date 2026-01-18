import { GetNitroInstance } from '$lib/api/GetNitroInstance';
import { GetConfigurationManager } from '$lib/api/GetConfigurationManager';
import { GetRoomEngine } from '$lib/api/GetRoomEngine';
import type { IEventDispatcher, NitroEvent } from '@nitrots/nitro-renderer';

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
