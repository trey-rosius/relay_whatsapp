# CS Unplugged: Searching Algorithms & Error Correction

* **Source Repository:** [https://github.com/uccser/cs-unplugged](https://github.com/uccser/cs-unplugged)
* **Direct Content Path:** `csunplugged/topics/content/en/searching-algorithms/` & `error-detection-and-correction/`
* **License:** Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
* **Target Audience:** K-8 Students & Computer Science Beginners
* **Vector DB Target:** Bedrock KnowledgeBase / S3 Vectors

---

## 1. Searching Algorithms: Linear vs. Binary Search

Computers often need to locate a specific item in massive lists containing millions of records (such as student directories, phone books, or dictionary words).

### Linear Search (Sequential Scanning)
- In an **unsorted list**, you must check items one by one from beginning to end.
- If a list has 1,000 items, in the worst case you may have to inspect all 1,000 items.

### Binary Search (Divide and Conquer)
- In a **sorted list**, you can look at the middle item first.
- If the target is smaller, discard the entire right half.
- If the target is larger, discard the entire left half.
- Each comparison halves the remaining search space.
- In a list of 1,000,000 items, binary search finds any item in **at most 20 comparisons**!

---

## 2. Parity Magic: Error Detection & Correction

When data is transmitted over noisy channels (like wireless radio, satellite links, or WhatsApp cellular connections), bits can flip accidentally from 0 to 1 or 1 to 0.

### The 2D Parity Check Card Trick
- Arrange cards in a 5x5 grid (black face up = 1, white face up = 0).
- Add a 6th row and 6th column of "parity bits" so that every single row and every single column has an **EVEN** number of black cards (Even Parity).
- If one card flips, exactly one row and one column will have an **ODD** number of black cards.
- The intersection of that row and column points precisely to the flipped bit, allowing automatic correction!

### Real-World Check Digits (UPC Barcodes)
* Every grocery store barcode has a final check digit calculated using a mathematical formula.
* If a scanner misreads a single digit, the checksum calculation immediately fails and asks for a rescan, preventing billing errors.
