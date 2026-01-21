import {  registerMainEvent, registerMessageEvent } from '$lib/events';
import {
	GetGuestRoomResultEvent,
	NavigatorHomeRoomEvent,
	NitroCommunicationDemoEvent,
	RoomDataParser,
	UserInfoEvent,
	type NitroEvent,
	HabboWebTools,
	type ILinkEventTracker,
	RoomScoreEvent,
	RoomSettingsUpdatedEvent,
	GetGuestRoomMessageComposer,
	GetUserFlatCatsMessageComposer,
	GetUserEventCatsMessageComposer,
	UserPermissionsEvent,
	SecurityLevel,
	RoomForwardEvent,
	RoomEntryInfoMessageEvent,
	LegacyExternalInterface,
	RoomDoorbellAcceptedEvent,
	FlatAccessDeniedMessageEvent,
	GenericErrorEvent
} from '@nitrots/nitro-renderer';
import { DoorStateType } from '$lib/api/navigator/DoorStateType';
import {
	CreateRoomSession,
	GetConfiguration,
	GetSessionDataManager,
	SendMessageComposer,
	TryVisitRoom
} from '$lib/api';

class NavigatorListener {
	homeRoomId: number = $state(0);
	isVisible: boolean = $state(false);
	doorData = $state<{roomInfo: RoomDataParser | undefined, state: number}>({roomInfo: undefined, state: DoorStateType.NONE});
	enteredGuestRoom = $state<RoomDataParser>();
	currentRoomIsStaffPick = $state(false);
	createdFlatId = $state(-1);
	linkTracker: ILinkEventTracker;
	currentRoomRating = $state(0);
	canRate = $state(false);
	eventMod = $state(false);
	roomPicker = $state(false);
	currentRoomOwner = $state(false);
	roomId = $state(-1);
	
	private static instance: NavigatorListener;

	constructor() {
		registerMainEvent(NitroCommunicationDemoEvent.CONNECTION_AUTHENTICATED, this.init);
		this.linkTracker = {
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
						this.isVisible = true;
						return;
					case 'hide':
						this.isVisible = false;
						return;
					case 'toggle':
						this.isVisible = !this.isVisible;
						return;
					case 'goto':
						if (!value) return;

						if (value === 'home') {
							if (this.homeRoomId > 0) TryVisitRoom(this.homeRoomId);
						} else {
							const roomId = parseInt(value);
							if (!isNaN(roomId)) TryVisitRoom(roomId);
						}
						return;
				}
			},
			eventUrlPrefix: 'navigator/'
		};
	}

	private init(_e: NitroEvent) {
		registerMessageEvent(NavigatorHomeRoomEvent, this.onHomeRoom);
		registerMessageEvent(GetGuestRoomResultEvent, this.onGuestResult);
		registerMessageEvent(RoomScoreEvent, this.onRoomScore);
		registerMessageEvent(RoomSettingsUpdatedEvent, this.onRoomSettingsUpdate);
		registerMessageEvent(UserInfoEvent, this.onUserInfo);
		registerMessageEvent(UserPermissionsEvent, this.onUserPermissions);
		registerMessageEvent(RoomForwardEvent, this.onRoomForward);
		registerMessageEvent(RoomEntryInfoMessageEvent, this.onRoomEntryInfo);
		registerMessageEvent(RoomDoorbellAcceptedEvent, this.onRoomDoorbellAccepted);
		registerMessageEvent(FlatAccessDeniedMessageEvent, this.onFlatAccessDenied);
		registerMessageEvent(GenericErrorEvent, this.onGenericError);
	}

	private onGenericError(event: GenericErrorEvent) {
		const parser = event.getParser();

		switch(parser.errorCode) {
			case -100002:
				this.doorData.state = DoorStateType.STATE_WRONG_PASSWORD;
				return;
		}
	}

	private onFlatAccessDenied(event: FlatAccessDeniedMessageEvent) {
		const parser = event.getParser();

		if (!parser.userName || (parser.userName.length === 0)) {
			this.doorData.state = DoorStateType.STATE_NO_ANSWER;
		}
	}

	private onRoomDoorbellAccepted(event: RoomDoorbellAcceptedEvent) {
		const parser = event.getParser();
		if (!parser.userName || (parser.userName.length === 0)) {
			this.doorData.state = DoorStateType.STATE_ACCEPTED;
		}
	}

	private onRoomEntryInfo(event: RoomEntryInfoMessageEvent) {
		const parser = event.getParser();
		this.enteredGuestRoom = undefined;
		this.currentRoomOwner = parser.isOwner;
		this.roomId = parser.roomId;
		SendMessageComposer(new GetGuestRoomMessageComposer(parser.roomId, true, false));

		if (LegacyExternalInterface.available) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
			LegacyExternalInterface.call('legacyTrack', 'navigator', 'private', [ parser.roomId ]);
		}
	}

	private onRoomForward(event: RoomForwardEvent) {
		const parser = event.getParser();
		TryVisitRoom(parser.roomId);
	}

	private onUserPermissions(event: UserPermissionsEvent) {
		const parser = event.getParser();
		this.eventMod = (parser.securityLevel >= SecurityLevel.MODERATOR);
		this.roomPicker = (parser.securityLevel >= SecurityLevel.COMMUNITY);
	}

	private onUserInfo(_event: UserInfoEvent) {
		SendMessageComposer(new GetUserFlatCatsMessageComposer());
		SendMessageComposer(new GetUserEventCatsMessageComposer());
	}

	private onRoomSettingsUpdate(event: RoomSettingsUpdatedEvent) {
		const parser = event.getParser();
		SendMessageComposer(new GetGuestRoomMessageComposer(parser.roomId, false, false));
	}

	private onRoomScore(event: RoomScoreEvent) {
		const parser = event.getParser();
		this.currentRoomRating = parser.totalLikes;
		this.canRate = parser.canLike;
	}

	private onHomeRoom(event: NavigatorHomeRoomEvent) {
		const parser = event.getParser();
		this.homeRoomId = parser.homeRoomId;
	}

	private onGuestResult(event: GetGuestRoomResultEvent) {
		const parser = event.getParser();
		if (parser.roomEnter)
		{
			this.doorData = {roomInfo: undefined, state: DoorStateType.NONE};
			this.enteredGuestRoom = parser.data;
			this.currentRoomIsStaffPick = parser.staffPick;
			if (this.createdFlatId != parser.data.roomId && parser.data.displayRoomEntryAd)
			{
				if (GetConfiguration<boolean>('roomenterad.habblet.enabled', false)) HabboWebTools.openRoomEnterAd();
			}
			this.createdFlatId = 0;
		} else if (parser.roomForward) {
			if ((parser.data.ownerName !== GetSessionDataManager().userName) && !parser.isGroupMember) {
				switch(parser.data.doorMode) {
					case RoomDataParser.DOORBELL_STATE:
						this.doorData.roomInfo = parser.data;
						this.doorData.state = DoorStateType.START_DOORBELL;
						return;
					case RoomDataParser.PASSWORD_STATE:
						this.doorData.roomInfo = parser.data;
						this.doorData.state = DoorStateType.START_PASSWORD;
						return;
				}
			}

			if ((parser.data.doorMode === RoomDataParser.NOOB_STATE) && !GetSessionDataManager().isAmbassador && !GetSessionDataManager().isRealNoob && !GetSessionDataManager().isModerator) return;

			CreateRoomSession(parser.data.roomId);
		} else {
			this.enteredGuestRoom = parser.data;
			this.currentRoomIsStaffPick = parser.staffPick;
		}
	}
	
	public static getInstance(): NavigatorListener {
		if (!NavigatorListener.instance) {
			NavigatorListener.instance = new NavigatorListener();
		}
		return NavigatorListener.instance;
	}
}

export const getNavigatorListener = () => NavigatorListener.getInstance();