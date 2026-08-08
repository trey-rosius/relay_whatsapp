# Workshop Guide: Building a Serverless AI WhatsApp Marketplace with AWS Building Blocks & Amazon Nova

Welcome to the **Relay Community Books Application** workshop guide! This document provides a line-by-line, section-by-section breakdown of the entire backend codebase in [`aws-blocks/index.ts`](file:///Users/ro/Documents/playground/books-block-app/aws-blocks/index.ts). 

You can use this guide to teach students or team members how to combine **AWS Building Blocks**, **AWS Lambda Durable Functions**, **Amazon Bedrock AI (Amazon Nova)**, and **Meta's WhatsApp Graph API** into a production-grade serverless app.

---

## 🎯 Workshop Agenda & Learning Objectives

This workshop is structured into **4 comprehensive learning tracks** covering modern cloud architecture, generative AI, serverless workflows, and production DevOps:

### 🏗️ Track 1: Serverless & AWS Building Blocks Architecture
1. **Composable Cloud Primitives**: Learn how to use `@aws-blocks/blocks` (`Scope`, `DistributedTable`, `AppSetting`, `KnowledgeBase`, `RawRoute`, and `ApiNamespace`) to construct end-to-end cloud applications in pure TypeScript.
2. **End-to-End Type Safety & Invisible RPC**: Connect a React frontend to serverless backend methods without writing manual `fetch()` calls, OpenAPI specs, or running client codegen tools.
3. **Double-Sided Marketplace Data Modeling**: Design dedicated DynamoDB tables (`active-inventory` & `demand-board`) with Global Secondary Indexes (`byConcept`) for $O(1)$ sub-millisecond buyer/seller matchmaking.

### 🤖 Track 2: Generative AI, Multimodal Vision & Vector RAG
4. **Zero-Shot Multilingual Intent Parsing**: Use **Amazon Bedrock (Amazon Nova Lite & Nova Pro)** via the Bedrock Converse API to extract structured JSON from unstructured, messy parent messages in both English and French.
5. **Multimodal Media Ingestion**: Fetch, decode, and process parent book photos from Meta's CDN and analyze them using vision-capable foundation models.
6. **Vector Search & S3 Knowledge Bases**: Implement semantic search and document retrieval using **Amazon Bedrock KnowledgeBase** and S3 Vectors, including chunking strategies and strict 2KB payload constraints.

### ⚡ Track 3: Failure-Resilient Workflow Orchestration
7. **AWS Lambda Durable Functions**: Master long-running, fault-tolerant serverless workflows using `withDurableExecution` and `context.step()`, ensuring network calls to Bedrock and Meta are idempotent, retryable, and memoized across failures.
8. **Real-time Event Observability**: Build a structured lifecycle event stream (`ProcessingStarted`, `ExtractionComplete`, `MatchFound`, `ListingAdded`) for live monitoring, telemetry, and debugging.

### 🌐 Track 4: Third-Party Ingress, Security & Cloud Deployment
9. **Meta WhatsApp Cloud API Integration**: Configure webhook handshakes (`GET /webhook`), process real-time inbound message streams (`POST /webhook`), and dispatch automated outbound WhatsApp notifications.
10. **Local-First Development & One-Click Cloud Deployment**: Rapidly develop and test full AWS architectures locally using in-memory mocks (`npm run dev` & `npm run test:e2e`), and deploy to live AWS infrastructure (CloudFront, S3, API Gateway, Lambda, DynamoDB) with `npm run deploy`.


---

## 📋 Prerequisites for Participants & Instructors

Before starting the workshop, ensure you and your participants have set up the following:

### 1. Developer Environment & Local Tools
- **Node.js:** `v20.x` or later installed (`node -v`).
- **Package Manager:** `npm` (v10+) or `pnpm` / `yarn`.
- **Git:** Installed and configured (`git --version`).
- **Code Editor:** VS Code, Antigravity IDE, or any modern TypeScript editor.

### 2. AWS Account & Model Access
- **AWS Account:** Active AWS Account with permissions to create Lambda functions, DynamoDB tables, API Gateways, CloudFront distributions, and S3 buckets.
- **AWS CLI:** Configured locally with credentials (`aws configure`) pointing to region `us-east-1` (or your preferred Bedrock region).
- **Amazon Bedrock Model Access:**
  - Open AWS Console → **Amazon Bedrock** → **Model access**.
  - Request and verify access is **Granted** for **Amazon Nova Lite** (`amazon.nova-lite-v1:0`), **Amazon Nova Pro** (`amazon.nova-pro-v1:0`), and **Titan Embeddings G1 - Text**.

### 3. Meta (Facebook) WhatsApp Cloud API Setup
- **Meta Developer Account:** Registered at [developers.facebook.com](https://developers.facebook.com).
- **Meta Business Portfolio:** A Meta Business Account with an Admin System User.
- **WhatsApp Cloud API Credentials:**
  - `WHATSAPP_TOKEN`: Permanent System User Access Token with `whatsapp_business_messaging` and `whatsapp_business_management` permissions.
  - `WHATSAPP_PHONE_NUMBER_ID`: Verified WhatsApp Business Phone Number ID.
  - `WHATSAPP_VERIFY_TOKEN`: Webhook handshake verification string (e.g. `my_verify_token_123`).
  - *(Refer to [facebook_whatsapp_setup_guide.md](file:///Users/ro/Documents/playground/books-block-app/facebook_whatsapp_setup_guide.md) for the complete 7-step guide).*

### 4. Recommended Background Knowledge
- Basic proficiency in **TypeScript / JavaScript** and `async/await`.
- Fundamental understanding of Webhooks, JSON-RPC, and NoSQL databases (DynamoDB).

---

## 🧩 Section-by-Section Code Breakdown (`aws-blocks/index.ts`)

---

### Section 1: Primitives & Scope Setup (Lines 1–13)
```typescript
import { Scope, ApiNamespace, DistributedTable, AppSetting, KnowledgeBase, RawRoute } from '@aws-blocks/blocks';
import { z } from 'zod';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';

const scope = new Scope('wm');
const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });
```
- **`Scope('wm')`**: Acts as a namespace container in CDK and DynamoDB resource naming. It prevents resource name collisions across stacks.
- **`BedrockRuntimeClient`**: Standard AWS SDK v3 client used to talk to Amazon Bedrock models (`us.amazon.nova-lite-v1:0` and `us.amazon.nova-pro-v1:0`).

---

### Section 2: AppSettings & Meta WhatsApp Egress (Lines 14–59)
```typescript
export const whatsappTokenSetting = new AppSetting(scope, 'whatsapp-token', { ... });
export const whatsappVerifyTokenSetting = new AppSetting(scope, 'whatsapp-verify-token', { ... });
export const whatsappPhoneNumberIdSetting = new AppSetting(scope, 'whatsapp-phone-number-id', { ... });

export async function sendWhatsAppTextMessage(toPhone: string, textBody: string) {
  const token = await whatsappTokenSetting.get();
  const phoneId = await whatsappPhoneNumberIdSetting.get();
  const res = await fetch(`https://graph.facebook.com/v25.0/${phoneId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: toPhone.replace(/\s+/g, '').replace('+', ''),
      type: 'text',
      text: { body: textBody },
    }),
  });
  return await res.json();
}
```
- **`AppSetting`**: AWS Building Block that securely stores and retrieves secrets and configuration values (backed by SSM / Secrets Manager in AWS production, and local mock files during `npm run dev`).
- **`sendWhatsAppTextMessage()`**: Helper function that formats phone numbers and posts outgoing messages directly to Meta’s WhatsApp Graph API `v25.0`.

---

### Section 3: Data Models & DynamoDB Tables (Lines 60–129)
```typescript
export const activeInventorySchema = z.object({
  itemId: z.string(),
  sellerPhone: z.string(),
  title: z.string(),
  concept: z.string(),
  domain: z.enum(DOMAIN_TYPES),
  providerCategory: z.enum(PROVIDER_CATEGORIES),
  conditionType: z.enum(CONDITION_TYPES),
  description: z.string(),
  status: z.enum(['active', 'matched', 'claimed']).default('active'),
  createdAt: z.string(),
});

export const activeInventory = new DistributedTable(scope, 'active-inventory', {
  schema: activeInventorySchema,
  key: { partitionKey: 'itemId' },
  indexes: {
    byConcept: { partitionKey: 'concept', sortKey: 'createdAt' },
  },
});
```
- **Zod Schemas**: Guarantees compile-time TypeScript types AND runtime validation.
- **`DistributedTable`**: High-level wrapper over DynamoDB.
- **GSIs (`byConcept`)**: Crucial for fast marketplace matchmaking. Querying `activeInventory` or `demandBoard` by `concept` (`Year6Books`, `Year5Chemistry`) takes $O(1)$ DynamoDB index lookups instead of expensive full table scans.

---

### Section 4: AI Intent Engine via Amazon Nova (Lines 510–618)
```typescript
export async function parseParentMessageIntentsWithLLM(text: string): Promise<ExtractedIntentItem[]>
```
- **Why LLMs instead of Regex?**: Parent group messages are messy, multilingual, and contain multi-intent clauses (e.g. *"I have Year 9 Maths and I need Year 12 Physics"*).
- **Amazon Nova Lite & Pro**: Uses `us.amazon.nova-lite-v1:0` for fast sub-second inference. If throttled, it gracefully falls back to `us.amazon.nova-pro-v1:0`.
- **Zero-Shot Prompt Engineering**: Asks Amazon Nova to return structured JSON containing:
  - `intent`: `'offer'` | `'demand'` | `'catalog'` | `'demand_board'` | `'greeting'`
  - `lang`: `'en'` | `'fr'`
  - `concept`: Canonical key (e.g., `'Year6Books'`)

---

### Section 5: Concept Key Normalization & Subject Aggregation (Lines 620–700)
```typescript
export function normalizeConceptKey(rawConcept: string): string
export function buildGroupedCatalogText(activeBooks: ActiveInventoryItem[], lang: 'en' | 'fr'): string
```
- **`normalizeConceptKey`**: Standardizes phrasing variants (e.g. *"Year 2 Science Textbook"*, *"Year 2 Science"*, *"Livres Année 2"*) into the identical canonical string (`"Year2Science"`).
- **`buildGroupedCatalogText`**: 
  - Groups inventory by Grade/Year Level (`*Year 3*`, `*Year 4*`, `*Year 12*`).
  - Strips repetitive `"Books for Year "` clutter.
  - Merges duplicate subject counts under the same grade level (e.g. combines separate `"Science"` items into `• Science (2 available)`).

---

### Section 6: Durable Workflow Execution Engine (Lines 636–950)
```typescript
export const processWhatsAppInbound = withDurableExecution(
  scope,
  'process-whatsapp-inbound',
  async (context, payload: WhatsAppInboundPayload) => { ... }
);
```
- **`withDurableExecution`**: Turns the handler into an AWS Lambda Durable Function.
- **`context.step(name, fn)`**: Every external call or state mutation is wrapped in a named step boundary.
- **Why Durable Execution is essential for WhatsApp bots**:
  1. **Network Failure Resilience**: If Meta API or Bedrock times out, completed steps are checkpointed in DynamoDB and never re-executed.
  2. **Idempotency**: Prevents double-sending WhatsApp messages or inserting duplicate inventory records.

#### 🔄 Matchmaking Workflow Logic:
1. **If message is an OFFER (Parent listing a book)**:
   - Check `demandBoard` GSI `byConcept` for waiting buyers.
   - **Match Found**: Notify buyer & seller immediately via WhatsApp, mark demand as `fulfilled`.
   - **No Match**: Save item into `activeInventory` with `status: 'active'`.
2. **If message is a DEMAND (Parent requesting a book)**:
   - Check `activeInventory` GSI `byConcept` for available books.
   - **Match Found**: Notify requesting parent immediately with seller's contact details.
   - **No Match**: Save demand entry into `demandBoard` with `status: 'pending'`.

---

### Section 7: Meta Webhook Endpoints (`RawRoute`) (Lines 951–1100)
```typescript
export const whatsappWebhookVerification = new RawRoute(scope, 'whatsapp-webhook-verify', {
  method: 'GET',
  path: '/webhook',
  handler: async (context) => { ... }
});

export const whatsappWebhookReceiver = new RawRoute(scope, 'whatsapp-webhook-receive', {
  method: 'POST',
  path: '/webhook',
  handler: async (context) => { ... }
});
```
- **`GET /webhook`**: Handles Meta's mandatory initial webhook verification challenge (`hub.challenge` and `hub.verify_token`).
- **`POST /webhook`**: Receives live WhatsApp inbound payloads, extracts sender phone & message body, and passes them to `processWhatsAppInbound`.

---

### Section 8: Frontend RPC API (`ApiNamespace`) (Lines 1101–1176)
```typescript
export const api = new ApiNamespace(scope, 'api', (context) => ({
  async getMetrics() { ... },
  async getDemands() { ... },
  async deleteInventory(itemId: string) { ... },
  async deleteDemand(demandId: string) { ... },
}));
```
- **`ApiNamespace`**: Exposes typed RPC methods to the frontend (`src/`).
- **End-to-End Type Safety**: The React/Vite frontend imports `api` directly via `import { api } from 'aws-blocks'` with zero client SDK generation or REST glue code.

---

## 🛠️ Workshop Hands-on Exercises for Students

1. **Exercise 1 (Local Iteration)**: Run `npm run dev` and execute `npm run test:e2e` to verify all 9 E2E unit tests against local in-memory mocks.
2. **Exercise 2 (AWS Deployment)**: Run `npm run deploy` to synthesize CDK stacks and deploy the Lambda durable function, API Gateway, DynamoDB tables, and CloudFront SPA to AWS.
3. **Exercise 3 (Live WhatsApp Test)**: Trigger an offer for *"Year 6 Books"* via Meta WhatsApp API webhook and verify that the matchmaker automatically alerts the waiting parent on `demand-board`!
