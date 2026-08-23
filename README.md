# Relay 📚 — Autonomous School Book Marketplace & Matchmaker
### Built with Strands Agents SDK & AWS Blocks for the *Agents for Humans Hackathon*

Relay is an autonomous AI agent operating in the background on WhatsApp and the web. It takes the heavy busywork and friction out of back-to-school textbook shopping by parsing parent messages & book photos, maintaining live community inventories, and autonomously matching buying parents to selling parents.

---

## 🌟 Hackathon Track & Problem Statement

* **Competition:** [Agents for Humans Hackathon (Devpost)](https://agentsforhumans.devpost.com/)
* **Target Track:** **Everyday Agents** / **Good Neighbor Agents**
* **The Problem:** Every school year, parents spend hours hunting down specific curriculum books across group chats, comparing grades/editions, and coordinating pickups.
* **The Agent Solution:** Instead of another app to manage, Relay runs autonomously in the background. Parents simply send a photo or natural language message on WhatsApp (e.g. *"I have Year 5 Maths and need Year 8 Physics"*). Relay automatically catalogs inventory, logs wishlist demands, executes matchmaker algorithms, and only reaches out when an exact match is confirmed.

---

## 🏗️ Architecture & Strands Agents Integration

```
                         Parent WhatsApp Message / Web Chat
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
     [Deterministic Fast-Path]                       [Strands-Powered Agent Block]
     - 'catalog', 'demandes'                         - Natural language multi-intent parsing
     - Exact button responses                        - Cross-grade recommendation reasoning
     - Sub-50ms DynamoDB reads                       - Autonomous tool calling loop
                 │                                               │
                 ▼                               ┌───────────────┴───────────────┐
         Instant Response                        ▼               ▼               ▼
                                          searchInventory   createDemand   registerBookOffer
                                                 │               │               │
                                                 └───────────────┬───────────────┘
                                                                 │
                                                                 ▼
                                                  48-Hour Reserved Hold Lock
                                                  & Automated WhatsApp Match Notification
```

### Powered by:
* **Strands Agents SDK (`@aws-blocks/bb-agent` / `Agent`):** Model-driven autonomous agent reasoning with type-safe Zod tools (`searchInventory`, `listDemands`, `createDemand`, `registerBookOffer`, `getSellerCatalog`).
* **Amazon Bedrock (`BedrockModels.BALANCED`):** Claude 3.5/3.7 Sonnet inference for conversational understanding with in-prompt PII redaction.
* **Amazon DynamoDB (`DistributedTable`):** High-throughput persistence for active inventory and demand boards with GSIs on `concept` and `createdAt`.
* **Meta WhatsApp Cloud API (`RawRoute`):** HMAC-SHA256 signature verified webhooks with sub-second non-blocking response.
* **AWS X-Ray (`Tracer`) & CloudWatch EMF (`Metrics`):** Enterprise distributed tracing and real-time operational telemetry.

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
Starts the local dev server with full mock storage and local agent support at `http://localhost:3000`.

### 3. Run Test Suites
```bash
# Run unit tests (prompts, PII redactions, invariants, agent tools)
npm run test:unit

# Run full end-to-end tests (webhooks, durable matchmaker, agent streaming)
npm run test:e2e

# Run all tests together
npm run test
```

---

## 📁 Repository Structure

| Path | Description |
| :--- | :--- |
| `aws-blocks/index.ts` | Backend core: Strands Agent definition, tools, DynamoDB models, webhook endpoints, and telemetry. |
| `src/` | Frontend web interface for catalog exploration, seller storefronts, and live agent chat. |
| `test/agent.unit.test.ts` | Unit tests for Strands Agent tools and schema validation. |
| `test/prompts.unit.test.ts` | Invariant tests, golden SHA-256 prompt baselines, and PII masking tests. |
| `test/e2e.test.ts` | End-to-end integration tests for WhatsApp webhooks, 48h holds, and agent flows. |
| `architecture_backend.drawio` | Comprehensive system architecture and data flow diagram. |

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
