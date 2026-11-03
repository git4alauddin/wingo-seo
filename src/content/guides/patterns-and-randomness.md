---
title: "Streaks and Randomness: Why Past Results Do Not Predict"
shortTitle: "Why patterns can mislead"
description: "Explore independent draws, streak probability, the gambler’s fallacy, and sample-size variation without treating historical patterns as predictions."
slug: patterns-and-randomness
topic: Patterns & perspective
summary: "Learn why a streak can be ordinary in a random sample, and why finding one is different from forecasting the next draw."
takeaway: "In an independent model, the next draw’s probability stays the same after a streak. A surprising-looking history does not make an outcome due."
order: 5
minutes: 6
pubDate: 2026-11-03
publisher: project
related: [historical-analysis, number-probability]
cta: simulator
sources:
  - title: "OpenStax: independence and conditional probabilities"
    url: "https://openstax.org/books/introductory-statistics-2e/pages/3-2-independent-and-mutually-exclusive-events"
  - title: "MDN: the browser random-value API planned for this lab"
    url: "https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues"
---
## A streak is an observation

Suppose you see Small, Small, Small. It is natural to notice the repetition. But naming a pattern does not tell you what will happen next.

In our uniform 0-9 model, Small contains five of the ten equally likely digits. Each draw is independent, so its probability is 50% on every draw. After three Small results, the next result still has a 50% chance of being Small and a 50% chance of being Big.

This is a statement about the model. We cannot infer that every external number game satisfies independence simply because it displays similar labels.

## The gambler’s fallacy

The gambler’s fallacy is the mistaken expectation that past independent outcomes must be compensated for immediately. After several Small results, someone may think Big is now more likely because it is “due.”

An independent process does not keep that kind of corrective ledger. It can produce another Small, a Big, or further repetition without changing its underlying probabilities.

The opposite story—“Small has momentum, so it must continue”—also lacks support in this model. Looking at the same streak can inspire two contradictory forecasts. Neither follows from independence.

## A fixed block is not a whole session

Before any new draw, ask: what is the chance that the **next three results are all Small**? Under our model, it is 1/2 × 1/2 × 1/2 = 1/8, or 12.5%.

Now change the question: what is the chance of seeing three Small results **somewhere in a history of 100 draws**? There are many possible starting positions. Some three-draw windows overlap, so treating those windows as independent would introduce another error.

The answer to the second question is not simply 12.5%. The event is larger and its calculation needs to account for the whole session. Our initial calculator is limited to specified ordered blocks; it will not label a block probability as an anywhere-in-session probability.

There is one more distinction: three Big **or** three Small in a specified block of three has probability 25%. The two possibilities are mutually exclusive, so their 12.5% probabilities add. That is still a fixed-block calculation.

## Random does not mean evenly alternating

A perfectly alternating sequence may look orderly, but the model does not prefer it. For a specified ten-position Big/Small sequence, any particular arrangement has probability (1/2)^10.

The appearance of a sequence and the probability of that exact sequence are different ideas. Many arrangements look mixed; some have obvious streaks. A longer record gives you more chances to notice something memorable after the fact.

Describe what you saw accurately. Then separate that description from a claim that the pattern will persist, reverse, or predict an external outcome.

## How a local random-number experiment works

Software needs a mechanism to produce its samples. Our planned simulator uses the browser’s random-value API, maps accepted values uniformly onto digits, and derives all labels from each sampled digit. The explanation will remain available alongside the tool.

Browser generators are software mechanisms, not mathematical proofs or certifications of an external game. A replay of recorded results will be deterministic and labeled as a replay. It is useful for reviewing an experiment, but it is not a new independent sample.

## Compare frequencies with care

A sample of 20 draws may differ substantially from a 50/50 split. With more draws, relative frequencies often move closer to the model’s probabilities, but they need not improve after every additional draw or in every larger sample.

The [historical-analysis guide](/historical-analysis/) shows why a larger absolute count gap can coexist with a smaller percentage gap. The [simulator preview](/simulator/) introduces the local model. The illustrative comparison below is fixed teaching data; it does not generate outcomes yet.
