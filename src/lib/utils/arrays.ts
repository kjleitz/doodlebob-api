export const reverse = <T>(list: T[]): T[] => [...list].reverse();

export const uniq = <T, U>(list: T[], by?: (item: T) => U): T[] => {
  const seen = new Set<U | T>();
  const result: T[] = [];

  for (let item of list) {
    const key = by ? by(item) : item;
    if (seen.has(key)) continue;

    seen.add(key);
    result.push(item);
  }

  return result;
};

export const findLast = <T>(list: T[], finder: (item: T, index: number) => boolean): T | undefined => {
  for (let i = list.length - 1; i >= 0; i--) {
    const item = list[i];
    if (finder(item, i)) return item;
  }
};
