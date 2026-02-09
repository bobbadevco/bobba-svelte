import { MessengerGroupType, MessengerThreadChat } from '$lib/api';

export class MessengerThreadChatGroup
{
	private readonly _userId: number;
	chats: MessengerThreadChat[] = $state([]);
	private _type: number;

	constructor(userId: number, type = MessengerGroupType.PRIVATE_CHAT)
	{
		this._userId = userId;
		this._type = type;
	}

	public addChat(message: MessengerThreadChat): void
	{
		this.chats.push(message);
	}

	public get userId(): number
	{
		return this._userId;
	}

	public get type(): number
	{
		return this._type;
	}

	public set type(type: number)
	{
		this._type = type;
	}
}