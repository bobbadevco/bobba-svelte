import { ChatMessageTypeEnum, CreateLinkEvent,
	GetClubMemberLevel, GetConfiguration, GetRoomEngine, GetSessionDataManager, RoomWidgetUpdateEvent,
	RoomWidgetUpdateRoomObjectEvent,
	SendMessageComposer
} from '$lib/api';
import {
	AvatarExpressionEnum,
	GetTicker,
	HabboClubLevelEnum, NitroCommunicationDemoEvent,
	type NitroEvent, RoomControllerLevel, RoomEngineObjectEvent, RoomObjectCategory, RoomRotatingEffect,
	RoomSessionChatEvent, RoomSettingsComposer, RoomShakingEffect, RoomZoomEvent, TextureUtils } from '@nitrots/nitro-renderer';
import { getRoomSession, registerMainEvent, registerObjectSelectedEvent,
	registerRoomEngineEvent, registerRoomSessionManagerEvent } from '$lib/events';

class ChatInputListener {
	selectedUsername= $state('');
	isTyping = $state(false);
	typingStartedSent = $state(false);
	isIdle = $state(false);
	floodBlocked = $state(false);
	floodBlockedSeconds = $state(0);

	private static instance: ChatInputListener;

	public constructor() {
		registerMainEvent(NitroCommunicationDemoEvent.CONNECTION_AUTHENTICATED, this.init.bind(this));
	}

	public static getInstance(): ChatInputListener {
		if (!ChatInputListener.instance) {
			ChatInputListener.instance = new ChatInputListener();
		}
		return ChatInputListener.instance;
	}

	public sendChat(text: string, chatType: number, recipientName: string = '', styleId: number = 0)
	{
		if(text === '') return null;
		const roomSession = getRoomSession();
		if (!roomSession) return null;

		const parts = text.split(' ');

		if(parts.length > 0)
		{
			const firstPart = parts[0];
			let secondPart = '';

			if(parts.length > 1) secondPart = parts[1];

			if((firstPart.charAt(0) === ':') && (secondPart === 'x'))
			{
				const selectedAvatarId = GetRoomEngine().selectedAvatarId;

				if(selectedAvatarId > -1)
				{
					const userData = roomSession.userDataManager.getUserDataByIndex(selectedAvatarId);

					if(userData)
					{
						secondPart = userData.name;
						text = text.replace(' x', (' ' + userData.name));
					}
				}
			}

			switch(firstPart.toLowerCase())
			{
				case ':shake':
					RoomShakingEffect.init(2500, 5000);
					RoomShakingEffect.turnVisualizationOn();

					return null;

				case ':rotate':
					RoomRotatingEffect.init(2500, 5000);
					RoomRotatingEffect.turnVisualizationOn();

					return null;
				case ':d':
				case ';d':
					if(GetClubMemberLevel() === HabboClubLevelEnum.VIP)
					{
						roomSession.sendExpressionMessage(AvatarExpressionEnum.LAUGH.ordinal);
					}

					break;
				case 'o/':
				case '_o/':
					roomSession.sendExpressionMessage(AvatarExpressionEnum.WAVE.ordinal);

					return null;
				case ':kiss':
					if(GetClubMemberLevel() === HabboClubLevelEnum.VIP)
					{
						roomSession.sendExpressionMessage(AvatarExpressionEnum.BLOW.ordinal);

						return null;
					}

					break;
				case ':jump':
					if(GetClubMemberLevel() === HabboClubLevelEnum.VIP)
					{
						roomSession.sendExpressionMessage(AvatarExpressionEnum.JUMP.ordinal);

						return null;
					}

					break;
				case ':idle':
					roomSession.sendExpressionMessage(AvatarExpressionEnum.IDLE.ordinal);

					return null;
				case '_b':
					roomSession.sendExpressionMessage(AvatarExpressionEnum.RESPECT.ordinal);

					return null;
				case ':sign':
					roomSession.sendSignMessage(parseInt(secondPart));

					return null;
				case ':iddqd':
				case ':flip':
					GetRoomEngine().events.dispatchEvent(new RoomZoomEvent(roomSession.roomId, -1, true));

					return null;
				case ':zoom':
					GetRoomEngine().events.dispatchEvent(new RoomZoomEvent(roomSession.roomId, parseFloat(secondPart), false));

					return null;
				case ':screenshot':
					{
						const texture = GetRoomEngine().createTextureFromRoom(roomSession.roomId, 1);

						const image = new Image();

						image.src = TextureUtils.generateImageUrl(texture);

						const newWindow = window.open('');
						if (newWindow != null) newWindow.document.write(image.outerHTML);
					}
					return null;
				case ':furni':
					CreateLinkEvent('furni-chooser/');
					return null;
				case ':chooser':
					CreateLinkEvent('user-chooser/');
					return null;
				case ':floor':
				case ':bcfloor':
					if(roomSession.controllerLevel >= RoomControllerLevel.ROOM_OWNER) CreateLinkEvent('floor-editor/show');

					return null;
				case ':togglefps': {
					if(GetTicker().maxFPS > 0) GetTicker().maxFPS = 0;
					else GetTicker().maxFPS = GetConfiguration('system.animation.fps');

					return null;
				}
				case ':settings':
					if(roomSession.isRoomOwner || GetSessionDataManager().isModerator)
					{
						SendMessageComposer(new RoomSettingsComposer(roomSession.roomId));
					}

					return null;
			}
		}
		switch(chatType)
		{
			case ChatMessageTypeEnum.CHAT_DEFAULT:
				roomSession.sendChatMessage(text, styleId);
				break;
			case ChatMessageTypeEnum.CHAT_SHOUT:
				roomSession.sendShoutMessage(text, styleId);
				break;
			case ChatMessageTypeEnum.CHAT_WHISPER:
				roomSession.sendWhisperMessage(recipientName, text, styleId);
				break;
		}
	}

	private init(_e: NitroEvent) {
		registerRoomSessionManagerEvent(RoomSessionChatEvent.FLOOD_EVENT, this.onRoomFlood.bind(this));
		registerObjectSelectedEvent(this.onObjectSelected.bind(this));
		registerRoomEngineEvent(RoomEngineObjectEvent.DESELECTED, this.onObjectDeselected.bind(this));
	}

	private onRoomFlood(event: RoomSessionChatEvent) {
		this.floodBlocked = true;
		this.floodBlockedSeconds = parseFloat(event.message);
	}

	private onObjectSelected(event: RoomWidgetUpdateRoomObjectEvent) {
		const roomSession = getRoomSession();
		if (event.category !== RoomObjectCategory.UNIT || !roomSession) return;
		const userData = roomSession.userDataManager.getUserDataByIndex(event.id);

		if(!userData) return;

		this.selectedUsername = userData.name;
	}

	private onObjectDeselected(_event: RoomEngineObjectEvent) {
		this.selectedUsername = '';
	}

}

export const getChatInputListener = () => ChatInputListener.getInstance();