/**
 * Tests for the Shep spec parser
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import { parseSpec } from "../src/parser.js";

describe("parseSpec", () => {
  it("should parse a minimal spec", () => {
    const source = `app TestApp`;
    const result = parseSpec(source);

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.spec?.app, "TestApp");
    assert.strictEqual(result.errors.length, 0);
  });

  it("should parse entities with fields", () => {
    const source = `app TestApp

entity User:
  fields:
    - name: text, required
    - email: email, required, unique
    - age: number
    - role: enum(admin, member, guest)
`;
    const result = parseSpec(source);

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.spec?.entities.length, 1);

    const user = result.spec?.entities[0];
    assert.strictEqual(user?.name, "User");
    assert.strictEqual(user?.fields.length, 4);

    // Check name field
    assert.strictEqual(user?.fields[0].name, "name");
    assert.strictEqual(user?.fields[0].fieldType, "text");
    assert.strictEqual(user?.fields[0].required, true);

    // Check email field
    assert.strictEqual(user?.fields[1].name, "email");
    assert.strictEqual(user?.fields[1].fieldType, "email");
    assert.strictEqual(user?.fields[1].required, true);
    assert.strictEqual(user?.fields[1].unique, true);

    // Check age field
    assert.strictEqual(user?.fields[2].name, "age");
    assert.strictEqual(user?.fields[2].fieldType, "number");
    assert.strictEqual(user?.fields[2].required, false);

    // Check role field (enum)
    assert.strictEqual(user?.fields[3].name, "role");
    assert.strictEqual(user?.fields[3].fieldType, "enum");
    assert.deepStrictEqual(user?.fields[3].enumValues, ["admin", "member", "guest"]);
  });

  it("should parse screens", () => {
    const source = `app TestApp

screen SignUp:
  kind: form
  fields: [name, email, password]
  action: "Create Account"

screen Dashboard:
  kind: dashboard
  widgets:
    - "Total Users" (number)
    - "Active Sessions" (percentage)
`;
    const result = parseSpec(source);

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.spec?.screens.length, 2);

    // Check SignUp screen
    const signUp = result.spec?.screens[0];
    assert.strictEqual(signUp?.name, "SignUp");
    assert.strictEqual(signUp?.kind, "form");
    assert.deepStrictEqual(signUp?.fields, ["name", "email", "password"]);
    assert.strictEqual(signUp?.actionText, "Create Account");

    // Check Dashboard screen
    const dashboard = result.spec?.screens[1];
    assert.strictEqual(dashboard?.name, "Dashboard");
    assert.strictEqual(dashboard?.kind, "dashboard");
    assert.strictEqual(dashboard?.widgets?.length, 2);
    assert.strictEqual(dashboard?.widgets?.[0].label, "Total Users");
    assert.strictEqual(dashboard?.widgets?.[0].widgetType, "number");
  });

  it("should parse flows", () => {
    const source = `app TestApp

flow "User signs up":
  1. User visits landing page
  2. Fills SignUp form
  3. Account created
  4. Redirect to Dashboard
`;
    const result = parseSpec(source);

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.spec?.flows.length, 1);

    const flow = result.spec?.flows[0];
    assert.strictEqual(flow?.name, "User signs up");
    assert.strictEqual(flow?.steps.length, 4);
    assert.strictEqual(flow?.steps[0].order, 1);
    assert.strictEqual(flow?.steps[0].description, "User visits landing page");
    assert.strictEqual(flow?.steps[3].order, 4);
    assert.strictEqual(flow?.steps[3].description, "Redirect to Dashboard");
  });

  it("should parse rules", () => {
    const source = `app TestApp

rule "Only admins can delete":
  if user.role != admin → show error "Permission denied"

rule "Minimum age is 18":
  if user.age < 18 → show error "Must be 18 or older"
`;
    const result = parseSpec(source);

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.spec?.rules.length, 2);

    const rule1 = result.spec?.rules[0];
    assert.strictEqual(rule1?.description, "Only admins can delete");
    assert.strictEqual(rule1?.condition, "user.role != admin");
    assert.strictEqual(rule1?.action, 'show error "Permission denied"');

    const rule2 = result.spec?.rules[1];
    assert.strictEqual(rule2?.description, "Minimum age is 18");
    assert.strictEqual(rule2?.condition, "user.age < 18");
  });

  it("should parse integrations", () => {
    const source = `app TestApp

integration Stripe:
  endpoint: "https://api.stripe.com"
  purpose: "Handle payments"

integration SendGrid:
  endpoint: "https://api.sendgrid.com"
  purpose: "Send emails"
`;
    const result = parseSpec(source);

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.spec?.integrations.length, 2);

    const stripe = result.spec?.integrations[0];
    assert.strictEqual(stripe?.name, "Stripe");
    assert.strictEqual(stripe?.endpoint, "https://api.stripe.com");
    assert.strictEqual(stripe?.purpose, "Handle payments");
  });

  it("should parse events", () => {
    const source = `app TestApp

event "user_signed_up":
  fields: [userId, email, plan]

event "purchase_completed":
  fields: [orderId, amount, customerId]
`;
    const result = parseSpec(source);

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.spec?.events.length, 2);

    const event1 = result.spec?.events[0];
    assert.strictEqual(event1?.name, "user_signed_up");
    assert.deepStrictEqual(event1?.fields, ["userId", "email", "plan"]);
  });

  it("should report error for missing app declaration", () => {
    const source = `entity User:
  fields:
    - name: text
`;
    const result = parseSpec(source);

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.errors.length, 1);
    assert.ok(result.errors[0].message.includes("First line must be"));
  });

  it("should skip comments", () => {
    const source = `# This is a comment
app TestApp

# Another comment
entity User:
  # Comment inside entity
  fields:
    - name: text
`;
    const result = parseSpec(source);

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.spec?.app, "TestApp");
    assert.strictEqual(result.spec?.entities.length, 1);
  });

  it("should parse relationships", () => {
    const source = `app TestApp

entity Post:
  fields:
    - title: text, required
    - author: User (relationship)
    - comments: list of Comment
`;
    const result = parseSpec(source);

    assert.strictEqual(result.success, true);
    const post = result.spec?.entities[0];

    // Check author field (relationship)
    const author = post?.fields.find((f) => f.name === "author");
    assert.strictEqual(author?.fieldType, "relationship");
    assert.strictEqual(author?.relatedEntity, "User");

    // Check comments field (list)
    const comments = post?.fields.find((f) => f.name === "comments");
    assert.strictEqual(comments?.fieldType, "list");
    assert.strictEqual(comments?.relatedEntity, "Comment");
  });

  it("should parse field constraints", () => {
    const source = `app TestApp

entity Product:
  fields:
    - price: money, required, min=0
    - name: text, required, max=100
`;
    const result = parseSpec(source);

    assert.strictEqual(result.success, true);
    const product = result.spec?.entities[0];

    const price = product?.fields.find((f) => f.name === "price");
    assert.strictEqual(price?.fieldType, "money");
    assert.strictEqual(price?.min, 0);

    const name = product?.fields.find((f) => f.name === "name");
    assert.strictEqual(name?.max, 100);
  });
});

describe("parseSpec - SupportAI example", () => {
  it("should parse the full SupportAI spec", async () => {
    // This test will read the actual example file when file reading is available
    // For now, we test a simplified version
    const source = `app SupportAI

entity Company:
  fields:
    - name: text, required
    - email: email, required, unique
    - plan: enum(starter, pro, enterprise)
    - apiKey: text, unique
    - createdAt: datetime

entity Conversation:
  fields:
    - company: Company (relationship)
    - customerId: text, required
    - status: enum(open, resolved, escalated)

screen Dashboard:
  kind: dashboard
  widgets:
    - "Total Questions" (number)
    - "Escalation Rate" (percentage)

flow "Customer asks a question":
  1. Customer opens chat widget
  2. Types question
  3. AI generates answer
  4. Answer displayed

rule "Free plan limited to 100 questions":
  if plan == starter AND questionsThisMonth >= 100 → show error "Upgrade required"

integration Claude:
  endpoint: "https://api.anthropic.com/v1/messages"
  purpose: "Generate AI answers"

event "question_answered":
  fields: [companyId, conversationId, confidence]
`;

    const result = parseSpec(source, "support-ai.shep");

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.spec?.app, "SupportAI");
    assert.strictEqual(result.spec?.entities.length, 2);
    assert.strictEqual(result.spec?.screens.length, 1);
    assert.strictEqual(result.spec?.flows.length, 1);
    assert.strictEqual(result.spec?.rules.length, 1);
    assert.strictEqual(result.spec?.integrations.length, 1);
    assert.strictEqual(result.spec?.events.length, 1);
  });
});
