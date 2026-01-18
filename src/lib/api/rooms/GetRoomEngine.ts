import { type IRoomEngine } from '@nitrots/nitro-renderer';
import { GetNitroInstance } from '..';

export function GetRoomEngine(): IRoomEngine {
	return GetNitroInstance().roomEngine;
}
