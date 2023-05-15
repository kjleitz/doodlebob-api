import { exists } from "./checks";

export const parseBool = (value: any): boolean => {
  if (!value) return false;

  const firstChar = (("" + value).charAt(0) ?? "").toLowerCase();
  return firstChar === "t" || firstChar === "y" || firstChar === "1";
};

export const parsePresentInt = (value: any): number | null => (exists(value) ? parseInt("" + value, 10) : null);
