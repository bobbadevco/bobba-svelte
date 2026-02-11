import { ClubGiftInfoParser, ClubOfferData, HabboGroupEntryData, MarketplaceConfigurationMessageParser } from '@nitrots/nitro-renderer';
import { CatalogPetPalette, GiftWrappingConfiguration } from '$lib/api';

export interface ICatalogOptions
{
	groups?: HabboGroupEntryData[];
	petPalettes?: CatalogPetPalette[];
	clubOffers?: ClubOfferData[];
	clubGifts?: ClubGiftInfoParser;
	giftConfiguration?: GiftWrappingConfiguration;
	marketplaceConfiguration?: MarketplaceConfigurationMessageParser;
}