# Content and experience plan

Decision date: 2026-11-03. This is the Phase 2 authoring brief, not published copy.

## Position and learning paths

Working public name: **WinGo Learning Lab**. Repository/project name remains WinGo Educational SEO Lab. The public promise is to explain a clearly specified number model and help visitors test their understanding through local experiments. No affiliation with an operator or expertise beyond the actual project is claimed.

Launch language is English. India is a working audience hypothesis, not a geo-specific search finding. Avoid fabricated local expertise or legal claims. Translation is a future decision supported by readership evidence, not automatically generated duplicate pages.

Primary navigation: Learn (`/guides/`), Simulator, Calculator, About. A visible home link and footer provide Contact, Privacy, and Terms. No registration, balances, deposits, VIP access, signal panels, or operator badges.

Two paths must be easy to follow:

1. **New to the topic:** overview -> rules -> Big/Small -> probability -> simulator.
2. **Questioning a pattern:** randomness -> sample-size analysis -> experiment -> calculator.

The primary homepage CTA is **Explore the Simulator**; secondary is **Learn Probability**. Each article ends with a relevant experiment and related reading, not the same indiscriminate link list. User-facing navigation should describe learning, without discussing Git, SEO implementation, or deployment internals.

## Homepage brief

| Section | Purpose and required behavior |
| --- | --- |
| Hero | Explain the educational purpose immediately; introduce probability and randomness; show both CTAs |
| Classification introduction | Original ten-digit diagram; demonstrate that 0 and 5 carry two color labels |
| Featured topics | Distinct cards for rules, size, probability, and randomness |
| Simulator preview | Show a labeled static example and link to the tool; avoid loading a second full simulator on home |
| Probability and randomness | Explain 10% per digit and independence within the model; no promise of external fairness |
| Featured articles | Three useful entry points from the same guide collection used by `/guides/` |
| Limitations | Local synthetic outcomes, explicit assumptions, no prediction advantage or external feed |
| Footer | Publisher/project context, information links, and analytics settings when implemented |

## Article briefs

The [keyword map](keyword-research.md) owns draft titles and URLs. Each article should answer its main question near the start, give worked examples, state assumptions, cite appropriate sources, and provide a next learning step. Length follows usefulness; there is no SEO word-count quota.

| Article | Required sections and original example | Links and experiment |
| --- | --- | --- |
| What is WinGo? | Clarify the 0-9 format addressed here and the existence of unrelated names/rule variations; number -> size and color; why this site is educational; read result 8 as Big + Red | Rules, probability; Explore the Simulator |
| Rules | Complete mapping table; Small/Big boundary; overlapping colors with anchor `color-classifications`; round timing in this local lab; 0 is Small + Red + Violet, 5 is Big + Green + Violet | Big/Small, number probability, simulator |
| Big and Small | Partition 0-4 vs 5-9; counting five favorable outcomes; 50% under uniformity; distinguish this from a claim about an external service; 4 versus 5 at the boundary | Rules, number probability; calculator |
| Number probability | Sample space, event sets, exact digit, category, overlap, independence across draws; show P(7)=1/10 and P(7 then 7)=1/100 | Rules, randomness; calculator |
| Patterns and randomness | Independent events, fixed-block streaks vs anywhere-in-session, gambler's fallacy, why PRNGs and model assumptions matter; embedded small/large-sample experiment | Historical analysis, probability; simulator |
| Historical analysis | Synthetic-data provenance, counts and percentages with denominators, expected vs observed, absolute counts vs relative frequencies, limits of sample-based claims; compare samples of 20 and 2,000 | Randomness, simulator; no fake external history |

Mathematical verification sources: [OpenStax independence](https://openstax.org/books/introductory-statistics-2e/pages/3-2-independent-and-mutually-exclusive-events), [probability rules](https://openstax.org/books/introductory-statistics-2e/pages/3-3-two-basic-rules-of-probability), and [binomial distribution](https://openstax.org/books/introductory-statistics-2e/pages/4-3-binomial-distribution). The [simulation specification](simulation-model.md) supplies our own worked examples and model definition. Search-result pages are research evidence, not mathematical authorities.

## Tool and information pages

- **Simulator:** static description and mapping remain available without JavaScript; enhanced controls run only in the browser. Display the local-model notice, sample size, frequency table, and explicit reset/replay behavior.
- **Calculator:** static worked example and assumptions; enhanced form calculates selected-event probabilities and exact sequences. Use plain-language labels for sequence order and event type.
- **Guides:** curated paths, short original summaries, and every published article. Do not create empty tag/category archives.
- **About:** explain the project, how content is checked, and its limitations. Credit the actual project publisher; do not invent qualifications, affiliations, or reviews.
- **Contact:** provide a working owner-approved destination before production. During development, clearly state that a contact channel is pending. Do not create a fake address or a form that discards messages.
- **Privacy:** describe actual local tool data, consent storage, third-party analytics, and configured behavior. Finalize in Phase 5; no inaccurate claim that all site traffic stays on-device when hosting necessarily receives requests.
- **Terms:** explain educational use, model assumptions, synthetic data, limitations, and lack of affiliation. No claims of legal approval or verified prediction performance.

Course-interest conversion remains optional. The reference course exists, but no enrollment, payment, or privileged connection is part of this build. An informational outbound link may be added only after its destination is reviewed for this site's scope. Disabled features must not appear as active CTAs.

## Content model and editorial checks

Use Markdown articles in one Astro content collection. Required metadata: title, description, slug, primary topic, summary, publication date, publisher key, related guide slugs, and source links. Support an optional genuine revision date; never update it merely to make content appear fresh. Draft entries are excluded from routes, cards, internal links, and sitemap.

The article layout supplies the single H1, publisher/date, breadcrumbs, optional table of contents, content, source list, related guides, and CTA. Article Markdown starts at H2. Keep tool instructions and explanatory content prerendered. JSON-LD describes the same visible publisher and dates; use Article only for real articles and BreadcrumbList where breadcrumbs are visible.

## Design direction

Original editorial laboratory aesthetic: warm off-white surfaces, deep ink text, indigo navigation/actions, restrained orange accents, generous spacing, and readable system fonts. Use red/green/violet only where the model calls for those categories and always pair them with text. This differs from the reference projects' visual systems while remaining familiar to learners.

Use responsive CSS, semantic cards, original SVG diagrams, and HTML/CSS bars with numeric tables rather than decorative chart libraries. Avoid casino reels, metallic chips, flashing timers, artificial scarcity, confetti, and live-feed styling. No AI bitmap assets are needed for the proposed educational diagrams.

Accessibility target: WCAG 2.2 AA as an implementation/testing goal, not a claim of certification. Include visible focus, skip navigation, meaningful headings, labeled controls, keyboard access, contrast checks, reduced-motion support, and useful no-JavaScript states. Announce completed runs/results without announcing every timer tick. Preserve room for dynamic output and controls at narrow widths.

## Phase 2 completion boundary

All 14 routes should be browsable with original substantive content, navigation, and responsive layouts. Simulator and calculator pages can have clearly labeled nonfunctional previews until Phase 3, but must not imply that controls work. Implement the metadata/content interfaces early so Phase 4 can finish and validate SEO without redesigning the pages. Production disclosure/contact details remain release gates rather than invented content.
