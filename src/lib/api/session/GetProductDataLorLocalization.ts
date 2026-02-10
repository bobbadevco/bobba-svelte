import { GetSessionDataManager } from '$lib/api';
import type { IProductData } from '@nitrots/nitro-renderer';

export function GetProductDataForLocalization(localizationId: string): IProductData | undefined
{
	if(!localizationId) return undefined;

	return GetSessionDataManager().getProductData(localizationId);
}