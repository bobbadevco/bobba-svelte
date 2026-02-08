import { UserProfileComposer } from '@nitrots/nitro-renderer';
import { SendMessageComposer } from '$lib/api';

export function GetUserProfile(userId: number): void
{
	SendMessageComposer(new UserProfileComposer(userId));
}