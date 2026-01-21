import { NotificationAlertType } from './NotificationAlertType';

export class NotificationAlertItem
{
	private static ITEM_ID: number = -1;

	private readonly _id: number;
	private readonly _messages: string[];
	private _alertType: string;
	private readonly _clickUrl: string | undefined;
	private readonly _clickUrlText: string | undefined;
	private readonly _title: string | undefined;
	private readonly _imageUrl: string | undefined;

	constructor(messages: string[], alertType: string = NotificationAlertType.DEFAULT, clickUrl: string | undefined = undefined, clickUrlText: string | undefined = undefined,  title: string | undefined = undefined, imageUrl: string | undefined = undefined)
	{
		NotificationAlertItem.ITEM_ID += 1;

		this._id = NotificationAlertItem.ITEM_ID;
		this._messages = messages;
		this._alertType = alertType;
		this._clickUrl = clickUrl;
		this._clickUrlText = clickUrlText;
		this._title = title;
		this._imageUrl = imageUrl;
	}

	public get id(): number
	{
		return this._id;
	}

	public get messages(): string[]
	{
		return this._messages;
	}

	public set alertType(alertType: string)
	{
		this._alertType = alertType;
	}

	public get alertType(): string
	{
		return this._alertType;
	}

	public get clickUrl(): string |undefined
	{
		return this._clickUrl;
	}

	public get clickUrlText(): string | undefined
	{
		return this._clickUrlText;
	}

	public get title(): string | undefined
	{
		return this._title;
	}

	public get imageUrl(): string | undefined
	{
		return this._imageUrl;
	}
}
