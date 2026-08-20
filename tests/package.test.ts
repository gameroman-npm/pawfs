import * as assert from "node:assert/strict";
import { join, resolve } from "node:path";
import { env } from "node:process";
import { describe, it } from "node:test";

import { findUpPackageJson, findPackageCacheDir } from "pawfs";

const fixtures = resolve("tests/fixtures");

const pkgfile = join(fixtures, "a/b/package.json");
const start = join(fixtures, "a/b/c/d/e/f/g/h/i/j");

describe("findUpPackageJson", () => {
  it("should be a function", () => {
    assert.equal(typeof findUpPackageJson, "function");
  });

  it('should find the nearest "package.json" file', () => {
    const output = findUpPackageJson({ cwd: fixtures });
    assert.equal(output, join(fixtures, "package.json"));
  });

  it('should use `options.cwd` to resolve nearest "package.json" file', () => {
    const output = findUpPackageJson({ cwd: start });

    assert.equal(output, pkgfile);
  });

  it("should stop resolving after `options.last` directory", () => {
    const output = findUpPackageJson({
      cwd: resolve("tests/fixtures/a/b/c/d/e/f/g/h/i/j"),
      last: resolve("tests/fixtures/a/b/c/d/e/f"),
    });

    assert.equal(output, undefined);
  });

  it("should still search `options.last` directory", () => {
    const output = findUpPackageJson({
      cwd: resolve("tests/fixtures/a/b/c/d/e/f/g/h/i/j"),
      last: resolve("tests/fixtures/a/b"),
    });

    assert.equal(output, pkgfile);
  });
});

describe("findPackageCacheDir", () => {
  it("should be a function", () => {
    assert.equal(typeof findPackageCacheDir, "function");
  });

  it('should construct path from nearest "package.json" file', () => {
    const output = findPackageCacheDir("foobar", { cwd: fixtures });
    assert.equal(output, join(fixtures, "node_modules/.cache/foobar"));
  });

  it("should use `options.cwd` for resolution", () => {
    const output = findPackageCacheDir("foobar", { cwd: start });
    const expect = resolve(pkgfile, "../node_modules/.cache/foobar");

    assert.equal(output, expect);
  });

  it("should still search `options.last` directory", () => {
    const output = findPackageCacheDir("foobar", {
      cwd: start,
      last: resolve("tests/fixtures/a/b"),
    });

    const expect = resolve(pkgfile, "../node_modules/.cache/foobar");
    assert.equal(output, expect);
  });

  it("should stop after `options.last` directory", () => {
    const output = findPackageCacheDir("foobar", {
      cwd: start,
      last: resolve("tests/fixtures/a/b/c"),
    });

    assert.equal(output, undefined);
  });

  it("should ignore invalid `env.CACHE_DIR` values", () => {
    env["CACHE_DIR"] = "true";

    const output = findPackageCacheDir("foobar", { cwd: fixtures });
    const expect = join(fixtures, "node_modules/.cache/foobar");
    delete env["CACHE_DIR"];

    assert.equal(output, expect);
  });

  it("should use env.CACHE_DIR for base", () => {
    env["CACHE_DIR"] = fixtures;

    const output = findPackageCacheDir("foobar");
    const expect = resolve(fixtures, "foobar");
    delete env["CACHE_DIR"];

    assert.equal(output, expect);
  });
});
