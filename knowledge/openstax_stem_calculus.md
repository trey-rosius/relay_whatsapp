# OpenStax STEM: Calculus, Functions & Rates of Change

* **Source Repository:** [https://github.com/philschatz/calculus-book](https://github.com/philschatz/calculus-book)
* **Direct Content Path:** `contents/`
* **License:** Creative Commons Attribution 4.0 International (CC BY 4.0)
* **Target Audience:** High School (Grades 11-12) & University Foundations
* **Vector DB Target:** Bedrock KnowledgeBase / S3 Vectors

---

## 1. Functions and Graphs

A function `f(x)` is a rule that assigns to each input `x` in a domain exactly one output `f(x)` in a range.

### Types of Functions
* **Linear Functions:** `f(x) = mx + b` where `m` represents constant rate of change (slope).
* **Quadratic Functions:** `f(x) = ax² + bx + c` representing parabolic trajectories (e.g. projectile motion).
* **Exponential Growth:** `f(x) = a · bˣ` where rate of growth is proportional to current quantity (population growth, compound interest).

---

## 2. Limits and Instantaneous Rates of Change

Calculus begins by asking: *what happens as the interval of measurement shrinks towards zero?*

### The Tangent Line Problem
* The average velocity of a moving object between time `t` and `t + Δt` is:
  `v_avg = (s(t + Δt) - s(t)) / Δt`
* As `Δt` approaches 0, the limit gives the **instantaneous rate of change** (the derivative `f'(x)`).
* The derivative of position with respect to time is **velocity**.
* The derivative of velocity with respect to time is **acceleration**.
