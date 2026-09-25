# CS Unplugged: Binary Numbers & Computational Thinking

* **Source Repository:** [https://github.com/uccser/cs-unplugged](https://github.com/uccser/cs-unplugged)
* **Direct Content Path:** `csunplugged/topics/content/en/binary-numbers/`
* **License:** Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
* **Target Audience:** K-8 & Primary School Learners
* **Vector DB Target:** Bedrock KnowledgeBase / S3 Vectors

---

## 1. How Binary Digits Work

Data in computers is stored and transmitted as a series of zeros and ones. How can we represent words and numbers using just these two symbols?

### The Analog Dot Card Method
Imagine a row of cards with dots on them. The right-most card has 1 dot. Each card to the left has twice as many dots as the previous one:
- Card 4: **8 dots**
- Card 3: **4 dots**
- Card 2: **2 dots**
- Card 1: **1 dot**

When a card is face up (visible), the dots are counted, and this corresponds to a **1**.
When a card is face down (hidden), the dots are not counted, corresponding to a **0**.

### Decimal to Binary Conversion Examples
* **Number 5:**
  - 8-card is OFF (0)
  - 4-card is ON (1)
  - 2-card is OFF (0)
  - 1-card is ON (1)
  - 4 + 1 = 5. Binary representation: `0101` (or `101`).

* **Number 6:**
  - 4-card is ON (1) and 2-card is ON (1).
  - 4 + 2 = 6. Binary representation: `0110` (or `110`).

* **Number 9:**
  - 8-card is ON (1) and 1-card is ON (1).
  - 8 + 1 = 9. Binary representation: `1001`.

* **Doubling Progression:**
  - 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024...
  - A 5th card to the left of the 8-card has `8 * 2 = 16` dots.
  - An 8-bit byte can represent any number from 0 up to 255.

---

## 2. Codes for Letters Using Binary (ASCII Representation)

Computers store letters of the alphabet by assigning each character a unique binary number.

### Standard Alphabet Mapping
* `A` = 1 = `00001`
* `B` = 2 = `00010`
* `C` = 3 = `00011`
* `D` = 4 = `00100`
* `E` = 5 = `00101`
* `T` = 20 = `10100`

### Caesar Cipher & Encryption
Julius Caesar encrypted confidential military dispatches by shifting letters in the alphabet by a secret integer key.
* Example with key `+1`:
  - `C` (+1) -> `D`
  - `A` (+1) -> `B`
  - `T` (+1) -> `U`
  - The secret word `CAT` encrypts to `DBU`.
