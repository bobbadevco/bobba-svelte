import type { IMessageComposer } from '@nitrots/nitro-renderer';
import { GetConnection } from '.';

export const SendMessageComposer = (event: IMessageComposer<unknown[]>) =>
	GetConnection().send(event);
