export function stringifyJson(value: any): string {
  return JSON.stringify(value, null, 2);
}

export function logJson(label: string, value: any): void;
export function logJson(value: any): void;
export function logJson(...args: [label: any, value?: any]): void {
  if (args.length === 1) {
    console.log(stringifyJson(args[0]));
  } else {
    console.log(args[0], stringifyJson(args[1]));
  }
}

export const printJson = logJson;
