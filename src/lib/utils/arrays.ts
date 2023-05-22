export const reverse = <T>(list: T[]): T[] => [...list].reverse();

export const uniq = <T, U>(list: T[], by?: (item: T) => U): T[] => {
  const seen = new Set<U | T>();
  const result: T[] = [];

  for (let item of list) {
    const current = by ? by(item) : item;
    if (seen.has(current)) continue;

    seen.add(current);
    result.push(item);
  }

  return result;
};

// If you know the list is already sorted, this is more efficient
export const sortedUniq = <T, U>(list: T[], by?: (item: T) => U): T[] => {
  if (list.length === 0) return [];

  const first = list[0];
  const result = [first];

  if (list.length === 1) return result;

  let previous = by ? by(first) : first;

  for (let i = 1; i < list.length; i++) {
    const item = list[i];
    const current = by ? by(item) : item;

    if (current !== previous) {
      result.push(item);
      previous = current;
    }
  }

  return result;
};

export const findLast = <T>(list: T[], finder: (item: T, index: number) => boolean): T | undefined => {
  for (let i = list.length - 1; i >= 0; i--) {
    const item = list[i];
    if (finder(item, i)) return item;
  }
};
