
import { registerMainEvent, registerMessageEvent, registerRoomSessionManagerEvent } from '$lib/events';
import {
	GetGuestRoomResultEvent,
	NavigatorHomeRoomEvent,
	RoomDataParser,
	UserInfoEvent,
	type NitroEvent,
	NavigatorSearchesEvent,
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
	GenericErrorEvent,
	NavigatorMetadataEvent,
	NavigatorTopLevelContext,
	NavigatorSearchEvent,
	NavigatorSearchResultSet,
	NavigatorCategoryDataParser,
	UserFlatCatsEvent,
	NavigatorEventCategoryDataParser,
	UserEventCatsEvent,
	FlatCreatedEvent,
	FollowFriendMessageComposer,
	NitroCommunicationDemoEvent,
	RoomSessionEvent,
	NavigatorSearchComposer, CreateFlatMessageComposer, type NavigatorSavedSearch
} from '@nitrots/nitro-renderer';
import { DoorStateType } from '$lib/api/navigator/DoorStateType';
import {
	AddEventLinkTracker,
	CreateRoomSession,
	GetConfiguration,
	GetSessionDataManager,
	LocalizeText,
	SendMessageComposer,
	TryVisitRoom
} from '$lib/api';
import { getAlertListener } from '$lib/listeners/AlertListener.svelte';
import { NotificationAlertType } from '$lib/api/notification/NotificationAlertType';
import { SearchOptions } from '$lib/api/navigator/SearchOptions';

class NavigatorListener implements ILinkEventTracker {
	homeRoomId = $state(0);
	visible: boolean = $state(false);
	creatorOpen: boolean = $state(false);
	needsInit: boolean = $state(true);
	needsSearch: boolean = $state(false);
	searchValue: string = $state('');
	searched: boolean = $state(false);
	searchIndex: number = $state(0);
	ready: boolean = $state(false);
	doorData = $state<{ roomInfo: RoomDataParser | undefined; state: number }>({
		roomInfo: undefined,
		state: DoorStateType.NONE
	});
	pendingSearch = $state<{ current: { value: string; code: string } | null }>({ current: null });
	enteredGuestRoom = $state<RoomDataParser>();
	currentRoomIsStaffPick = $state(false);
	createdFlatId = $state(-1);
	currentRoomRating = $state(0);
	canRate = $state(false);
	eventMod = $state(false);
	roomPicker = $state(false);
	currentRoomOwner = $state(false);
	roomId = $state(-1);
	loading: boolean = $state(false);
	topLevelContext = $state<NavigatorTopLevelContext>();
	navigatorSearches = $state<NavigatorSavedSearch[]>();
	topLevelContexts = $state<NavigatorTopLevelContext[]>();
	searchResult = $state<NavigatorSearchResultSet>();
	categories = $state<NavigatorCategoryDataParser[]>()	;
	eventCategories = $state<NavigatorEventCategoryDataParser[]>();
	settingsReceived = $state(false);

	eventUrlPrefix = 'navigator/';

	private static instance: NavigatorListener;

	simpleAlert = getAlertListener().simpleAlert;

	linkReceived = (url: string) => {
		const parts = url.split('/');

		let method = parts[0];
		let value = parts.length > 1 ? parts[1] : undefined;

		if (method === 'navigator' && parts.length > 1) {
			method = parts[1];
			value = parts.length > 2 ? parts[2] : undefined;
		}

		switch (method) {
			case 'show':
				this.visible = true;
				return;
			case 'hide':
				this.visible = false;
				return;
			case 'toggle':
				this.visible = !this.visible;
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
	};

	constructor() {
		registerMainEvent(NitroCommunicationDemoEvent.CONNECTION_AUTHENTICATED, this.init.bind(this));
	}

	public init(_e: NitroEvent) {
		AddEventLinkTracker(this);
		registerMessageEvent(NavigatorHomeRoomEvent, this.onHomeRoom.bind(this));
		registerMessageEvent(GetGuestRoomResultEvent, this.onGuestResult.bind(this));
		registerMessageEvent(RoomScoreEvent, this.onRoomScore.bind(this));
		registerMessageEvent(RoomSettingsUpdatedEvent, this.onRoomSettingsUpdate.bind(this));
		registerMessageEvent(UserInfoEvent, this.onUserInfo.bind(this));
		registerMessageEvent(UserPermissionsEvent, this.onUserPermissions.bind(this));
		registerMessageEvent(RoomForwardEvent, this.onRoomForward.bind(this));
		registerMessageEvent(RoomEntryInfoMessageEvent, this.onRoomEntryInfo.bind(this));
		registerMessageEvent(RoomDoorbellAcceptedEvent, this.onRoomDoorbellAccepted.bind(this));
		registerMessageEvent(FlatAccessDeniedMessageEvent, this.onFlatAccessDenied.bind(this));
		registerMessageEvent(GenericErrorEvent, this.onGenericError.bind(this));
		registerMessageEvent(NavigatorMetadataEvent, this.onMetadata.bind(this));
		registerMessageEvent(NavigatorSearchEvent, this.onSearch.bind(this));
		registerMessageEvent(UserFlatCatsEvent, this.onUserFlatCategories.bind(this));
		registerMessageEvent(UserEventCatsEvent, this.onUserEventCategories.bind(this));
		registerMessageEvent(FlatCreatedEvent, this.onFlatCreated.bind(this));
		registerMessageEvent(NavigatorSearchesEvent, this.onSavedSearches.bind(this));
		registerRoomSessionManagerEvent(RoomSessionEvent.CREATED, this.onRoomCreated.bind(this));
	}

	public static getInstance(): NavigatorListener {
		if (!NavigatorListener.instance) {
			NavigatorListener.instance = new NavigatorListener();
		}
		return NavigatorListener.instance;
	}

	public createRoom(roomName: string, description: string, selectedModelName: string, category: number, usersCount: number, tradeSettings: number)
	{
		if (!roomName || (roomName.length < 3)) return;

		SendMessageComposer(new CreateFlatMessageComposer(roomName, description, 'model_' + selectedModelName, Number(category), Number(usersCount), tradeSettings));
	}

	public visitRoom(roomData: RoomDataParser) {
		if(roomData.ownerId !== GetSessionDataManager().userId)
		{
			if(roomData.habboGroupId !== 0)
			{
				TryVisitRoom(roomData.roomId);

				return;
			}

			switch(roomData.doorMode)
			{
				case RoomDataParser.DOORBELL_STATE:
					this.doorData.roomInfo = roomData;
					this.doorData.state = DoorStateType.START_DOORBELL;
					return;
				case RoomDataParser.PASSWORD_STATE:
					this.doorData.roomInfo = roomData;
					this.doorData.state = DoorStateType.START_PASSWORD;
					return;
			}
		}
		CreateRoomSession(roomData.roomId);
	}

	public sendSearch(value: string, code: string) {
		SendMessageComposer(new NavigatorSearchComposer(code, value));

		this.loading = true;
	}

	public processSearch() {
		if(!this.topLevelContext) return;

		let searchFilter = SearchOptions[this.searchIndex];

		if(!searchFilter) searchFilter = SearchOptions[0];

		const searchQuery = ((searchFilter.query ? (searchFilter.query + ':') : '') + this.searchValue);

		this.searched = true;
		this.sendSearch((searchQuery || ''), this.topLevelContext.code);
	}

	public reloadCurrentSearch(value?: string) {
		if(!this.ready)
		{
			this.needsSearch = true;

			return;
		}

		if(value !== undefined)
		{
			this.sendSearch(value, this.topLevelContext?.code || '');

			return;
		}

		if(this.pendingSearch.current)
		{
			this.sendSearch(this.pendingSearch.current.value, this.pendingSearch.current.code);

			this.pendingSearch.current = null;
			return;
		}

		if(this.searchResult)
		{
			this.sendSearch(this.searchResult.data, this.searchResult.code);

			return;
		}

		if(!this.topLevelContext) return;

		this.sendSearch('', this.topLevelContext.code);
	}

	private onRoomCreated(_e: RoomSessionEvent) {
		this.visible = false;
		this.creatorOpen = false;
	}

	private onFlatCreated(event: FlatCreatedEvent) {
		const parser = event.getParser();
		CreateRoomSession(parser.roomId);
	}

	private onUserEventCategories(event: UserEventCatsEvent) {
		const parser = event.getParser();
		this.eventCategories = parser.categories;
	}

	private onUserFlatCategories(event: UserFlatCatsEvent) {
		const parser = event.getParser();
		this.categories = parser.categories;
	}

	private onSearch(event: NavigatorSearchEvent) {
		const parser = event.getParser();

		this.searchResult = parser.result;
		this.loading = false;

		let currContext = this.topLevelContext;

		if (!currContext) currContext = ((this.topLevelContexts && this.topLevelContexts.length && this.topLevelContexts[0]) || undefined);
		if (!currContext) return;

		if ((parser.result.code !== currContext.code) && this.topLevelContexts && this.topLevelContexts.length) {
			for (const context of this.topLevelContexts) {
				if (context.code !== parser.result.code) continue;
				currContext = context;
			}
		}

		this.topLevelContext = currContext;
	}

	private onMetadata(event: NavigatorMetadataEvent) {
		const parser = event.getParser();
		this.topLevelContexts = parser.topLevelContexts;
		if (parser.topLevelContexts.length > 0) {
			this.topLevelContext = parser.topLevelContexts[0];
		}
	}

	private onGenericError(event: GenericErrorEvent) {
		const parser = event.getParser();
		this.loading = false;

		switch (parser.errorCode) {
			case -100002:
				this.doorData.state = DoorStateType.STATE_WRONG_PASSWORD;
				return;
			case 4009:
				this.simpleAlert(LocalizeText('navigator.alert.need.to.be.vip'), NotificationAlertType.DEFAULT, undefined, undefined, LocalizeText('generic.alert.title'));
				return;
			case 4010:
				this.simpleAlert(
					LocalizeText('navigator.alert.invalid_room_name'),
					NotificationAlertType.DEFAULT,
					undefined,
					undefined,
					LocalizeText('generic.alert.title')
				);
				return;
			case 4011:
				this.simpleAlert(
					LocalizeText('navigator.alert.cannot_perm_ban'),
					NotificationAlertType.DEFAULT,
					undefined,
					undefined,
					LocalizeText('generic.alert.title')
				);
				return;
			case 4013:
				this.simpleAlert(
					LocalizeText('navigator.alert.room_in_maintenance'),
					NotificationAlertType.DEFAULT,
					undefined,
					undefined,
					LocalizeText('generic.alert.title')
				);
				return;
		}
	}

	private onFlatAccessDenied(event: FlatAccessDeniedMessageEvent) {
		const parser = event.getParser();

		if (!parser.userName || parser.userName.length === 0) {
			this.doorData.state = DoorStateType.STATE_NO_ANSWER;
		}
	}

	private onRoomDoorbellAccepted(event: RoomDoorbellAcceptedEvent) {
		const parser = event.getParser();
		if (!parser.userName || parser.userName.length === 0) {
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
			LegacyExternalInterface.call('legacyTrack', 'navigator', 'private', [parser.roomId]);
		}
	}

	private onRoomForward(event: RoomForwardEvent) {
		const parser = event.getParser();
		TryVisitRoom(parser.roomId);
	}

	private onUserPermissions(event: UserPermissionsEvent) {
		const parser = event.getParser();
		this.eventMod = parser.securityLevel >= SecurityLevel.MODERATOR;
		this.roomPicker = parser.securityLevel >= SecurityLevel.COMMUNITY;
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
		const prevSettingsReceived = this.settingsReceived;
		this.homeRoomId = parser.homeRoomId;
		this.settingsReceived = true;

		if (prevSettingsReceived) {
			return;
		}

		let forwardType = -1;
		let forwardId = -1;

		if((GetConfiguration<string>('friend.id') !== undefined) && (parseInt(GetConfiguration<string>('friend.id')) > 0)) {
			forwardType = 0;
			SendMessageComposer(
				new FollowFriendMessageComposer(parseInt(GetConfiguration<string>('friend.id')))
			);
		}

		if (
			GetConfiguration<number>('forward.type') !== undefined &&
			GetConfiguration<number>('forward.id') !== undefined
		) {
			forwardType = parseInt(GetConfiguration<string>('forward.type'));
			forwardId = parseInt(GetConfiguration<string>('forward.id'));
		}

		if (forwardType === 2) {
			TryVisitRoom(forwardId);
		} else if (forwardType === -1 && parser.roomIdToEnter > 0) {
			if (parser.roomIdToEnter !== parser.homeRoomId) {
				CreateRoomSession(parser.roomIdToEnter);
			} else {
				CreateRoomSession(parser.homeRoomId);
			}
		}
	}

	private onSavedSearches(event: NavigatorSearchesEvent) {
		const parser = event.getParser();

		if (!parser) return;

		this.navigatorSearches = parser.searches;
	}

	private onGuestResult(event: GetGuestRoomResultEvent) {
		const parser = event.getParser();

		if (parser.roomEnter) {
			this.doorData = { roomInfo: undefined, state: DoorStateType.NONE };
			this.enteredGuestRoom = parser.data;
			this.currentRoomIsStaffPick = parser.staffPick;
			if (this.createdFlatId != parser.data.roomId && parser.data.displayRoomEntryAd) {
				if (GetConfiguration<boolean>('roomenterad.habblet.enabled', false))
					HabboWebTools.openRoomEnterAd();
			}
			this.createdFlatId = 0;
		} else if (parser.roomForward) {
			if (parser.data.ownerName !== GetSessionDataManager().userName && !parser.isGroupMember) {
				switch (parser.data.doorMode) {
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

			if (
				parser.data.doorMode === RoomDataParser.NOOB_STATE &&
				!GetSessionDataManager().isAmbassador &&
				!GetSessionDataManager().isRealNoob &&
				!GetSessionDataManager().isModerator
			)
				return;

			CreateRoomSession(parser.data.roomId);
		} else {
			this.enteredGuestRoom = parser.data;
			this.currentRoomIsStaffPick = parser.staffPick;
		}
	}
}


export const getNavigatorListener = () => NavigatorListener.getInstance();
