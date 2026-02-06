import { MessengerGroupType, MessengerThreadChat } from '$lib/api';

export class MessengerThreadChatGroup
{
	private readonly _userId: number;
	private readonly _chats: MessengerThreadChat[];
	private _type: number;

	constructor(userId: number, type = MessengerGroupType.PRIVATE_CHAT)
	{
		this._userId = userId;
		this._chats = [];
		this._type = type;
	}

	public addChat(message: MessengerThreadChat): void
	{
		this._chats.push(message);
	}

	public get userId(): number
	{
		return this._userId;
	}

	public get chats(): MessengerThreadChat[]
	{
		return this._chats;
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