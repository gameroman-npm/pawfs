import { createRequire } from "node:module";
import { isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function resolveAbsolute(input: string, root?: string): string {
  return isAbsolute(input) ? input : resolve(root || ".", input);
}

export function resolveFrom(
  root: URL | string,
  ident: string,
  silent: true,
): string | undefined;
export function resolveFrom(
  root: URL | string,
  ident: string,
  silent?: false,
): string;
export function resolveFrom(
  root: URL | string,
  ident: string,
  silent?: boolean,
): string | undefined;
export function resolveFrom(
  root: URL | string,
  ident: string,
  silent?: boolean,
) {
  try {
    const r =
      root instanceof URL || root.startsWith("file://")
        ? join(fileURLToPath(root), "noop.js")
        : join(resolveAbsolute(root), "noop.js");

    return createRequire(r).resolve(ident);
  } catch (err) {
    if (!silent) throw err;
  }
}

export function resolveCwd(ident: string, silent: true): string | undefined;
export function resolveCwd(ident: string, silent?: false): string;
export function resolveCwd(ident: string, silent?: boolean): string | undefined;
export function resolveCwd(ident: string, silent?: boolean) {
  return resolveFrom(resolve(), ident, silent);
}
