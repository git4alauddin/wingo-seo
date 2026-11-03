# Phase 3 report: interactive educational tools

Date: 2026-11-03. Status: implemented and locally validated. No production deployment or analytics was enabled.

## Delivered behavior

The simulator now generates local outcomes using the documented `uniform-digits-v1` model. It offers batches of 1–10,000 digits and timed experiments of 1–100 five-second rounds. Timed runs pause/resume, pause on hidden documents, and avoid background catch-up results. Cancellation and reset invalidate pending work so an earlier callback cannot overwrite a later run.

Statistics use the entire current run: digit counts/percentages, size/color memberships, and longest observed size run. Recent history is limited to twenty labeled local outcomes. The latest result preserves both color memberships for 0 and 5. Overlapping color percentages are not shown as pie slices.

Recorded replay restores the last completed dataset without calling the random source again. CSV export includes model ID, mode, sample size, draw number, digit, size, and color memberships. A cancelled partial run does not replace the last complete dataset. Reset clears both; reload clears in-memory run history. No automatic persistence or external history import was added.

The calculator supports exact digits, size/color events, Red OR Violet, and Big AND Red. It counts unique qualifying digits for one-draw questions. Its comma-separated sequence input accepts 1–20 ordered events, computes the independent product, and uses scientific notation for tiny positive probabilities. The displayed block probability is explicitly distinguished from a streak occurring anywhere in a longer history.

The trial-comparison tool reports theoretical probability, observed count/denominator, observed probability, expected count, and gap in percentage points. The result retains the event used when the sample started, rather than relabeling old results if the selection changes.

The randomness guide now generates separate samples of 20 and 2,000 digits. It shows actual size frequencies, relative gaps, and longest size runs. Constructed initial examples are visibly separate from generated samples. Cancellation does not publish incomplete results, and neither history changes the theoretical next-draw probability.

## Implementation decisions

- `src/lib/model.ts` is the single classification source used by server-rendered reference tables and browser logic.
- `probability.ts`, `simulation.ts`, and `statistics.ts` contain shared testable logic. Page-specific controllers handle form errors, rendering, timers, and cancellation.
- The default source buffers 128 unsigned 32-bit words from the browser random-value API. Rejection mapping discards values at or above 4,294,967,290; the remaining values map evenly to ten digits under an ideal uniform word source. A bounded retry guard detects a broken injected source.
- Batch work yields between chunks of at most 200 samples. Run identity checks and abort signals prevent stale updates. Timers use elapsed monotonic time, rather than assuming callbacks arrive precisely on schedule.
- Sampling is disabled with an explanation if browser randomness is unavailable. Event and sequence calculations still work. No silent fallback to another generator exists.
- The randomness article has a dedicated route that shares the article layout. This confines interactive JavaScript to the three pages that actually need it; ordinary articles remain script-free.
- Visible status messages announce important transitions/results rather than every timer tick. Controls use labels, associated errors, native buttons, and no-JavaScript explanations.
- About, privacy, terms, navigation, guide links, and homepage descriptions were updated to match the implemented behavior. The homepage retains an explicitly static illustration rather than starting a second simulator.

Primary technical references: [MDN random-value API](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues), [Playwright clock](https://playwright.dev/docs/clock), and [Vitest](https://vitest.dev/guide/). Mathematical assumptions and rules remain documented in the [model specification](simulation-model.md) and the educational articles.

## Validation results

Final local `npm run validate` passed on Windows with Node 24.19.0, npm 11.17.0, installed Chrome through Playwright 1.64.1, and Vitest 5.1.0:

| Check | Evidence |
| --- | --- |
| Type/content checks | 51 files; zero errors, warnings, or hints |
| Unit tests | 73 passed across model/probability/statistics and simulation/state tests |
| Static build | All 14 public pages plus custom 404 |
| Built-site validation | 440 internal links/anchors; unique metadata; existing assets; staged indexing safeguards |
| Browser suite | 42 passed across desktop 1440px, tablet 768px, and mobile 390px viewports |
| Functional coverage | Complete 10,000-draw batch; full-run denominators vs twenty-row history; invalid input; timed pause/resume/hidden state; cancellation/reset; replay; exact CSV contents |
| Probability coverage | All supported categories; overlap; exact sequences; tiny values; selected-event comparison; unavailable random API with functioning math |
| Randomness coverage | Actual 20/2,000 sample counts and longest runs; cancellation and clean restart; explicit next-draw limitations |
| Accessibility | No detected A/AA axe violations on five core layouts at all three viewports, plus populated simulator and randomness states |
| Privacy/network | Interactive sampling made no unexpected external requests; no console/page errors, cookies, localStorage, or sessionStorage data observed in the dedicated privacy flows |
| Graceful degradation | Static explanations and reference tables remain readable without JavaScript; unavailable random API disables sampling with an explanation |

Unit tests use controlled source words rather than flaky assertions about a random sample being close to its expectation. Browser fixtures use a clearly test-only deterministic source to make counts and CSV contents verifiable. The shipped application uses the native browser source. Hidden-state transitions and timers are tested with simulated browser APIs/virtual time; these do not certify behavior on every physical device or prove external fairness.

Measured compressed route JavaScript, including discovered shared chunks: simulator 4,840 bytes, calculator 4,065 bytes, randomness guide 3,858 bytes. Other routes ship zero client JavaScript. Tool-page CSS totals 8,404 bytes gzip including inline styles; ordinary-page CSS remains 7,113 bytes gzip. Built-output checks enforce the planned route budgets. These are build measurements, not field Core Web Vitals.

Screenshots of initial and populated tools are saved in the ignored local `artifacts/screenshots/phase-3/` directory. Browser tests continue to check every route, refresh behavior, viewport overflow, keyboard skip/navigation behavior, no-JavaScript content, and real local 404 responses.

## Learning recap

A theoretical probability belongs to a specified model. An observed frequency belongs to a sample. Replaying a recorded dataset helps inspect the same evidence, while generating a fresh sample asks a new experimental question. Shared logic and deterministic tests make those distinctions easier to keep correct across the interface.

## Remaining work

Phase 4 completes technical SEO: sitemap, robots, structured data, canonical/indexing validation, and production/preview separation. Every current build intentionally remains `noindex`. Phase 5 adds configurable analytics and consent; Phase 6 handles authorized hosting and broader release QA. Public contact details and production domain authorization remain pending owner inputs before launch. No external game integration, account, DNS, paid service, or production publishing was performed in Phase 3.
