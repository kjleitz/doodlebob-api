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
