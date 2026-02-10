import { GiftWrappingConfigurationParser } from '@nitrots/nitro-renderer';

export class GiftWrappingConfiguration
{
	private readonly _isEnabled: boolean = false;
	private readonly _price: number;
	private readonly _stuffTypes: number[];
	private readonly _boxTypes: number[];
	private readonly _ribbonTypes: number[];
	private readonly _defaultStuffTypes: number[];

	constructor(parser: GiftWrappingConfigurationParser)
	{
		this._isEnabled = parser.isEnabled;
		this._price = parser.price;
		this._boxTypes = parser.boxTypes;
		this._ribbonTypes = parser.ribbonTypes;
		this._stuffTypes = parser.giftWrappers;
		this._defaultStuffTypes = parser.giftFurnis;
	}

	public get isEnabled(): boolean
	{
		return this._isEnabled;
	}

	public get price(): number
	{
		return this._price;
	}

	public get stuffTypes(): number[]
	{
		return this._stuffTypes;
	}

	public get boxTypes(): number[]
	{
		return this._boxTypes;
	}

	public get ribbonTypes(): number[]
	{
		return this._ribbonTypes;
	}

	public get defaultStuffTypes(): number[]
	{
		return this._defaultStuffTypes;
	}
}