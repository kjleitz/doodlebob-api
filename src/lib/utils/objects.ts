export function omit<O extends Record<string, any>, K extends keyof O>(obj: O): O;
export function omit<O extends Record<string, any>, K extends keyof O>(obj: O, ...keys: K[]): Omit<O, K>;
export function omit<O extends Record<string, any>, K extends keyof O>(obj: O, ...keys: K[]): Record<string, any> {
  const copy = Object.assign({}, obj);
  keys.forEach((key) => delete copy[key]);
  return copy;
}

export function isObject(value: any): boolean {
  return Object.prototype.toString.call(value) === "[object Object]";
}
