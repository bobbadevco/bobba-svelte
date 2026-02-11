import type { IPageLocalization, IPurchasableOffer } from '$lib/api';

export interface ICatalogPage
{
	readonly pageId: number;
	readonly layoutCode: string;
	readonly localization: IPageLocalization;
	readonly offers: IPurchasableOffer[];
	readonly acceptSeasonCurrencyAsCredits: boolean;
	readonly mode: number;
}