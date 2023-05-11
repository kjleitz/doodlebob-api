import { exists } from "./checks";

export const VALID_USERNAME_CHARACTERS = ["A-Z", "a-z", "0-9", "+", ".", "@", "_", "-"];
export const MATCH_INVALID_USERNAME_CHAR = /[^A-Za-z0-9+.@_-]/;
export const MIN_PASSWORD_LENGTH = 6;

export const isLength = (value: string | any[], length: number): boolean => exists(value) && value.length === length;
export const isMinLength = (value: string | any[], min: number): boolean => exists(value) && value.length >= min;
export const isMaxLength = (value: string | any[], max: number): boolean => exists(value) && value.length <= max;
export const lengthBetween = (value: string | any[], min: number, max: number): boolean =>
  isMinLength(value, min) && isMaxLength(value, max);

export const isBetween = (value: number, min: number, max: number): boolean =>
  exists(value) && (min <= max ? min <= value && value <= max : max <= value && value <= min);

export const isIn = (value: any, values: any[]): boolean => values.includes(value);

export const validUsername = (value: any): boolean =>
  isMinLength(value, 1) && !value.match(MATCH_INVALID_USERNAME_CHAR);
export const validPassword = (value: any): boolean => isMinLength(value, MIN_PASSWORD_LENGTH);
