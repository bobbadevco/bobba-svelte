import { HabboClubLevelEnum } from '@nitrots/nitro-renderer';
import { GetConfiguration, GetSessionDataManager } from '..';

export function GetClubMemberLevel(): number
{
	if(GetConfiguration<boolean>('hc.disabled', false)) return HabboClubLevelEnum.VIP;

	return GetSessionDataManager().clubLevel;
}