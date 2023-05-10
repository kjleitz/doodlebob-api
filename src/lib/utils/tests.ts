export function authHeaderForAccessToken(accessToken: string): string {
  return `Bearer ${accessToken}`;
}

export function wait(milliseconds: number): Promise<void>;
export function wait<R>(milliseconds: number, resolveWith: R): Promise<R>;
export function wait<R>(milliseconds: number, resolveWith?: R): Promise<R | void> {
  return new Promise((resolve, _reject) => {
    setTimeout(() => {
      typeof resolveWith === "undefined" ? resolve() : resolve(resolveWith);
    }, milliseconds);
  });
}
