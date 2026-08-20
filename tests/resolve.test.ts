import * as assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import { createRequire } from "node:module";
import * as path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { pathToFileURL } from "node:url";

import { resolveFrom, resolveAbsolute, resolveCwd } from "pawfs";

type RequireError = Error & {
  code: string;
  requireStack: string[];
};

const fixtures = path.resolve("tests/fixtures");

describe("resolveAbsolute", () => {
  it("should be a function", () => {
    assert.equal(typeof resolveAbsolute, "function");
  });

  it("should respect absolute inputs", () => {
    const input = path.resolve("tests/fixtures/a/b/c");
    const output = resolveAbsolute(input);
    assert.equal(output, input);
  });

  it("should resolve non-absolute inputs", () => {
    const output = resolveAbsolute("tests/fixtures/a/b/c");
    assert.equal(output, path.resolve("tests/fixtures/a/b/c"));
  });

  it("should handle file:/// inputs", { skip: true }, () => {
    const real = fixtures;
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
      resolveFrom(fixtures, "foobar");
      assert.fail("should have thrown");
    } catch (err) {
      assert.ok(err instanceof Error);

      const { code, message, requireStack } = err as RequireError;

      assert.equal(code, "MODULE_NOT_FOUND");
      assert.match(message, /Cannot find module 'foobar'/);
      assert.deepEqual(requireStack, [path.join(fixtures, "noop.js")]);
    }
  });

  it("should NOT throw if `silent` enabled", () => {
    const output = resolveFrom(fixtures, "bar", true);
    assert.equal(output, undefined);
  });

  it("should resolve relative paths", async () => {
    const target = path.join(fixtures, "foo.js");

    try {
      await fs.writeFile(target, "");
      const output = resolveFrom(fixtures, "./foo");
      assert.equal(output, target);
    } finally {
      await fs.unlink(target);
    }
  });

  it("should resolve node_module identifiers", () => {
    const packageName = "typescript";
    const target = createRequire(import.meta.url).resolve(packageName);
    const output = resolveFrom(fixtures, packageName);
    assert.equal(output, target);
  });
});

describe("resolveCwd", () => {
  const originalCwd = process.cwd();

  beforeEach(() => {
    process.chdir(fixtures);
  });

  afterEach(() => {
    process.chdir(originalCwd);
  });

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
      assert.deepEqual(requireStack, [path.join(fixtures, "noop.js")]);
    }
  });

  it("should NOT throw if `silent` enabled", () => {
    const output = resolveCwd("foobar", true);
    assert.equal(output, undefined);
  });

  it("should resolve relative paths", () => {
    const target = path.join(fixtures, "b.txt");
    const output = resolveCwd("./b.txt");
    assert.equal(output, target);
  });

  it("should resolve node_module identifiers", () => {
    const packageName = "typescript";
    const target = createRequire(import.meta.url).resolve(packageName);
    const output = resolveCwd(packageName);
    assert.equal(output, target);
  });
});
