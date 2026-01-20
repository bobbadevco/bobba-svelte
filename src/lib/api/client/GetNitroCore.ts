import { type INitroCore } from '@nitrots/nitro-renderer';
import { GetNitroInstance } from "./GetNitroInstance";

export function GetNitroCore(): INitroCore {
	return GetNitroInstance().core;
}
