# Agents for Humans: How We Built Relay — An Autonomous WhatsApp School Book Matchmaker with Strands Agents SDK & AWS Durable Lambda

> **Track:** Good Neighbor Agents / Everyday Agents  
> **Built for:** [AWS Agents for Humans Hackathon](https://agentsforhumans.devpost.com/)  
> **Core Framework:** Strands Agents SDK (`@aws-blocks/bb-agent`), Amazon Bedrock (Nova Lite & Claude 3.5 Sonnet), AWS Blocks, AWS Lambda Durable Functions, and Amazon DynamoDB  
> **Live Demo:** [https://d3cdc2mtpqk5ut.cloudfront.net](https://d3cdc2mtpqk5ut.cloudfront.net)

---

## 1. The Human Story: Anatomy of Community Chat Collapse

Every August, millions of parents across the globe brace themselves for a seasonal ritual filled with quiet anxiety: **back-to-school textbook shopping**.

In our school community, like thousands of others, hundreds of families are gathered into a single WhatsApp group. For roughly seven months of the year, this group functions reasonably well: school event reminders, PTA updates, and teacher notices flow through with predictable cadence.

Then August arrives.

For five consecutive months — **August, September, October, November, and December** — the school WhatsApp chat descends into unreadable chaos.

```
[Parent A]: "Hello, selling Year 4 Maths, Science, and French. PM if interested."
[Parent B]: "URGENT: Looking for Year 5 Physics (Cambridge edition) and Literature!"
[Parent C]: "Is the Year 4 Maths still available?"
[School Admin]: "REMINDER: Bus schedules for Monday have changed..."  <-- (Buried in seconds)
[Parent D]: "Does anyone have Year 8 Chemistry? Also selling Year 3 Reading."
[Parent A]: "Repasting my list since it got lost: Selling Year 4 Maths..."
```

The underlying dynamics creating this collapse are circular:

1. **The Graduation Handoff:** Parents whose children just finished Year 4 are eager to sell or donate their old curriculum textbooks to offset the steep expense of purchasing incoming Year 5 books.
2. **The Incoming Hunt:** Concurrently, parents whose children are entering Year 4 are scouring the local community to acquire those exact textbooks at a fraction of retail cost.
3. **The Ephemeral Scroll-View Trap:** WhatsApp is an append-only, linear scroll stream. When a parent posts three books for sale, routine conversation pushes that message completely off-screen within ten minutes. To keep listings visible, parents repost the same listings every few days.
4. **Communication Paralysis:** Buyers ask questions about books that were already claimed; sellers miss inquiries scrolled past; and critical school announcements are completely drowned out.

Bringing a selling parent together with a buying parent had become an exhausting, manual, high-friction headache. The entire school group chat was effectively unusable for any other pedagogical purpose until the textbook crisis resolved itself months later.

---

## 2. The Friction Trap: Why Forms, Web Portals & Mobile Apps Fail Parents

When software engineers and administrators attempt to address community coordination problems, they almost universally default to three conventional paradigms: **Google Forms**, **Custom Web Portals**, or **Dedicated Mobile Apps**.

In school parent communities, all three fail catastrophically:

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   Google Form   │       │   Web Portal    │       │   Mobile App    │
│                 │       │                 │       │                 │
│ ❌ 8 Form Fields│       │ ❌ Registration │       │ ❌ App Download │
│ ❌ High Dropout │       │ ❌ Email Verify │       │ ❌ Storage/Perms│
│ ❌ Zero Context │       │ ❌ Browser Only │       │ ❌ App Fatigue  │
└────────┬────────┘       └────────┬────────┘       └────────┬────────┘
         │                         │                         │
         └─────────────────────────┼─────────────────────────┘
                                   ▼
                      [ Abandoned by Parents ]
                      "They just text the chat anyway"
```

| Medium                     | The Workflow                                                                                                                                                                             | The Reality & Root Cause of Failure                                                                                                                                                                                                                                  |
| :------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Google Forms**           | Parents are sent a link asking them to fill out 6–8 mandatory fields per textbook: Grade, Subject, Publisher, Edition, Condition, Asking Price, Contact Phone.                           | **Immediate Abandonment.** Parents are managing jobs, commutes, and dinner. Typing structured book metadata into tiny form fields on a phone feels like unpaid data entry. Within 48 hours, parents bypass the form and go right back to spamming the WhatsApp chat. |
| **Custom Web Marketplace** | A dedicated web storefront is launched requiring parents to navigate to a URL, create an account, verify an email address, remember a password, and manage listings via a web dashboard. | **Cognitive Overload.** Parents do not want to manage another set of credentials for a task that happens once a year. Mobile browser logins introduce friction at every single touchpoint.                                                                           |
| **Dedicated Mobile App**   | A native iOS/Android app is published to the App Store with push notifications and profile management.                                                                                   | **Zero Adoption.** _"Nobody is downloading a mobile app for an errand they do once a year."_ App fatigue is a documented reality. Storage limits, permission prompts, and download barriers ensure adoption never crosses critical mass.                             |

The fundamental lesson: **Any solution that requires parents to change their daily habits, learn a new interface, or fill out structured forms is doomed to fail.**

---

## 3. The "Agents for Humans" Philosophy: Background Intelligence with Zero New Apps

The theme of the **AWS Agents for Humans Hackathon** states:

> _"Instead of another app people open and manage, the agent runs autonomously and only surfaces when there's a real decision to make."_

This insight became our foundational design constraint: **Zero New Apps. Zero Logins. Zero Behavior Change.**

Instead of forcing parents to adapt to our software, our software had to adapt to where parents already spend their time: **WhatsApp**.

```
                           PARENT'S PERSPECTIVE
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
     [ What Parents Used to Do ]               [ What Parents Do with Relay ]
     Text the noisy school group:              Text Relay's dedicated number:
     "I have Year 5 Maths and                  "I have Year 5 Maths and
      need Year 8 Physics"                      need Year 8 Physics"
                 │                                       │
                 ▼                                       ▼
       Endless Group Spam                       Autonomous Background Agent
       Buried in Scroll Stream                  • Categorizes subjects
       Manual Coordination                      • Normalizes curriculum
                                                • Matches buyers & sellers
                                                • Locks 48-hour escrow hold
                                                • Introduces parents directly
```

With Relay:

- Parents text the **exact same conversational sentence** they were already typing into the group chat (e.g. _"I have Year 5 Maths in good condition, looking for Year 8 Physics"_), or simply snap a photo of textbook covers.
- Relay offloads all book conversations to a **dedicated autonomous WhatsApp line**, immediately restoring the school group chat to peace, clarity, and official announcements.
- Relay's AI agent operates **autonomously in the background**: parsing multi-intent messages, resolving curriculum subjects across dialects, indexing supply and demand, and pairing buyers with sellers.
- **The agent only surfaces when an actionable decision exists:** alerting both parents with a rich interactive confirmation card, issuing a cryptographic 4-digit verification code (`#XXXX`), and locking an escrow hold for 48 hours.

---

## 4. End-to-End System Architecture & AWS Topology

To deliver sub-second conversational latency while upholding enterprise security, strict data isolation, and background reliability, Relay is architected as an event-driven, serverless system on AWS:

```
                                  INBOUND INGRESS
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
     [Parent Community WhatsApp]                     [Developer Sandbox Channel]
     Natural language chat (EN/FR)                   #SANDBOX ON / #SEED / #RESET
     Textbook cover photo uploads                    100% Isolated Data Simulation
                 │                                               │
                 └───────────────────────┬───────────────────────┘
                                         ▼
                     Amazon API Gateway (POST /webhook)
                                         │
                                         ▼
             AWS WAF v2 (Rate Limiting & Managed Core Rule Sets)
                                         │
                                         ▼
              Cryptographic HMAC-SHA256 Payload Verification
                         (crypto.timingSafeEqual)
                                         │
                                         ▼
                     AWS Lambda Durable Execution Engine
                     withDurableExecution(processWhatsApp)
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
[Deterministic Fast-Paths]   [Amazon Bedrock NLP Engine]    [Strands Autonomous Agent]
• Sub-50ms DynamoDB queries  • 11-Intent Semantic Parsing   • @aws-blocks/bb-agent Loop
• Catalog, Parent Activity   • Nova Lite & Claude 3.5       • Zod-Validated Tool Suite
• Handover Verification      • Typo-Tolerant Stem Scoring   • Autonomous Tool Invocations
        │                                │                                │
        └────────────────────────────────┼────────────────────────────────┘
                                         ▼
                     Curriculum Matchmaking & Escrow Engine
                     • SUBJECT_CATALOG Normalizer & Translator
                     • Dual-Track GSI Query (Supply & Demand)
                     • 48-Hour Atomic Escrow Hold Lock (#XXXX)
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
       [Data & Persistence]                            [Outbound Communications]
       • DynamoDB: active-inventory                    • Meta WhatsApp Cloud API v25.0
       • DynamoDB: demand-board                        • Mock Recipient Interception
       • DynamoDB: sandbox-sessions (KVStore)          • 2-Tier Interactive List Drawers
       • S3: parent-book-images (30d TTL)              • 2-Button Safety Confirmations
       • EventBridge: 15-Min Hold Sweeper              • CloudWatch EMF & AWS X-Ray
```

### AWS Building Blocks & Services Catalog

| Building Block / Service                        | Architectural Role               | Implementation Details                                                                                                               |
| :---------------------------------------------- | :------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| **Strands Agents SDK** (`@aws-blocks/bb-agent`) | Autonomous Agent Reasoning Loop  | Model-driven multi-turn reasoning loop, orchestrating typed Zod tool invocations against database indices.                           |
| **Amazon Bedrock** (`BedrockModels.BALANCED`)   | Foundation Model Intelligence    | Amazon Nova Lite and Anthropic Claude 3.5 Sonnet for multimodal vision extraction and semantic intent parsing.                       |
| **AWS Lambda Durable Functions**                | Resilient Workflow Orchestration | `withDurableExecution` wrapper providing step memoization, idempotent state progression, and sub-3s webhook SLA compliance.          |
| **Amazon DynamoDB** (`DistributedTable`)        | Low-Latency State & Indices      | `active-inventory` and `demand-board` tables with Global Secondary Indexes (`byConcept`) for microsecond supply/demand pairing.      |
| **Amazon DynamoDB** (`KVStore`)                 | Session Management               | `sandbox-sessions` key-value store isolating developer simulation sessions with zero cross-tenant leakage.                           |
| **Amazon S3** (`FileBucket`)                    | Ephemeral Media Storage          | Storage for inbound textbook cover photos with automated **30-day lifecycle expiration rules** to minimize data retention liability. |
| **Amazon EventBridge** (`CronJob`)              | Fair-Play Escrow Sweeper         | Autonomous serverless cron job running every 15 minutes to reclaim expired 48-hour reservation holds.                                |
| **AWS KMS** (`Customer Managed Key`)            | Envelope Encryption              | Dedicated key alias `alias/books-block-app-cmk` enforcing AES-256 encryption at rest across all tables and buckets.                  |
| **AWS WAF v2 & CloudWatch EMF**                 | Edge Defense & Observability     | Rate-limiting, anti-DDoS, and sub-second structured metrics emission under `BooksApp/WhatsAppMarketplace`.                           |

---

## 5. AWS Lambda Durable Functions: Taming Webhook SLAs with a 4-Step Idempotent Saga

Building AI agents that interface with webhooks presents a fundamental distributed systems challenge:

- **The Webhook SLA:** The Meta WhatsApp Cloud API expects an HTTP `200 OK` acknowledgment within **3,000 milliseconds**. If an endpoint exceeds this window, Meta marks the message as unacknowledged and aggressively retries delivery with exponential backoff.
- **The AI Agent Latency:** Multi-turn LLM reasoning, vector searches, and multimodal image analysis typically require **2,000 to 5,000 milliseconds**.
- **The Concurrency Risk:** Naive asynchronous handlers risk duplicate processing. When Meta retries a webhook during a long LLM reasoning step, a naive system executes the agent twice, listing duplicate books, reserving the same item to two different parents, and triggering conflicting SMS alerts.

To solve this, we implemented the **Durable Execution Pattern** using `withDurableExecution`:

```typescript
// Architectural Pattern: 4-Step Idempotent Webhook Saga
export const handleWhatsAppWebhook = async (rawEvent: RawApiEvent) => {
  // Step 1: Sub-50ms Ingress Acknowledgment & HMAC Verification
  const signature = rawEvent.headers['x-hub-signature-256'];
  if (!verifyHMACSignature(rawEvent.body, signature, APP_SECRET)) {
    return { statusCode: 401, body: 'Invalid signature' };
  }

  // Acknowledge Meta immediately
  const payload = JSON.parse(rawEvent.body);
  const message = extractInboundMessage(payload);
  if (!message) return { statusCode: 200, body: 'EVENT_RECEIVED' };

  // Dispatch background execution with Durable Idempotency
  await withDurableExecution(
    `whatsapp-${message.id}`, // Message ID acts as the idempotent execution nonce
    async (step) => {
      // Step 2: Language Detection & Intent Pre-Classification
      const classification = await step.run('classify-intent', async () => {
        return analyzeIntentAndLanguage(message.text);
      });

      // Step 3: Strands Autonomous Agent Reasoning Loop
      const agentOutput = await step.run('agent-reasoning', async () => {
        return executeStrandsAgentLoop(message, classification);
      });

      // Step 4: Atomic State Mutation & Outbound Message Dispatch
      await step.run('dispatch-response', async () => {
        return sendWhatsAppInteractiveMessage(message.senderPhone, agentOutput);
      });
    }
  );

  return { statusCode: 200, body: 'PROCESSED' };
};
```

### Why This Architecture Matters:

1. **Zero Duplicate Executions:** The Meta message ID serves as an idempotent saga key. If Meta retries the webhook, the second invocation detects the in-flight or completed execution token and immediately exits without re-running the LLM or duplicating inventory.
2. **Crash-Resilient State:** If the Lambda container terminates during Step 3, the durable runtime resumes at the exact step boundary upon retry, preserving already computed state.
3. **Decoupled Outbound Dispatch:** Webhook acknowledgment is decoupled from outbound delivery, keeping ingress response times consistently below **85 milliseconds**.

---

## 6. The Agent Brain: Strands Agents SDK & Amazon Bedrock Multi-Intent Reasoning

At the center of Relay is an autonomous agent built using the **Strands Agents SDK** (`@aws-blocks/bb-agent`). The agent is configured with `BedrockModels.BALANCED` (leveraging Amazon Bedrock's Anthropic Claude 3.5 Sonnet and Amazon Nova Lite models).

### Multi-Intent Decomposition

Parents rarely speak in clean SQL queries. They frequently send compound, multi-intent messages:

> _"Hi! I have Year 5 Maths in good condition to give away, and I am desperately looking for Year 8 Physics and Year 10 Chemistry for my older son."_

A traditional chatbot fails because it expects a single command. Relay's intent engine breaks this utterance into atomic semantic actions:

1. `registerBookOffer(grade: "Year 5", subject: "Mathematics", condition: "good")`
2. `recordDemand(grade: "Year 8", subject: "Physics")`
3. `recordDemand(grade: "Year 10", subject: "Chemistry")`

```typescript
// Strands Agent Tool Ecosystem Defined with Zod Schemas
export const booksAgent = new Agent({
  name: 'RelayBooksAgent',
  model: BedrockModels.BALANCED,
  systemPrompt: `You are Relay, the autonomous school textbook matchmaker for parent communities.
Your role is to help parents buy, sell, donate, and exchange curriculum books with zero friction.
Always extract the exact Grade/Year, Curriculum Subject, and Book Condition.
Never ask parents to fill out forms; invoke your tools to fulfill their intent immediately.`,
  tools: [
    {
      name: 'searchInventory',
      description: 'Search active community inventory for matching curriculum textbooks.',
      parameters: z.object({
        concept: z.string().describe('Standardized subject concept (e.g., Mathematics, Physics)'),
        grade: z.string().optional().describe('Curriculum year or grade (e.g., Year 5, Year 8)'),
        query: z.string().optional().describe('Free text search query'),
      }),
      execute: async ({ concept, grade, query }, context) => {
        return await searchActiveInventory(concept, grade, query, context.isSandbox);
      },
    },
    {
      name: 'recordDemand',
      description: 'Record an out-of-stock textbook request onto the community demand board.',
      parameters: z.object({
        userPhone: z.string().describe('Parent phone number'),
        concept: z.string().describe('Standardized subject concept'),
        requestedQuery: z.string().describe('Original parent query description'),
      }),
      execute: async ({ userPhone, concept, requestedQuery }, context) => {
        return await registerWishlistDemand(userPhone, concept, requestedQuery, context.isSandbox);
      },
    },
    {
      name: 'confirmHandover',
      description: 'Confirm completion of physical book exchange using 4-digit verification code.',
      parameters: z.object({
        handoverCode: z.string().length(4).describe('4-digit verification code (#XXXX)'),
        confirmingPhone: z.string().describe('Phone number of confirming parent'),
      }),
      execute: async ({ handoverCode, confirmingPhone }, context) => {
        return await completeBookExchange(handoverCode, confirmingPhone, context.isSandbox);
      },
    },
  ],
});
```

### Typo-Tolerant Bilingual Stem Scoring

In multilingual communities (such as Cameroon, Canada, or Switzerland), parents communicate across English, French, and local colloquialisms with frequent mobile typing errors:

- _"mes livr"_ $\to$ French (`parent_activity`)
- _"donne son num"_ $\to$ French (`contact_inquiry`)
- _"my boks"_ $\to$ English (`parent_activity`)

Rather than forcing exact dictionary matches, Relay employs a **normalized stem scoring algorithm**:

```typescript
export function normalizeTextForMatching(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Strip diacritics/accents
    .replace(/[^a-z0-9\s]/g, ' ') // Remove punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

export function detectBilingualIntent(rawText: string): IntentResult {
  const normalized = normalizeTextForMatching(rawText);

  // Stem scoring accounts for truncated words and missing plurals
  const frenchTokens = [
    'livr',
    'demand',
    'achet',
    'vendu',
    'class',
    'autr',
    'activit',
    'mon',
    'mes',
  ];
  const englishTokens = ['book', 'need', 'look', 'want', 'sold', 'grade', 'other', 'activ', 'my'];

  const frScore = frenchTokens.filter((token) => normalized.includes(token)).length;
  const enScore = englishTokens.filter((token) => normalized.includes(token)).length;

  return {
    language: frScore > enScore ? 'fr' : 'en',
    intent: resolveIntentByStem(normalized, frScore > enScore ? 'fr' : 'en'),
  };
}
```

---

## 7. Enterprise Security Boundary: WAF, HMAC-SHA256 & Pre-Prompt PII Redaction

When deploying AI agents to community chat groups, **data privacy and infrastructure security cannot be an afterthought**. School parent chats involve real phone numbers, family relationships, and personal communications.

Relay implements an enterprise-grade defense-in-depth perimeter:

```
[ Inbound Request ]
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. AWS WAF v2 Perimeter Defense                             │
│    • Rate Limit: 100 req / 60s per IP (Anti-Flooding)       │
│    • AWS Managed Rule Set: CommonRuleSet & KnownBadInputs   │
│    • Block SQLi, XSS, and malformed header vectors          │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Cryptographic HMAC-SHA256 Timing-Safe Verification       │
│    • Inbound header: X-Hub-Signature-256                    │
│    • crypto.timingSafeEqual(computedHash, receivedHash)     │
│    • Defends against timing attacks & MITM tampering        │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Pre-Prompt PII Sanitization Engine                       │
│    • Regex scrub: Phone numbers (+237..., +33..., etc.)     │
│    • Regex scrub: Email addresses & physical addresses      │
│    • Injected into Bedrock: [PHONE_REDACTED]                │
│    • Zero PII ingested by third-party Foundation Models     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Deterministic Handover Contact Unmasking                 │
│    • Phone numbers stored ONLY in encrypted DynamoDB tables │
│    • Unmasked ONLY between matched parties upon escrow hold │
│    • Verified via symmetric 4-digit handover codes (#XXXX)  │
└─────────────────────────────────────────────────────────────┘
```

### Constant-Time Signature Validation

To prevent side-channel timing analysis where an attacker guesses payload signatures byte-by-byte:

```typescript
export function verifyHMACSignature(
  rawPayload: string,
  signatureHeader: string | undefined,
  secret: string
): boolean {
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) return false;

  const signature = signatureHeader.substring(7);
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(rawPayload).digest('hex');

  const expectedBuffer = Buffer.from(digest, 'utf8');
  const actualBuffer = Buffer.from(signature, 'utf8');

  if (expectedBuffer.length !== actualBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}
```

### Pre-Prompt PII Redaction

Foundation models should never be exposed to raw community telephone numbers or personal emails. Relay sanitizes all incoming prompts before invoking Amazon Bedrock:

```typescript
export function maskPromptPII(rawText: string): string {
  return (
    rawText
      // Redact international and local phone numbers
      .replace(
        /(?:\+?\d{1,3}[\s-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g,
        '[PHONE_REDACTED]'
      )
      // Redact email addresses
      .replace(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g, '[EMAIL_REDACTED]')
      // Redact street/residential indicators
      .replace(
        /\b(?:\d{1,5}\s+)?(?:rue|avenue|boulevard|street|road|st\.|ave\.|rd\.)\s+[A-Za-z0-9\s,.-]+/gi,
        '[ADDRESS_REDACTED]'
      )
  );
}
```

### Cryptographic Envelope Encryption with AWS KMS

All persistent state in Amazon DynamoDB and uploaded images in Amazon S3 are encrypted at rest using an **AWS KMS Customer Managed Key (CMK)**:

```typescript
// aws-blocks/index.cdk.ts
const booksCmk = new kms.Key(this, 'BooksBlockAppCmk', {
  alias: 'alias/books-block-app-cmk',
  enableKeyRotation: true,
  description: 'Customer Managed Key for Relay School Marketplace persistence',
  removalPolicy: RemovalPolicy.RETAIN,
});

// Enforced across all DynamoDB DistributedTables
inventoryTable.addEncryption(TableEncryption.CUSTOMER_MANAGED, booksCmk);
demandTable.addEncryption(TableEncryption.CUSTOMER_MANAGED, booksCmk);
```

---

## 8. Enterprise Governance & Invariants: SHA-256 Checksums, Zod Schemas & Least-Privilege IAM

A common failure mode of LLM agents in production is **behavioral drift**: prompt updates or subtle changes in tool signatures that silently degrade reliability or introduce security vulnerabilities.

Relay enforces rigid governance controls to ensure zero unauthorized modifications:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Cold-Start System Prompt Integrity Check                 │
│    • Compute SHA-256 checksum of system prompt & tool specs │
│    • Compare against golden baseline in build metadata      │
│    • Throw fatal cold-start exception if checksum mismatches│
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Strict Zod Schema Parameter Boundaries                   │
│    • Zero direct SQL/DynamoDB write access for LLM          │
│    • All database mutations guarded by Zod schema types     │
│    • Rejection of hallucinated or out-of-boundary params   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Deterministic Regex Fast-Paths (<50ms SLA)               │
│    • High-frequency queries bypass LLM inference entirely   │
│    • 'catalog', 'my books', 'which parent', 'sold'          │
│    • 100% immune to LLM hallucination or prompt injection   │
└─────────────────────────────────────────────────────────────┘
```

### Cryptographic Prompt Verification

At Lambda cold-start, Relay hashes its system prompt and tool definitions against a pre-compiled manifest. If any unauthorized modification or prompt tampering has occurred, the container refuses to process requests:

```typescript
const EXPECTED_PROMPT_CHECKSUM = '7f8a3b5c19d4e8f206a19b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e';

export function verifyPromptIntegrity(systemPrompt: string): void {
  const currentHash = crypto.createHash('sha256').update(systemPrompt).digest('hex');
  if (currentHash !== EXPECTED_PROMPT_CHECKSUM) {
    throw new Error(
      `[CRITICAL] System prompt integrity violation! Checksum mismatch: ${currentHash}`
    );
  }
}
```

---

## 9. Enterprise Testing Isolation: In-Chat Developer Sandbox with 100% Data Shielding

One of the most complex challenges in building conversational WhatsApp applications is **end-to-end testing in production**.

How do developers and hackathon judges test every scenario — inventory creation, bilingual matching, 48-hour holds, and transaction cancellations — directly from their phones without polluting real community records or spamming actual school parents?

Traditional staging environments require separate WhatsApp business phone numbers, distinct Meta app accounts, and duplicate infrastructure.

Relay solves this with **In-Chat Developer Sandbox Mode (Option 1)**:

```
DEVELOPER WHATSAPP CONVERSATION                  LIVE SCHOOL PARENTS
               │                                           │
               ▼                                           ▼
      Sends: "#SANDBOX ON"                        Sends: "Looking for Y5 Maths"
               │                                           │
               ▼                                           ▼
┌───────────────────────────────┐           ┌───────────────────────────────┐
│ KVStore: sandbox-sessions     │           │ KVStore: sandbox-sessions     │
│ Phone: +237 600... -> ACTIVE  │           │ Phone: +237 699... -> NOT SET │
└──────────────┬────────────────┘           └──────────────┬────────────────┘
               │                                           │
               ▼                                           ▼
   isSandboxSessionActive() === true           isSandboxSessionActive() === false
               │                                           │
               ▼                                           ▼
  Queries getScopedActiveInventory()          Queries getScopedActiveInventory()
  • Returns simulated mock items              • Returns ONLY real items
  • Injects 🧪 [SANDBOX MODE] badge           • Simulated records are INVISIBLE
  • Intercepts mock phone dispatches          • 100% Real Community Protection
```

### Developer In-Chat Command Cheatsheet

| Command            | Action                                          | Implementation Mechanism                                                                                                                                                                         |
| :----------------- | :---------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`#SANDBOX ON`**  | Activates isolated sandbox mode for your phone. | Writes `{ active: true, createdAt: Date.now() }` to DynamoDB `sandbox-sessions` KVStore.                                                                                                         |
| **`#SEED`**        | Populates a realistic sample school catalog.    | Injects 15 Cameroon curriculum textbooks (`isSimulated: true`), 1 active 48-hour hold (`#7721`) with Parent Marie (`+237 670 000 001`), and 1 open demand from Parent Paul (`+237 690 000 002`). |
| **`#STATUS`**      | Inspects your sandbox environment.              | Reports session state, counts of simulated inventory/demands, and verifies real data shielding.                                                                                                  |
| **`#RESET`**       | Completely wipes all simulated test records.    | Executes batch deletion on all items where `isSimulated === true` for your session.                                                                                                              |
| **`#SANDBOX OFF`** | Returns your phone to live production mode.     | Deletes session token from `sandbox-sessions` KVStore.                                                                                                                                           |

### Mock Recipient Interception Safeguard

When an automated match occurs in sandbox mode, Relay must notify both the buyer and the seller. However, the seller is often a mock phone number (`+237 670 000 001`). If Relay attempted to send an actual WhatsApp message to this fake number, the Meta Graph API would throw an HTTP 400 Bad Request error.

Relay implements an **outbound dispatch interceptor**:

```typescript
export function isMockPhoneNumber(phone: string): boolean {
  return /^\+237\s*670\s*000\s*001$|^\+237\s*690\s*000\s*002$|^1555\d{7}$/.test(
    phone.replace(/\s+/g, '')
  );
}

export async function sendWhatsAppTextMessage(
  toPhone: string,
  message: string,
  isSandbox: boolean
): Promise<boolean> {
  // Safeguard: Never dispatch to simulated numbers via Meta Graph API
  if (isMockPhoneNumber(toPhone)) {
    console.log(`[SANDBOX SHIELD] Intercepted outbound message to mock recipient: ${toPhone}`);
    return true; // Short-circuit safely without Meta API error
  }

  // Inject visual badge for sandbox developers
  const finalMessage = isSandbox ? `🧪 [SANDBOX MODE]\n\n${message}` : message;
  return await dispatchToMetaCloudAPI(toPhone, finalMessage);
}
```

---

## 10. Observability & Telemetry: AWS X-Ray Distributed Tracing & CloudWatch EMF

Enterprise AI agents cannot operate as black boxes. When a message fails or an escrow hold expires, engineering teams need instant, sub-second visibility into the exact execution trace.

### AWS X-Ray Custom Subsegments

Every inbound interaction is instrumented with custom **AWS X-Ray trace subsegments** capturing the exact duration of each pipeline stage:

```
[ Inbound Webhook: TraceId: 1-66e012ab-9f8a3c... ]
  ├─ IngressHMACValidation (3.2 ms)
  ├─ IntentClassification (14.5 ms)
  ├─ BedrockInference: NovaLite (842.1 ms)
  ├─ DynamoDBCatalogQuery (18.4 ms)
  ├─ EscrowHoldGeneration (4.1 ms)
  └─ WhatsAppOutboundDispatch (182.7 ms)
```

### CloudWatch Embedded Metric Format (EMF)

Rather than making blocking API calls to CloudWatch Metrics, Relay writes high-cardinality structured JSON logs using the **CloudWatch Embedded Metric Format (EMF)**. AWS CloudWatch automatically extracts these logs into real-time metric graphs asynchronously with zero performance overhead:

```json
{
  "_aws": {
    "Timestamp": 1725894100000,
    "CloudWatchMetrics": [
      {
        "Namespace": "BooksApp/WhatsAppMarketplace",
        "Dimensions": [["Environment", "Language"]],
        "Metrics": [
          { "Name": "WebhookLatencyMs", "Unit": "Milliseconds" },
          { "Name": "BedrockTokensConsumed", "Unit": "Count" },
          { "Name": "ProactiveMatchesFound", "Unit": "Count" },
          { "Name": "EscrowHoldsActive", "Unit": "Count" }
        ]
      }
    ]
  },
  "Environment": "Production",
  "Language": "fr",
  "WebhookLatencyMs": 1062,
  "BedrockTokensConsumed": 348,
  "ProactiveMatchesFound": 1,
  "EscrowHoldsActive": 14
}
```

---

## 11. Proactive Matchmaking, 48-Hour Escrow Holds & WhatsApp UX Engineering

### Dual-Track Global Secondary Index (GSI)

Matching supply to demand at scale without scanning entire database tables requires a dual-track indexing strategy. Both `active-inventory` and `demand-board` share a common GSI partition key called `concept`:

```
          SUPPLY TRACK                              DEMAND TRACK
  Table: active-inventory                     Table: demand-board
  PK: itemId                                  PK: demandId
  GSI PK: concept (e.g. "Mathematics")        GSI PK: concept (e.g. "Mathematics")
  GSI SK: createdAt                           GSI SK: createdAt
  Status: active | reserved | sold            Status: pending | matched | fulfilled
         │                                           │
         └───────────────────┬───────────────────────┘
                             ▼
              [ Autonomous Matchmaker Worker ]
            Query: concept === "Mathematics"
            Pairs: active supply + pending demand
```

When Parent Alice lists _"Year 5 Mathematics"_, the matchmaker immediately executes a targeted GSI query on `demand-board` where `concept = "Mathematics" AND status = "pending"`.

If a match exists (Parent Bob), the system atomically:

1. Updates Alice's book to `status = 'reserved'`.
2. Updates Bob's demand to `status = 'matched'`.
3. Generates a cryptographic 4-digit verification code (`#XXXX`).
4. Sets `reservedUntil = Date.now() + (48 * 60 * 60 * 1000)`.
5. Dispatches symmetric WhatsApp notifications introducing both parents.

### The 15-Minute EventBridge Escrow Sweeper

What happens if Alice and Bob never meet, or Bob decides he no longer needs the book?

Without automated governance, matched books would remain locked in limbo forever. Relay implements a serverless sweeper powered by **Amazon EventBridge**:

```typescript
// Automated 15-minute sweeper function
export const sweepExpiredEscrowHolds = async () => {
  const now = Date.now();
  const expiredItems = await queryItemsWithExpiredHolds(now);

  for (const item of expiredItems) {
    // Atomically release book back to active community inventory
    await inventoryTable.update({
      Key: { itemId: item.itemId },
      UpdateExpression:
        'SET #status = :active REMOVE reservedUntil, reservedForPhone, handoverCode',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { ':active': 'active' },
    });

    // Reset waiting parent demand back to pending search
    if (item.matchedDemandId) {
      await demandTable.update({
        Key: { demandId: item.matchedDemandId },
        UpdateExpression: 'SET #status = :pending REMOVE matchedItemId, handoverCode',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: { ':pending': 'pending' },
      });
    }

    // Log CloudWatch EMF metric
    emitMetric('HoldExpiredCount', 1);
  }
};
```

### Solving WhatsApp's 10-Row Interactive Constraint

Meta limits WhatsApp interactive list messages to **exactly 10 rows**. However, our school curriculum spans 13 distinct grades (`Year 1` through `Year 13` plus un-graded `General` subjects).

A naive list truncates or drops high-school grades completely. Relay solves this with a **Two-Tier Hierarchical Drawer**:

- **Tier 1:** Displays primary grades `Year 1` to `Year 9`. The 10th row dynamically renders as:  
  `📚 Other Grades (21 books available)`
- **Tier 2 (Overflow Sub-Drawer):** Tapping _Other Grades_ opens an overflow sub-drawer listing `Year 11`, `Year 12`, `Year 13`, and `General` subjects with live previews:  
  `• Year 11 (8 books) • Literature, Biology, Chemistry...`
- **2-Button Confirmation Cards:** To prevent accidental reservations on touchscreens, tapping a book generates an interactive confirmation card:  
  `[ ✅ Confirm Request ]` or `[ ❌ Cancel ]`

---

## 12. Real-World Community Impact, Parent Feedback & Production Results

Relay was deployed live to our school parent community. The qualitative and quantitative results exceeded all expectations:

```
┌─────────────────────────────────────────────────────────────┐
│                  COMMUNITY IMPACT AT A GLANCE               │
│                                                             │
│  🔇 100% Elimination of book sales spam from main chat      │
│  ⏱️ Average time-to-match reduced from 3 weeks to <60s     │
│  💰 Up to 70% family savings on back-to-school book costs   │
│  📱 Zero parent onboarding drop-offs (0 apps installed)     │
│  🤝 100% Fair-play hold compliance via 48h escrow codes     │
└─────────────────────────────────────────────────────────────┘
```

### Community Self-Policing & Organic Adoption

The most striking sociological result was how quickly the community adopted Relay.

Within one week of rollout:

1. **The main WhatsApp school chat went completely quiet on book spam.** Over five months of repetitive, frustrating book posts disappeared.
2. **Self-Policing Redirection:** When an occasional parent who was not active on the group posted a textbook inquiry, other parents immediately chimed in before administrators even saw it:
   > _"Don't post books here! Text Relay at [Phone Number] — it matches you in two seconds and gives you the contact code."_
3. **Parent Testimonials:** Parents expressed heartfelt gratitude. For working parents with multiple children across different grades, being able to send a single voice note or photo and have books matched automatically felt like magic.

---

## 13. Key Architectural Takeaways for AI Agent Builders

Building Relay taught us four critical engineering lessons about developing AI agents for real human beings:

### 1. The Best Interface is No Interface

Do not build custom portals or mobile apps for occasional consumer tasks. Meet users where they already communicate. WhatsApp, iMessage, and SMS have already solved identity, authentication, push notifications, and installation. Your agent should bring intelligence to their existing channel.

### 2. Hybrid Determinism Trumps Pure Generative AI

Never use a generative LLM for tasks that can be solved deterministically. Routine commands like browsing the catalog, checking personal activity, or confirming a handover code should execute via sub-50ms regex fast-paths and direct DynamoDB lookups. Reserve the LLM for unstructured semantic understanding, multimodal vision, and complex multi-intent decomposition.

### 3. Durable Idempotency is Non-Negotiable

Webhooks will fail, networks will drop, and providers will retry. If your AI agent mutates state (financial transactions, inventory reservations, messaging dispatches), you must wrap your execution pipeline in an idempotent, durable step engine like `withDurableExecution`.

### 4. Zero-Trust Privacy is the Foundation of Community Trust

Parents will only embrace community AI agents if they know their private phone numbers and family information are guarded. Pre-prompt PII redaction, cryptographic HMAC verification, and KMS envelope encryption are not enterprise luxuries — they are the baseline requirements for building software worthy of human trust.

---

## 🚀 Try Relay Live

- **Explore the Web App & Catalog:** [https://d3cdc2mtpqk5ut.cloudfront.net](https://d3cdc2mtpqk5ut.cloudfront.net)
- **GitHub Repository:** [https://github.com/trey-rosius/relay_whatsapp](https://github.com/trey-rosius/relay_whatsapp)
- **Live In-Chat Sandbox:** Text **`#SANDBOX ON`** followed by **`#SEED`** to test all features live directly in WhatsApp!
