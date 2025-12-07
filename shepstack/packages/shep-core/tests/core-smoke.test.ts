/**
 * Smoke tests for shep-core.
 * Verifies that the spec parser and core types work correctly.
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import { ShepError, NotImplementedError, parseSpec } from "../src/index.js";

describe("parseSpec", () => {
  it("should parse a minimal spec", () => {
    const source = `app TestApp`;
    const result = parseSpec(source);

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.spec?.app, "TestApp");
    assert.strictEqual(result.errors.length, 0);
  });

  it("should parse entities", () => {
    const source = `app TestApp

entity User:
  fields:
    - name: text, required
    - email: email, required, unique
`;
    const result = parseSpec(source);

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.spec?.entities.length, 1);
    assert.strictEqual(result.spec?.entities[0].name, "User");
    assert.strictEqual(result.spec?.entities[0].fields.length, 2);
  });

  it("should parse screens", () => {
    const source = `app TestApp

screen SignUp:
  kind: form
  fields: [name, email]
  action: "Create Account"
`;
    const result = parseSpec(source);

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.spec?.screens.length, 1);
    assert.strictEqual(result.spec?.screens[0].name, "SignUp");
    assert.strictEqual(result.spec?.screens[0].kind, "form");
  });

  it("should report errors for invalid specs", () => {
    const source = `entity User:
  fields:
    - name: text
`;
    const result = parseSpec(source);

    assert.strictEqual(result.success, false);
    assert.ok(result.errors.length > 0);
  });
});

describe("Error handling", () => {
  it("should throw NotImplementedError when needed", () => {
    assert.throws(
      () => {
        throw new NotImplementedError("Test");
      },
      NotImplementedError
    );
  });

  it("should create ShepError instances", () => {
    const error = new ShepError("Test error");
    assert.strictEqual(error.message, "Test error");
  });
});
