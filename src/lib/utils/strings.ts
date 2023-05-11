const PASCAL_SPLITTER = /(?<!(?:^|[A-Z]))(?=[A-Z])|(?<!^)(?=[A-Z][a-z])/;
const SNAKE_SPLITTER = /(?<!(?:^|_))_+/;
const MATCH_PUNCTUATED = /[.,?!]['"]?\s*$/;
const MATCH_LAST_NON_WHITESPACE_TO_END_OF_STRING = /\S\s*$/;

export const splitPascal = (pascalCased: string): string[] => pascalCased.split(PASCAL_SPLITTER);

export const splitSnake = (snakeCased: string): string[] => snakeCased.split(SNAKE_SPLITTER);

export const capitalize = (value: string): string => value.charAt(0).toLocaleUpperCase() + value.slice(1);

export const insertSubstring = (value: string, index: number, substring: string): string =>
  value.slice(0, index) + substring + value.slice(index);

const lastWhitespaceCharacterIndex = (value: string): number => {
  const spaceMatch = value.match(MATCH_LAST_NON_WHITESPACE_TO_END_OF_STRING);
  if (!spaceMatch) return value.length;

  // match includes last non-whitespace character, so subtract that one
  const numSpaces = spaceMatch[0].length - 1;
  return value.length - numSpaces;
};

export const punctuate = (value: string, punctuation = "."): string =>
  value.match(MATCH_PUNCTUATED) ? value : insertSubstring(value, lastWhitespaceCharacterIndex(value), punctuation);

// dealwithit.jpg
export const toSentence = (strings: string[], lastItemSeparator = "and"): string =>
  strings.length === 0
    ? ""
    : strings.length === 1
    ? strings[0]
    : strings.length === 2
    ? strings[0] + " " + (lastItemSeparator ? lastItemSeparator + " " : "") + strings[1]
    : strings.slice(0, strings.length - 1).join(", ") +
      ", " +
      (lastItemSeparator ? lastItemSeparator + " " : "") +
      strings[strings.length - 1];
