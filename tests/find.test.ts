import * as assert from "node:assert/strict";
import { join, resolve } from "node:path";
import { describe, it } from "node:test";

import { findUp, findDir, findFile, findAny } from "pawfs";

const fixtures = resolve("fixtures");

describe("findUp", () => {
  const target = join(fixtures, "a/b/c/d/e/f/file.txt");

  it("should be a function", () => {
    assert.equal(typeof findUp, "function");
  });

  it("should default looking in current (cwd) directory", () => {
    const output = findUp("license");
    assert.equal(output, resolve("license"));
  });

  it("should use `options.cwd` directory", () => {
    const output = findUp("file.txt", {
      cwd: join(fixtures, "a/b/c/d/e/f/g/h/i/j"),
    });

    assert.equal(output, target);
  });

  it("should stop after `options.last` directory", () => {
    const output = findUp("file.txt", {
      cwd: join(fixtures, "a/b/c/d/e/f/g/h/i/j"),
      last: join(fixtures, "a/b/c/d/e/f/g"),
    });
    assert.equal(output, undefined);
  });

  it("should still search `options.last` directory", () => {
    const output = findUp("file.txt", {
      cwd: join(fixtures, "a/b/c/d/e/f/g/h/i/j"),
      last: join(fixtures, "a/b/c/d/e/f"),
    });
    assert.equal(output, target);
  });
});

describe("findAny", () => {
  it("should be a function", () => {
    assert.equal(typeof findAny, "function");
  });

  it("should looking in current (cwd) directory", () => {
    const output = findAny(["license"]);
    assert.equal(output, resolve("license"));
  });

  it("should respect the input order", () => {
    const output = findAny(["readme.md", "license", "deno.json"]);
    assert.equal(output, resolve("readme.md"));
  });

  it("should resolve from `options.cwd` directory", () => {
    const input = ["start.txt", "file.txt"];
    let start = join(fixtures, "a/b/c/d/e/f/g/h/i/j");

    let output = findAny(input, { cwd: start });
    assert.equal(output, join(start, "start.txt"));

    start = join(start, "..");
    output = findAny(input, { cwd: start });
    assert.equal(output, join(fixtures, "a/b/c/d/e/f/file.txt"));
  });

  it("should still search `options.last` directory", () => {
    const output = findAny(["file.txt"], {
      cwd: join(fixtures, "a/b/c/d/e/f/g/h/i/j"),
      last: join(fixtures, "a/b/c/d/e/f"),
    });
    assert.equal(output, join(fixtures, "a/b/c/d/e/f/file.txt"));
  });

  it("should stop after `options.last` directory", () => {
    const output = findAny(["file.txt"], {
      cwd: join(fixtures, "a/b/c/d/e/f/g/h/i/j"),
      last: join(fixtures, "a/b/c/d/e/f/g"),
    });
    assert.equal(output, undefined);
  });
});

describe("findFile", () => {
  it("should be a function", () => {
    assert.equal(typeof findFile, "function");
  });

  it("should looking in current (cwd) directory", () => {
    const output = findFile("license");
    assert.equal(output, resolve("license"));
  });

  it("should use `options.cwd` directory", () => {
    const output = findFile("file.txt", {
      cwd: join(fixtures, "a/b/c/d/e/f/g/h/i/j"),
    });
    assert.equal(output, join(fixtures, "a/b/c/d/e/f/file.txt"));
  });

  it("should stop after `options.last` directory", () => {
    const output = findFile("file.txt", {
      cwd: join(fixtures, "a/b/c/d/e/f/g/h/i/j"),
      last: join(fixtures, "a/b/c/d/e/f/g"),
    });
    assert.equal(output, undefined);
  });

  it("should still search `options.last` directory", () => {
    const output = findFile("file.txt", {
      cwd: join(fixtures, "a/b/c/d/e/f/g/h/i/j"),
      last: join(fixtures, "a/b/c/d/e/f"), // < file.txt is here
    });
    assert.equal(output, join(fixtures, "a/b/c/d/e/f/file.txt"));
  });

  it("should ignore directory with matching name", () => {
    const output = findFile("e", {
      cwd: join(fixtures, "a/b/c/d/e/f/g/h/i/j"),
    });
    assert.equal(output, undefined);
  });
});

describe("findDir", () => {
  it("should be a function", () => {
    assert.equal(typeof findDir, "function");
  });

  it("should looking in current (cwd) directory", () => {
    const output = findDir("fixtures");
    assert.equal(output, resolve("fixtures"));
  });

  it("should use `options.cwd` directory", () => {
    const output = findDir("f", {
      cwd: join(fixtures, "a/b/c/d/e/f/g/h/i/j"),
    });
    assert.equal(output, join(fixtures, "a/b/c/d/e/f"));
  });

  it("should stop after `options.last` directory", () => {
    const output = findDir("g", {
      cwd: join(fixtures, "a/b/c/d/e/f/g/h/i/j"),
      last: join(fixtures, "a/b/c/d/e/f/g"),
    });
    assert.equal(output, undefined);
  });

  it("should still search `options.last` directory", () => {
    const output = findDir("g", {
      cwd: join(fixtures, "a/b/c/d/e/f/g/h/i/j"),
      last: join(fixtures, "a/b/c/d/e/f"),
    });
    assert.equal(output, join(fixtures, "a/b/c/d/e/f/g"));
  });

  it("should ignore file with matching name", () => {
    const output = findDir("file.txt", {
      cwd: join(fixtures, "a/b/c/d/e/f/g/h/i/j"),
    });
    assert.equal(output, undefined);
  });
});
