---
title: "WinGo Rules Explained: Numbers, Colors, Big and Small"
shortTitle: "The rules, clearly mapped"
description: "Read the complete 0-9 classification table used in this educational lab, including Big and Small and the overlapping Red, Green, and Violet labels on 0 and 5."
slug: wingo-rules
topic: Mechanics & labels
summary: "A complete reference for the ten digits, the size boundary, and the special color cases of 0 and 5."
takeaway: "Small is 0-4 and Big is 5-9. In this example ruleset, 0 is Red + Violet and 5 is Green + Violet."
order: 2
minutes: 5
pubDate: 2026-11-03
publisher: project
related: [big-small-explained, number-probability]
cta: simulator
sources:
  - title: "Selected example ruleset: versioned classification function"
    url: "https://github.com/git4alauddin/wingo-aff/blob/52459b34f108a0f171277adf31012d54094a8020/js/wingo-engine.js"
  - title: "OpenStax: probability rules and overlapping events"
    url: "https://openstax.org/books/introductory-statistics-2e/pages/3-3-two-basic-rules-of-probability"
---
## Start with the selected ruleset

This guide documents the example rules used throughout WinGo Learning Lab. They describe how digits are classified. They are not a universal rulebook for every product using the name WinGo.

The outcome is a digit from 0 to 9. Each outcome has exactly one size label and one or two color memberships. Monetary choices, fees, and payouts are outside this educational model.

Keeping a complete table is better than relying on a shortcut that leaves out special cases. Here is the full mapping:

| Digit | Size | Color membership |
| --- | --- | --- |
| 0 | Small | Red + Violet |
| 1 | Small | Green |
| 2 | Small | Red |
| 3 | Small | Green |
| 4 | Small | Red |
| 5 | Big | Green + Violet |
| 6 | Big | Red |
| 7 | Big | Green |
| 8 | Big | Red |
| 9 | Big | Green |

## The Big and Small boundary

**Small contains 0, 1, 2, 3, and 4. Big contains 5, 6, 7, 8, and 9.** Every digit belongs to one group, and no digit belongs to both. Zero is included; it is not an empty outcome.

The boundary is between 4 and 5. A result of 4 is Small and Red. A result of 5 is Big and carries two color labels. Its Violet membership does not remove it from Big in our ruleset.

The [Big and Small guide](/big-small-explained/) explains why each group has probability 50% when the ten digits are equally likely.

## Color classifications

Red contains the even digits: **0, 2, 4, 6, and 8**. Green contains the odd digits: **1, 3, 5, 7, and 9**. Violet contains **0 and 5**.

The key detail is that Violet overlaps the other groups. The number 0 belongs to Red and Violet. The number 5 belongs to Green and Violet. You do not need to choose which of its two colors is “the real one.” Both are part of the classification.

Consider the question “Was this result Red or Violet?” There are six distinct qualifying digits: 0, 2, 4, 5, 6, and 8. Counting the five Red digits and then adding both Violet digits would count 0 twice. This is why event sets are useful: list the outcomes, remove duplicates, and then calculate.

Under a uniform model, Red has probability 50%, Green 50%, and Violet 20%. Their total is 120%, which is valid for overlapping memberships. It would be misleading to draw those percentages as three slices of one pie. The [probability guide](/number-probability/) explains overlap more fully.

## Round timing in this lab

A timer organizes a demonstration; it does not define the classification or prove a random-generation method. The planned simulator will use short teaching rounds and batch experiments with a disclosed local model. The current page is a [static simulator preview](/simulator/), with no running timer.

No account, wallet, stake, or external period identifier is required to study these rules. A generated local history will be labeled as simulated, and an illustrative example will remain labeled as an illustration.

## What rules alone cannot tell you

A mapping says what a digit means once it appears. It does not establish how often an external system generates that digit, whether its rounds are independent, or whether its process is fair.

Our probability calculations add explicit assumptions: ten equally likely digits and independent draws. When discussing another system, those assumptions would need independent evidence. A familiar color table is not that evidence.
