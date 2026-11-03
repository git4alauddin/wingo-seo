---
title: "What Is WinGo? Number and Color Mechanics Explained"
shortTitle: "What is WinGo?"
description: "Understand the WinGo-style 0-9 format, how one digit determines size and color labels, and how this educational lab separates models from predictions."
slug: what-is-wingo
topic: The fundamentals
summary: "Start with the format: ten possible digits, two size groups, and color labels that sometimes overlap."
takeaway: "In the version explored here, a result is one digit from 0 to 9. Size and color are classifications of that digit—not separate outcomes."
order: 1
minutes: 5
pubDate: 2026-11-03
publisher: project
related: [wingo-rules, number-probability]
cta: simulator
sources:
  - title: "Selected example ruleset: classification function in the reference project"
    url: "https://github.com/git4alauddin/wingo-aff/blob/52459b34f108a0f171277adf31012d54094a8020/js/wingo-engine.js"
  - title: "OpenStax: independent and mutually exclusive events"
    url: "https://openstax.org/books/introductory-statistics-2e/pages/3-2-independent-and-mutually-exclusive-events"
---
## The format this guide explains

“WinGo” is not a precise mathematical definition. The name can appear on different products and unrelated games. This lab focuses on a particular number-and-color format: one digit from **0 through 9** is recorded in a round, and that digit determines additional labels.

Some external versions attach financial choices to those labels. Our site does not. We use a specified example ruleset to teach classification, probability, and the limits of interpreting past results. We do not operate a real-money game or verify how an external service produces its outcomes.

That distinction is useful from the beginning. Understanding a table of rules is one task. Establishing that an outside system is fair, independent, or predictable is a very different task.

## One number, several descriptions

Take the digit **8**. In our example, it belongs to the Big group because Big includes 5, 6, 7, 8, and 9. It also belongs to Red. “8,” “Big,” and “Red” describe the same outcome at different levels of detail.

Now take **5**. It belongs to Big, Green, and Violet. The two colors are both valid labels in this ruleset. A display that insists every result has exactly one color would lose part of the rule.

There are three useful questions to ask about any result:

1. What is the exact digit?
2. Which size group contains it?
3. Which color group or groups contain it?

The [complete rules guide](/wingo-rules/) lists all ten digits. You can use it as a reference while reading the other guides.

## What a round represents

A round is a way to organize one outcome and the time around it. A timer may make a demonstration easier to follow, but a timer alone says nothing about how the number was selected.

In our local experiment, one completed teaching round produces one sampled digit. Its history records that experiment, not a feed from an external game. The [simulator](/simulator/) offers timed rounds and batch samples.

The pace of a demonstration and its probability model are separate choices. Making the timer longer does not, by itself, change a digit’s chance in our uniform model.

## Where probability enters the picture

Our mathematical model assumes that each of the ten digits is equally likely and that draws are independent. Under those assumptions, a particular digit has probability 1/10, or 10%. A group of five distinct digits has probability 5/10, or 50%.

Independence means the previous result does not change the next draw’s probability. If the previous result was 8, the next draw still has a 10% chance of being 8 in this model. The same applies after several repeated results.

These numbers come from the assumptions and the classification table. They are not evidence about the actual process used by any outside operator. The [number-probability guide](/number-probability/) works through the calculations in more detail.

## A useful way to approach the topic

Begin with the rules, then ask which assumptions would make a probability calculation valid. When you see a chart, ask where its data came from, how many outcomes it contains, and what conclusion the chart can actually support.

A short run of repeated labels may be interesting to describe. It does not establish that a different label is due, or that the same label will keep appearing. Learning to keep those questions separate is the purpose of this lab.
