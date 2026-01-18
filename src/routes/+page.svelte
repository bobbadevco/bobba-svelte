<script lang="ts">
	import {type IEventDispatcher, LegacyExternalInterface, ConfigurationEvent, GetAssetManager, HabboWebTools, Nitro, NitroCommunicationDemoEvent, NitroConfiguration, NitroEvent, NitroLocalizationEvent, RoomEngineEvent } from '@nitrots/nitro-renderer';
	import { onMount, type Snippet } from 'svelte';
	import {GetNitroInstance} from "$lib/api/GetNitroInstance";
	import { GetConfiguration } from '$lib/api/GetConfiguration';
	import { GetCommunication } from '$lib/api/GetCommunication';
	import { GetConfigurationManager } from '$lib/api/GetConfigurationManager';
	import { GetRoomEngine } from '$lib/api/GetRoomEngine';

	const registerNitroEvent = <T extends NitroEvent>(type: string | string[], eventDispatcher: IEventDispatcher, handler: (evt: T) => void) => {
		if (Array.isArray(type)) {
			type.map(name => eventDispatcher.addEventListener(name, handler));
		} else {
			eventDispatcher.addEventListener(type, handler);
		}
	};

	const registerMainEvent = <T extends NitroEvent>(type: string | string[], handler: (evt: T) => void) => registerNitroEvent(type, GetNitroInstance().events, handler);
	const registerConfigurationEvent = <T extends NitroEvent>(type: string | string[], handler: (evt: T) => void) => registerNitroEvent(type, GetConfigurationManager().events, handler);
	const registerRoomEngineEvent = <T extends NitroEvent>(type: string | string[], handler: (evt: T) => void) => registerNitroEvent(type, GetRoomEngine().events, handler);
	const registerLocalizationEvent = <T extends NitroEvent>(type: string | string[], handler: (evt: T) => void) => registerNitroEvent(type, GetNitroInstance().localization.events, handler);

	let percent = $state(0);
	let message = $state('');
	let isError = $state(false);
	let isReady = $state(false);


	const handler = async (event: NitroEvent) =>
	{
		switch(event.type)
		{
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
				if(LegacyExternalInterface.available) LegacyExternalInterface.call('legacyTrack', 'authentication', 'authok', []);
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

				setTimeout(() => isReady = true, 300);
				return;
			case NitroLocalizationEvent.LOADED: {
				const assetUrls = GetConfiguration<string[]>('preload.assets.urls', []);
				const urls: string[] = [];

				if(assetUrls && assetUrls.length) for(const url of assetUrls) urls.push(NitroConfiguration.interpolate(url));

				const status = await GetAssetManager().downloadAssets(urls);

				if(status)
				{
					GetCommunication().init();
					percent += 20;
				}
				else
				{
					isError = true;
					message = 'Assets Failed';
				}
				return;
			}
		}
	};


	let MainView = $state<Snippet>();

	onMount(
		async () => {
			Nitro.bootstrap();
			GetNitroInstance().core.configuration.init();
			const theme = GetConfiguration<string>('theme', './themes/default');
			MainView = (await import(theme+"/MainView.svelte")).default;

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
		}
	);
</script>

{percent}
{message}
{isError}
{isReady}

{#if MainView}
	{#if isReady}
		{@render MainView()}
	{/if}
{/if}