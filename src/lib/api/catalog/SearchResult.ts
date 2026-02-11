import type { ICatalogNode, IPurchasableOffer } from '$lib/api';

export class SearchResult
{
	constructor(
		public readonly searchValue: string,
		public readonly offers: IPurchasableOffer[],
		public readonly filteredNodes: ICatalogNode[])
	{}
}