/**
 * Tests for the Shep verification engine.
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import { parseSpec } from "../src/parser.js";
import { verifySpec } from "../src/verifier.js";

describe("verifySpec - Entity Verification", () => {
  it("should pass for valid entities", () => {
    const source = `app TestApp

entity User:
  fields:
    - name: text, required
    - email: email, required, unique
`;
    const parsed = parseSpec(source);
    assert.ok(parsed.success && parsed.spec);

    const result = verifySpec(parsed.spec);
    const errors = result.issues.filter((i) => i.severity === "error");
    assert.strictEqual(errors.length, 0);
  });

  it("should detect duplicate field names", () => {
    const source = `app TestApp

entity User:
  fields:
    - name: text
    - name: text
`;
    const parsed = parseSpec(source);
    assert.ok(parsed.success && parsed.spec);

    const result = verifySpec(parsed.spec);
    const errors = result.issues.filter((i) => i.code === "E003");
    assert.strictEqual(errors.length, 1);
    assert.ok(errors[0].message.includes("Duplicate field name"));
  });

  it("should detect invalid relationship references", () => {
    const source = `app TestApp

entity Post:
  fields:
    - title: text
    - author: NonExistent (relationship)
`;
    const parsed = parseSpec(source);
    assert.ok(parsed.success && parsed.spec);

    const result = verifySpec(parsed.spec);
    const errors = result.issues.filter((i) => i.code === "E005");
    assert.strictEqual(errors.length, 1);
    assert.ok(errors[0].message.includes("unknown entity"));
  });

  it("should detect enum fields without values", () => {
    const source = `app TestApp

entity User:
  fields:
    - status: enum()
`;
    const parsed = parseSpec(source);
    assert.ok(parsed.success && parsed.spec);

    const result = verifySpec(parsed.spec);
    const errors = result.issues.filter((i) => i.code === "E007");
    assert.strictEqual(errors.length, 1);
    assert.ok(errors[0].message.includes("no values"));
  });

  it("should validate min/max constraints", () => {
    const source = `app TestApp

entity Product:
  fields:
    - price: money, min=100, max=10
`;
    const parsed = parseSpec(source);
    assert.ok(parsed.success && parsed.spec);

    const result = verifySpec(parsed.spec);
    const errors = result.issues.filter((i) => i.code === "E008");
    assert.strictEqual(errors.length, 1);
    assert.ok(errors[0].message.includes("min") && errors[0].message.includes("max"));
  });
});

describe("verifySpec - Screen Verification", () => {
  it("should pass for valid screens", () => {
    const source = `app TestApp

entity User:
  fields:
    - name: text

screen UserList:
  kind: list
  entity: User
`;
    const parsed = parseSpec(source);
    assert.ok(parsed.success && parsed.spec);

    const result = verifySpec(parsed.spec);
    const errors = result.issues.filter((i) => i.severity === "error");
    assert.strictEqual(errors.length, 0);
  });

  it("should detect invalid screen kind", () => {
    const source = `app TestApp

screen BadScreen:
  kind: invalidKind
`;
    const parsed = parseSpec(source);
    assert.ok(parsed.success && parsed.spec);

    const result = verifySpec(parsed.spec);
    const errors = result.issues.filter((i) => i.code === "S002");
    assert.strictEqual(errors.length, 1);
  });

  it("should detect unknown entity reference in screen", () => {
    const source = `app TestApp

screen UserList:
  kind: list
  entity: NonExistentEntity
`;
    const parsed = parseSpec(source);
    assert.ok(parsed.success && parsed.spec);

    const result = verifySpec(parsed.spec);
    const errors = result.issues.filter((i) => i.code === "S003");
    assert.strictEqual(errors.length, 1);
    assert.ok(errors[0].message.includes("unknown entity"));
  });

  it("should warn for form screens without entity", () => {
    const source = `app TestApp

screen ContactForm:
  kind: form
  fields: [name, email, message]
`;
    const parsed = parseSpec(source);
    assert.ok(parsed.success && parsed.spec);

    const result = verifySpec(parsed.spec);
    const warnings = result.issues.filter((i) => i.code === "S005");
    assert.strictEqual(warnings.length, 1);
    assert.ok(warnings[0].message.includes("no entity"));
  });

  it("should error for wizard screens without steps", () => {
    const source = `app TestApp

screen SetupWizard:
  kind: wizard
`;
    const parsed = parseSpec(source);
    assert.ok(parsed.success && parsed.spec);

    const result = verifySpec(parsed.spec);
    const errors = result.issues.filter((i) => i.code === "S008");
    assert.strictEqual(errors.length, 1);
  });
});

describe("verifySpec - Flow Verification", () => {
  it("should warn for flows without steps", () => {
    const source = `app TestApp

flow "Empty flow":
`;
    const parsed = parseSpec(source);
    assert.ok(parsed.success && parsed.spec);

    const result = verifySpec(parsed.spec);
    const warnings = result.issues.filter((i) => i.code === "F002");
    assert.strictEqual(warnings.length, 1);
  });
});

describe("verifySpec - Integration Verification", () => {
  it("should pass for valid integrations", () => {
    const source = `app TestApp

integration Stripe:
  endpoint: "https://api.stripe.com"
  purpose: "Payment processing"
`;
    const parsed = parseSpec(source);
    assert.ok(parsed.success && parsed.spec);

    const result = verifySpec(parsed.spec);
    const errors = result.issues.filter((i) => i.severity === "error");
    assert.strictEqual(errors.length, 0);
  });

  it("should warn for invalid endpoint URLs", () => {
    const source = `app TestApp

integration BadAPI:
  endpoint: "not-a-url"
  purpose: "Something"
`;
    const parsed = parseSpec(source);
    assert.ok(parsed.success && parsed.spec);

    const result = verifySpec(parsed.spec);
    const warnings = result.issues.filter((i) => i.code === "I003");
    assert.strictEqual(warnings.length, 1);
    assert.ok(warnings[0].message.includes("invalid endpoint URL"));
  });
});

describe("verifySpec - Wiring Verification", () => {
  it("should warn for unused entities", () => {
    const source = `app TestApp

entity OrphanEntity:
  fields:
    - name: text

screen Dashboard:
  kind: dashboard
  widgets:
    - "Stats" (number)
`;
    const parsed = parseSpec(source);
    assert.ok(parsed.success && parsed.spec);

    const result = verifySpec(parsed.spec);
    const infos = result.issues.filter((i) => i.code === "W001");
    assert.strictEqual(infos.length, 1);
    assert.ok(infos[0].message.includes("not used by any screen"));
  });

  it("should warn for form missing required fields", () => {
    const source = `app TestApp

entity User:
  fields:
    - name: text, required
    - email: email, required
    - bio: text

screen UserForm:
  kind: form
  entity: User
  fields: [bio]
`;
    const parsed = parseSpec(source);
    assert.ok(parsed.success && parsed.spec);

    const result = verifySpec(parsed.spec);
    const warnings = result.issues.filter((i) => i.code === "W002");
    assert.strictEqual(warnings.length, 2); // Missing name and email
  });

  it("should detect circular relationships", () => {
    const source = `app TestApp

entity Parent:
  fields:
    - name: text
    - children: list of Child

entity Child:
  fields:
    - name: text
    - parent: Parent (relationship)
`;
    const parsed = parseSpec(source);
    assert.ok(parsed.success && parsed.spec);

    const result = verifySpec(parsed.spec);
    const infos = result.issues.filter((i) => i.code === "W003");
    assert.ok(infos.length >= 1);
    assert.ok(infos[0].message.includes("Circular relationship"));
  });
});

describe("verifySpec - Complete Spec", () => {
  it("should pass for a complete valid spec", () => {
    const source = `app SupportAI

entity Company:
  fields:
    - name: text, required
    - email: email, required, unique
    - plan: enum(starter, pro, enterprise)

entity Conversation:
  fields:
    - company: Company (relationship)
    - status: enum(open, resolved, escalated)

screen CompanyList:
  kind: list
  entity: Company
  filters: [plan]

screen CompanyForm:
  kind: form
  entity: Company
  fields: [name, email, plan]
  action: "Create Company"

screen Dashboard:
  kind: dashboard
  widgets:
    - "Total Companies" (number)
    - "Active Conversations" (number)

flow "Company signs up":
  1. User fills CompanyForm
  2. Account created
  3. Redirect to Dashboard

rule "Only admins can delete":
  if user.role != admin → show error "Permission denied"

integration Stripe:
  endpoint: "https://api.stripe.com"
  purpose: "Handle payments"

event "company_created":
  fields: [companyId, plan]
`;
    const parsed = parseSpec(source);
    assert.ok(parsed.success && parsed.spec);

    const result = verifySpec(parsed.spec);
    
    // Should pass with no errors
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.errorCount, 0);
    
    // Summary should show all components verified
    assert.strictEqual(result.summary.entitiesVerified, 2);
    assert.strictEqual(result.summary.screensVerified, 3);
    assert.strictEqual(result.summary.flowsVerified, 1);
    assert.strictEqual(result.summary.rulesVerified, 1);
    assert.strictEqual(result.summary.integrationsVerified, 1);
    assert.strictEqual(result.summary.eventsVerified, 1);
  });
});
