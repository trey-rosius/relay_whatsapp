# Relay 📚 — Autonomous School Book Marketplace & Matchmaker

### Built with Strands Agents SDK & AWS Blocks for the _Agents for Humans Hackathon_

[![Hackathon](https://img.shields.io/badge/Devpost-Agents_for_Humans-blue?style=for-the-badge&logo=devpost)](https://agentsforhumans.devpost.com/)
[![Track](https://img.shields.io/badge/Track-Good_Neighbor_Agents-green?style=for-the-badge)](https://agentsforhumans.devpost.com/#prizes)
[![SDK](https://img.shields.io/badge/AWS-Strands_Agents_SDK-orange?style=for-the-badge&logo=amazon-aws)](https://github.com/aws/strands-agents)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

Relay is an autonomous AI agent operating quietly in the background on WhatsApp. It eliminates the chaos, manual friction, and endless group-chat spam of back-to-school textbook shopping by parsing parent messages & book cover photos, maintaining real-time community inventories, and autonomously matching buying parents to selling parents.

---

## 🌟 The Human Story: Why Relay Was Built

> _"My son goes to school, and like hundreds of other families, we are all part of a single school WhatsApp group. Every single year, for the first five months of the school year — August, September, October, November, December — the entire group chat is completely hijacked by textbook chatter._
>
> _Parents whose kids just finished a grade (for example, moving from Year 4 to Year 5) want to sell their old Year 4 books and hunt down Year 5 curriculum books. Meanwhile, new parents joining Year 4 are desperately searching to buy those exact books._
>
> _The problem? WhatsApp is a linear, ephemeral scroll stream. A parent posts three books for sale; within five minutes, routine chatter pushes the post completely out of view. The parent posts again. A buyer asks 'Is the Maths book still available?', but that question gets scrolled past too. Bringing a selling parent and a buying parent together is an exhausting, manual pain. Crucial school announcements, pedagogical updates, and PTA discussions are completely blocked and drowned out for months._
>
> _Relay was built to step in and fix this for good. It offloads 100% of textbook conversations out of the community group chat to a dedicated autonomous WhatsApp channel. The main school group chat is restored to its original purpose: calm, relevant school conversations. Meanwhile, Relay quietly works in the background: tracking what parents have and need, matching supply to demand, locking 48-hour reservations with verification codes, and introducing parents directly to complete the exchange."_

---

## 🎯 Hackathon Pitch & Alignment

Relay is submitted to the **[Agents for Humans Hackathon](https://agentsforhumans.devpost.com/)** across two core tracks:

- 🥇 **Primary Track: Good Neighbor Agents** — _"An agent that helps groups of people, not just one: neighborhoods, nonprofits, food banks, schools, libraries, small local orgs."_
- 🥈 **Secondary Track: Everyday Agents** — _"An agent that takes the busywork out of daily life, home, money, errands, family. The best ones run quietly in the background and only ping you when there's a real decision to make."_

### The Pitch in Three Questions:

1. **The Problem We're Solving:** Every back-to-school season, school parent groups are inundated with chaotic, repetitive textbook sales chatter. Hundreds of book listings and requests get buried in WhatsApp's fast-scrolling feed, forcing parents to repeatedly repost, manually cross-reference curriculum editions, and negotiate handovers while drowning out essential school notices.
2. **Who It's For:** School parent communities, PTAs, teachers, and families managing back-to-school expenses who need a frictionless way to recycle curriculum books locally without learning or downloading another app.
3. **Why It Matters:** Textbooks represent one of the single highest recurring out-of-pocket education costs for families worldwide. By automating hyper-local second-hand exchanges directly inside WhatsApp, Relay cuts textbook costs for parents by up to 70%, keeps dozens of kilograms of paper in active circulation, and restores peace and clarity to community communication channels.

### The "Agents for Humans" Philosophy: Zero New Apps

In accordance with the hackathon's core thesis — _"Instead of another app people open and manage, the agent runs autonomously and only surfaces when there's a real decision to make"_ — Relay does not force parents to download an app, create an account, or monitor a dashboard:

- **Background Autonomous Loop:** Parents simply send a voice note, text (_"I have Year 5 Maths and need Year 8 Physics"_), or snap a textbook cover photo.
- **Proactive Matchmaking:** Relay's Strands Agent reasons in the background, queries DynamoDB supply and demand, and autonomously detects matches without human prompting.
- **Surfaces Only for Decisions:** Relay only pings parents when a match is found to present an interactive confirmation card, lock a 48-hour reservation, and issue a cryptographic verification code (`#XXXX`) for a safe physical handover.

### 💡 The Friction Trap: Why Forms, Web Portals & Mobile Apps Fail Parents

When communities try to organize textbook exchanges, they almost always reach for conventional tools that fail because they demand extra work from already busy parents:

| Approach                         | What Happens                                                                                                            | Why It Fails                                                                                                                                                                           |
| :------------------------------- | :---------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Google Forms**                 | Parents are asked to fill out multiple mandatory fields per book (grade, subject, edition, condition, price).           | **Too much friction.** Parents don't have time to sit down with a form. They abandon it and go right back to posting in the WhatsApp chat.                                             |
| **Web Portal / Storefront**      | Parents are directed to a website to register an account, verify an email, log in, and fill out forms.                  | **Cognitive overload.** Parents are on the go. Opening a mobile browser and navigating forms feels like unpaid homework.                                                               |
| **Dedicated Mobile App**         | A native iOS or Android app is published on the app stores.                                                             | **Zero adoption.** _"Nobody's downloading no mobile app"_ for a task they do once or twice a year. App fatigue is real.                                                                |
| **Relay 📚 (WhatsApp AI Agent)** | Parents text the exact same sentence or photo they were already going to post in the group chat, but to Relay's number. | **100% Frictionless.** Zero downloads, zero logins, zero forms, zero behavior change. Relay's AI handles all categorization, cataloging, matching, and escrow holds in the background. |

### 📈 Real-World Community Impact & Results

In our live school deployment:

- **The Main Group Chat Went Completely Quiet on Book Spam:** Five full months (August–December) of repetitive, chaotic textbook chatter was completely cleared out of the community group chat, restoring it to essential academic notices, teacher alerts, and PTA discussions.
- **Self-Policing Community Adoption:** When an occasional parent who is new to the school asks for a book in the main group, other parents immediately redirect them: _"Don't post here — just text Relay at this phone number and it will connect you automatically!"_
- **Real Parent Testimonials:** School parents have overwhelmingly praised how fast, painless, and respectful of their time Relay is compared to years past.

---

## 🚀 Key Features & Capabilities

### 1. 🧪 In-Chat Developer Sandbox Mode

Test and simulate every bot interaction end-to-end directly from WhatsApp without touching, seeing, or polluting live production records:

- **`#SANDBOX ON`** (or `#SANDBOX`): Activates an isolated testing session for your phone number. All bot responses are visually tagged with `🧪 [SANDBOX MODE]`.
- **`#SEED`**: Generates a mock catalog of 15 Cameroon curriculum textbooks (Primary, Middle, and High School in English & French), 1 active 48-hour reserved hold with Parent Marie (`+237 670 000 001`, handover code `#7721`), and 1 open wishlist demand (_Terminale C Physique_ from Parent Paul `+237 690 000 002`).
- **`#STATUS`**: Inspects session state (`🟢 ACTIVE`), counts simulated records, and confirms real community data is 100% shielded.
- **`#RESET`**: Wipes all simulated records, leaving real community inventory completely untouched.
- **`#SANDBOX OFF`**: Exits sandbox mode and returns your phone to live production.
- **100% Data Shielding & Interception:** Real community parents never see or match against simulated records. Outbound dispatches to mock phone numbers are safely intercepted so Meta Graph API never receives invalid phone numbers.

### 2. 📊 Parent Activity & History Command (`"my books"` / `"mes livres"`)

Parents can check their personal history and active transactions at any time:

- **📖 Books on Sale (`added`):** Books currently listed in the community catalog.
- **⏳ Exchanges in Progress (`reserved`):** 48-hour active holds with mutual parent contact and `#XXXX` handover code.
- **🤝 Books Sold (`sold`):** Completed textbook sales.
- **🎓 Books Acquired / Bought (`bought`):** Completed textbook acquisitions.
- **📋 Wishlist Demands (`demanded`):** Active book requests with real-time status tracking (`⏳ Searching`, `🤝 Reserved`, `✅ Completed`).

### 3. 📚 Interactive Catalog & Dedicated "Other Grades" Sub-Drawer

Solves WhatsApp's strict 10-row list constraint:

- **Tier 1 (Grades Drawer):** Displays primary curriculum grades with live book counts (e.g. `Year 7 (14 books)`).
- **"Other Grades" Sub-Drawer:** When more than 9 grades exist, overflow grades (`Year 11`, `Year 12`, `Year 13`, `General`) expand into a dedicated sub-drawer with live subject previews rather than truncating items.
- **Tier 2 (Subjects Drill-Down):** Displays books for the selected grade with condition badges (✨ _Comme neuf_, 👍 _Bon état_).
- **2-Button Safety Confirmation:** Prevents accidental reservations with explicit `[ ✅ Confirmer la demande ]` and `[ ❌ Annuler ]` actions.

### 4. 🧠 Universal Semantic Meaning & Language Engine

- **11 Intent Taxonomy:** Powered by Amazon Bedrock Nova Lite & Claude with contextual sentence-level understanding (`offer`, `demand`, `offer_inquiry`, `demand_inquiry`, `catalog`, `demand_board`, `greeting`, `confirm_handover`, `parent_activity`, `contact_inquiry`, `other_grades`).
- **Typo-Tolerant Stem Scoring:** Normalized stem matching (`normalizeTextForMatching`) handles misspellings, slang, and dialectal variations in French and English (e.g. _"mes livr"_, _"donne son num"_ $\to$ French; _"my boks"_ $\to$ English).
- **Phone Unmasking Guarantee:** Ensures that whenever parents ask for matched contact info (`"which parent"`, `"quel parent"`), real phone numbers and handover verification codes are provided without redaction tokens.

### 5. 🎯 Proactive Matchmaker & 48-Hour Reservation Lock

- Automatically pairs matching supply and demand across identical or compatible curriculum subjects.
- Locks the matched book under a **48-Hour Reserved Hold** with a cryptographic 4-digit verification code (`#XXXX`).
- An automated **AWS EventBridge Cron Job** sweeps the database every 15 minutes to release expired holds back to the community if an exchange does not complete in time.

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

- **Strands Agents SDK (`@aws-blocks/bb-agent` / `Agent`):** Autonomous agent reasoning loop with Zod-validated tool suites.
- **Amazon Bedrock (`BedrockModels.BALANCED`, Nova Lite & Pro):** Multimodal inference, intent classification, and bilingual response generation.
- **Amazon DynamoDB (`DistributedTable` & `KVStore`):** High-throughput data tables for active inventory, wishlist demands, and isolated developer sandbox sessions.
- **Amazon S3 (`FileBucket`):** 30-day automated lifecycle expiration bucket for textbook cover photos.
- **Amazon EventBridge (`CronJob`):** 15-minute proactive hold expiration sweeper.
- **Amazon CloudFront & S3:** CDN-accelerated single-page web storefront and monitoring dashboard.
- **AWS X-Ray & CloudWatch EMF:** Distributed tracing and sub-second metrics emission.

---

## 💬 WhatsApp Command Cheatsheet

### For Community Parents:

| Message                                | What Happens                                                                    |
| :------------------------------------- | :------------------------------------------------------------------------------ |
| `"catalog"` or `"catalogue"`           | Opens the interactive grade selection drawer.                                   |
| `"other grades"` or `"autres classes"` | Opens the overflow drawer for Year 11, 12, 13 & General subjects.               |
| `"wishlist"` or `"demandes"`           | Displays what books other parents are currently looking for.                    |
| `"my books"` or `"mes livres"`         | Shows personal summary of listed, reserved, sold, bought, and requested books.  |
| `"which parent"` or `"quel parent"`    | Retrieves contact info and handover verification code for an active exchange.   |
| `"sold"` or `"vendu"`                  | Confirms exchange completion and fulfills the transaction.                      |
| `"I have Year 8 Science"`              | Automatically lists the book for sale or donation in the school catalog.        |
| `"Looking for Year 10 Physics"`        | Searches catalog or creates a wishlist demand with instant matchmaker alerting. |

### For Bot Creators & Developers (In-Chat Sandbox):

| Command            | Action                                                                                         |
| :----------------- | :--------------------------------------------------------------------------------------------- |
| **`#SANDBOX ON`**  | Activates isolated sandbox mode for your phone number.                                         |
| **`#SEED`**        | Populates 15 Cameroon mock textbooks, 1 active reserved hold (`#7721`), and 1 wishlist demand. |
| **`#STATUS`**      | Shows session state and count of simulated inventory/demands.                                  |
| **`#RESET`**       | Deletes all simulated sandbox items and demands cleanly.                                       |
| **`#SANDBOX OFF`** | Exits sandbox and returns your phone to live production mode.                                  |

---

## 🌐 Live Deployments & Hackathon Reviewer Guide

### Live Cloud Endpoints

- **Web Storefront & Parent Portal:** [https://d3cdc2mtpqk5ut.cloudfront.net](https://d3cdc2mtpqk5ut.cloudfront.net) _(Amazon CloudFront CDN + S3)_
- **Production API Gateway:** `https://0bur1ooy7b.execute-api.us-east-1.amazonaws.com/prod/aws-blocks/api`
- **Realtime WebSocket Gateway:** `wss://ftuliydf8c.execute-api.us-east-1.amazonaws.com/rt`
- **WhatsApp Bot Number:** Connected via Meta Cloud API v25.0

### 🧪 How Hackathon Judges Can Test Relay Live (Without Touching Production)

Judges can test every single feature directly on WhatsApp using the built-in **Developer Sandbox**:

1. Open WhatsApp and text **`#SANDBOX ON`** to activate your isolated session. You will receive a `🧪 [SANDBOX MODE]` confirmation.
2. Text **`#SEED`** to load a realistic sample school catalog (15 curriculum books, 1 active 48-hour reservation with code `#7721`, and 1 wishlist demand).
3. Test browsing: text **`catalog`** or **`other grades`** to interact with WhatsApp interactive lists.
4. Test activity tracking: text **`my books`** (or **`mes livres`**) to see your personal dashboard.
5. Test unmasking: text **`which parent`** to see secure phone and handover code delivery.
6. Test natural language offers: text _"I have Year 5 Maths and need Year 8 Physics"_ to experience multi-intent parsing and background matchmaking.
7. Clean up: text **`#RESET`** to clear all mock items, followed by **`#SANDBOX OFF`** to return to live mode. Real community records remain 100% shielded and untouched.

### 📋 Hackathon Submission Requirements Checklist

- [x] **Public Code Repository:** GitHub public repository with complete source code.
- [x] **Open Source License:** [MIT License](LICENSE) included in root.
- [x] **Technical Implementation:** Built with Strands Agents SDK (`@aws-blocks/bb-agent`), Bedrock Nova Lite & Claude, DynamoDB, S3, and AWS Blocks.
- [x] **Architecture Diagram:** [architecture_backend.drawio](file:///Users/ro/Documents/playground/books-block-app/architecture_backend.drawio) (diagrams.net compatible) + ASCII architecture in README.
- [x] **Working Project Demo:** Live CloudFront web application and live WhatsApp integration.
- [x] **Pitch & Presentation:** Covers (1) the problem, (2) who it's for, and (3) why it matters.

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 22.0.0
- npm

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

| Path                          | Description                                                                                                                         |
| :---------------------------- | :---------------------------------------------------------------------------------------------------------------------------------- |
| `aws-blocks/index.ts`         | Complete backend orchestration: Strands Agent, tools, DynamoDB tables, sandbox sessions, interactive list generators, and webhooks. |
| `aws-blocks/index.cdk.ts`     | AWS CDK infrastructure definitions and resource extensions.                                                                         |
| `src/`                        | Frontend single-page application for inventory exploration, storefronts, and live agent chat.                                       |
| `test/prompts.unit.test.ts`   | Unit test suite: golden prompt baselines, PII masking, language routing, and developer sandbox mode.                                |
| `test/e2e.test.ts`            | End-to-end integration tests: WhatsApp webhooks, 48h holds, photo batches, and matchmaking.                                         |
| `test/agent.unit.test.ts`     | Unit tests for Strands Agent tools and Zod schema validations.                                                                      |
| `architecture_backend.drawio` | Complete system architecture and data flow diagram (editable in diagrams.net / draw.io).                                            |
| `blog_post.md`                | In-depth engineering build story and architecture deep-dive for `builder.aws.com`.                                                  |
| `relay_interaction_guide.md`  | Comprehensive WhatsApp conversation testing guide with Cameroon curriculum examples.                                                |

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
