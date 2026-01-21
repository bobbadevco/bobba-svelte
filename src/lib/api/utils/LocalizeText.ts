import { GetNitroInstance } from '..';

export function LocalizeText(
	key: string,
	parameters: string[] = [],
	replacements: string[]  = []
): string {
	return GetNitroInstance().getLocalizationWithParameters(key, parameters, replacements);
}
