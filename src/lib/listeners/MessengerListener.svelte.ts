import { registerMainEvent, registerMessageEvent } from '$lib/events';
import { NewConsoleMessageEvent, NitroCommunicationDemoEvent, type NitroEvent,
	RoomInviteErrorEvent, RoomInviteEvent, SendMessageComposer as SendMessageComposerPacket } from '@nitrots/nitro-renderer';
import { GetSessionDataManager, LocalizeText,
	MessengerIconState, MessengerThread, MessengerThreadChat, PlaySound, SendMessageComposer } from '$lib/api';
import { getFriendListener } from '$lib/listeners/FriendListener.svelte';
import { CloneObject } from '$lib/api/utils/CloneObject';
import { SoundNames } from '$lib/api/utils/SoundNames';
import { NotificationAlertType } from '$lib/api/notification/NotificationAlertType';
import { getAlertListener } from '$lib/listeners/AlertListener.svelte';

class MessengerListener {
	private static instance: MessengerListener;
	messageThreads = $state<MessengerThread[]>([]);
	hiddenThreadIds = $state<number[]>([]);
	activeThreadId = $state(-1);

	visibleThreads = $derived.by(() => this.messageThreads.filter(thread => (this.hiddenThreadIds.indexOf(thread.threadId) === -1)));
	activeThread = $derived.by(() => ((this.activeThreadId > 0) && this.visibleThreads.find(thread => (thread.threadId === this.activeThreadId) || null)));

	iconState = $derived.by(() => {
		if(!this.visibleThreads.length) return MessengerIconState.HIDDEN;

		let isUnread = false;

		for(const thread of this.visibleThreads)
		{
			if(thread.unreadCount > 0)
			{
				isUnread = true;

				break;
			}
		}

		if(isUnread) return MessengerIconState.UNREAD;

		return MessengerIconState.SHOW;
	});

	constructor(){
		registerMainEvent(NitroCommunicationDemoEvent.CONNECTION_AUTHENTICATED, this.init.bind(this));
	}

	public static getInstance() {
		if(!MessengerListener.instance) {
			MessengerListener.instance = new MessengerListener();
		}
		return MessengerListener.instance;
	}

	public getMessageThread(userId: number) {
		let thread = this.messageThreads.find(thread => (thread.participant && (thread.participant.id === userId)));

		if(!thread)
		{
			const friend = getFriendListener().getFriend(userId);

			if(!friend) return undefined;

			thread = new MessengerThread(friend);

			thread.addMessage(0, LocalizeText('messenger.moderationinfo'), 0, undefined, MessengerThreadChat.SECURITY_NOTIFICATION);

			thread.setRead();
			this.messageThreads.push(thread);
		}
		else
		{
			const hiddenIndex = this.hiddenThreadIds.indexOf(thread.threadId);

			if(hiddenIndex >= 0)
			{
				this.hiddenThreadIds.splice(hiddenIndex, 1);
			}
		}

		return thread;
	}

	public closeThread(threadId: number) {
		if(this.activeThreadId === threadId) this.activeThreadId = -1;
		if(this.hiddenThreadIds.indexOf(threadId) >= 0) return;
		this.hiddenThreadIds.push(threadId);
	}

	public sendMessage(thread: MessengerThread, senderId: number, messageText: string, secondsSinceSent: number, extraData?: string, messageType: number = MessengerThreadChat.CHAT) {
		if(!thread || !messageText || !messageText.length) return;

		const ownMessage = (senderId === GetSessionDataManager().userId);

		if(ownMessage && (messageText.length <= 255)) SendMessageComposer(new SendMessageComposerPacket(thread.participant.id, messageText));

		const index = this.messageThreads.findIndex(newThread => (newThread.threadId === thread.threadId));

		if(index === -1) return;

		thread = CloneObject(this.messageThreads[index]);

		if(ownMessage && (thread.groups.length === 1)) PlaySound(SoundNames.MESSENGER_NEW_THREAD);

		thread.addMessage(((messageType === MessengerThreadChat.ROOM_INVITE) ? undefined : senderId), messageText, secondsSinceSent, extraData, messageType);

		if(this.activeThreadId === thread.threadId) thread.setRead();

		this.messageThreads[index] = thread;

		if(!ownMessage && thread.unread) PlaySound(SoundNames.MESSENGER_MESSAGE_RECEIVED);
	}

	private init(_e: NitroEvent) {
		registerMessageEvent(NewConsoleMessageEvent, this.onNewConsoleMessage.bind(this));
		registerMessageEvent(RoomInviteEvent, this.onRoomInvite.bind(this));
		registerMessageEvent(RoomInviteErrorEvent, this.onRoomInviteError.bind(this));
	}

	private onNewConsoleMessage(event: NewConsoleMessageEvent) {
		const parser = event.getParser();
		const thread = this.getMessageThread(parser.senderId);
		if (!thread) return;

		this.sendMessage(thread, parser.senderId, parser.messageText, parser.secondsSinceSent, parser.extraData);
	}

	private onRoomInvite(event: RoomInviteEvent) {
		const parser = event.getParser();
		const thread = this.getMessageThread(parser.senderId);

		if(!thread) return;

		this.sendMessage(thread, parser.senderId, parser.messageText, 0, undefined, MessengerThreadChat.ROOM_INVITE);
	}

	private onRoomInviteError(event: RoomInviteErrorEvent) {
		const parser = event.getParser();

		getAlertListener().simpleAlert(`Received room invite error: ${ parser.errorCode },recipients: ${ parser.failedRecipients }`, NotificationAlertType.DEFAULT, undefined, undefined, LocalizeText('friendlist.alert.title'));
	}
}


export const getMessengerListener = () => MessengerListener.getInstance();