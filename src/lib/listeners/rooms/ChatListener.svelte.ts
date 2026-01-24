import {
	ChatBubbleMessage,
	GetAvatarRenderManager,
	GetRoomEngine,
	GetRoomObjectScreenLocation,
	type IRoomChatSettings,
	LocalizeText,
	RoomChatFormatter
} from '$lib/api';
import {
	AvatarFigurePartType,
	AvatarScaleType,
	AvatarSetType,
	GetGuestRoomResultEvent,
	type IGetImageListener,
	NitroCommunicationDemoEvent,
	NitroPoint,
	PetFigureData,
	RoomChatSettings,
	RoomChatSettingsEvent,
	RoomDragEvent,
	RoomEngineEvent,
	RoomObjectCategory,
	RoomObjectType,
	RoomObjectVariable,
	RoomSessionChatEvent,
	RoomUserData,
	SystemChatStyleEnum,
	TextureUtils,
	Vector3d
} from '@nitrots/nitro-renderer';
import { SvelteMap } from 'svelte/reactivity';
import { getRoomSession,
	registerMainEvent, registerMessageEvent, registerRoomEngineEvent, registerRoomSessionManagerEvent } from '$lib/events';

const avatarColorCache = new SvelteMap<string, number>();
const avatarImageCache = new SvelteMap<string, string>();
const petImageCache = new SvelteMap<string, string>();

class ChatListener {
	chatMessages = $state<ChatBubbleMessage[]>([]);
	chatSettings = $state<IRoomChatSettings>({
		mode: RoomChatSettings.CHAT_MODE_FREE_FLOW,
		weight: RoomChatSettings.CHAT_BUBBLE_WIDTH_NORMAL,
		speed: RoomChatSettings.CHAT_SCROLL_SPEED_NORMAL,
		distance: 50,
		protection: RoomChatSettings.FLOOD_FILTER_NORMAL
	} as IRoomChatSettings);

	scrollSpeed = $derived.by(() => {
		if (!this.chatSettings) return 6000;

		switch (this.chatSettings.speed) {
			case RoomChatSettings.CHAT_SCROLL_SPEED_FAST:
				return 3000;
			default:
			case RoomChatSettings.CHAT_SCROLL_SPEED_NORMAL:
				return 6000;
			case RoomChatSettings.CHAT_SCROLL_SPEED_SLOW:
				return 12000;
		}
	});

	private static instance: ChatListener;

	public static getInstance() {
		if (!ChatListener.instance) {
			ChatListener.instance = new ChatListener();
		}
		return ChatListener.instance;
	}

	constructor() {
		registerRoomEngineEvent(RoomEngineEvent.ENGINE_INITIALIZED, this.initRoom.bind(this));
		registerMainEvent(NitroCommunicationDemoEvent.CONNECTION_AUTHENTICATED, this.initMessages.bind(this));
	}

	private initMessages() {
		registerMessageEvent(GetGuestRoomResultEvent, this.onGetGuestRoomResult.bind(this));
		registerMessageEvent(RoomChatSettingsEvent, this.onRoomChatSettings.bind(this));
	}

	private initRoom(_e: RoomEngineEvent) {
		registerRoomSessionManagerEvent(RoomSessionChatEvent.CHAT_EVENT, this.onRoomSessionChat.bind(this));
		registerRoomEngineEvent(RoomDragEvent.ROOM_DRAG, this.onRoomDrag.bind(this));
	}

	private onRoomChatSettings(event: RoomChatSettingsEvent) {
		const parser = event.getParser();
		this.chatSettings = parser.chat;
	}

	private onGetGuestRoomResult(event: GetGuestRoomResultEvent) {
		const parser = event.getParser();
		if(!parser.roomEnter) return;
		this.chatSettings = parser.chat;
	}

	private onRoomDrag(event: RoomDragEvent) {
		const roomSession = getRoomSession();
		if (!this.chatMessages.length || !roomSession || (event.roomId !== roomSession.roomId)) return;

		const offsetX = event.offsetX;

		this.chatMessages.forEach((chatMessage) => chatMessage.left += offsetX);
	}

	private onRoomSessionChat(event: RoomSessionChatEvent) {
		const roomSession = getRoomSession();
		if (!roomSession) return;

		const roomId = roomSession.roomId;
		const roomObject = GetRoomEngine().getRoomObject(
			roomId,
			event.objectId,
			RoomObjectCategory.UNIT
		);
		const bubbleLocation = (roomObject
			? GetRoomObjectScreenLocation(roomSession.roomId, roomObject?.id, RoomObjectCategory.UNIT)
			: new NitroPoint()) || new NitroPoint();
		const userData = roomObject
			? roomSession.userDataManager.getUserDataByIndex(event.objectId)
			: new RoomUserData(-1);

		let username = '';
		let avatarColor: number | undefined = 0;
		let imageUrl: string | undefined = undefined;
		const chatType = event.chatType;
		let styleId = event.style;
		let userType = 0;
		let _petType = -1;
		let text = event.message;

		if (userData) {
			userType = userData.type;

			const figure = userData.figure;

			switch (userType) {
				case RoomObjectType.PET:
					imageUrl = this.getPetImage(
						figure,
						2,
						true,
						64,
						roomObject.model.getValue<string>(RoomObjectVariable.FIGURE_POSTURE)
					);
					_petType = new PetFigureData(figure).typeId;
					break;
				case RoomObjectType.USER:
					imageUrl = this.getUserImage(figure);
					break;
				case RoomObjectType.RENTABLE_BOT:
				case RoomObjectType.BOT:
					styleId = SystemChatStyleEnum.BOT;
					break;
			}

			avatarColor = avatarColorCache.get(figure);
			username = userData.name;
		}

		switch (chatType) {
			case RoomSessionChatEvent.CHAT_TYPE_RESPECT:
				text = LocalizeText('widgets.chatbubble.respect', ['username'], [username]);

				break;
			case RoomSessionChatEvent.CHAT_TYPE_PETREVIVE:
			case RoomSessionChatEvent.CHAT_TYPE_PET_REBREED_FERTILIZE:
			case RoomSessionChatEvent.CHAT_TYPE_PET_SPEED_FERTILIZE: {
				let textKey = 'widget.chatbubble.petrevived';

				if (chatType === RoomSessionChatEvent.CHAT_TYPE_PET_REBREED_FERTILIZE) {
					textKey = 'widget.chatbubble.petrefertilized;';
				} else if (chatType === RoomSessionChatEvent.CHAT_TYPE_PET_SPEED_FERTILIZE) {
					textKey = 'widget.chatbubble.petspeedfertilized';
				}

				let targetUserName: string | undefined = undefined;

				const newRoomObject = GetRoomEngine().getRoomObject(
					roomSession.roomId,
					event.extraParam,
					RoomObjectCategory.UNIT
				);

				if (newRoomObject) {
					const newUserData = roomSession.userDataManager.getUserDataByIndex(roomObject.id);

					if (newUserData) targetUserName = newUserData.name;
				}

				text = LocalizeText(textKey, ['petName', 'userName'], [username, targetUserName || '']);
				break;
			}
			case RoomSessionChatEvent.CHAT_TYPE_PETRESPECT:
				text = LocalizeText('widget.chatbubble.petrespect', ['petname'], [username]);
				break;
			case RoomSessionChatEvent.CHAT_TYPE_PETTREAT:
				text = LocalizeText('widget.chatbubble.pettreat', ['petname'], [username]);
				break;
			case RoomSessionChatEvent.CHAT_TYPE_HAND_ITEM_RECEIVED:
				text = LocalizeText(
					'widget.chatbubble.handitem',
					['username', 'handitem'],
					[username, LocalizeText('handitem' + event.extraParam)]
				);
				break;
			case RoomSessionChatEvent.CHAT_TYPE_MUTE_REMAINING: {
				const hours = (event.extraParam > 0 ? Math.floor(event.extraParam / 3600) : 0).toString();
				const minutes = (
					event.extraParam > 0 ? Math.floor((event.extraParam % 3600) / 60) : 0
				).toString();
				const seconds = (event.extraParam % 60).toString();

				text = LocalizeText(
					'widget.chatbubble.mutetime',
					['hours', 'minutes', 'seconds'],
					[hours, minutes, seconds]
				);
				break;
			}
		}

		const formattedText = RoomChatFormatter(text);
		const color = avatarColor && ('#' + avatarColor.toString(16).padStart(6, '0') || undefined) || '#000';

		const chatMessage = new ChatBubbleMessage(
			userData.roomIndex,
			RoomObjectCategory.UNIT,
			roomSession.roomId,
			text,
			formattedText,
			username,
			new NitroPoint(bubbleLocation.x, bubbleLocation.y),
			chatType,
			styleId,
			imageUrl,
			color
		);
		this.chatMessages.push(chatMessage);
	}

	private setFigureImage(figure: string) {
		const avatarImage = GetAvatarRenderManager().createAvatarImage(
			figure,
			AvatarScaleType.LARGE,
			'',
			{
				resetFigure: (figure: string) => {
					this.setFigureImage(figure);
				},
				dispose: () => {},
				disposed: false
			}
		);

		if (!avatarImage) return;

		const image = avatarImage.getCroppedImage(AvatarSetType.HEAD);
		const color = avatarImage.getPartColor(AvatarFigurePartType.CHEST);
		avatarColorCache.set(figure, (color && color.rgb) || 16777215);
		avatarImage.dispose();
		avatarImageCache.set(figure, image.src);
		return image.src;
	}

	private getUserImage(figure: string) {
		let existing = avatarImageCache.get(figure);
		if (!existing) existing = this.setFigureImage(figure);
		return existing;
	}

	private getPetImage(figure: string, direction: number, _arg_3: boolean, scale: number = 64, posture?: string) {
		let existing = petImageCache.get(figure + posture);

		if (existing) return existing;

		const figureData = new PetFigureData(figure);
		const typeId = figureData.typeId;
		const image = GetRoomEngine().getRoomObjectPetImage(
			typeId,
			figureData.paletteId,
			figureData.color,
			new Vector3d(direction * 45),
			scale,
			{} as IGetImageListener,
			false,
			0,
			figureData.customParts,
			posture
		);

		if (image) {
			existing = TextureUtils.generateImageUrl(image.data);

			petImageCache.set(figure + posture, existing);
		}

		return existing;
	}
}

export const getChatListener = () => ChatListener.getInstance();