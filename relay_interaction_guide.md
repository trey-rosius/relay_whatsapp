# 📚 Relay — Parent School Book Marketplace: Interaction & Response Guide

Welcome to the complete interaction guide for **Relay**, the intelligent WhatsApp-based school book exchange and marketplace connecting parents.

---

## 🌟 Quick Reference & Live Endpoints

- **💬 WhatsApp Bot Number:** `+237 6 51 56 53 40` (Display Name: *Educloud,Inc*)
- **🌐 Web Marketplace Portal:** [https://d3cdc2mtpqk5ut.cloudfront.net](https://d3cdc2mtpqk5ut.cloudfront.net)
- **🔗 Production Webhook Endpoint:** `https://0bur1ooy7b.execute-api.us-east-1.amazonaws.com/prod/webhook`
- **🧠 AI Core:** Amazon Bedrock (Nova Lite) Multi-Intent Parser & Natural Response Generator

---

## 1. 🚀 Onboarding, Greetings & Tutorials

When a parent reaches out for the first time or types greeting / tutorial triggers like `hi`, `hello`, `help`, `tutorials`, `how do i use this app`, `bonjour`, or `comment utiliser`.

### 🇬🇧 English Welcome Message
> **Trigger Examples:** `hi`, `hello`, `help`, `tutorials`, `how do i use this app`

```text
Hello! 👋 Welcome to Relay! You can:
1. Share books: 'I have Year 3 books'
2. Ask for books: 'Looking for Year 9 Maths'
3. View available books: 'catalog'
4. View requested books: 'demand board'

*Tip:* Always include the school year (e.g. Year 5, Year 8, Year 11, or 6ème, 3ème) for faster matching!
```

---

### 🇫🇷 French Welcome Message
> **Trigger Examples:** `bonjour`, `salut`, `aide`, `tutoriel`, `comment utiliser`

```text
Bonjour ! 👋 Bienvenue sur Relay ! Vous pouvez :
1. Partager des livres : 'J'ai des livres de l'année 3'
2. Demander des livres : 'Je cherche des livres de maths année 9'
3. Voir les livres disponibles : 'catalogue'
4. Voir les livres demandés : 'demandes'

*Conseil :* Précisez toujours la classe (ex : 6ème, 3ème, Year 5, Year 8) pour être mis en relation rapidement !
```

---

## 2. 📖 Offering / Sharing Books (Supply)

Parents can offer a single book or list multiple books across different school years in one sentence.

### Example A: Multi-Book Compound Sentence
> **Parent Sends:**  
> *"I have chemistry, humanities and maths book for year 3, 7 and 9"*

#### 🧠 AI Extraction:
- **Item 1:** Chemistry Book for Year 3 (`Year3Chemistry` • Science • Primary School)
- **Item 2:** Humanities Book for Year 7 (`Year7Humanities` • Humanities • Middle School)
- **Item 3:** Maths Book for Year 9 (`Year9Mathematics` • Mathematics • High School)

#### 💬 Bot Responses Sent to Parent:
1. `📚 Hello! We have added an active listing for "Chemistry Book for Year 3" to the marketplace. 🤝✨`
2. `📚 Hello! We have added an active listing for "Humanities Book for Year 7" to the marketplace. 🤝✨`
3. `📚 Hello! We have added an active listing for "Maths Book for Year 9" to the marketplace. 🤝✨`

---

### Example B: Single Book Offer
> **Parent Sends:**  
> *"J'ai le manuel de Physique Chimie 3ème en très bon état"*

#### 💬 Bot Response:
```text
📚 Bonjour ! Votre offre pour "Physique Chimie 3ème" a bien été enregistrée dans le catalogue. Dès qu'un parent cherche ce livre, nous vous mettrons en relation ! 🤝✨
```

---

## 3. 🔍 Looking for / Requesting Books (Demand)

When a parent is looking for a textbook for their child.

### Example A: Requesting a Book
> **Parent Sends:**  
> *"i'm looking for maths year 6 books"*

#### 🧠 AI Extraction:
- **Intent:** `demand` (Search/Request)
- **Extracted Title:** `Maths Year 6 Books`
- **Concept Key:** `Year6Mathematics`
- **Category:** Primary School (Year 6)

---

### Scenario 1: Book is already available in the catalog
The matchmaking engine finds an existing listing and connects both parents immediately:

**To the searching parent:**
```text
🎉 Good news! We found a match for "Maths Year 6 Books"! 

You can connect directly with the parent offering this book via WhatsApp: +237 6XXXXXXXX 🤝📚
```

**To the offering parent:**
```text
🎉 Great news! A parent is looking for your book "Maths Year 6 Books"! 

They may reach out to you directly on WhatsApp: +237 6XXXXXXXX 🤝💡
```

---

### Scenario 2: Book is NOT currently in the catalog
The request is stored in the **Wishlist / Demand Board**:

```text
👋 We've recorded your request for "Maths Year 6 Books" on our Wishlist / Demand Board 📚.

As soon as another parent lists this book, we will automatically match you and notify you here! 🤝💡
```

---

## 4. 🗂️ Browsing the Catalog & Wishlist

Parents can inspect available inventory and open requests anytime using simple keywords.

### A. View Active Books Catalog
> **Triggers:** `catalog`, `catalogue`, `available books`, `livres disponibles`

```text
📚 Available Books in Catalog:

• Year 3:
  - Chemistry Book for Year 3 (Contact: +237 6XXXXXXXX)

• Year 7:
  - Humanities Book for Year 7 (Contact: +237 6XXXXXXXX)

• Year 9:
  - Maths Book for Year 9 (Contact: +237 6XXXXXXXX)
```

---

### B. View Requested Books Wishlist
> **Triggers:** `wishlist`, `demand board`, `demandes`, `demandes de livres`

```text
📋 Current Parent Book Requests (Wishlist):

• Year 6:
  - Maths Year 6 Books (Requested by: +237 6XXXXXXXX)

• Year 10:
  - Biology Year 10 Textbook (Requested by: +237 6XXXXXXXX)
```

---

## 5. 💬 Conversational Clarification (Missing Year/Grade)

If a parent asks for or offers a book without specifying the school year, the bot prompts them to specify the grade to ensure precise matchmaking.

> **Parent Sends:**  
> *"I need a biology textbook"*

#### 💬 Bot Response:
```text
📚 Could you please specify the school year or grade for "biology textbook" (e.g. Year 7, Year 10, or 4ème, 2nde)? This helps us match you with the right parent! 😊
```

---

## 6. 🛡️ Security, Privacy & Reliability

1. **Direct Peer-to-Peer Contact:** Contact information is only shared when a genuine match between supply and demand is identified.
2. **KMS CMK Encryption:** All database entries and secrets are encrypted with customer-managed AWS KMS keys.
3. **Bedrock Guardrails & WAF:** Protection against spam, prompt injections, and API abuse.
4. **EMF Telemetry:** Real-time latency, token usage, and matchmaking success tracking in Amazon CloudWatch.
