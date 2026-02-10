import type { IFurnitureData } from '@nitrots/nitro-renderer';
import { GetSessionDataManager, ProductTypeEnum } from '$lib/api';

export function GetFurnitureData(furniClassId: number, productType: string): IFurnitureData | undefined
{
	let furniData: IFurnitureData | undefined;

	switch(productType.toLowerCase())
	{
		case ProductTypeEnum.FLOOR:
			furniData = GetSessionDataManager().getFloorItemData(furniClassId);
			break;
		case ProductTypeEnum.WALL:
			furniData = GetSessionDataManager().getWallItemData(furniClassId);
			break;
	}

	return furniData;
}