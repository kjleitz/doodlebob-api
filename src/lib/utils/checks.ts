export const isNullish = (value: any): value is null | undefined | void =>
  value === null || typeof value === "undefined";

export const exists = <T>(value: T): value is Exclude<T, null | undefined | void> => !isNullish(value);
