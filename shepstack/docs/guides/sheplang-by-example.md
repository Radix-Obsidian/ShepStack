# ShepLang by Example

Learn ShepLang through working examples.

---

## Example 1: Hello World

The simplest ShepLang program:

```shep
app "HelloWorld"

data Greeting {
  message: text (required)
}

view GreetingList {
  show: [message]
}

action CreateGreeting {
  save Greeting
}
```

**What this does:**
- Declares a program called "HelloWorld"
- Defines a `Greeting` data type with one field
- Creates a view to display greetings
- Defines an action to create new greetings

---

## Example 2: Task Manager

A more complete example with relationships:

```shep
app "TaskManager"

data User {
  email: email (required, unique)
  name: text (required)
  role: enum(admin, member)
}

data Task {
  title: text (required)
  description: text
  status: enum(todo, in_progress, done)
  priority: enum(low, medium, high)
  assignee: User
  dueDate: date
}

view TaskList {
  show: [title, status, priority, assignee]
  filter: [status, priority]
  sort: dueDate asc
}

view TaskForm {
  input: [title, description, status, priority, assignee, dueDate]
  submit: CreateTask
}

action CreateTask {
  validate title is not empty
  save Task
}

action CompleteTask {
  set status = done
  log "Task completed: ${title}"
}
```

**Key concepts:**
- **Relationships:** `assignee: User` creates a foreign key
- **Enums:** Fixed set of values
- **Views:** Both list and form views
- **Actions:** Business logic with validation

---

## Example 3: AI-Powered Support

Demonstrating the `ai` primitive:

```shep
app "SupportAI"

data Ticket {
  subject: text (required)
  message: text (required)
  status: enum(open, resolved, escalated)
  priority: enum(low, medium, high)
  
  # AI-derived fields
  sentiment: ai("classify as positive, neutral, negative")
  category: ai("classify as billing, technical, general")
  summary: ai("summarize in one sentence")
}

data Response {
  ticket: Ticket (required)
  content: text (required)
  isAI: boolean
}

view TicketDashboard {
  show: [subject, status, priority, sentiment, category]
  filter: [status, priority, category]
  sort: createdAt desc
}

view TicketDetail {
  show: [subject, message, summary, responses]
  actions: [resolve, escalate, respond]
}

action Respond {
  validate content is not empty
  save Response
}

action Resolve {
  set status = resolved
  notify customer
}

action Escalate {
  if ai(message, "sounds frustrated or angry") {
    set priority = high
    set status = escalated
    alert on-call team
  }
}

task AutoCategorize {
  on: ticket.created
  ai: categorize ticket
  ai: suggest initial response
}
```

**AI concepts:**
- **AI fields:** Computed by LLM when data is created
- **AI conditions:** `if ai(field, "condition")` for smart logic
- **AI tasks:** Background processing with AI

---

## Example 4: E-Commerce

A more complex domain:

```shep
app "SimpleStore"

data Product {
  name: text (required)
  description: text
  price: money (required, min=0)
  stock: number (required, min=0, default=0)
  category: enum(electronics, clothing, books, other)
  image: image
}

data Customer {
  email: email (required, unique)
  name: text (required)
  address: text
}

data Order {
  customer: Customer (required)
  items: list(OrderItem)
  status: enum(pending, paid, shipped, delivered)
  total: money (computed)
}

data OrderItem {
  order: Order (required)
  product: Product (required)
  quantity: number (required, min=1)
  price: money (required)
}

view ProductCatalog {
  show: [name, price, category, image]
  filter: category
  sort: price asc
}

view Cart {
  show: [items, total]
  actions: [checkout]
}

view OrderHistory {
  show: [createdAt, status, total]
  filter: status
}

action AddToCart {
  validate stock > 0
  create OrderItem
  update total
}

action Checkout {
  validate cart is not empty
  set status = pending
  process payment
  set status = paid
  notify customer
}

action Ship {
  set status = shipped
  notify customer with tracking
}
```

**Advanced concepts:**
- **Money type:** Currency handling
- **Computed fields:** `total` calculated from items
- **Constraints:** `min`, `max`, `default`
- **Lists:** `list(OrderItem)` for one-to-many

---

## Example 5: SaaS with Multi-tenancy

Enterprise patterns:

```shep
app "ProjectHub"

data Organization {
  name: text (required)
  plan: enum(free, starter, pro, enterprise)
  seats: number (required, min=1)
}

data User {
  org: Organization (required)
  email: email (required, unique)
  name: text (required)
  role: enum(owner, admin, member)
}

data Project {
  org: Organization (required)
  name: text (required)
  description: text
  status: enum(active, archived)
}

data Task {
  project: Project (required)
  title: text (required)
  assignee: User
  status: enum(backlog, todo, doing, done)
  estimate: number  # hours
}

view Dashboard {
  scope: org
  show: [activeProjects, tasksByStatus, teamActivity]
}

view ProjectBoard {
  scope: project
  show: tasks grouped by status
  dragDrop: true
}

action CreateProject {
  validate org.plan != free or projectCount < 3
  save Project
}

action InviteUser {
  validate org.seats > userCount
  create User
  send invite email
}
```

**SaaS concepts:**
- **Scoping:** `scope: org` for multi-tenancy
- **Plan limits:** Validation based on subscription
- **Seat management:** Counting users

---

## Language Cheat Sheet

### Data Types

```shep
text                    # String
number                  # Integer or float
money                   # Decimal currency
email                   # Validated email
date                    # Date only
datetime                # Date and time
boolean                 # True/false
file                    # File reference
image                   # Image reference
enum(a, b, c)           # Fixed values
EntityName              # Relationship
list(EntityName)        # One-to-many
ai("prompt")            # AI-computed
```

### Field Modifiers

```shep
(required)              # Must have value
(unique)                # No duplicates
(min=N)                 # Minimum value/length
(max=N)                 # Maximum value/length
(default=value)         # Default if not provided
(computed)              # Calculated field
```

### View Types

```shep
view ListName {
  show: [field1, field2]
  filter: [field1]
  sort: field1 desc
}

view FormName {
  input: [field1, field2]
  submit: ActionName
}

view DetailName {
  show: [field1, field2]
  actions: [action1, action2]
}
```

### Actions

```shep
action Name {
  validate condition
  set field = value
  save EntityName
  notify target
  log "message"
}
```

### AI Primitive

```shep
# AI field
field: ai("prompt")

# AI condition
if ai(field, "condition") { ... }

# AI task step
ai: do something
```

---

## Next Steps

1. **[Quick Start](./quickstart.md)** — Install and run your first program
2. **[Syntax Reference](./syntax-reference.md)** — Complete grammar
3. **[Language Spec](../spec/sheplang-spec.md)** — Formal specification

---

*ShepLang: A programming language for the AI era.*
