import type { IFurnitureData, IProductData } from '@nitrots/nitro-renderer';
import type { IPurchasableOffer } from '$lib/api';

export interface IProduct
{
	getIconUrl(offer?: IPurchasableOffer): string | undefined;
	productType: string;
	productClassId: number;
	extraParam: string;
	productCount: number;
	productData: IProductData;
	furnitureData: IFurnitureData;
	isUniqueLimitedItem: boolean;
	uniqueLimitedItemSeriesSize: number;
	uniqueLimitedItemsLeft: number;
}