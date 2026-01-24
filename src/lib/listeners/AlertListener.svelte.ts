import { NotificationAlertItem } from '$lib/api/notification/NotificationAlertItem';
import {
	GetConfiguration,
	GetNitroInstance, GetRoomEngine,
	GetSessionDataManager,
	LocalizeBadgeName,
	LocalizeText
} from '$lib/api';
import { NotificationAlertType } from '$lib/api/notification/NotificationAlertType';
import {
	AchievementNotificationMessageEvent,
	ActivityPointNotificationMessageEvent,
	ClubGiftNotificationEvent,
	HabboBroadcastMessageEvent,
	HotelClosesAndWillOpenAtEvent,
	ModeratorMessageEvent,
	NitroCommunicationDemoEvent,
	PetReceivedMessageEvent,
	RespectReceivedEvent,
	UserBannedMessageEvent,
	type NitroEvent,
	Vector3d,
	type IGetImageListener,
	MOTDNotificationEvent,
	PetLevelNotificationEvent,
	InfoFeedEnableMessageEvent,
	ClubGiftSelectedEvent,
	MaintenanceStatusMessageEvent,
	ModeratorCautionEvent,
	NotificationDialogMessageEvent,
	HotelWillCloseInMinutesEvent,
	HotelClosedAndOpensEvent,
	ConnectionErrorEvent,
	SimpleAlertMessageEvent
} from '@nitrots/nitro-renderer';
import { registerMainEvent, registerMessageEvent } from '$lib/events';
import { NotificationBubbleItem } from '$lib/api/notification/NotificationBubbleItem';
import { SvelteMap } from 'svelte/reactivity';
import { NotificationBubbleType } from '$lib/api/notification/NotificationBubbleType';
import { ProductImageUtility } from '$lib/api/utils/ProductImageUtility';

const cleanText = (text: string) => (text && text.length ? text.replace(/\\r/g, '\r') : '');

const getTimeZeroPadded = (time: number) =>
{
	const text = ('0' + time);

	return text.substr((text.length - 2), text.length);
}

class AlertListener {
	alerts = $state<NotificationAlertItem[]>([]);
	bubbleAlerts = $state<NotificationBubbleItem[]>([]);
	bubblesDisabled = $state(false);

	private static instance: AlertListener | undefined;

	constructor() {
		registerMainEvent(NitroCommunicationDemoEvent.CONNECTION_AUTHENTICATED, this.init.bind(this));
	}

	public static getInstance() {
		if (!AlertListener.instance) {
			AlertListener.instance = new AlertListener();
		}
		return AlertListener.instance;
	}

	public init(_e: NitroEvent) {
		registerMessageEvent(RespectReceivedEvent, this.onRespectReceived.bind(this));
		registerMessageEvent(HabboBroadcastMessageEvent, this.onHabboBroadcast.bind(this));
		registerMessageEvent(AchievementNotificationMessageEvent, this.onAchievementNotification.bind(this));
		registerMessageEvent(ClubGiftNotificationEvent, this.onClubNotification.bind(this));
		registerMessageEvent(ModeratorMessageEvent, this.onModerator.bind(this));
		registerMessageEvent(ActivityPointNotificationMessageEvent, this.onActivityPointNotification.bind(this));
		registerMessageEvent(UserBannedMessageEvent, this.onUserBanned.bind(this));
		registerMessageEvent(HotelClosesAndWillOpenAtEvent, this.onHotelClosesAndWillOpenAt.bind(this));
		registerMessageEvent(PetReceivedMessageEvent, this.onPetReceived.bind(this));
		registerMessageEvent(MOTDNotificationEvent, this.onMOTDNotification.bind(this));
		registerMessageEvent(PetLevelNotificationEvent, this.onPetLevelNotification.bind(this));
		registerMessageEvent(InfoFeedEnableMessageEvent, this.onInfoFeedEnable.bind(this));
		registerMessageEvent(ClubGiftSelectedEvent, this.onClubGiftSelected.bind(this));
		registerMessageEvent(MaintenanceStatusMessageEvent, this.onMaintenanceStatus.bind(this));
		registerMessageEvent(ModeratorCautionEvent, this.onModeratorCaution.bind(this));
		registerMessageEvent(NotificationDialogMessageEvent, this.onNotificationDialog.bind(this));
		registerMessageEvent(HotelWillCloseInMinutesEvent, this.onHotelWillCloseInMinutes.bind(this));
		registerMessageEvent(HotelClosedAndOpensEvent, this.onHotelClosedAndOpens.bind(this));
		registerMessageEvent(ConnectionErrorEvent, this.onConnectionError.bind(this));
		registerMessageEvent(SimpleAlertMessageEvent, this.onSimpleAlert.bind(this));
	}

	private onSimpleAlert(event: SimpleAlertMessageEvent)	{
		const parser = event.getParser();

		this.simpleAlert(
			LocalizeText(parser.alertMessage),
			NotificationAlertType.DEFAULT,
			undefined,
			undefined,
			LocalizeText(parser.titleMessage ? parser.titleMessage : 'notifications.broadcast.title')
		);
	}

	private onConnectionError(event: ConnectionErrorEvent) {
		const parser = event.getParser();

		switch (parser.errorCode) {
			default:
			case 0:
				this.simpleAlert(
					LocalizeText(
						'connection.server.error.desc',
						['errorCode'],
						[parser.errorCode.toString()]
					),
					NotificationAlertType.ALERT,
					undefined,
					undefined,
					LocalizeText('connection.server.error.title')
				);
				break;
			case 1001:
			case 1002:
			case 1003:
			case 1004:
			case 1005:
			case 1006:
			case 1007:
			case 1008:
			case 1009:
			case 1010:
			case 1011:
			case 1012:
			case 1013:
			case 1014:
			case 1015:
			case 1016:
			case 1017:
			case 1018:
			case 1019:
				event.connection.dispose();
				break;
			case 4013:
				this.simpleAlert(
					LocalizeText('connection.room.maintenance.desc'),
					NotificationAlertType.ALERT,
					undefined,
					undefined,
					LocalizeText('connection.room.maintenance.title')
				);
				break;
		}
	}

	private onHotelClosedAndOpens(event: HotelClosedAndOpensEvent) {
		const parser = event.getParser();

		this.simpleAlert(
			LocalizeText(
				'opening.hours.disconnected',
				['h', 'm'],
				[parser.openHour.toString(), parser.openMinute.toString()]
			),
			NotificationAlertType.DEFAULT,
			undefined,
			undefined,
			LocalizeText('opening.hours.title')
		);
	}

	private onHotelWillCloseInMinutes(event: HotelWillCloseInMinutesEvent) {
		const parser = event.getParser();

		this.simpleAlert(
			LocalizeText('opening.hours.shutdown', ['m'], [parser.openMinute.toString()]),
			NotificationAlertType.DEFAULT,
			undefined,
			undefined,
			LocalizeText('opening.hours.title')
		);
	}

	private onNotificationDialog(event: NotificationDialogMessageEvent) {
		const parser = event.getParser();

		this.showNotification(parser.type, parser.parameters);
	}

	private onModeratorCaution(event: ModeratorCautionEvent) {
		const parser = event.getParser();

		this.showModeratorMessage(parser.message, parser.url);
	}

	private onMaintenanceStatus(event: MaintenanceStatusMessageEvent)	{
		const parser = event.getParser();

		this.simpleAlert(
			LocalizeText(
				'maintenance.shutdown',
				['m', 'd'],
				[parser.minutesUntilMaintenance.toString(), parser.duration.toString()]
			),
			NotificationAlertType.DEFAULT,
			undefined,
			undefined,
			LocalizeText('opening.hours.title')
		);
	}

	private onClubGiftSelected(event: ClubGiftSelectedEvent) {
		const parser = event.getParser();

		if (!parser.products || !parser.products.length) return;

		const productData = parser.products[0];

		if (!productData) return;

		this.showSingleBubble(
			LocalizeText('notifications.text.club_gift.selected'),
			NotificationBubbleType.INFO,
			ProductImageUtility.getProductImageUrl(
				productData.productType,
				productData.furniClassId,
				productData.extraParam
			)
		);
	}

	private onInfoFeedEnable(event: InfoFeedEnableMessageEvent)	 {
		const parser = event.getParser();
		this.bubblesDisabled = !parser.enabled;
	}

	private onPetLevelNotification(event: PetLevelNotificationEvent) {
		const parser = event.getParser();
		let imageUrl: string | undefined;
		const imageResult = GetRoomEngine().getRoomObjectPetImage(
			parser.figureData.typeId,
			parser.figureData.paletteId,
			parseInt(parser.figureData.color, 16),
			new Vector3d(45 * 3),
			64,
			{} as IGetImageListener,
			true
		);

		if (imageResult) imageUrl = imageResult.getImage().src;

		this.showSingleBubble(
			LocalizeText(
				'notifications.text.petlevel',
				['pet_name', 'level'],
				[parser.petName, parser.level.toString()]
			),
			NotificationBubbleType.PETLEVEL,
			imageUrl
		);
	}

	private onMOTDNotification(event: MOTDNotificationEvent) {
		const parser = event.getParser();
		const messages = parser.messages.map(cleanText);
		const alertItem = new NotificationAlertItem(messages, NotificationAlertType.MOTD, undefined, undefined, LocalizeText('notifications.motd.title'));
		this.alerts.push(alertItem);
	}

	private onPetReceived(event: PetReceivedMessageEvent) {
		const parser = event.getParser();
		const text = LocalizeText('notifications.text.' + (parser.boughtAsGift ? 'petbought' : 'petreceived'));

		let imageUrl: string | undefined = undefined;

		const imageResult = GetRoomEngine().getRoomObjectPetImage(
			parser.pet.typeId,
			parser.pet.paletteId,
			parseInt(parser.pet.color, 16),
			new Vector3d(45 * 3),
			64,
			{} as IGetImageListener,
			true);

		if(imageResult) imageUrl = imageResult.getImage().src;

		this.showSingleBubble(text, NotificationBubbleType.PETLEVEL, imageUrl);
	}

	private onHotelClosesAndWillOpenAt(event: HotelClosesAndWillOpenAtEvent) {
		const parser = event.getParser();
		this.simpleAlert( LocalizeText(('opening.hours.' + (parser.userThrowOutAtClose ? 'disconnected' : 'closed')), [ 'h', 'm' ], [ getTimeZeroPadded(parser.openHour), getTimeZeroPadded(parser.openMinute) ]), NotificationAlertType.DEFAULT, undefined, undefined, LocalizeText('opening.hours.title'));
	}

	private onUserBanned(event: UserBannedMessageEvent) {
		const parser = event.getParser();
		this.showModeratorMessage(parser.message);
	}
	private onActivityPointNotification(event: ActivityPointNotificationMessageEvent) {
		const parser = event.getParser();
		if ((parser.amountChanged <= 0) || (parser.type !== 5)) return;
		const imageUrl = GetConfiguration<string>('currency.asset.icon.url', '').replace('%type%', parser.type.toString());

		this.showSingleBubble(LocalizeText('notifications.text.loyalty.received', [ 'AMOUNT' ], [ parser.amountChanged.toString() ]), NotificationBubbleType.INFO, imageUrl);
	}

	private onModerator(event: ModeratorMessageEvent) {
		const parser = event.getParser();
		this.showModeratorMessage(parser.message, parser.url, false);
	}

	private onClubNotification(event: ClubGiftNotificationEvent) {
		const parser = event.getParser();
		if (parser.numGifts <= 0) return;

		this.showSingleBubble(
			parser.numGifts.toString(),
			NotificationBubbleType.CLUBGIFT,
			undefined,
			`catalog/open/${GetConfiguration('catalog.links', {} as {[key: string]: string})['hc.hc_gifts']}`
		);
	}

	private onAchievementNotification(event: AchievementNotificationMessageEvent) {
		const parser = event.getParser();
		const text1 = LocalizeText('achievements.levelup.desc');
		const badgeName = LocalizeBadgeName(parser.data.badgeCode);
		const badgeImage = GetSessionDataManager().getBadgeUrl(parser.data.badgeCode);
		const internalLink = 'questengine/achievements/' + parser.data.category;

		this.showSingleBubble(
			text1 + ' ' + badgeName,
			NotificationBubbleType.ACHIEVEMENT,
			badgeImage,
			internalLink
		);
	}

	private onHabboBroadcast(event: HabboBroadcastMessageEvent) {
		const parser = event.getParser();
		this.simpleAlert(
			parser.message.replace(/\\r/g, '\r'),
			undefined,
			undefined,
			LocalizeText('notifications.broadcast.title')
		);
	}

	private onRespectReceived(event: RespectReceivedEvent) {
		const parser = event.getParser();

		if (parser.userId !== GetSessionDataManager().userId) return;

		const text1 = LocalizeText('notifications.text.respect.1');
		const text2 = LocalizeText(
			'notifications.text.respect.2',
			['count'],
			[parser.respectsReceived.toString()]
		);

		this.showSingleBubble(text1, NotificationBubbleType.RESPECT);
		this.showSingleBubble(text2, NotificationBubbleType.RESPECT);
	}

	private showModeratorMessage(message: string, url?: string, _showHabboWay: boolean = true) {
		this.simpleAlert(message, NotificationAlertType.DEFAULT, url, LocalizeText('mod.alert.link'), LocalizeText('mod.alert.title'));
	}

	public showNotification(type: string, options?: Map<string, string>) {
		if (!options) options = new SvelteMap<string, string>();

		const configuration = this.getNotificationConfig('notification.' + type) as {
			[key: string]: string;
		};
		if (configuration) for (const key in configuration) options.set(key, configuration[key]);

		if (type === 'floorplan_editor.error')
			options.set('message', options.get('message')?.replace(/[^a-zA-Z._ ]/g, '') || '');

		const title = this.getNotificationPart(options, type, 'title', true);
		const message =
			this.getNotificationPart(options, type, 'message', true)?.replace(/\\r/g, '\r') || '';
		const linkTitle = this.getNotificationPart(options, type, 'linkTitle', false);
		const linkUrl = this.getNotificationPart(options, type, 'linkUrl', false);
		const image = this.getNotificationImageUrl(options, type);

		if (options.get('display') === 'BUBBLE') {
			this.showSingleBubble(LocalizeText(message), NotificationBubbleType.INFO, image, linkUrl);
		} else {
			this.simpleAlert(LocalizeText(message), type, linkUrl, linkTitle, title, image);
		}
	}

	private getMainNotificationConfig() {
		return GetConfiguration<{
			[key: string]: { delivery?: string; display?: string; title?: string; image?: string };
		}>('notification', {});
	}

	private getNotificationConfig(key: string) {
		const mainNotificationConfig = this.getMainNotificationConfig();
		if (!mainNotificationConfig) {
			return undefined;
		}
		return mainNotificationConfig[key];
	}

	private getNotificationPart(
		options: Map<string, string>,
		type: string,
		key: string,
		localize: boolean
	) {
		if (options.has(key)) return options.get(key);

		const localizeKey = ['notification', type, key].join('.');

		if (GetNitroInstance().localization.hasValue(localizeKey) || localize)
			return LocalizeText(localizeKey, Array.from(options.keys()), Array.from(options.values()));

		return undefined;
	}

	private getNotificationImageUrl(options: Map<string, string>, type: string) {
		let imageUrl = options.get('image');

		if (!imageUrl)
			imageUrl = GetConfiguration<string>('image.library.notifications.url', '').replace(
				'%image%',
				type.replace(/\./g, '_')
			);

		return LocalizeText(imageUrl);
	}

	public simpleAlert(
		message: string,
		type?: string,
		clickUrl?: string,
		clickUrlText?: string,
		title?: string,
		imageUrl?: string
	) {
		if (!title || !title.length) title = LocalizeText('notifications.broadcast.title');
		if (!type || !type.length) type = NotificationAlertType.DEFAULT;
		const alertItem = new NotificationAlertItem(
			[cleanText(message)],
			type,
			clickUrl,
			clickUrlText,
			title,
			imageUrl
		);

		this.alerts.push(alertItem);
	}

	public closeAlert(alert: NotificationAlertItem) {
		this.alerts = this.alerts.filter((v) => v !== alert);
	}

	public showSingleBubble(
		message: string,
		type: string,
		imageUrl: string | undefined = undefined,
		internalLink: string | undefined = undefined
	) {
		if (this.bubblesDisabled) return;

		const notificationItem = new NotificationBubbleItem(message, type, imageUrl, internalLink);
		this.bubbleAlerts.push(notificationItem);
	}

	private closeBubble(item: NotificationBubbleItem) {
		this.bubbleAlerts = this.bubbleAlerts.filter((v) => v !== item);
	}
}

export const getAlertListener = () => AlertListener.getInstance();