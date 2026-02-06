import { MessengerFriend } from '$lib/api';
import { MessengerThreadChatGroup } from '$lib/api/friends/MessengerThreadChatGroup';
import { MessengerThreadChat } from '$lib/api/friends/MessengerThreadChat';
import { MessengerGroupType } from '$lib/api/friends/MessengerGroupType';
import { GetGroupChatData } from '$lib/api/friends/GetGroupChatData';

export class MessengerThread {
	public static MESSAGE_RECEIVED: string = 'MT_MESSAGE_RECEIVED';
	public static THREAD_ID: number = 0;

	private readonly _threadId: number;
	private readonly _participant: MessengerFriend;
	private readonly _groups: MessengerThreadChatGroup[];
	private _lastUpdated: Date;
	private _unreadCount: number;

	constructor(participant: MessengerFriend)
	{
		this._threadId = ++MessengerThread.THREAD_ID;
		this._participant = participant;
		this._groups = [];
		this._lastUpdated = new Date();
		this._unreadCount = 0;
	}

	public addMessage(senderId: number | undefined, message: string, secondsSinceSent: number = 0, extraData?: string, type: number = 0)
	{
		const isGroupChat = (senderId && senderId < 0 && extraData);
		const userId = (isGroupChat ? GetGroupChatData(extraData)?.userId : senderId) || senderId || 0;

		const group = this.getLastGroup(userId);

		if(!group) return;

		if(isGroupChat) group.type = MessengerGroupType.GROUP_CHAT;

		const chat = new MessengerThreadChat(senderId, message, secondsSinceSent, extraData, type);

		group.addChat(chat);

		this._lastUpdated = new Date();

		this._unreadCount++;

		return chat;
	}

	private getLastGroup(userId: number): MessengerThreadChatGroup
	{
		let group = this._groups[(this._groups.length - 1)];

		if(group && (group.userId === userId)) return group;

		group = new MessengerThreadChatGroup(userId);

		this._groups.push(group);

		return group;
	}

	public setRead(): void
	{
		this._unreadCount = 0;
	}

	public get threadId(): number
	{
		return this._threadId;
	}

	public get participant(): MessengerFriend
	{
		return this._participant;
	}

	public get groups(): MessengerThreadChatGroup[]
	{
		return this._groups;
	}

	public get lastUpdated(): Date
	{
		return this._lastUpdated;
	}

	public get unreadCount(): number
	{
		return this._unreadCount;
	}

	public get unread(): boolean
	{
		return (this._unreadCount > 0);
	}
}