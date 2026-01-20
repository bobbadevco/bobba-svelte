import { browser } from '$app/environment';

export const GetLocalStorage = <T>(key: string): T | null => {
    if (!browser) return null;

    try {
        const item = window.localStorage.getItem(key);

        if (!item) return null;

        return JSON.parse(item) as T;
    } catch {
        return null;
    }
}
