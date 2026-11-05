---
title: "Reading Simulated History: Frequency and Sample Size"
shortTitle: "Read the history, carefully"
description: "Interpret synthetic outcome histories using counts, denominators, expected versus observed frequencies, and sample size without turning a chart into a prediction."
slug: historical-analysis
topic: Read the evidence
summary: "Turn a list of outcomes into useful descriptions, and learn where those descriptions stop supporting a conclusion."
takeaway: "A frequency describes the sample you counted. Always state the sample size and data source before drawing a conclusion from it."
order: 6
minutes: 6
pubDate: 2026-11-03
updatedDate: 2026-11-06
publisher: project
related: [patterns-and-randomness, number-probability]
cta: simulator
sources:
  - title: "OpenStax: the binomial model for repeated independent trials"
    url: "https://openstax.org/books/introductory-statistics-2e/pages/4-3-binomial-distribution"
  - title: "OpenStax: independence and its assumptions"
    url: "https://openstax.org/books/introductory-statistics-2e/pages/3-2-independent-and-mutually-exclusive-events"
---
## Start with provenance and a denominator

Before reading a chart, ask where the numbers came from. Were they generated locally, constructed for teaching, or recorded elsewhere? How many results are included? Has anything been omitted?

The [DmPlay WinGo history-chart walkthrough](/dmplay-wingo-guide/#reading-the-dmplay-number-chart) applies these questions to an owner-supplied interface reference and distinguishes displayed records from an audited dataset.

This lab uses synthetic examples and, locally generated samples. It does not collect external game histories. The following 20 digits are a **constructed teaching dataset**, not live results or a claimed random sample:

`0, 7, 2, 4, 8, 0, 1, 5, 3, 2, 9, 1, 4, 6, 3, 0, 7, 6, 5, 4`

The denominator is 20. Any frequency we calculate from this full example must use those 20 outcomes, even if a compact display shows only a few recent rows.

## Count first, then calculate percentages

Twelve digits in the example belong to Small and eight to Big. The observed Small frequency is 12/20 = 60%; Big is 8/20 = 40%.

For individual digits, the complete count is:

| Digit | Count | Observed frequency |
| --- | --- | --- |
| 0 | 3 | 15% |
| 1 | 2 | 10% |
| 2 | 2 | 10% |
| 3 | 2 | 10% |
| 4 | 3 | 15% |
| 5 | 2 | 10% |
| 6 | 2 | 10% |
| 7 | 2 | 10% |
| 8 | 1 | 5% |
| 9 | 1 | 5% |

The counts add to 20, and the percentages add to 100%. Checking those totals catches simple errors before any interpretation begins.

Color memberships require a different check. Digits 0 and 5 each contribute to two color groups. Those group counts can sum to more than 20, because they are memberships rather than an exclusive partition. The [rules guide](/wingo-rules/#color-classifications) explains the overlap.

## Expected is not required

Under our uniform model, the expected count for each exact digit in 20 independent draws is 20 × 0.1 = 2. The expected Small count is 20 × 0.5 = 10.

An expectation is a model-based average, not a demand that every sample match it. A digit appearing three times is not a contradiction of a 10% probability. Nor does a digit appearing once become more likely on the next independent draw.

The example data is constructed, so its uneven counts illustrate the arithmetic rather than provide experimental evidence about randomness. You can study sampling variation with labeled generated runs in the simulator.

## Absolute gaps and relative gaps

Compare two constructed examples:

- In 20 draws, 12 Small results exceed the expected count of 10 by 2. The observed proportion is 60%, a gap of **10 percentage points** above 50%.
- In 2,000 draws, 1,016 Small results exceed the expected count of 1,000 by 16. The observed proportion is 50.8%, a gap of **0.8 percentage points**.

The second absolute count gap is larger, while its relative gap is smaller. Looking only at raw counts could hide that distinction.

Larger independent samples tend to have less relative sampling variation. That does not guarantee every larger sample will be closer to the expected percentage than every smaller sample. Avoid turning a general tendency into a promise for an individual run.

## A chart describes; it does not certify

A line connecting digits can make an arbitrary sequence appear to rise, fall, or reverse. A bar chart is useful for counting frequencies, but it cannot by itself prove independence, fairness, or a future advantage.

Changing the visible window also changes the question. A chart of the last 20 outcomes describes those 20, not necessarily all outcomes in the experiment. Keep the window size and denominator visible, and do not select only the most striking section of a history.

The [patterns and randomness guide](/patterns-and-randomness/) explains why streaks need careful interpretation. The [simulator](/simulator/) produces local samples using the disclosed model. Read the data fully, state its origin, and keep the next-draw claim separate.
