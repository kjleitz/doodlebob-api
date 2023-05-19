export type Nullish = null | undefined;

export type Optionalize<T extends Record<string, any>, K extends keyof T> = Partial<T> & Pick<T, K>;

export type Dict<T = any> = Record<string, T>;
