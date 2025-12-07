/**
 * Shep New Command
 *
 * Scaffolds a new Shep project with all the necessary files.
 */

import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";

// ============================================================================
// Command Definition
// ============================================================================

export const newCommand = new Command("new")
  .description("Create a new Shep project")
  .argument("<name>", "Project name")
  .option("-t, --template <template>", "Template: blank, saas, marketplace, ai-chat", "blank")
  .option("--no-git", "Skip git initialization")
  .action(async (name: string, options: NewOptions) => {
    await createProject(name, options);
  });

// ============================================================================
// Types
// ============================================================================

interface NewOptions {
  template: "blank" | "saas" | "marketplace" | "ai-chat";
  git: boolean;
}

// ============================================================================
// Project Creation
// ============================================================================

async function createProject(name: string, options: NewOptions): Promise<void> {
  console.log("\n🐑 Shep New Project\n");

  const projectDir = path.resolve(name);

  // Check if directory already exists
  if (fs.existsSync(projectDir)) {
    console.error(`❌ Error: Directory "${name}" already exists.\n`);
    process.exit(1);
  }

  console.log(`📁 Creating project: ${name}`);
  console.log(`   Template: ${options.template}\n`);

  // Create project directory
  fs.mkdirSync(projectDir, { recursive: true });

  // Create project structure
  const files = getTemplateFiles(name, options.template);
  
  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(projectDir, filePath);
    const dir = path.dirname(fullPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(fullPath, content);
    console.log(`   ✓ ${filePath}`);
  }

  // Initialize git if requested
  if (options.git) {
    try {
      const { execSync } = await import("child_process");
      execSync("git init", { cwd: projectDir, stdio: "ignore" });
      console.log(`   ✓ Initialized git repository`);
    } catch {
      console.log(`   ⚠ Could not initialize git`);
    }
  }

  console.log(`\n✅ Project created!\n`);
  console.log(`   Next steps:`);
  console.log(`   1. cd ${name}`);
  console.log(`   2. Edit app.shep to define your app`);
  console.log(`   3. shep compile --input app.shep --output generated`);
  console.log(`   4. cd generated && ./run.sh\n`);

  if (options.template === "blank") {
    console.log(`   💡 Tip: Use "shep draft" to generate a spec with AI!\n`);
  }
}

// ============================================================================
// Template Files
// ============================================================================

function getTemplateFiles(name: string, template: string): Record<string, string> {
  const pascalName = toPascalCase(name);
  
  const baseFiles: Record<string, string> = {
    ".gitignore": `# Dependencies
node_modules/
__pycache__/
.venv/
venv/

# Build outputs
dist/
build/
.next/
*.tsbuildinfo

# Environment
.env
.env.local

# IDE
.vscode/
.idea/
.DS_Store

# Generated (optional - commit if you want)
# generated/
`,
    "README.md": `# ${pascalName}

Built with [Shep](https://github.com/Radix-Obsidian/ShepStack) - the spec-first full-stack framework.

## Getting Started

1. **Edit the spec**
   \`\`\`bash
   # Edit app.shep to define your entities, screens, flows, rules
   \`\`\`

2. **Generate code**
   \`\`\`bash
   shep compile --input app.shep --output generated
   \`\`\`

3. **Run the backend**
   \`\`\`bash
   cd generated
   pip install -r requirements.txt
   uvicorn main:app --reload --port 3001
   \`\`\`

4. **Run the frontend**
   \`\`\`bash
   cd frontend
   npm install
   npm run dev
   \`\`\`

## Project Structure

\`\`\`
${name}/
├── app.shep           # Your spec file
├── generated/         # Generated code (Python + SQL)
│   ├── models.py
│   ├── routes.py
│   ├── ai_client.py
│   └── ...
└── frontend/          # Generated frontend (TypeScript + React)
    ├── app/
    └── ...
\`\`\`

## Commands

- \`shep verify app.shep\` - Validate spec without generating
- \`shep compile --input app.shep\` - Generate code
- \`shep draft "description"\` - AI generates spec from description
- \`shep style --analyze ./generated\` - Generate AGENTS.md style guide
`,
  };

  // Add template-specific spec file
  baseFiles["app.shep"] = getTemplateSpec(pascalName, template);

  return baseFiles;
}

function getTemplateSpec(name: string, template: string): string {
  switch (template) {
    case "saas":
      return getSaaSTemplate(name);
    case "marketplace":
      return getMarketplaceTemplate(name);
    case "ai-chat":
      return getAIChatTemplate(name);
    default:
      return getBlankTemplate(name);
  }
}

function getBlankTemplate(name: string): string {
  return `app "${name}"
  description: "A new Shep application"
  version: "1.0"

# ============================================================================
# Entities - Define your data model
# ============================================================================

entity User:
  fields:
    - email: email (required)
    - name: text (required)
    - createdAt: datetime (required)

# Add more entities here...
# entity Product:
#   fields:
#     - name: text (required)
#     - price: money (required)
#     - owner: relationship(User)

# ============================================================================
# Screens - Define your UI
# ============================================================================

screen Home (dashboard):
  widgets:
    - welcome: number  # Replace with your widgets

screen UserList (list):
  entity: User
  fields: [email, name, createdAt]

# ============================================================================
# Flows - Define user journeys
# ============================================================================

flow "User signs up":
  1. User visits landing page
  2. User fills out sign up form
  3. System creates user account
  4. User is redirected to dashboard

# ============================================================================
# Rules - Define business logic
# ============================================================================

rule "Validate email format":
  if user.email is invalid → show error

# ============================================================================
# Integrations - External services
# ============================================================================

# integration Stripe:
#   purpose: "payment processing"

# integration Claude:
#   purpose: "AI features"

# ============================================================================
# Events - Analytics and tracking
# ============================================================================

event UserSignedUp:
  fields: [userId, email, source]
`;
}

function getSaaSTemplate(name: string): string {
  return `app "${name}"
  description: "A multi-tenant SaaS application"
  version: "1.0"

# ============================================================================
# Entities
# ============================================================================

entity Organization:
  fields:
    - name: text (required)
    - plan: enum(free, starter, pro, enterprise) (required)
    - stripeCustomerId: text
    - createdAt: datetime (required)

entity User:
  fields:
    - email: email (required)
    - name: text (required)
    - role: enum(owner, admin, member) (required)
    - organization: relationship(Organization) (required)
    - createdAt: datetime (required)

entity Subscription:
  fields:
    - organization: relationship(Organization) (required)
    - plan: enum(free, starter, pro, enterprise) (required)
    - status: enum(active, canceled, past_due) (required)
    - currentPeriodEnd: datetime (required)

# ============================================================================
# Screens
# ============================================================================

screen Landing (dashboard):
  widgets:
    - heroSection: number
    - pricing: list

screen SignUp (form):
  entity: User
  fields: [email, name]

screen Dashboard (dashboard):
  widgets:
    - activeUsers: number
    - revenue: number
    - usage: chart

screen Settings (form):
  entity: Organization
  fields: [name, plan]

screen TeamMembers (list):
  entity: User
  fields: [email, name, role]

# ============================================================================
# Flows
# ============================================================================

flow "Organization signs up":
  1. User visits landing page
  2. User clicks "Start Free Trial"
  3. User fills out signup form
  4. System creates organization and user
  5. User is redirected to dashboard

flow "User upgrades plan":
  1. User clicks "Upgrade" in settings
  2. User selects new plan
  3. Stripe checkout opens
  4. User completes payment
  5. System updates subscription
  6. User sees confirmation

# ============================================================================
# Rules
# ============================================================================

rule "Enforce plan limits":
  if organization.plan == "free" and users.count > 3 → show upgrade prompt

rule "Only owners can change plan":
  if user.role != "owner" → hide billing settings

# ============================================================================
# Integrations
# ============================================================================

integration Stripe:
  purpose: "subscription billing"

integration SendGrid:
  purpose: "transactional emails"

# ============================================================================
# Events
# ============================================================================

event OrganizationCreated:
  fields: [orgId, plan, source]

event SubscriptionChanged:
  fields: [orgId, oldPlan, newPlan]

event UserInvited:
  fields: [orgId, inviterUserId, inviteeEmail]
`;
}

function getMarketplaceTemplate(name: string): string {
  return `app "${name}"
  description: "A two-sided marketplace"
  version: "1.0"

# ============================================================================
# Entities
# ============================================================================

entity User:
  fields:
    - email: email (required)
    - name: text (required)
    - type: enum(buyer, seller) (required)
    - stripeAccountId: text
    - createdAt: datetime (required)

entity Listing:
  fields:
    - title: text (required)
    - description: text (required)
    - price: money (required)
    - images: list(text)
    - category: enum(electronics, clothing, home, other) (required)
    - status: enum(draft, active, sold, archived) (required)
    - seller: relationship(User) (required)
    - createdAt: datetime (required)

entity Order:
  fields:
    - listing: relationship(Listing) (required)
    - buyer: relationship(User) (required)
    - seller: relationship(User) (required)
    - amount: money (required)
    - status: enum(pending, paid, shipped, delivered, canceled) (required)
    - stripePaymentId: text
    - createdAt: datetime (required)

entity Review:
  fields:
    - order: relationship(Order) (required)
    - reviewer: relationship(User) (required)
    - rating: number (required)
    - comment: text
    - createdAt: datetime (required)

# ============================================================================
# Screens
# ============================================================================

screen Browse (list):
  entity: Listing
  fields: [title, price, category, images]

screen ListingDetail (detail):
  entity: Listing
  fields: [title, description, price, images, seller]

screen CreateListing (form):
  entity: Listing
  fields: [title, description, price, images, category]

screen SellerDashboard (dashboard):
  widgets:
    - totalSales: money
    - activeListings: number
    - pendingOrders: list

screen BuyerOrders (list):
  entity: Order
  fields: [listing, amount, status, createdAt]

# ============================================================================
# Flows
# ============================================================================

flow "Buyer purchases item":
  1. Buyer browses listings
  2. Buyer views listing detail
  3. Buyer clicks "Buy Now"
  4. Stripe checkout opens
  5. Buyer completes payment
  6. Order created, seller notified
  7. Seller ships item
  8. Buyer confirms delivery
  9. Funds released to seller

flow "Seller creates listing":
  1. Seller clicks "Create Listing"
  2. Seller fills out listing form
  3. Seller uploads images
  4. Seller publishes listing
  5. Listing appears in marketplace

# ============================================================================
# Rules
# ============================================================================

rule "Only seller can edit listing":
  if user != listing.seller → deny edit

rule "Require Stripe for sellers":
  if user.type == "seller" and !user.stripeAccountId → prompt Stripe setup

rule "Auto-archive sold listings":
  if order.status == "delivered" → set listing.status = "sold"

# ============================================================================
# Integrations
# ============================================================================

integration Stripe:
  purpose: "payments and payouts"

integration S3:
  purpose: "image storage"

integration SendGrid:
  purpose: "order notifications"

# ============================================================================
# Events
# ============================================================================

event ListingCreated:
  fields: [listingId, sellerId, category, price]

event OrderPlaced:
  fields: [orderId, buyerId, sellerId, amount]

event ReviewSubmitted:
  fields: [orderId, rating]
`;
}

function getAIChatTemplate(name: string): string {
  return `app "${name}"
  description: "An AI-powered chat application"
  version: "1.0"

# ============================================================================
# Entities
# ============================================================================

entity User:
  fields:
    - email: email (required)
    - name: text (required)
    - plan: enum(free, pro) (required)
    - createdAt: datetime (required)

entity Conversation:
  fields:
    - user: relationship(User) (required)
    - title: text (required)
    - createdAt: datetime (required)
    - summary: ai("summarize this conversation in one sentence")

entity Message:
  fields:
    - conversation: relationship(Conversation) (required)
    - role: enum(user, assistant) (required)
    - content: text (required)
    - timestamp: datetime (required)
    - sentiment: ai("classify as positive, neutral, or negative")

entity KnowledgeBase:
  fields:
    - name: text (required)
    - content: text (required)
    - embedding: text
    - createdAt: datetime (required)

# ============================================================================
# Screens
# ============================================================================

screen Chat (detail):
  entity: Conversation
  fields: [title, messages]

screen ConversationList (list):
  entity: Conversation
  fields: [title, summary, createdAt]

screen KnowledgeBaseManager (list):
  entity: KnowledgeBase
  fields: [name, createdAt]

screen UploadKnowledge (form):
  entity: KnowledgeBase
  fields: [name, content]

# ============================================================================
# Flows
# ============================================================================

flow "User chats with AI":
  1. User opens chat
  2. User types message
  3. System sends message to AI
  ai: generate response based on conversation history and knowledge base
  4. AI response displayed
  5. Conversation continues

flow "Admin uploads knowledge":
  1. Admin opens knowledge base manager
  2. Admin clicks "Upload"
  3. Admin enters content
  4. System generates embeddings
  5. Knowledge added to search index

# ============================================================================
# Rules
# ============================================================================

rule "Rate limit free users":
  if user.plan == "free" and messages_today > 20 → show upgrade prompt

rule "Auto-detect frustration":
  if ai(message.content, "sounds frustrated or angry") → flag for human review

rule "Escalate complex queries":
  if ai(message.content, "requires human expertise") → notify support team

# ============================================================================
# Integrations
# ============================================================================

integration Claude:
  purpose: "AI chat responses"

integration Pinecone:
  purpose: "vector search for knowledge base"

integration Stripe:
  purpose: "subscription billing"

# ============================================================================
# Events
# ============================================================================

event MessageSent:
  fields: [conversationId, role, sentiment]

event ConversationStarted:
  fields: [userId, source]

event KnowledgeUploaded:
  fields: [knowledgeBaseId, size]
`;
}

function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}
