# 🎬 Relay: 5-Minute Video Demo Recording Blueprint & Teleprompter Script

> **Submission for:** [AWS Agents for Humans Hackathon (Devpost)](https://agentsforhumans.devpost.com/)  
> **Track:** Good Neighbor Agents / Everyday Agents  
> **Target Video Length:** **5:00 Minutes (300 Seconds)**  
> **Live Demo URL:** [https://d3cdc2mtpqk5ut.cloudfront.net](https://d3cdc2mtpqk5ut.cloudfront.net)  
> **GitHub Repository:** [https://github.com/trey-rosius/relay_whatsapp](https://github.com/trey-rosius/relay_whatsapp)

---

## 📋 Table of Contents

1. [Pre-Recording Checklist & Screen Layout](#1-pre-recording-checklist--screen-layout)
2. [5-Minute Timing & Pacing Matrix](#2-5-minute-timing--pacing-matrix)
3. [Word-for-Word Teleprompter Script (0:00 – 5:00)](#3-word-for-word-teleprompter-script)
   - [Act I: The Hook & The Real-World Chaos (0:00 – 0:45)](#act-i-the-hook--the-real-world-chaos-000--045)
   - [Act II: The "Agents for Humans" Thesis (0:45 – 1:30)](#act-ii-the-agents-for-humans-thesis-045--130)
   - [Act III: Live Interactive Demo (1:30 – 3:15)](#act-iii-live-interactive-demo-130--315)
   - [Act IV: Architecture & AWS Serverless Deep-Dive (3:15 – 4:15)](#act-iv-architecture--aws-serverless-deep-dive-315--415)
   - [Act V: Real-World Community Impact, Costs & Outro (4:15 – 5:00)](#act-v-real-world-community-impact-costs--outro-415--500)
4. [Copy-Paste Cheat Sheet for Demo Messages](#4-copy-paste-cheat-sheet-for-demo-messages)
5. [Recording & Video Export Best Practices](#5-recording--video-export-best-practices)

---

## 1. Pre-Recording Checklist & Screen Layout

### 🖥️ Recommended Screen Layout (Side-by-Side 1080p)

For maximum visual clarity and pacing, arrange your recording screen as follows:

```text
+-------------------------------------------------------------------------+
| [Left 45% Screen: Mobile Mirroring]   | [Right 55% Screen: Browser Tabs] |
|                                       |                                 |
| WhatsApp Web or QuickTime Phone       | Tab 1: Live Web Storefront      |
| Mirror (Clean chat window with bot    |        (d3cdc2mtpqk5ut...net)   |
| +237 6 51 56 53 40)                   | Tab 2: Architecture Diagram     |
|                                       | Tab 3: Live Dashboard / CloudWatch
+-------------------------------------------------------------------------+
```

### 🛠️ Pre-Flight Verification

- [ ] **Reset Test Data:** Open WhatsApp with Relay and type `#RESET` (or `#SANDBOX ON` followed by `#SEED`) so your test state is pristine and ready.
- [ ] **Textbook Cover Photo Ready:** Have 1 crisp textbook cover photo on your phone or desktop ready to drag-and-drop (e.g., Cambridge Year 9 Physics or Maths).
- [ ] **Storefront Open:** Open [https://d3cdc2mtpqk5ut.cloudfront.net](https://d3cdc2mtpqk5ut.cloudfront.net) in your browser, scrolled to the top.
- [ ] **Architecture Tab Ready:** Open [docs/images/relay_architecture.png](./docs/images/relay_architecture.png) full-screen in a browser tab.
- [ ] **Microphone & Notifications:** Do Not Disturb active on phone and computer; microphone volume tested and crisp.

---

## 2. 5-Minute Timing & Pacing Matrix

| Segment                            | Duration |   Timestamp   | Visual on Screen                                              | Core Objective                                                                             |
| :--------------------------------- | :------: | :-----------: | :------------------------------------------------------------ | :----------------------------------------------------------------------------------------- |
| **Act I: The Hook & The Problem**  |   45s    | `0:00 – 0:45` | `school_chat_book_chaos.png`                                  | Emotional hook: 5 months of WhatsApp group chat book spam; why forms/apps fail.            |
| **Act II: The Solution & Thesis**  |   45s    | `0:45 – 1:30` | Web Storefront + WhatsApp side-by-side                        | "Agents for Humans" thesis: Zero new apps, zero logins, zero forms.                        |
| **Act III: Live Interactive Demo** |   105s   | `1:30 – 3:15` | WhatsApp interaction + Web Storefront live sync               | Natural language offer, Bedrock vision scan, proactive wishlist match, 48h escrow pin.     |
| **Act IV: AWS Architecture**       |   60s    | `3:15 – 4:15` | `relay_architecture.png`                                      | Strands Agents SDK, Bedrock Nova Lite & Pro, Durable Lambda, DynamoDB, Zero-Trust privacy. |
| **Act V: Community Impact & Cost** |   45s    | `4:15 – 5:00` | `relay_community_dashboard.png` + `relay_parent_feedback.png` | 100 books cataloged, 47 exchanges, $2.65/mo operating cost, live demo links.               |

---

## 3. Word-for-Word Teleprompter Script

---

### Act I: The Hook & The Real-World Chaos (`0:00 – 0:45`)

**Target Duration:** 45 seconds  
**Visual Cue:** Full-screen display of [Figure 1: School Chat Book Chaos](./docs/images/school_chat_book_chaos.png). Zoom slightly into repetitive message threads.

#### 🎙️ Spoken Script:

> "Every August, over five hundred families in our school community face the exact same quiet anxiety: **back-to-school textbook shopping**.
>
> For most of the year, our school WhatsApp group is a vital lifeline. But from August through December, it collapses into utter chaos.
>
> Parents whose kids just finished Year 4 post lists of books they want to sell. New parents joining Year 4 post asking to buy those exact same books. But because WhatsApp is a fast-moving linear stream, messages disappear within twenty minutes. Desperate parents repost the same lists over and over.
>
> Searching our school chat surfaced **over fifty-three unresolved book threads**! Important school alerts were drowned out, parents bought new books when used ones were sitting right in their neighborhood, and three different PTA attempts to set up Google Forms and mobile apps were completely abandoned within forty-eight hours.
>
> Parents don’t want another app to manage for a once-a-year chore. That’s why we built **Relay**."

---

### Act II: The "Agents for Humans" Thesis (`0:45 – 1:30`)

**Target Duration:** 45 seconds  
**Visual Cue:** Transition to side-by-side view: Mobile WhatsApp on the left, Web Storefront on the right.

#### 🎙️ Spoken Script:

> "Relay was built around the core thesis of the **AWS Agents for Humans Hackathon**:
>
> _Instead of another app people have to open and learn, the best interface for humans is no interface at all._
>
> Relay is an autonomous, bilingual AI agent that lives directly inside WhatsApp. There are **zero apps to download**, **zero accounts to create**, and **zero forms to fill out**.
>
> Parents text the exact same casual sentences or textbook cover photos they were already going to post into the group chat.
>
> In the background, Relay’s autonomous multi-agent reasoning loop—powered by **AWS Strands Agents SDK** and **Amazon Bedrock**—extracts the curriculum year, catalogs the listing, runs proactive wishlist matching, and sets up secure forty-eight-hour escrow reservations.
>
> Let me show you how it works live in production."

---

### Act III: Live Interactive Demo (`1:30 – 3:15`)

**Target Duration:** 105 seconds (1 min 45 sec)  
**Visual Cue:** Live split screen. You are actively typing and sending messages into WhatsApp.

#### Step 1: Natural Language Offer (30s)

**Action:** Type into WhatsApp:

```text
I have Year 5 Cambridge Maths and Year 6 French textbook in good condition for $15
```

**Wait 1 second for response.**

#### 🎙️ Spoken Script:

> "First, I’ll message Relay casually as a parent whose child just passed their classes:  
> _'I have Year 5 Cambridge Maths and Year 6 French textbook in good condition for $15.'_
>
> Notice that this is a compound message with two separate books. Relay’s Bedrock parser breaks this down into structured curriculum models, catalogs both items, and replies with instant confirmation—all in under eight hundred milliseconds.
>
> And if I refresh our live CloudFront web catalog on the right... both textbooks appear immediately with full condition tags."

---

#### Step 2: Bedrock Multimodal Vision Cover Scan (30s)

**Action:** Attach a textbook cover photo from your camera roll/desktop and hit send.

#### 🎙️ Spoken Script:

> "Now, what if a busy parent doesn't want to type anything? They just snap a photo of the textbook cover.
>
> Let’s send this book photo directly to Relay.
>
> Using **Amazon Bedrock Nova Pro Multimodal Vision**, Relay inspects the cover image, extracts the exact subject, publisher, curriculum level, and edition, and catalogs it automatically without the parent having to type a single word. It even detects the language and responds in bilingual French or English."

---

#### Step 3: Proactive Wishlist Matching & 48-Hour Escrow Hold (30s)

**Action:** Type a buyer demand into WhatsApp:

```text
Looking for Year 5 Cambridge Maths
```

**Wait for the bot to trigger the Match & Escrow Hold.**

#### 🎙️ Spoken Script:

> "Now let’s look at the real magic: **Proactive Wishlist Matching**.
>
> When a buyer texts: _'Looking for Year 5 Cambridge Maths'_, Relay doesn’t just say 'found it'. It executes an autonomous matchmaker workflow.
>
> It places an automatic **48-hour escrow reservation hold** on the book to prevent race conditions, generates a mutual four-digit verification PIN, and securely introduces both parents with pickup safety instructions.
>
> When they meet at the school gate, they simply confirm the four-digit PIN, and the book is marked as completed."

---

#### Step 4: In-Chat Developer Sandbox (15s)

**Action:** Type `#STATUS` or `#SANDBOX ON` into WhatsApp.

#### 🎙️ Spoken Script:

> "For hackathon judges and testers, Relay features a full **In-Chat Developer Sandbox**. Texting `#SANDBOX ON` isolates your session so you can simulate matches, test mock Cameroon and French curricula, and inspect state transitions without touching live production community records."

---

### Act IV: Architecture & AWS Serverless Deep-Dive (`3:15 – 4:15`)

**Target Duration:** 60 seconds  
**Visual Cue:** Cut to full-screen display of [Figure 2: Relay Simplified End-to-End System Architecture](./docs/images/relay_architecture.png).

#### 🎙️ Spoken Script:

> "Let’s look under the hood at how this is architected on AWS.
>
> Relay is built using **AWS Blocks** and is one hundred percent serverless:
>
> 1. **Conversational Ingress:** Meta WhatsApp webhooks are validated by API Gateway and our custom constant-time HMAC-SHA256 signature verification block.
> 2. **Agentic Reasoning Layer:** We use the **AWS Strands Agents SDK** (`@aws-blocks/bb-agent`). The reasoning loop coordinates specialized typed Zod tools across **Amazon Bedrock Nova Lite** for sub-four-hundred millisecond intent parsing and **Bedrock Nova Pro** for multimodal vision.
> 3. **AWS Lambda Durable Functions:** To ensure zero dropped transactions during network retries, our webhook handlers use an idempotent step-execution engine (`withDurableExecution`). It provides the reliability of distributed sagas with zero Step Functions state-transition costs.
> 4. **Storage & Data Layer:** Amazon DynamoDB on-demand single-table architecture with Global Secondary Indexes for microsecond catalog and demand-board lookups.
> 5. **Zero-Trust Community Privacy:** Dual-stage PII redactors mask parent phone numbers and addresses in memory before reaching the LLM, backed by AWS KMS envelope encryption."

---

### Act V: Real-World Community Impact, Costs & Outro (`4:15 – 5:00`)

**Target Duration:** 45 seconds  
**Visual Cue:** Show [Figure 3: Production Dashboard Live Metrics](./docs/images/relay_community_dashboard.png) followed by [Figure 4: Real Community Parent Praise](./docs/images/relay_parent_feedback.png).

#### 🎙️ Spoken Script:

> "What was the real-world human impact?
>
> In our live school rollout, Relay completely eliminated five months of repetitive textbook spam from the main community group.
>
> As you can see from our live dashboard, Relay has cataloged over **one hundred curriculum textbooks**, actively tracked **twenty-six pending wishlist demands**, and successfully completed **forty-seven direct parent-to-parent book exchanges**, saving families thousands of dollars.
>
> Parents in our bilingual community responded with overwhelming gratitude—praising how fast and effortless it was to recycle books in both French and English.
>
> And best of all? The entire solution runs on AWS for **less than two dollars and seventy cents a month**—an astounding four-thousand-to-one financial return for our school community.
>
> Try Relay live today via our web storefront or text our WhatsApp bot. Thank you!"

---

## 4. Copy-Paste Cheat Sheet for Demo Messages

Keep these messages open in a text editor on your second screen or clipboard so you can paste them without typos during recording:

| Scenario                    | WhatsApp Message to Send                                                             | Expected Bot Output                                                     |
| :-------------------------- | :----------------------------------------------------------------------------------- | :---------------------------------------------------------------------- |
| **Welcome / Language Test** | `Bonjour`                                                                            | French onboarding menu with catalog triggers.                           |
| **Dual Listing (Offer)**    | `I have Year 5 Cambridge Maths and Year 6 French textbook in good condition for $15` | Both books cataloged with confirmation tags.                            |
| **Search / Demand (Match)** | `Looking for Year 5 Cambridge Maths`                                                 | Triggers immediate match and 48-hour reservation hold.                  |
| **Catalog Check**           | `catalog`                                                                            | Formatted summary of currently available books.                         |
| **Parent Status Command**   | `my books`                                                                           | Personal inventory: books on sale, reserved holds, and completed sales. |
| **Sandbox Status**          | `#STATUS`                                                                            | Sandbox diagnostic state confirmation.                                  |
| **Sandbox Reset**           | `#RESET`                                                                             | Cleans up test simulation records.                                      |

---

## 5. Recording & Video Export Best Practices

### Video Specs for Devpost / YouTube

- **Resolution:** 1080p Full HD (1920 × 1080) at 30 fps or 60 fps.
- **Audio:** 48 kHz stereo, normalized to `-14 LUFS` (clear voice, zero background hiss).
- **Aspect Ratio:** 16:9 widescreen.
- **File Format:** MP4 (H.264 / AAC).

### Recommended Editing Additions

1. **Chapter Markers:** When uploading to YouTube, add timestamps in the description:
   - `0:00` The 5-Month School Chat Chaos
   - `0:45` The "Agents for Humans" Thesis
   - `1:30` Live WhatsApp & Vision Demo
   - `3:15` AWS Serverless & Strands Agent Architecture
   - `4:15` Real-World Community Impact & Cost Analysis
   - `4:45` Live Links & Try It Yourself
2. **Subtitles / Closed Captions:** Generate auto-captions on YouTube or CapCut to make bilingual French/English terms crystal clear for judges.
3. **Thumbnail:** Use the simplified architecture diagram ([relay_architecture.png](./docs/images/relay_architecture.png)) with bold text: **"RELAY: Autonomous WhatsApp Agent on AWS"**.
