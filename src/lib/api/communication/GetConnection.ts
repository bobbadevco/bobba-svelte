import { GetCommunication } from '$lib/api/GetCommunication';
import type { IConnection } from '@nitrots/nitro-renderer';

export function GetConnection(): IConnection {
	return GetCommunication()?.connection;
}
