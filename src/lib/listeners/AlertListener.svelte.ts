import { NotificationAlertItem } from '$lib/api/notification/NotificationAlertItem';
import { GetConfiguration, GetNitroInstance, LocalizeText } from '$lib/api';
import { NotificationAlertType } from '$lib/api/notification/NotificationAlertType';

const cleanText = (text: string) => (text && text.length ? text.replace(/\\r/g, '\r') : '');

class AlertListener {
	alerts = $state<NotificationAlertItem[]>([]);
	private static instance: AlertListener | undefined;

	constructor() {}

	public static getInstance() {
		if (!AlertListener.instance) {
			AlertListener.instance = new AlertListener();
		}
		return AlertListener.instance;
	}

	private getMainNotificationConfig() {
		return GetConfiguration<{
			[key: string]: { delivery?: string; display?: string; title?: string; image?: string };
		}>('notification', {});
	}

	private getNotificationConfig(key: string) {
		const mainNotificationConfig = this.getMainNotificationConfig();
		if (!mainNotificationConfig) {
			return null;
		}
		return mainNotificationConfig[key];
	}

	private getNotificationPart(options: Map<string, string>, type: string, key: string, localize: boolean) {
		if(options.has(key)) return options.get(key);

		const localizeKey = [ 'notification', type, key ].join('.');

		if(GetNitroInstance().localization.hasValue(localizeKey) || localize) return LocalizeText(localizeKey, Array.from(options.keys()), Array.from(options.values()));

		return null;
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

	public simpleAlert(message: string, type?: string, clickUrl?: string, clickUrlText?: string, title?: string, imageUrl?: string) {
		if(!title || !title.length) title = LocalizeText('notifications.broadcast.title');
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
}

export const getAlertListener = () => AlertListener.getInstance();