import { type INitroCore } from '@nitrots/nitro-renderer';
import { GetNitroInstance } from "$lib/api/GetNitroInstance";

export function GetNitroCore(): INitroCore {
	return GetNitroInstance().core;
}
