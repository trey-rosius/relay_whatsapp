# 📚 Relay — Parent School Book Marketplace: Interaction & Response Guide

Welcome to the complete interaction guide for **Relay**, the intelligent WhatsApp-based school book exchange and marketplace connecting parents.

---

## 🌟 Quick Reference & Live Endpoints

- **💬 WhatsApp Bot Number:** `+237 6 51 56 53 40` (Display Name: *Educloud,Inc*)
- **🌐 Web Marketplace Portal:** [https://d3cdc2mtpqk5ut.cloudfront.net](https://d3cdc2mtpqk5ut.cloudfront.net)
- **🔗 Production Webhook Endpoint:** `https://0bur1ooy7b.execute-api.us-east-1.amazonaws.com/prod/webhook`
- **🧠 AI Core:** Amazon Bedrock (Nova Lite & Claude) Multi-Intent Parser & Natural Response Generator

---

## 1. 🚀 Onboarding, Greetings & Intelligent Noise Filtering

### Standard Greetings & Tutorials
When a parent reaches out for the first time or types greeting / tutorial triggers like `hi`, `hello`, `help`, `tutorials`, `how do i use this app`, `bonjour`, or `comment utiliser`.

#### 🇬🇧 English Welcome Message
> **Trigger Examples:** `hi`, `hello`, `help`, `tutorials`, `how do i use this app`

```text
Hello! 👋 Welcome to Relay! You can:
1. Share books: 'I have Year 3 books'
2. Ask for books: 'Looking for Year 9 Maths'
3. View available books: 'catalog'
4. View requested books: 'demand board'

*Tip:* Always include the school year (e.g. Year 5, Year 8, Year 11, or 6ème, 3ème) for faster matching!
```

#### 🇫🇷 French Welcome Message
> **Trigger Examples:** `bonjour`, `salut`, `aide`, `tutoriel`, `comment utiliser`

```text
Bonjour ! 👋 Bienvenue sur Relay ! Vous pouvez :
1. Partager des livres : 'J'ai des livres de l'année 3'
2. Demander des livres : 'Je cherche des livres de maths année 9'
3. Voir les livres disponibles : 'catalogue'
4. Voir les livres demandés : 'demandes'

*Conseil :* Précisez toujours la classe (ex : 6ème, 3ème, Year 5, Year 8) pour être mis en relation rapidement !
```

### 🔇 Intelligent Greeting Noise Filtering in Compound Messages
When a parent includes social greetings as part of an actionable request (e.g., *"Hello everyone! Please I’m looking for..."*), Relay automatically filters out the greeting noise so it does **not** trigger a generic welcome message. Instead, the bot immediately processes the underlying book offers and requests!

---

## 2. 🔀 Compound Dual-Intent Messages (Buyer + Seller in One Message)

Parents transitioning between school years often want to pass down old textbooks while acquiring new ones for their children in the same message. Relay handles these compound messages seamlessly by executing both transactions sequentially.

### Example: Simultaneous Request and Offer
> **Parent Sends:**  
> *"Hello everyone! Please I’m looking for year 6 textbooks and I have year 5"*

#### 🧠 AI Multi-Intent Extraction:
1. **Greeting Noise Filter:** Strips *"Hello everyone! Please"* to focus on actionable intent.
2. **Intent 1 (`demand`):** Year 6 Textbooks (`Year6Books` • Primary School)
3. **Intent 2 (`offer`):** Year 5 Textbooks (`Year5Books` • Primary School)

#### 💬 Bot Responses Dispatched to Parent:
Relay processes both intents and returns dedicated notifications for each action:

1. **Offer Confirmation / Match:**
   ```text
   📚 Hello! We have added an active listing for "Books for Year 5" to the marketplace. 🤝✨
   ```
   *(If another parent had an open request for Year 5, an immediate match introduction is triggered instead!)*

2. **Demand Confirmation / Match:**
   ```text
   👋 We've recorded your request for "Books for Year 6" on our Wishlist / Demand Board 📚.
   
   As soon as another parent lists this book, we will automatically match you and notify you here! 🤝💡
   ```
   *(If Year 6 books are already in stock, Relay immediately introduces the offering parent!)*

---

## 3. 📋 Multi-Book Curriculum Batch Listings

Parents often list an entire grade's syllabus at once using bullet points or multi-line messages. Relay parses these structured messages and expands them into individual textbook entries.

### Example: Multi-Grade & Multi-Subject List
> **Parent Sends:**  
> *"Hi. I have year 10 and 11 books :
> Chemistry
> Physics
> Additional maths
> English first language
> French second language
> ICT
> Maths
> Economics
> Biology"*

#### 🧠 AI Extraction & Curriculum Expansion:
Relay recognizes both school years and maps each subject into individual catalog items:
- `Year10Chemistry` & `Year11Chemistry`
- `Year10Physics` & `Year11Physics`
- `Year10AdditionalMaths` & `Year11AdditionalMaths`
- `Year10English` & `Year11English`
- `Year10French` & `Year11French`
- `Year10ICT` & `Year11ICT`
- `Year10Mathematics` & `Year11Mathematics`
- `Year10Economics` & `Year11Economics`
- `Year10Biology` & `Year11Biology`

Each textbook is registered in the catalog and cross-referenced with open community demands in real time.

---

## 4. 📖 Offering / Sharing Books (Supply)

Parents can offer books using natural phrases, contractions, or textbook photos.

### Supported Contractions & Phrases:
- **English:** *"I have..."*, *"I'm offering..."*, *"Im offering..."*, *"Giving away..."*, *"Selling..."*
- **French:** *"J'ai..."*, *"Je donne..."*, *"Je vends..."*, *"Disponible..."*

### Example A: Single Book Offer
> **Parent Sends:**  
> *"J'ai le manuel de Physique Chimie 3ème en très bon état"*

#### 💬 Bot Response:
```text
📚 Bonjour ! Votre offre pour "Physique Chimie 3ème" a bien été enregistrée dans le catalogue. Dès qu'un parent cherche ce livre, nous vous mettrons en relation ! 🤝✨
```

### Example B: Photo Upload
When a parent uploads a photo of a textbook cover:
1. S3 safely ingests the image with KMS CMK encryption and a 30-day lifecycle policy.
2. Amazon Bedrock extracts title, grade, subject, and condition.
3. Relay confirms the listing and attaches the processed photo URL.

---

## 5. 🔍 Looking for / Requesting Books (Demand)

When a parent is looking for a textbook for their child.

### Supported Contractions & Phrases:
- **English:** *"I'm looking for..."*, *"Im looking for..."*, *"Looking for..."*, *"Need..."*, *"Do you have..."*
- **French:** *"Je cherche..."*, *"J'ai besoin de..."*, *"Recherche..."*

### Scenario 1: Book is already available in the catalog (Instant Match & 48H Hold)
The matchmaking engine finds an active book in DynamoDB and creates a **48-Hour Reserved Hold** with a 4-digit verification code:

**To the searching parent (Buyer):**
```text
🎉 Good news! We found a match for "Maths Year 6 Books"! 

You can connect directly with the parent offering this book via WhatsApp: +237 6XXXXXXXX 🤝📚
Your Handover Code: #4821 (Valid for 48 hours)
```

**To the offering parent (Seller):**
```text
🎉 Great news! A parent is looking for your book "Maths Year 6 Books"! 

They may reach out to you directly on WhatsApp: +237 6XXXXXXXX 🤝💡
Your Handover Code: #4821 (Valid for 48 hours)
```

---

### Scenario 2: Book is NOT currently in the catalog (Wishlist / Demand Board)
The request is stored in the **Wishlist / Demand Board**:

```text
👋 We've recorded your request for "Maths Year 6 Books" on our Wishlist / Demand Board 📚.

As soon as another parent lists this book, we will automatically match you and notify you here! 🤝💡
```

---

## 6. 🤝 48-Hour Hold Lifecycle & Handover Confirmation ("Sold" / "Vendu")

To ensure fairness, books matched between parents are reserved for **48 hours** (`reservedUntil = Date.now() + 48h`).

```
[ Active Book ] ──Match──> [ 48H Reserved Hold ] ──"Sold"──> [ Sold / Fulfilled ]
                                  │
                          48 Hours Elapsed
                                  │
                                  ▼
                         [ Reset to Active ]
```

### A. Confirming a Successful Handover
Once the exchange is completed, either parent can confirm by texting simple keywords:
> **Triggers:** `Sold`, `Vendu`, `Remis`, `Got it`, `Handover complete`

#### 💬 Bot Response to Seller:
```text
Thank you! Your book has been marked as sold and removed from the active catalog. Have a great school year! 🎓
```
*(French: "Merci ! Votre livre a été marqué comme vendu et retiré du catalogue disponible. Bonne rentrée scolaire ! 🎓")*

#### 💬 Bot Response to Buyer:
```text
Thank you for confirming receipt of the book! Your request has been completed. 🎓
```
*(French: "Merci d'avoir confirmé la réception du livre ! Votre demande a été finalisée. 🎓")*

### B. Automated 15-Minute Hold Sweeper (`holdExpiryCron`)
If 48 hours elapse without confirmation:
- An automated AWS EventBridge CronJob sweeps DynamoDB.
- The book is safely unlocked and returned to `status: 'active'`.
- The unmet demand is restored to `status: 'pending'` on the wishlist.
- Prevents community inventory from being locked indefinitely!

---

## 7. 🗂️ Browsing the Catalog & Wishlist

Parents can inspect available inventory and open requests anytime using simple keywords.

### A. View Active Books Catalog (2-Tier Interactive List Messages)
> **Triggers:** `catalog`, `catalogue`, `available books`, `livres disponibles`

Relay sends a native **WhatsApp Interactive List Message** with a button (`📚 Select Grade` / `📚 Choisir classe`):

1. **Step 1: Select Grade / Year Menu:**
   ```text
   📚 Book Catalog (76 books)
   We have 76 books available in our school community! Tap below to choose a grade and browse subjects:
   
   [ 📚 Select Grade ]
   ├── Year 1 (6 books • General Textbooks)
   ├── Year 3 (7 books • Math, Science, English...)
   ├── Year 4 (9 books • Math, Science, Computing...)
   ├── Year 5 (22 books • Chemistry, English, Math...)
   └── Year 12 (10 books • Math, Chem, Physics...)
   ```

2. **Step 2: 1-Tap Subject Selection & Safety Confirmation:**
   Tapping a grade opens the **Subject Interactive List**:
   ```text
   📚 Year 5 Books (22)
   Here are available books for Year 5. Tap below to choose:
   
   [ 📖 Select Book ]
   ├── Chemistry (8 avail — Like New)
   ├── Mathematics (1 avail — New)
   ├── Science (2 avail — New, Good)
   └── English (1 avail — Good)
   ```

3. **Step 3: 2-Button Confirmation Card:**
   To prevent accidental taps, Relay sends a 2-button confirmation card:
   ```text
   Would you like to request "Year 5 Chemistry"?
   
   [ ✅ Confirm Request ]   [ ❌ Cancel ]
   ```
   Tapping **Confirm** immediately locks the 48-hour reservation and connects both parents!

---

### B. View Requested Books Wishlist
> **Triggers:** `wishlist`, `demand board`, `demandes`, `demandes de livres`

```text
📋 Books Wanted by Parents (21) :

Here are textbooks currently requested by the school community. If you have any of these, send a photo or description! 👇

• Year 6:
  - Maths Year 6 Books (Requested by: +237 6XXXXXXXX)

• Year 10:
  - Biology Year 10 Textbook (Requested by: +237 6XXXXXXXX)

💡 Reply with "I have [Subject/Year]" to list it for a parent!
```

---

## 8. 💬 Conversational Clarification (Missing Year/Grade)

If a parent asks for or offers a book without specifying the school year, Relay asks for the grade to guarantee precise matchmaking:

> **Parent Sends:**  
> *"I need a biology textbook"*

#### 💬 Bot Response:
```text
📚 Could you please specify the school year or grade for "biology textbook" (e.g. Year 7, Year 10, or 4ème, 2nde)? This helps us match you with the right parent! 😊
```

---

## 9. 🛡️ Security, Privacy & Reliability

1. **Direct Peer-to-Peer Privacy:** Phone numbers are never published in public lists; they are only shared in private 1-on-1 introductions upon a verified match.
2. **Pre-Prompt PII Redaction (`maskPromptPII`):** Phone numbers, emails, and home addresses are masked before LLM reasoning.
3. **AWS KMS CMK Envelope Encryption:** All inventory, demands, and images are encrypted at rest using customer-managed AWS KMS keys.
4. **Automated Data Lifecycle:** Inbound book cover images in S3 expire automatically after 30 days.
5. **Real-time EMF Telemetry & X-Ray:** Amazon CloudWatch Embedded Metric Format tracks matching latency, hold expirations, and delivery success in real time.
