import * as assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { describe, it } from "node:test";
import { pathToFileURL } from "node:url";

import { resolveFrom, resolveAbsolute, resolveCwd } from "pawfs";

type RequireError = Error & {
  code: string;
  requireStack: string[];
};

describe("resolveAbsolute", () => {
  it("should be a function", () => {
    assert.equal(typeof resolveAbsolute, "function");
  });

  it("should respect absolute inputs", () => {
    const input = path.resolve("fixtures/a/b/c");
    const output = resolveAbsolute(input);
    assert.equal(output, input);
  });

  it("should resolve non-absolute inputs", () => {
    const output = resolveAbsolute("fixtures/a/b/c");
    assert.equal(output, path.resolve("fixtures/a/b/c"));
  });

  it("should handle file:/// inputs", { skip: true }, () => {
    const real = path.resolve("fixtures");
    const input = pathToFileURL(real).toString();
    const output = resolveAbsolute(input);
    assert.equal(output, real);
  });
});

describe("resolveFrom", () => {
  it("should be a function", () => {
    assert.equal(typeof resolveFrom, "function");
  });

  it("should throw MODULE_NOT_FOUND if identifer not found", () => {
    try {
      resolveFrom("fixtures", "foobar");
      assert.fail("should have thrown");
    } catch (err) {
      assert.ok(err instanceof Error);

      const { code, message, requireStack } = err as RequireError;

      assert.equal(code, "MODULE_NOT_FOUND");
      assert.match(message, /Cannot find module 'foobar'/);
      assert.deepEqual(requireStack, [path.resolve("fixtures/noop.js")]);
    }
  });

  it("should NOT throw if `silent` enabled", () => {
    const output = resolveFrom("foo", "bar", true);
    assert.equal(output, undefined);
  });

  it("should resolve relative paths", async () => {
    const target = path.resolve("fixtures/foo.js");

    try {
      await fs.writeFile(target, "");
      const output = resolveFrom("fixtures", "./foo");
      assert.equal(output, target);
    } finally {
      await fs.unlink(target);
    }
  });

  it("should resolve node_module identifiers", async () => {
    const moddir = path.resolve("fixtures/node_modules");

    const foobar = path.join(moddir, "foobar");
    const pkgfile = path.join(foobar, "package.json");
    const target = path.join(foobar, "index.js");

    try {
      await fs.mkdir(foobar, { recursive: true });

      await fs.writeFile(target, "");
      await fs.writeFile(pkgfile, "{}");

      const output = resolveFrom("fixtures", "foobar");
      assert.equal(output, target);
    } finally {
      await fs.rm(moddir, { recursive: true });
    }
  });
});

describe("resolveCwd", () => {
  it("should be a function", () => {
    assert.equal(typeof resolveCwd, "function");
  });

  it("should throw if identifier does not exist", () => {
    try {
      resolveCwd("foobar");
      assert.fail("should have thrown");
    } catch (err) {
      const { code, message, requireStack } = err as RequireError;

      assert.ok(err instanceof Error);
      assert.equal(code, "MODULE_NOT_FOUND");
      assert.match(message, /Cannot find module 'foobar'/);
      assert.deepEqual(requireStack, [path.resolve("noop.js")]);
    }
  });

  it("should NOT throw if `silent` enabled", () => {
    const output = resolveCwd("foobar", true);
    assert.equal(output, undefined);
  });

  it("should resolve relative paths", () => {
    const target = path.resolve("license");
    const output = resolveCwd("./license");
    assert.equal(output, target);
  });

  it("should resolve node_module identifiers", async () => {
    const moddir = path.resolve("node_modules");

    const foobar = path.join(moddir, "foobar");
    const pkgfile = path.join(foobar, "package.json");
    const target = path.join(foobar, "index.js");

    try {
      await fs.mkdir(foobar, { recursive: true });

      await fs.writeFile(target, "");
      await fs.writeFile(pkgfile, "{}");

      const output = resolveCwd("foobar");
      assert.equal(output, target);
    } finally {
      await fs.rm(foobar, { recursive: true });
    }
  });
});
