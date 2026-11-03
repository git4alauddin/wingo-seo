# Educational simulation and probability model

Decision date: 2026-11-03. Model identifier: `uniform-digits-v1`. This is a specification for Phase 3; no tools are implemented yet.

## Assumptions and classification

The theoretical experiment draws independently with replacement from the ten equally likely digits 0 through 9. Each digit has probability 1/10. These are assumptions of this lab, not verified facts about any external service.

Classification follows the reviewed example function in [wingo-aff at the inspected commit](https://github.com/git4alauddin/wingo-aff/blob/52459b34f108a0f171277adf31012d54094a8020/js/wingo-engine.js). We will write our own implementation and exclude monetary rules. There is no universal external rulebook implied by this selection.

| Digit | Size | Color memberships |
| --- | --- | --- |
| 0 | Small | Red, Violet |
| 1 | Small | Green |
| 2 | Small | Red |
| 3 | Small | Green |
| 4 | Small | Red |
| 5 | Big | Green, Violet |
| 6 | Big | Red |
| 7 | Big | Green |
| 8 | Big | Red |
| 9 | Big | Green |

An outcome is one digit with derived size and a list of colors. Red = {0,2,4,6,8}; Green = {1,3,5,7,9}; Violet = {0,5}. Size and color are related properties of one draw; they are not independent draws.

## Probability contracts

For any event set A of distinct valid digits, P(A) = |A|/10. Treat compound choices as set union/intersection before counting, so overlapping membership cannot be counted twice.

| Question | Calculation | Correct result |
| --- | --- | --- |
| One chosen digit | 1/10 | 10% |
| Big or Small individually | 5/10 | 50% each |
| Red or Green individually | 5/10 | 50% each |
| Violet | 2/10 | 20% |
| Red AND Violet in one draw | {0}: 1/10 | 10% |
| Red OR Violet in one draw | {0,2,4,5,6,8}: 6/10 | 60%, not 70% |
| Big AND Red in one draw | {6,8}: 2/10 | 20%, not 25% |
| 7 then 7 in two draws | (1/10)^2 | 1% |
| Big, Big, Small in that order | (1/2)^3 | 12.5% |
| Three Big in the next specified three draws | (1/2)^3 | 12.5% |
| Either all Big or all Small in a specified block of three | 2(1/2)^3 | 25% |

The three marginal color percentages sum to 120%, because Violet overlaps Red/Green. Display separate membership bars with a caption explaining the denominator (draw count). Do not use a pie chart or imply an exclusive three-way partition. Number frequencies and the two size frequencies do partition the outcomes and sum to 100% before rounding.

For independent successive draws with event sets A1,...,Ak, the exact ordered-sequence probability is the product of |Ai|/10. Independence across draws does not justify multiplying category probabilities within the same draw. See [OpenStax's probability rules](https://openstax.org/books/introductory-statistics-2e/pages/3-3-two-basic-rules-of-probability).

Observed frequency is count/n for n > 0; with no draws show an empty state, not 0% evidence. Expected count is n*p, which may be fractional. A larger sample tends to reduce relative sampling variation under the model; it need not be closer on every run, and absolute count gaps can grow. If showing theoretical standard deviation of a sample proportion, use sqrt(p*(1-p)/n) for a specified binary event and explain that it is not a guarantee. This follows the [binomial model](https://openstax.org/books/introductory-statistics-2e/pages/4-3-binomial-distribution).

## Streak boundaries

The initial calculator handles a specified next block/ordered sequence only. It must say so visibly. It will not label p^k as the probability of a streak somewhere in n draws: overlapping windows make that a different problem.

The randomness demonstration reports the *observed* longest Big or Small run in a generated sample, and may highlight streaks of at least three. That observation is descriptive. It is not an exact anywhere-in-session probability or a next-round signal. No prediction-themed interface is retained.

For the independent theoretical model, conditioning on a previous streak does not change the next draw's event probability. That is the meaning of [independence](https://openstax.org/books/introductory-statistics-2e/pages/3-2-independent-and-mutually-exclusive-events), not proof that arbitrary external systems satisfy it.

## Sampling implementation decision

Default sampling will use browser `crypto.getRandomValues` through an injected unsigned-32-bit source. [MDN documents this browser API](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues). To avoid modulo bias, accept only integers x < 4,294,967,290 and return x % 10. Reject the final six possible 32-bit values. This threshold is 10 * floor(2^32/10), so every accepted digit has the same number of preimages under an ideal uniform word source. Never use rounded randomness, a shuffled deck without replacement, or the reference outcome cycle.

The software implements a model of independent draws; a browser PRNG is not a proof of mathematical independence or certified operator fairness. No certification, external RNG access, or predictive advantage is claimed. If the required API is unavailable, show an explanation and disable sampling rather than silently changing the source. Inject deterministic sources for unit tests and boundary/rejection checks; guard a broken injected source from an unbounded rejection loop.

Replay uses the recorded digits of a completed local run. Replaying is explicitly deterministic and is not a fresh random experiment. No seeded PRNG or external random service is required for the initial release. Export may include model version, mode, sample size, and digits as CSV; never export personal inputs or claim external provenance. Reload clears in-memory run history. No automatic persistent storage of outcomes is needed.

## Tool behavior

### Simulator

- Modes: user-initiated timed experiment and user-initiated batch experiment. No auto-start on arrival.
- Timed mode: 5-second teaching rounds, target of 10 rounds by default, selectable target up to 100; this timing is a lab choice, not operator timing. Pause/resume and cancel are visible. Append exactly one result per completed round.
- Pause timed progression when the document is hidden; resume only when appropriate for the existing running state. Do not fabricate a background catch-up history. Use elapsed-time logic rather than assuming interval callbacks arrive precisely.
- Batch samples: integer 1-10,000; useful presets 20, 200, and 2,000. Process in bounded chunks with cancellation so mobile interaction remains responsive. Retain at most one active run and one completed replay dataset.
- Maintain aggregate counts for the whole run; show at most 20 recent outcomes in the UI. State that window limit alongside the history. Chart/table denominators must reflect the complete run, not just the visible rows.
- Run states: idle -> running -> paused/running -> complete, with cancel/reset transitions. Reject simultaneous starts, stale callbacks, and duplicate completions. Reset clears counts and displayed history; replay is a separate action.

### Probability calculator

- Event selector: exact digit, size, or color. Digit must be an integer 0-9. All formulas use the same event sets as the simulator.
- Exact-sequence input: 1-20 ordered event selections. Show the product, decimal/percentage, and assumptions; use scientific notation for tiny probabilities rather than an unexplained 0%.
- Repeated-trial comparison can use the shared sampler, 1-10,000 draws, and the selected event. Show theoretical p, observed count/n, expected count, and the gap in percentage points.
- Reject blanks, fractions where integers are required, NaN/infinity, unsupported values, and out-of-range sizes. Never silently clamp or evaluate arbitrary text expressions.

### Randomness demonstration

Generate synthetic samples of 20 and 2,000 independently on demand. Show actual counts, longest size run, and relative frequency against 50%. Explain that separate samples are not nested and results can vary in either direction. Initial static examples must be captioned as illustrative, not current user-run results.

## Integrity and data boundaries

Every tool presents: **Local educational simulation. Outcomes are generated in your browser using the stated model. They are not live results or predictions of an external game.** Equivalent plain wording is acceptable.

No live APIs, operator iframes, result scraping, wallets, stakes, fees, returns, payout controls, live-looking period identifiers, or historical imports. Use local run numbers. Outcome arrays, seeds, free text, and exported data must not be sent to analytics. Tests will check these contracts as described in the [validation plan](validation-plan.md).
