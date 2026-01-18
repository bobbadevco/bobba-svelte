import {
	ConfigurationEvent,
	GetAssetManager,
	HabboWebTools,
	LegacyExternalInterface,
	Nitro,
	NitroCommunicationDemoEvent,
	NitroConfiguration,
	NitroEvent,
	NitroLocalizationEvent,
	RoomEngineEvent
} from '@nitrots/nitro-renderer';
import { GetNitroInstance, GetConfiguration, GetCommunication } from './api';
import {
	registerMainEvent,
	registerRoomEngineEvent,
	registerLocalizationEvent,
	registerConfigurationEvent,
} from './events';

let percent = $state(0);
let message = $state('');
let isError = $state(false);
let isReady = $state(false);

export const getPercent = () => percent;
export const getMessage = () => message;
export const getIsError = () => isError;
export const getIsReady = () => isReady;

const handler = async (event: NitroEvent) => {
	switch (event.type) {
		case ConfigurationEvent.LOADED:
			GetNitroInstance().localization.init();
			percent += 20;
			return;
		case ConfigurationEvent.FAILED:
			isError = true;
			message = 'Configuration Failed';
			return;
		case Nitro.WEBGL_UNAVAILABLE:
			isError = true;
			message = 'WebGL Required';
			return;
		case Nitro.WEBGL_CONTEXT_LOST:
			isError = true;
			message = 'WebGL Context Lost - Reloading';

			setTimeout(() => window.location.reload(), 1500);
			return;
		case NitroCommunicationDemoEvent.CONNECTION_HANDSHAKING:
			percent += 20;
			return;
		case NitroCommunicationDemoEvent.CONNECTION_HANDSHAKE_FAILED:
			isError = true;
			message = 'Handshake Failed';
			return;
		case NitroCommunicationDemoEvent.CONNECTION_AUTHENTICATED:
			percent += 20;
			GetNitroInstance().init();

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
			if (LegacyExternalInterface.available) LegacyExternalInterface.call('legacyTrack', 'authentication', 'authok', []);
			return;
		case NitroCommunicationDemoEvent.CONNECTION_ERROR:
			isError = true;
			message = 'Connection Error';
			return;
		case NitroCommunicationDemoEvent.CONNECTION_CLOSED:
			//if(GetNitroInstance().roomEngine) GetNitroInstance().roomEngine.dispose();
			//setIsError(true);
			message = 'Connection Error';

			HabboWebTools.send(-1, 'client.init.handshake.fail');
			return;
		case RoomEngineEvent.ENGINE_INITIALIZED:
			percent += 20;

			setTimeout(() => {
				isReady = true;
			}, 300);
			return;
		case NitroLocalizationEvent.LOADED: {
			const assetUrls = GetConfiguration<string[]>('preload.assets.urls', []);
			const urls: string[] = [];

			if (assetUrls && assetUrls.length)
				for (const url of assetUrls) urls.push(NitroConfiguration.interpolate(url));

			const status = await GetAssetManager().downloadAssets(urls);

			if (status) {
				GetCommunication().init();
				percent += 20;
			} else {
				isError = true;
				message = 'Assets Failed';
			}
			return;
		}
	}
};

export const initialize = () => {
	registerMainEvent(Nitro.WEBGL_UNAVAILABLE, handler);
	registerMainEvent(Nitro.WEBGL_CONTEXT_LOST, handler);
	registerMainEvent(NitroCommunicationDemoEvent.CONNECTION_HANDSHAKING, handler);
	registerMainEvent(NitroCommunicationDemoEvent.CONNECTION_HANDSHAKE_FAILED, handler);
	registerMainEvent(NitroCommunicationDemoEvent.CONNECTION_AUTHENTICATED, handler);
	registerMainEvent(NitroCommunicationDemoEvent.CONNECTION_ERROR, handler);
	registerMainEvent(NitroCommunicationDemoEvent.CONNECTION_CLOSED, handler);
	registerRoomEngineEvent(RoomEngineEvent.ENGINE_INITIALIZED, handler);
	registerLocalizationEvent(NitroLocalizationEvent.LOADED, handler);
	registerConfigurationEvent(ConfigurationEvent.LOADED, handler);
	registerConfigurationEvent(ConfigurationEvent.FAILED, handler);
};
