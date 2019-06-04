import stableStringify from 'json-stable-stringify';
import React from 'react';

export type Interner = <T extends any>(orginal: T) => T;


export const makeInterner = (): Interner => {
    const cache = new Map<string, any>();

    return (value) => {
        const key = stableStringify(value);
        if (cache.has(key)) {
            return cache.get(key);
        } else {
            cache.set(key, value);
            return value;
        }
    }
};

export const useInterner = () => {
    return React.useMemo(makeInterner, []);
};