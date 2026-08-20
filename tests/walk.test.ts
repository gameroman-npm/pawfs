import * as assert from "node:assert/strict";
import { join, resolve } from "node:path";
import { describe, it } from "node:test";

import { walkUp } from "pawfs";

describe("walkUp", () => {
  const fixtures = resolve("tests/fixtures");

  it("should be a function", () => {
    assert.equal(typeof walkUp, "function");
  });

  const parents = walkUp(join(fixtures, "a/b/c"));

  it("should return an Array of parent directories", () => {
    assert.ok(Array.isArray(parents));
  });

  it("should resolve input from CWD if not absolute", () => {
    const output = walkUp("tests/fixtures/a/b/c");
    assert.deepEqual(output, parents);
  });

  it("should start with the initial directory", () => {
    assert.equal(parents[0], resolve("tests/fixtures/a/b/c"));
  });

  it('should return all parents until "/" root (default)', () => {
    assert.equal(parents[0], resolve("tests/fixtures/a/b/c"));
    assert.equal(parents[1], resolve("tests/fixtures/a/b"));
    assert.equal(parents[2], resolve("tests/fixtures/a"));
    assert.equal(parents[3], resolve("tests/fixtures"));
    assert.equal(parents[4], resolve("tests"));
    assert.equal(parents[5], resolve("."));
    assert.equal(parents.at(-1), resolve("/"));
  });

  it("should resolve from `options.cwd` if input is not absolute", () => {
    const output = walkUp("a/b/c", {
      cwd: fixtures,
    });

    assert.deepEqual(output, parents);
  });

  it("should stop after `options.last` directory", () => {
    const output = walkUp("tests/fixtures/a/b/c", {
      last: fixtures,
    });

    assert.ok(parents.length > output.length);
  });

  it("should include `options.last` directory", () => {
    const output = walkUp("tests/fixtures/a/b/c", {
      last: fixtures,
    });

    assert.equal(output[output.length - 1], fixtures);
  });

  it("should only have 1 entry if started at `options.last` directory", () => {
    const start = resolve("tests/fixtures/a/b/c");
    const output = walkUp(start, { last: start });
    assert.equal(output.length, 1);
  });

  it("should still exit at root if `options.last` is a subdir of start", () => {
    const start = resolve("tests/fixtures/a/b/c");
    const last = join(start, "d/e/f");

    const output = walkUp(start, { last });

    assert.equal(output[0], resolve("tests/fixtures/a/b/c"));
    assert.equal(output[1], resolve("tests/fixtures/a/b"));
    assert.equal(output[2], resolve("tests/fixtures/a"));
    assert.equal(output[output.length - 1], resolve("/"));

    assert.deepEqual(output, parents);
  });
});
