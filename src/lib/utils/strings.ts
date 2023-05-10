const PASCAL_SPLITTER = /(?<!(?:^|[A-Z]))(?=[A-Z])|(?<!^)(?=[A-Z][a-z])/;
const SNAKE_SPLITTER = /(?<!(?:^|_))_+/;

export const splitPascal = (pascalCased: string): string[] => pascalCased.split(PASCAL_SPLITTER);

export const splitSnake = (snakeCased: string): string[] => snakeCased.split(SNAKE_SPLITTER);

export const capitalize = (value: string): string => value.charAt(0).toLocaleUpperCase() + value.slice(1);
