export const isNullish = (value: any): value is null | undefined => value === null || typeof value === "undefined";

export const exists = <T>(value: T): value is Exclude<T, null | undefined> => !isNullish(value);
