---
title: "WinGo Number Probability: A Uniform 0-9 Model"
shortTitle: "Where the probability comes from"
description: "Calculate exact-digit and category probabilities in a uniform 0-9 model, handle overlapping colors correctly, and distinguish one-draw questions from ordered sequences."
slug: number-probability
topic: Probability, step by step
summary: "Work from possible outcomes to percentages, then see why overlap and independence need different calculations."
takeaway: "Count distinct favorable digits for one draw. Multiply probabilities across separate draws only when the model makes those draws independent."
order: 4
minutes: 6
pubDate: 2026-11-03
publisher: project
related: [wingo-rules, patterns-and-randomness]
cta: calculator
sources:
  - title: "OpenStax: multiplication and addition rules of probability"
    url: "https://openstax.org/books/introductory-statistics-2e/pages/3-3-two-basic-rules-of-probability"
  - title: "OpenStax: independence and mutually exclusive events"
    url: "https://openstax.org/books/introductory-statistics-2e/pages/3-2-independent-and-mutually-exclusive-events"
---
## Start with the sample space

The sample space is the list of outcomes the model allows. Here it is **{0, 1, 2, 3, 4, 5, 6, 7, 8, 9}**. A draw produces one of these ten digits.

Our uniform model makes each digit equally likely. An event is a set of digits that meets a condition. For example, “the result is 7” contains one digit, while “the result is Big” contains five.

For this model, the probability of an event is its number of distinct favorable digits divided by 10. This counting shortcut relies on equal likelihood; it is not valid for every imaginable distribution over ten digits.

## Exact digits and groups

For one chosen digit, there is one favorable outcome out of ten: **P(7) = 1/10 = 10%**. The same applies to 0, 5, or any other exact digit.

Using our [classification rules](/wingo-rules/), we can count several broader events:

| Event | Favorable digits | Theoretical probability |
| --- | --- | --- |
| Small | 0, 1, 2, 3, 4 | 50% |
| Big | 5, 6, 7, 8, 9 | 50% |
| Red | 0, 2, 4, 6, 8 | 50% |
| Green | 1, 3, 5, 7, 9 | 50% |
| Violet | 0, 5 | 20% |

A 10% probability does not mean a digit must appear once in every ten draws. “One in ten” describes a chance per draw under the model, not a spacing rule.

## Handle overlapping colors by counting once

Consider “Red **or** Violet” in one draw. Red contains five digits and Violet contains two, but both sets contain 0. Their union is {0, 2, 4, 5, 6, 8}: six distinct digits. The probability is **60%**.

Adding 50% and 20% without adjusting for overlap gives 70%, counting the digit 0 twice. The addition rule corrects that: 50% + 20% − 10% = 60%.

“Red **and** Violet” asks a different question. Only 0 belongs to both groups, so its probability is 10%. Always make “and” and “or” explicit before calculating.

## Labels in one draw are not independent trials

A result’s size and colors come from the same digit. Do not automatically multiply their marginal probabilities.

For example, “Big and Red” contains 6 and 8. Its probability is 2/10, or **20%**. Multiplying P(Big) by P(Red) would give 25%, which is wrong here because those two properties are not independent under this ruleset.

The remedy is straightforward: for conditions within one draw, list the qualifying digits first. Independence is a relationship to establish, not a shortcut to assume.

## Multiply across independent draws

Our model does assume independence from one draw to the next. That lets us calculate an exact ordered sequence by multiplying the probability for each position.

- 7, then 7: 1/10 × 1/10 = 1/100 = **1%**.
- Big, then Big, then Small: 1/2 × 1/2 × 1/2 = 1/8 = **12.5%**.
- Violet, then Green: 2/10 × 5/10 = 1/10 = **10%**.

Specify the order and the positions in advance. A sequence that looks unusual after you have inspected a long history is not the same event as a specific sequence chosen before the next draws.

The [patterns and randomness guide](/patterns-and-randomness/) explains why repeated results do not change the independent next-draw probability, and why a streak anywhere in a longer session requires a different calculation.

## Keep the assumptions next to the answer

A responsible calculation states the digit range, equal-likelihood assumption, event definition, and any independence assumption. It also distinguishes the theoretical answer from an observed sample frequency.

The [calculator preview](/probability-calculator/) shows this structure with a fixed example. Its future interactive version will use the same rules. None of these formulas proves that an outside service follows our model or that its next result can be known in advance.
