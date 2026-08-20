import { dirname } from "node:path";

import { resolveAbsolute } from "./resolve";
import type { Options } from "./types";

export function walkUp(base: string, options?: Options): string[] {
  const { last, cwd } = options || {};

  let tmp = resolveAbsolute(base, cwd),
    prev: string | undefined;

  const root = resolveAbsolute(last || "/", cwd),
    arr: string[] = [];

  while (prev !== root) {
    arr.push(tmp);
    tmp = dirname((prev = tmp));
    if (tmp === prev) break;
  }

  return arr;
}
