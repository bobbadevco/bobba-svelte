export class MessengerThreadChat
{
	public static CHAT: number = 0;
	public static ROOM_INVITE: number = 1;
	public static STATUS_NOTIFICATION: number = 2;
	public static SECURITY_NOTIFICATION: number = 3;

	private readonly _type: number;
	private readonly _senderId: number | undefined;
	private readonly _message: string;
	private readonly _secondsSinceSent: number;
	private readonly _extraData: string | undefined;
	private readonly _date: Date;

	constructor(senderId: number | undefined, message: string, secondsSinceSent: number = 0, extraData?: string, type: number = 0)
	{
		this._type = type;
		this._senderId = senderId;
		this._message = message;
		this._secondsSinceSent = secondsSinceSent;
		this._extraData = extraData;
		this._date = new Date();
	}

	public get type(): number
	{
		return this._type;
	}

	public get senderId(): number | undefined
	{
		return this._senderId;
	}

	public get message(): string
	{
		return this._message;
	}

	public get secondsSinceSent(): number
	{
		return this._secondsSinceSent;
	}

	public get extraData(): string | undefined
	{
		return this._extraData;
	}

	public get date(): Date
	{
		return this._date;
	}
}