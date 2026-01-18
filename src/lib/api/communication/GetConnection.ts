import type { IConnection } from '@nitrots/nitro-renderer';
import { GetCommunication } from '..';

export function GetConnection(): IConnection {
	return GetCommunication()?.connection;
}
