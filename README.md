# Relay 📚 — Autonomous School Book Marketplace & Matchmaker

### Built with Strands Agents SDK & AWS Blocks for the *Agents for Humans Hackathon*

Relay is an autonomous AI agent operating in the background on WhatsApp and the web. It eliminates the friction, manual coordination, and chaos of back-to-school textbook shopping by parsing parent natural language messages & book photos, maintaining live community inventories, and autonomously matching buying parents to selling parents.

---

## 🌟 Hackathon Track & Problem Statement

* **Competition:** [Agents for Humans Hackathon (Devpost)](https://agentsforhumans.devpost.com/)
* **Target Track:** **Everyday Agents** / **Good Neighbor Agents**
* **The Problem:** Every back-to-school season, parents spend dozens of hours hunting down curriculum books across crowded WhatsApp group chats, comparing book editions, negotiating handovers, and tracking who has what.
* **The Agent Solution:** Instead of forcing parents to learn yet another complex app, Relay operates directly inside WhatsApp. Parents simply text what they have or need (e.g. *"I have Year 5 Maths and need Year 8 Physics"*) or upload textbook cover photos. Relay parses multi-intent messages, catalogs inventory, records wishlist demands, locks 48-hour mutual reservation holds with secure verification codes, and connects parents automatically.

---

## 🚀 Key Features & Capabilities

### 1. 🧪 In-Chat Developer Sandbox Mode
Test and simulate every bot interaction end-to-end directly from WhatsApp without touching, seeing, or polluting live production records:
* **`#SANDBOX ON`** (or `#SANDBOX`): Activates an isolated testing session for your phone number. All bot responses are visually tagged with `🧪 [SANDBOX MODE]`.
* **`#SEED`**: Generates a mock catalog of 15 Cameroon curriculum textbooks (Primary, Middle, and High School in English & French), 1 active 48-hour reserved hold with Parent Marie (`+237 670 000 001`, handover code `#7721`), and 1 open wishlist demand (*Terminale C Physique* from Parent Paul `+237 690 000 002`).
* **`#STATUS`**: Inspects session state (`🟢 ACTIVE`), counts simulated records, and confirms real community data is 100% shielded.
* **`#RESET`**: Wipes all simulated records, leaving real community inventory completely untouched.
* **`#SANDBOX OFF`**: Exits sandbox mode and returns your phone to live production.
* **100% Data Shielding & Interception:** Real community parents never see or match against simulated records. Outbound dispatches to mock phone numbers are safely intercepted so Meta Graph API never receives invalid phone numbers.

### 2. 📊 Parent Activity & History Command (`"my books"` / `"mes livres"`)
Parents can check their personal history and active transactions at any time:
* **📖 Books on Sale (`added`):** Books currently listed in the community catalog.
* **⏳ Exchanges in Progress (`reserved`):** 48-hour active holds with mutual parent contact and `#XXXX` handover code.
* **🤝 Books Sold (`sold`):** Completed textbook sales.
* **🎓 Books Acquired / Bought (`bought`):** Completed textbook acquisitions.
* **📋 Wishlist Demands (`demanded`):** Active book requests with real-time status tracking (`⏳ Searching`, `🤝 Reserved`, `✅ Completed`).

### 3. 📚 Interactive Catalog & Dedicated "Other Grades" Sub-Drawer
Solves WhatsApp's strict 10-row list constraint:
* **Tier 1 (Grades Drawer):** Displays primary curriculum grades with live book counts (e.g. `Year 7 (14 books)`).
* **"Other Grades" Sub-Drawer:** When more than 9 grades exist, overflow grades (`Year 11`, `Year 12`, `Year 13`, `General`) expand into a dedicated sub-drawer with live subject previews rather than truncating items.
* **Tier 2 (Subjects Drill-Down):** Displays books for the selected grade with condition badges (✨ *Comme neuf*, 👍 *Bon état*).
* **2-Button Safety Confirmation:** Prevents accidental reservations with explicit `[ ✅ Confirmer la demande ]` and `[ ❌ Annuler ]` actions.

### 4. 🧠 Universal Semantic Meaning & Language Engine
* **11 Intent Taxonomy:** Powered by Amazon Bedrock Nova Lite & Claude with contextual sentence-level understanding (`offer`, `demand`, `offer_inquiry`, `demand_inquiry`, `catalog`, `demand_board`, `greeting`, `confirm_handover`, `parent_activity`, `contact_inquiry`, `other_grades`).
* **Typo-Tolerant Stem Scoring:** Normalized stem matching (`normalizeTextForMatching`) handles misspellings, slang, and dialectal variations in French and English (e.g. *"mes livr"*, *"donne son num"* $\to$ French; *"my boks"* $\to$ English).
* **Phone Unmasking Guarantee:** Ensures that whenever parents ask for matched contact info (`"which parent"`, `"quel parent"`), real phone numbers and handover verification codes are provided without redaction tokens.

### 5. 🎯 Proactive Matchmaker & 48-Hour Reservation Lock
* Automatically pairs matching supply and demand across identical or compatible curriculum subjects.
* Locks the matched book under a **48-Hour Reserved Hold** with a cryptographic 4-digit verification code (`#XXXX`).
* An automated **AWS EventBridge Cron Job** sweeps the database every 15 minutes to release expired holds back to the community if an exchange does not complete in time.

---

## 🏗️ Architecture Overview

```
                         Parent / Developer WhatsApp Message
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
     [Developer Sandbox Router]                      [Public Ingress Router]
     - #SANDBOX ON / OFF / STATUS                    - Rate Limiting (AWS WAF v2)
     - #SEED / #RESET mock catalog                   - HMAC-SHA256 Payload Signature
     - Scoped Data Isolation (100% shielded)         - Pre-Prompt PII Redactor
                 │                                               │
                 └───────────────────────┬───────────────────────┘
                                         ▼
                         AWS Lambda Durable Functions
                         withDurableExecution(processWhatsAppInbound)
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
[Deterministic Fast-Paths]   [Amazon Bedrock NLP Engine]    [Strands Autonomous Agent]
- 'catalog', 'mes livres'    - 11-Category Intent Parsing   - Model-Driven Tool Calling
- 'which parent', 'vendu'    - Nova Lite / Claude 3.5       - booksAgent (@aws-blocks/bb-agent)
- Sub-50ms DynamoDB queries  - Typo-Tolerant Bilingual      - Conversational multi-turn chat
        │                                │                                │
        └────────────────────────────────┼────────────────────────────────┘
                                         ▼
                         Curriculum & Matchmaking Engine
                         - Declarative Subject Normalizer (SUBJECT_CATALOG)
                         - Dual-Track GSI Query (Supply & Demand)
                         - 48-Hour Reservation Lock & Handover Code (#XXXX)
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
       [Data & Vectors]                                [Outbound Communications]
       - DynamoDB: active-inventory                    - Meta WhatsApp Cloud API v25.0
       - DynamoDB: demand-board                        - Mock Phone Interception (Sandbox)
       - DynamoDB: sandbox-sessions                    - 2-Tier Interactive Lists
       - S3 FileBucket: parent-book-images             - CloudWatch EMF & X-Ray Tracing
       - Bedrock KnowledgeBase: 2KB chunks
```

### AWS Building Blocks & Services Used:
* **Strands Agents SDK (`@aws-blocks/bb-agent` / `Agent`):** Autonomous agent reasoning loop with Zod-validated tool suites.
* **Amazon Bedrock (`BedrockModels.BALANCED`, Nova Lite & Pro):** Multimodal inference, intent classification, and bilingual response generation.
* **Amazon DynamoDB (`DistributedTable` & `KVStore`):** High-throughput data tables for active inventory, wishlist demands, and isolated developer sandbox sessions.
* **Amazon S3 (`FileBucket`):** 30-day automated lifecycle expiration bucket for textbook cover photos.
* **Amazon EventBridge (`CronJob`):** 15-minute proactive hold expiration sweeper.
* **Amazon CloudFront & S3:** CDN-accelerated single-page web storefront and monitoring dashboard.
* **AWS X-Ray & CloudWatch EMF:** Distributed tracing and sub-second metrics emission.

---

## 💬 WhatsApp Command Cheatsheet

### For Community Parents:
| Message | What Happens |
| :--- | :--- |
| `"catalog"` or `"catalogue"` | Opens the interactive grade selection drawer. |
| `"other grades"` or `"autres classes"` | Opens the overflow drawer for Year 11, 12, 13 & General subjects. |
| `"wishlist"` or `"demandes"` | Displays what books other parents are currently looking for. |
| `"my books"` or `"mes livres"` | Shows personal summary of listed, reserved, sold, bought, and requested books. |
| `"which parent"` or `"quel parent"` | Retrieves contact info and handover verification code for an active exchange. |
| `"sold"` or `"vendu"` | Confirms exchange completion and fulfills the transaction. |
| `"I have Year 8 Science"` | Automatically lists the book for sale or donation in the school catalog. |
| `"Looking for Year 10 Physics"` | Searches catalog or creates a wishlist demand with instant matchmaker alerting. |

### For Bot Creators & Developers (In-Chat Sandbox):
| Command | Action |
| :--- | :--- |
| **`#SANDBOX ON`** | Activates isolated sandbox mode for your phone number. |
| **`#SEED`** | Populates 15 Cameroon mock textbooks, 1 active reserved hold (`#7721`), and 1 wishlist demand. |
| **`#STATUS`** | Shows session state and count of simulated inventory/demands. |
| **`#RESET`** | Deletes all simulated sandbox items and demands cleanly. |
| **`#SANDBOX OFF`** | Exits sandbox and returns your phone to live production mode. |

---

## 🚀 Getting Started

### Prerequisites
* Node.js >= 22.0.0
* npm

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Starts the local development server with DynamoDB storage, local S3 buckets, and realtime WebSocket streaming at `http://localhost:3000`.

### 3. Run Test Suites
```bash
# Run unit tests (50 tests: prompts, PII redactions, invariants, sandbox isolation)
npm run test:unit

# Run full end-to-end tests (32 tests: webhooks, durable matchmaker, photo batches)
npm run test:e2e

# Run TypeScript compilation check
npm run typecheck

# Run all test suites together
npm run test
```

### 4. Deploy to AWS
```bash
# Deploy backend & frontend to AWS CloudFormation stack
npm run deploy

# Run local frontend connected to deployed backend sandbox
npm run sandbox
```

---

## 📁 Repository Structure

| Path | Description |
| :--- | :--- |
| `aws-blocks/index.ts` | Complete backend orchestration: Strands Agent, tools, DynamoDB tables, sandbox sessions, interactive list generators, and webhooks. |
| `aws-blocks/index.cdk.ts` | AWS CDK infrastructure definitions and resource extensions. |
| `src/` | Frontend single-page application for inventory exploration, storefronts, and live agent chat. |
| `test/prompts.unit.test.ts` | Unit test suite: golden prompt baselines, PII masking, language routing, and developer sandbox mode. |
| `test/e2e.test.ts` | End-to-end integration tests: WhatsApp webhooks, 48h holds, photo batches, and matchmaking. |
| `test/agent.unit.test.ts` | Unit tests for Strands Agent tools and Zod schema validations. |
| `architecture_backend.drawio` | Complete system architecture and data flow diagram (editable in diagrams.net / draw.io). |
| `relay_interaction_guide.md` | Comprehensive WhatsApp conversation testing guide with Cameroon curriculum examples. |

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

