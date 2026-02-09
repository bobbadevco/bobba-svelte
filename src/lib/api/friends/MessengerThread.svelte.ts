import { MessengerFriend } from '$lib/api';
import { MessengerThreadChatGroup } from '$lib/api/friends/MessengerThreadChatGroup.svelte';
import { MessengerThreadChat } from '$lib/api/friends/MessengerThreadChat';
import { MessengerGroupType } from '$lib/api/friends/MessengerGroupType';
import { GetGroupChatData } from '$lib/api/friends/GetGroupChatData';
import { SvelteDate } from 'svelte/reactivity';

export class MessengerThreadSvelte {
	public static MESSAGE_RECEIVED: string = 'MT_MESSAGE_RECEIVED';
	public static THREAD_ID: number = 0;

	private readonly _threadId: number;
	private readonly _participant: MessengerFriend;
	groups: MessengerThreadChatGroup[] = $state([]);
	lastUpdated: SvelteDate = new SvelteDate();
	unreadCount: number = $state(0);
	unread = $derived(this.unreadCount > 0);

	constructor(participant: MessengerFriend)
	{
		this._threadId = ++MessengerThreadSvelte.THREAD_ID;
		this._participant = participant;
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

		this.lastUpdated = new SvelteDate();

		this.unreadCount++;

		return chat;
	}

	private getLastGroup(userId: number): MessengerThreadChatGroup
	{
		let group = this.groups[(this.groups.length - 1)];

		if(group && (group.userId === userId)) return group;

		group = new MessengerThreadChatGroup(userId);

		this.groups.push(group);

		return group;
	}

	public setRead(): void
	{
		this.unreadCount = 0;
	}

	public get threadId(): number
	{
		return this._threadId;
	}

	public get participant(): MessengerFriend
	{
		return this._participant;
	}

}