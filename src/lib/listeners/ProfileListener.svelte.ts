import  {
	ExtendedProfileChangedMessageEvent, NitroCommunicationDemoEvent,
	RelationshipStatusInfoEvent, RelationshipStatusInfoMessageParser,
	RoomEngineObjectEvent, RoomObjectCategory, RoomObjectType, UserCurrentBadgesComposer, UserCurrentBadgesEvent,
	UserProfileEvent, UserProfileParser, UserRelationshipsComposer } from '@nitrots/nitro-renderer';
import { GetRoomSession, SendMessageComposer } from '$lib/api';
import { registerMainEvent, registerMessageEvent, registerRoomEngineEvent } from '$lib/events';
import { GetUserProfile } from '$lib/api/user/GetUserProfile';

class ProfileListener {
	userProfile = $state<UserProfileParser | null>(null);
	userBadges: string[] = $state<string[]>([]);
	userRelationships = $state<RelationshipStatusInfoMessageParser | null>(null);

	private static instance: ProfileListener;

	constructor() {
		registerMainEvent(NitroCommunicationDemoEvent.CONNECTION_AUTHENTICATED, this.init.bind(this));
	}

	public init() {
		registerMessageEvent(UserCurrentBadgesEvent, this.onUserBadges.bind(this));
		registerMessageEvent(RelationshipStatusInfoEvent, this.onUserRelationships.bind(this));
		registerMessageEvent(UserProfileEvent, this.onUserProfile.bind(this));
		registerMessageEvent(ExtendedProfileChangedMessageEvent, this.onProfileUpdate.bind(this));
		registerRoomEngineEvent(RoomEngineObjectEvent.SELECTED, this.onRoomEngine.bind(this));
	}

	public static getInstance(): ProfileListener {
		if (!ProfileListener.instance) {
			ProfileListener.instance = new ProfileListener();
		}
		return ProfileListener.instance;
	}

	private onUserBadges(event: UserCurrentBadgesEvent) {
		const parser = event.getParser();

		if(!this.userProfile || (parser.userId !== this.userProfile.id)) return;

		this.userBadges = parser.badges;
	}

	private onUserRelationships(event: RelationshipStatusInfoEvent) {
		const parser = event.getParser();

		if(!this.userProfile || (parser.userId !== this.userProfile.id)) return;

		this.userRelationships = parser;
	}

	private onUserProfile(event: UserProfileEvent) {
		const parser = event.getParser();

		const isSameProfile = (this.userProfile && (this.userProfile.id === parser.id));

		this.userProfile = parser;

		if (!isSameProfile) {
			this.userBadges = [];
			this.userRelationships = null;
		}

		SendMessageComposer(new UserCurrentBadgesComposer(parser.id));
		SendMessageComposer(new UserRelationshipsComposer(parser.id));
	}

	private onProfileUpdate(event: ExtendedProfileChangedMessageEvent) {
		const parser = event.getParser();

		if(parser.userId != this.userProfile?.id) return;

		GetUserProfile(parser.userId);
	}

	private onRoomEngine(event: RoomEngineObjectEvent) {
		if(!this.userProfile) return;

		if(event.category !== RoomObjectCategory.UNIT) return;

		const userData = GetRoomSession().userDataManager.getUserDataByIndex(event.objectId);

		if(userData.type !== RoomObjectType.USER) return;

		GetUserProfile(userData.webID);
	}
}

export const getProfileListener = () => ProfileListener.getInstance();