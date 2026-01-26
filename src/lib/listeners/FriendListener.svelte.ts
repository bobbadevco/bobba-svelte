import { MessengerFriend } from '$lib/api/friends/MessengerFriend';
import { registerMainEvent, registerMessageEvent } from '$lib/events';
import  {
	AcceptFriendMessageComposer,
	DeclineFriendMessageComposer, FollowFriendMessageComposer, FriendListFragmentEvent,
	FriendListUpdateComposer, FriendListUpdateEvent,
	type FriendParser,
	FriendRequestsEvent,
	MessengerInitComposer,
	MessengerInitEvent,
	NewFriendRequestEvent, NitroCommunicationDemoEvent, type NitroEvent, RequestFriendComposer, SetRelationshipStatusComposer } from '@nitrots/nitro-renderer';
import { GetSessionDataManager, SendMessageComposer } from '$lib/api';
import { MessengerSettings } from '$lib/api/friends/MessengerSettings';
import { MessengerRequest } from '$lib/api/friends/MessengerRequest';
import { CloneObject } from '$lib/api/utils/CloneObject';

class FriendListener {
	friends = $state<MessengerFriend[]>([]);
	requests = $state<MessengerRequest[]>([]);
	sentRequests = $state<number[]>([]);
	settings = $state<MessengerSettings>();
	friendListFragmentsReceived = $state<boolean[]>();
	friendListTotalFragments = $state(0);
	friendsListReady = $state(false);
	interval: ReturnType<typeof setInterval>;

	onlineFriends = $derived(this.friends.filter((friend) => friend.online).toSorted());
	offlineFriends = $derived(this.friends.filter((friend) => !friend.online).toSorted());

	private static instance: FriendListener;

	constructor() {
		this.interval = setInterval(() => {}, 10000000);
		registerMainEvent(NitroCommunicationDemoEvent.CONNECTION_AUTHENTICATED, this.init.bind(this));
	}

	public static getInstance(): FriendListener {
		if (!FriendListener.instance) {
			FriendListener.instance = new FriendListener();
		}
		return FriendListener.instance;
	}

	public followFriend(friend: MessengerFriend) {
		SendMessageComposer(new FollowFriendMessageComposer(friend.id));
	}

	public updateRelationship(friend: MessengerFriend, type: number) {
		if (type !== friend.relationshipStatus) {
			SendMessageComposer(new SetRelationshipStatusComposer(friend.id, type));
		}
	}

	public getFriend(userId: number): MessengerFriend | undefined {
		return this.friends.find((friend) => friend.id === userId);
	}

	public canRequestFriend(userId: number) {
		if (userId === GetSessionDataManager().userId) return false;
		if (this.getFriend(userId)) return false;
		if (this.requests.find((friend) => friend.requesterUserId === userId)) return false;
		return this.sentRequests.includes(userId);
	}

	public requestFriend(userId: number, userName: string) {
		if (!this.canRequestFriend(userId)) return false;
		this.sentRequests.push(userId);
		SendMessageComposer(new RequestFriendComposer(userName));
	}

	public requestResponse(requestId: number, flag: boolean) {
		if (requestId === -1 && !flag) {
			SendMessageComposer(new DeclineFriendMessageComposer(true));
		} else {
			const index = this.requests.findIndex((request) => (request.requestId === requestId));
			if (index == -1) return;
			if (flag) {
				SendMessageComposer(new AcceptFriendMessageComposer(this.requests[index].requestId));
			} else {
				SendMessageComposer(new DeclineFriendMessageComposer(false, this.requests[index].requestId));
			}

			this.requests.splice(index, 1);
		}
	}

	private init(_e: NitroEvent) {

		registerMessageEvent(MessengerInitEvent, this.onMessengerInit.bind(this));
		registerMessageEvent(FriendListFragmentEvent, this.onFriendListFragment.bind(this));
		registerMessageEvent(FriendListUpdateEvent, this.onFriendListUpdate.bind(this));
		registerMessageEvent(FriendRequestsEvent, this.onFriendRequests.bind(this));
		registerMessageEvent(NewFriendRequestEvent, this.onNewFriendRequest.bind(this));

		SendMessageComposer(new MessengerInitComposer());
		clearInterval(this.interval);
		this.interval = setInterval(() => SendMessageComposer(new FriendListUpdateComposer()), 120000);
	}

	public clearInterval() {
		clearInterval(this.interval);
	}

	private onMessengerInit(event: MessengerInitEvent) {
		const parser = event.getParser();
		this.friends = [];
		this.requests = [];
		this.friendListFragmentsReceived = undefined;
		this.friendListTotalFragments = 0;
		this.settings = new MessengerSettings(parser.userFriendLimit, parser.normalFriendLimit, parser.extendedFriendLimit, parser.categories);
	}

	private onFriendListFragment(event: FriendListFragmentEvent) {
		const parser = event.getParser();

		if(!this.friendListFragmentsReceived || (this.friendListTotalFragments !== parser.totalFragments))
		{
			this.friendListTotalFragments = parser.totalFragments;
			this.friendListFragmentsReceived = new Array(parser.totalFragments).fill(false);
		}

		if(this.friendListFragmentsReceived && (parser.totalFragments > 0) && (parser.fragmentNumber >= 0) && (parser.fragmentNumber < this.friendListFragmentsReceived.length))
		{
			this.friendListFragmentsReceived[parser.fragmentNumber] = true;

			if(this.friendListFragmentsReceived.every(Boolean)) this.friendsListReady = true;
		}

		for(const friend of parser.fragment)
		{
			const index = this.friends.findIndex(existingFriend => (existingFriend.id === friend.id));
			const newFriend = new MessengerFriend(friend);

			if(index > -1) this.friends[index] = newFriend;
			else this.friends.push(newFriend);
		}
	}

	private onFriendListUpdate(event: FriendListUpdateEvent) {
		const parser = event.getParser();

		if(!this.friendListFragmentsReceived) this.friendsListReady = true;

		const processUpdate = (friend: FriendParser) =>
		{
			const index = this.friends.findIndex(existingFriend => (existingFriend.id === friend.id));

			if(index === -1)
			{
				const newFriend = new MessengerFriend(friend);

				this.friends.unshift(newFriend);
			}
			else
			{
				this.friends[index].populate(friend);
			}
		}

		for(const friend of parser.addedFriends) processUpdate(friend);

		for(const friend of parser.updatedFriends) processUpdate(friend);

		for(const removedFriendId of parser.removedFriendIds)
		{
			const index = this.friends.findIndex(existingFriend => (existingFriend.id === removedFriendId));

			if(index > -1) this.friends.splice(index, 1);
		}
	}

	private onFriendRequests(event: FriendRequestsEvent) {
		const parser = event.getParser();

		for(const request of parser.requests)
		{
			const index = this.requests.findIndex(existing => (existing.requesterUserId === request.requesterUserId));

			if(index >= 0)
			{
				this.requests[index] = CloneObject(this.requests[index]);
				this.requests[index].populate(request);
			}
			else
			{
				const newRequest = new MessengerRequest(request);
				this.requests.push(newRequest);
			}
		}
	}

	private onNewFriendRequest(event: NewFriendRequestEvent) {
		const parser = event.getParser();
		const request = parser.request;
		const index = this.requests.findIndex(existing => (existing.requesterUserId === request.requesterUserId));
		if(index === -1)
		{
			const newRequest = new MessengerRequest(request);
			this.requests.push(newRequest);
		}
	}
}

export const getFriendListener = () => FriendListener.getInstance();