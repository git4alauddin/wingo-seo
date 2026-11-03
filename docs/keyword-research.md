# Keyword research and page map

Research date: 2026-11-03. Status: initial qualitative research, ready to guide the first build; demand remains unquantified.

## Audience and research limits

Launch audience: English-reading beginners curious about WinGo-style classifications and independent random events, with India as an initial audience hypothesis. The site will also serve learners interested in probability without prior WinGo knowledge. The topic is not a reason to target children with gambling-themed material.

Ten candidate queries from the handoff were searched individually. The [observation log](search-observations.md) records the exact queries and example URLs returned. We also reviewed the reference projects and primary mathematical and technical sources. Search output is not a controlled, signed-out Google India mobile results capture; language, geography, personalization, ordering, and result features are not controlled. We did not measure Google positions, ads, People Also Ask coverage, backlinks, or domain authority.

No authenticated Keyword Planner export, Search Console history, or reliable keyword-volume/difficulty dataset was available. **Monthly search demand, numerical organic difficulty, and current ranking positions are unknown for every candidate.** Pages appearing for a query show existing content, not how often people search for it. Priority below means editorial usefulness and fit, not proven traffic potential.

Competition labels describe the observed content landscape. They are qualitative judgments, not proprietary difficulty scores. Source sites' claims about prediction accuracy, popularity, fairness, or operator status are not accepted as facts.

## Candidate assessment

Sensitivity describes gambling/advertising proximity of the topic, not a legal determination. All WinGo terms require explicit educational framing. Google Ads remains outside this release; see [Google's gambling and games policy](https://support.google.com/adspolicy/answer/15132179?hl=en) and [policy overview](https://support.google.com/google-ads/answer/6008942?hl=en). Organic indexing and advertising eligibility are separate questions.

| Candidate query | Intent and observed result types | Competition judgment / educational opportunity | Relevance / sensitivity | Priority and destination |
| --- | --- | --- | --- | --- |
| What is WinGo? | Ambiguous: airline help, finance app, unrelated games | Entity ambiguity is a stronger initial obstacle than a measured difficulty; qualify the title with number/color mechanics | High only when disambiguated / high | P1: `/what-is-wingo/` |
| WinGo game rules | Mixed informational and play intent; different games' rules, operator-style guides | No single universal ruleset established; offer one explicit 0-9 model and complete table | High / high | P1: `/wingo-rules/` |
| WinGo Big Small explained | Definition intent mixed with betting onboarding and guides | Competing content often leads toward playing; explain the five-versus-five partition without registration | High / high | P1: `/big-small-explained/` |
| WinGo probability | Mixed math, predictions, game FAQs and trend tools | Needs a clear distinction between a theoretical model and an external outcome process | High / high | P1: `/number-probability/` |
| WinGo number probability | Number prediction panels, analysis articles and result trackers | Explain sample space, 10%, and why a missing number is not due; avoid a competing thin article | High / high | P1: same `/number-probability/` page |
| WinGo color rules | Rules pages and classification guides; special/overlapping categories appear | A labeled ten-row table can clarify 0/5 and overlapping color totals; do not assume all sources agree | High / high | P1: `/wingo-rules/#color-classifications` |
| How random number games work | RNG explainers, lottery help, gaming articles, learning material | Broad established topic; use our transparent local model as a bounded worked example | Medium-high / medium-high | P2: section in `/patterns-and-randomness/`; link to model explanation on `/simulator/` |
| Probability simulator | Educational coin/dice/spinner tools and classroom resources | Existing interactive tools set expectations; differentiate with a transparent ten-digit experiment, not a claim of low competition | High / low for general math, higher in WinGo context | P1: `/simulator/` |
| Random number simulation | Seeded generators, statistics lessons, random-number utilities | Broad programming/utility intent; do not compete as a general-purpose random generator | Medium / low-medium, context dependent | P2 supporting term on `/simulator/` |
| Streak probability explained | Calculators, university teaching, sports/gambling explanations | Distinguish a specified block from a streak anywhere; show why historical streaks do not alter an independent next draw | High / medium, context dependent | P1: `/patterns-and-randomness/` |

Demand for each row: unknown; no numeric estimates. Evidence for each row: corresponding exact-query entry in the [observation log](search-observations.md). P1 and P2 both belong in the initial site; P2 topics receive less title emphasis rather than extra low-value URLs.

## Keyword-to-page map

Each canonical route owns one primary learning job. Supporting terms are topic hypotheses, not additional verified-volume keywords. Titles are editorial drafts informed by this research and may be refined during writing.

| Canonical route | Primary topic / draft title | Supporting terms | Audience and format | Evidence |
| --- | --- | --- | --- | --- |
| `/` | WinGo Learning Lab: Mechanics, Probability & Randomness | probability learning, educational simulator | All beginners; editorial homepage and learning paths | Handoff + research synthesis |
| `/what-is-wingo/` | What Is WinGo? Number and Color Mechanics Explained | WinGo-style numbers, educational model | Newcomers; disambiguating overview article | Query 1; reference review |
| `/wingo-rules/` | WinGo Rules Explained: Numbers, Colors, Big and Small | WinGo color/colour rules, 0 and 5, violet | Readers decoding classifications; reference article/table | Queries 2 and 6; versioned example ruleset |
| `/big-small-explained/` | WinGo Big and Small Explained: The 0-9 Model | Small 0-4, Big 5-9, 50% probability | Beginners asking about size; visual worked-example article | Query 3; partition derived from model |
| `/number-probability/` | WinGo Number Probability: A Uniform 0-9 Model | exact number, 10%, independent draws | Learners seeking mathematical explanation; article | Queries 4 and 5; OpenStax probability sources |
| `/patterns-and-randomness/` | Streaks and Randomness: Why Past Results Do Not Predict | streak probability, gambler's fallacy, random number games | Pattern-curious learners; article plus experiment | Queries 7 and 10; independence source |
| `/historical-analysis/` | Reading Simulated History: Frequency and Sample Size | observed frequency, sampling variation, synthetic data | Readers interpreting charts; statistical walkthrough | Handoff requirement; broader simulation results, no direct demand claim |
| `/simulator/` | Probability Simulator: Explore WinGo-Style Classifications | random number simulation, ten-digit experiment | Hands-on learners; interactive lab with static explanation | Queries 8 and 9; reference model |
| `/probability-calculator/` | Probability Calculator for Numbers and Sequences | event probability, independent sequence, repeated trials | Learners checking examples; calculator with formulas | Handoff requirement; math synthesis, no separate demand claim |
| `/guides/` | Probability and WinGo Mechanics Guides | learning path, beginner explanations | Browsers; curated article index | Navigation/content architecture decision |
| `/about/` | About the WinGo Learning Lab | project purpose, methodology, limitations | Readers assessing trust; project information | Actual project scope; no invented credentials |
| `/contact/` | Contact the WinGo Learning Lab | corrections, questions | Readers with feedback; information page | Owner contact destination pending; no SEO-volume claim |
| `/privacy-policy/` | Privacy and Analytics | consent, local simulation, data use | All visitors; accurate disclosure | Actual deployed behavior to be finalized in Phase 5 |
| `/terms/` | Terms and Educational Limitations | model assumptions, no prediction service | All visitors; scope and usage information | Handoff and actual functionality |

## Focus and content boundaries

The initial site answers six editorial questions and provides two tools. Color rules stay within the rules article. Both number-probability query variants use one article. Streak demonstrations live within the randomness article, not a duplicate tool page. Historical analysis examines labeled synthetic data; it does not publish external result feeds.

Exclude acquisition pages for login, APK downloads, deposits, referral codes, guaranteed predictions, live signals, winning formulas, or operator comparisons. Mention misleading claims only when needed to correct a misconception, without optimizing a service page around those promises.

Prioritize the path **understand a classification -> explore its probability -> run an experiment -> interpret variation**. The differentiator is inspectable educational work, not unverified claims that competitors lack educational content. Some observed sites already discuss uncertainty.

## Demand validation and iteration

Before a later keyword revision, obtain an owner-authorized keyword export if available. Record country, language, date range, search network, exact query, and whether the tool reports a range or point estimate. Do not mistake paid advertiser competition for organic ranking difficulty. [Keyword Planner documentation](https://support.google.com/google-ads/answer/3022575?hl=en-en) describes estimates; it does not provide values for our terms. No account creation, billing, or campaign launch is needed for the current qualitative decisions.

After launch, use Search Console to discover actual queries/pages and countries. Compare impressions, clicks, CTR, and index coverage over the first 30 days; use GA4 separately for consented onsite engagement. Neither tool supplies a complete cross-user journey. If impressions are absent, investigate indexing and elapsed time before assuming no demand. Write additional pages only when they answer a distinct supported need. See [Google's Search Console introduction](https://developers.google.com/search/docs/monitor-debug/search-console-start).
