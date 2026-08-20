import { existsSync, statSync } from "node:fs";
import { join } from "node:path";

import type { Options } from "./types";
import { walkUp } from "./walk";

export function findUp(name: string, options?: Options): string | undefined {
  let dir: string, tmp: string;
  const start = options?.cwd || "";
  for (dir of walkUp(start, options)) {
    tmp = join(dir, name);
    if (existsSync(tmp)) return tmp;
  }
}

export function findAny(
  names: string[],
  options?: Options,
): string | undefined {
  const start = options?.cwd || "",
    len = names.length;
  let dir: string,
    j = 0,
    tmp: string;
  for (dir of walkUp(start, options)) {
    for (j = 0; j < len; j++) {
      tmp = join(dir, names[j]!);
      if (existsSync(tmp)) return tmp;
    }
  }
}

export function findFile(name: string, options?: Options): string | undefined {
  let dir: string, tmp: string;
  const start = options?.cwd || "";
  for (dir of walkUp(start, options)) {
    try {
      tmp = join(dir, name);
      if (statSync(tmp).isFile()) return tmp;
    } catch {}
  }
}

export function findDir(name: string, options?: Options): string | undefined {
  let dir: string, tmp: string;
  const start = options?.cwd || "";
  for (dir of walkUp(start, options)) {
    try {
      tmp = join(dir, name);
      if (statSync(tmp).isDirectory()) return tmp;
    } catch {}
  }
}
