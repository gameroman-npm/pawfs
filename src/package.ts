import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { env } from "node:process";

import { isWritable } from "./access";
import { findUp } from "./find";
import type { Options } from "./types";

export function findUpPackageJson(options?: Options): string | undefined {
  return findUp("package.json", options);
}

export function findPackageJsonCacheDir(
  name: string,
  options?: Options & { create?: boolean },
): string | undefined {
  options ??= {};

  let dir = env["CACHE_DIR"];

  if (!dir || /^(1|0|true|false)$/.test(dir)) {
    const pkg = findUpPackageJson(options);

    if ((dir = pkg && dirname(pkg))) {
      const mods = join(dir, "node_modules");
      const exists = existsSync(mods);

      if (!isWritable(exists ? mods : dir)) return;

      dir = join(mods, ".cache");
    }
  }

  if (dir) {
    dir = join(dir, name);
    if (options.create && !existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    return dir;
  }
}
