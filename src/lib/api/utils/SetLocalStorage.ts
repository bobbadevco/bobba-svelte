import { browser } from '$app/environment';

export const SetLocalStorage = <T>(key: string, value: T) => {
    if (!browser) return;

    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
        return;
    }
}
