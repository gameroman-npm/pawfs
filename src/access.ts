import { accessSync, constants } from "node:fs";
import type { PathLike } from "node:fs";

export function ok(path: PathLike, mode?: number): boolean {
  try {
    accessSync(path, mode);
    return true;
  } catch {
    return false;
  }
}

export function isWritable(path: PathLike): boolean {
  return ok(path, constants.W_OK);
}

export function isReadable(path: PathLike): boolean {
  return ok(path, constants.R_OK);
}

export function isExecutable(path: PathLike): boolean {
  return ok(path, constants.X_OK);
}
