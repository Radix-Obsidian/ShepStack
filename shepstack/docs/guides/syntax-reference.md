# Shep Syntax Reference

Complete reference for writing `.shep` specification files.

## Table of Contents

- [App Declaration](#app-declaration)
- [Entities](#entities)
- [Field Types](#field-types)
- [Screens](#screens)
- [Flows](#flows)
- [Rules](#rules)
- [Integrations](#integrations)
- [Events](#events)
- [AI Primitives](#ai-primitives)

---

## App Declaration

Every `.shep` file starts with an app declaration:

```shep
app "MyAppName"
  description: "What this app does"
  version: "1.0"
```

**Fields:**
- `description` - Human-readable description of the app
- `version` - Semantic version string

---

## Entities

Entities define your data model. They map to database tables and API endpoints.

```shep
entity User:
  fields:
    - email: email (required)
    - name: text (required)
    - age: number
    - createdAt: datetime (required)
```

### Entity Naming

- Use **PascalCase** for entity names: `User`, `OrderItem`, `KnowledgeBase`
- Use **camelCase** for field names: `firstName`, `createdAt`, `stripeCustomerId`

### Field Modifiers

- `(required)` - Field must have a value
- Without modifier - Field is optional (nullable)

---

## Field Types

### Primitive Types

| Type | Description | Python | TypeScript | SQL |
|------|-------------|--------|------------|-----|
| `text` | String of any length | `str` | `string` | `TEXT` |
| `number` | Integer or float | `float` | `number` | `NUMERIC` |
| `money` | Currency amount | `Decimal` | `number` | `DECIMAL(10,2)` |
| `email` | Email address | `str` | `string` | `VARCHAR(255)` |
| `date` | Date without time | `date` | `string` | `DATE` |
| `datetime` | Date with time | `datetime` | `string` | `TIMESTAMP` |
| `boolean` | True/false | `bool` | `boolean` | `BOOLEAN` |
| `file` | File reference | `str` | `string` | `TEXT` |
| `image` | Image reference | `str` | `string` | `TEXT` |

### Enum Type

Define a field with a fixed set of values:

```shep
entity Order:
  fields:
    - status: enum(pending, processing, shipped, delivered) (required)
```

Generated code:
- Python: `Enum` class
- TypeScript: Union type `"pending" | "processing" | "shipped" | "delivered"`
- SQL: `VARCHAR` with check constraint

### Relationship Type

Reference another entity (foreign key):

```shep
entity Order:
  fields:
    - customer: relationship(User) (required)
    - items: list(OrderItem)
```

- `relationship(Entity)` - One-to-one or many-to-one
- `list(Entity)` - One-to-many

### AI Type

Field computed by AI:

```shep
entity Message:
  fields:
    - content: text (required)
    - sentiment: ai("classify as positive, neutral, or negative")
    - summary: ai("summarize in one sentence")
```

See [AI Primitives](#ai-primitives) for more details.

---

## Screens

Screens define your UI. Each screen has a kind that determines its behavior.

```shep
screen UserList (list):
  entity: User
  fields: [email, name, createdAt]
```

### Screen Kinds

| Kind | Purpose | Required Fields |
|------|---------|-----------------|
| `form` | Create/edit data | `entity`, `fields` |
| `list` | Display multiple items | `entity`, `fields` |
| `detail` | Display single item | `entity`, `fields` |
| `dashboard` | Overview with widgets | `widgets` |
| `wizard` | Multi-step form | `steps` |
| `api` | API endpoint only | `entity` |

### Dashboard Widgets

```shep
screen Dashboard (dashboard):
  widgets:
    - totalUsers: number
    - revenue: money
    - recentOrders: list
    - salesChart: chart
```

Widget types: `number`, `percentage`, `rating`, `list`, `chart`

### Wizard Steps

```shep
screen Onboarding (wizard):
  steps:
    - name: "Account Info"
      fields: [email, name]
    - name: "Company Details"
      fields: [company, role]
    - name: "Preferences"
      fields: [notifications, theme]
```

---

## Flows

Flows describe user journeys as numbered steps.

```shep
flow "User signs up":
  1. User visits landing page
  2. User clicks "Sign Up" button
  3. User fills out registration form
  4. System validates email
  5. System creates account
  6. User is redirected to dashboard
```

### AI Steps

Use `ai:` for AI-powered steps:

```shep
flow "Customer support":
  1. Customer submits ticket
  ai: categorize ticket and suggest response
  2. Agent reviews AI suggestion
  3. Agent sends response
```

---

## Rules

Rules define business logic and validations.

### Simple Rules

```shep
rule "Validate email format":
  if user.email is invalid → show error

rule "Only owners can delete":
  if user.role != "owner" → deny delete

rule "Premium feature":
  if plan == "free" → show upgrade prompt
```

### AI-Powered Rules

Use `ai()` for intelligent conditions:

```shep
rule "Auto-escalate frustrated customers":
  if ai(message.content, "sounds frustrated or angry") → escalate

rule "Flag inappropriate content":
  if ai(post.text, "contains offensive language") → hide post

rule "Smart categorization":
  if ai(ticket.description, "is billing related") → route to billing team
```

**Syntax:** `ai(field, "condition description")`

- `field` - The field to analyze (e.g., `message.content`)
- `condition description` - What to check for

---

## Integrations

Declare external services your app uses:

```shep
integration Claude:
  purpose: "AI chat and classification"

integration Stripe:
  purpose: "payment processing"
  endpoint: "https://api.stripe.com"

integration SendGrid:
  purpose: "transactional emails"

integration S3:
  purpose: "file storage"
```

### Common Integrations

| Integration | Purpose |
|-------------|---------|
| `Claude` | AI responses (Anthropic) |
| `OpenAI` | AI responses (OpenAI) |
| `Stripe` | Payments and subscriptions |
| `SendGrid` | Email delivery |
| `Twilio` | SMS and voice |
| `S3` | File storage (AWS) |
| `Pinecone` | Vector search |

---

## Events

Events track user actions for analytics:

```shep
event UserSignedUp:
  fields: [userId, email, source]

event OrderPlaced:
  fields: [orderId, amount, itemCount]

event FeatureUsed:
  fields: [userId, featureName, timestamp]
```

Generated code includes tracking functions you can call from your app.

---

## AI Primitives

Shep has AI built in as a first-class primitive. AI is a verb, not an integration.

### AI in Fields

Compute field values with AI:

```shep
entity Article:
  fields:
    - title: text (required)
    - content: text (required)
    - summary: ai("summarize in 2 sentences")
    - category: ai("classify into: tech, business, lifestyle, sports")
    - readingTime: ai("estimate reading time in minutes")
```

### AI in Rules

Make decisions with AI:

```shep
rule "Smart routing":
  if ai(ticket.message, "is a technical issue") → route to engineering

rule "Content moderation":
  if ai(comment.text, "is spam or self-promotion") → flag for review
```

### AI in Flows

Automate steps with AI:

```shep
flow "Support ticket":
  1. Customer submits ticket
  ai: categorize and prioritize
  ai: draft initial response
  2. Agent reviews and sends
```

### What Gets Generated

For each AI primitive, Shep generates:

**Python (backend):**
```python
async def compute_article_summary(data: dict) -> str:
    return await call_ai(
        prompt="Summarize in 2 sentences",
        context=data.get("content", ""),
        cache_key="article_summary"
    )
```

**TypeScript (frontend):**
```typescript
export function useArticleSummary(articleId: string) {
  return useQuery<string>(`/api/ai/article_summary/${articleId}`);
}
```

---

## Complete Example

```shep
app "SupportAI"
  description: "AI-powered customer support platform"
  version: "1.0"

# Data Model
entity Company:
  fields:
    - name: text (required)
    - plan: enum(free, starter, pro) (required)
    - createdAt: datetime (required)

entity Conversation:
  fields:
    - company: relationship(Company) (required)
    - status: enum(open, resolved) (required)
    - createdAt: datetime (required)
    - summary: ai("summarize in one sentence")

entity Message:
  fields:
    - conversation: relationship(Conversation) (required)
    - role: enum(user, assistant) (required)
    - content: text (required)
    - timestamp: datetime (required)
    - sentiment: ai("classify as positive, neutral, or negative")

# UI
screen Dashboard (dashboard):
  widgets:
    - activeConversations: number
    - avgResponseTime: number
    - satisfaction: percentage

screen ConversationList (list):
  entity: Conversation
  fields: [company, status, summary, createdAt]

screen Chat (detail):
  entity: Conversation
  fields: [messages, status]

# User Journeys
flow "Customer asks question":
  1. Customer opens chat widget
  2. Customer types question
  ai: search knowledge base for relevant answers
  ai: generate response
  3. Customer receives answer
  4. Customer rates response

# Business Logic
rule "Auto-escalate":
  if ai(message.content, "customer is frustrated") → escalate

rule "Rate limit free tier":
  if company.plan == "free" and conversations_today > 10 → show upgrade

# External Services
integration Claude:
  purpose: "AI responses"

integration SendGrid:
  purpose: "email notifications"

# Analytics
event MessageSent:
  fields: [conversationId, role, sentiment]

event EscalationTriggered:
  fields: [conversationId, reason]
```

---

## CLI Commands

```bash
# Create new project
shep new my-app
shep new my-saas --template saas

# Generate spec with AI
shep draft "I want a SaaS for dog groomers"

# Verify spec
shep verify app.shep

# Generate code
shep compile --input app.shep --output generated

# Development server
shep dev --input app.shep

# Generate style guide
shep style --analyze ./generated
```

---

## Best Practices

1. **Use domain language** - Name entities after your business domain, not generic terms
2. **Start with flows** - Define user journeys first, then entities to support them
3. **Use AI sparingly** - AI fields add latency; use for high-value computations
4. **Keep entities focused** - Each entity should have a single responsibility
5. **Write clear prompts** - AI prompts should be specific and unambiguous

---

*Generated by Shep - "Build narrow. Test deep. Ship confidently."*
