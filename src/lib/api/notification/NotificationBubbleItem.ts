import { NotificationBubbleType } from './NotificationBubbleType';

export class NotificationBubbleItem {
	private static ITEM_ID: number = -1;

	private readonly _id: number;
	private readonly _message: string;
	private readonly _notificationType: string;
	private readonly _iconUrl: string | undefined;
	private readonly _linkUrl: string | undefined;

	constructor(
		message: string,
		notificationType: string = NotificationBubbleType.INFO,
		iconUrl?: string,
		linkUrl?: string
	) {
		NotificationBubbleItem.ITEM_ID += 1;

		this._id = NotificationBubbleItem.ITEM_ID;
		this._message = message;
		this._notificationType = notificationType;
		this._iconUrl = iconUrl;
		this._linkUrl = linkUrl;
	}

	public get id(): number {
		return this._id;
	}

	public get message(): string {
		return this._message;
	}

	public get notificationType(): string {
		return this._notificationType;
	}

	public get iconUrl(): string | undefined {
		return this._iconUrl;
	}

	public get linkUrl(): string | undefined {
		return this._linkUrl;
	}
}
