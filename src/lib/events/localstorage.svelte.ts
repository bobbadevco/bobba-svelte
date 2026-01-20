import { GetLocalStorage, SetLocalStorage } from "$lib/api";
import { NitroLogger } from "@nitrots/nitro-renderer";

export class LocalStorage<T> {
    private _current = $state<T>() as T;

    constructor(
        private key: string,
        initialValue: T
    ) {
        let value = initialValue;

        if (typeof window !== 'undefined') {
            try {
                const item = GetLocalStorage<T>(key);

                if (item !== null) value = item;
            } catch {
                // ignore
            }
        }

        this._current = value;
    }

    get current() {
        return this._current;
    }

    set current(value: T) {
        this.setValue(value);
    }

    setValue = (value: T | ((prev: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(this._current) : value;

            this._current = valueToStore;

            if (typeof window !== 'undefined') SetLocalStorage(this.key, valueToStore);
        } catch (error) {
            NitroLogger.error(error);
        }
    }
}

export const registerLocalStorage = <T>(key: string, initialValue: T) => {
    return new LocalStorage(key, initialValue);
}
