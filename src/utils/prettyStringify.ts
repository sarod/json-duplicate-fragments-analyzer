export const prettyStringify = (value: any): string => {
    return JSON.stringify(value, null, '  ');
}
