# Phase 1 report: research and architecture

Date: 2026-11-03. Scope: Phase 1 only. Status: research and implementation blueprint complete; documentation checks passed. The phase commit contains this report and its supporting documents.

## Outcome

The build has a defined audience, original educational positioning, 14-page information architecture, six distinct article briefs, and specifications for the simulator, calculator, and randomness demonstration. Astro static output with TypeScript and Cloudflare Pages is the selected architecture. The site is not implemented or deployed yet.

## Deliverables

| Document | What it resolves |
| --- | --- |
| [Reference review](reference-review.md) | Course HTML review, versioned simulation review, useful concepts, and exclusions |
| [Keyword research](keyword-research.md) | All ten handoff candidates, intent/competition judgments, uncertainties, and full keyword-to-page map |
| [Search observation log](search-observations.md) | Exact queries and example returned URLs without fabricated Google positions |
| [Content plan](content-plan.md) | Learning paths, homepage structure, article briefs, editorial model, and original design direction |
| [Architecture](architecture.md) | Static stack, file structure, rendering boundaries, hosting/environment safeguards, analytics boundary, and budgets |
| [Simulation model](simulation-model.md) | Complete 0-9 ruleset, overlapping colors, probability examples, random sampling, replay, and state/input contracts |
| [Validation plan](validation-plan.md) | Unit/browser/SEO acceptance checks, phase gates, and external owner inputs |

## Decisions that affect the build

- Lead with learning and transparent experiments. Search traffic quality matters more than attracting people seeking betting signals.
- Keep the 14 proposed URLs, with color rules as a section of the rules article and both number-probability variants on one page.
- Use a fresh browser sampler. The old simulation advances through configured outcomes, so its outcome mechanism will not be reused.
- Preserve both color memberships on 0 and 5. Red, Green, and Violet are not an exclusive three-way partition.
- Explain ordered-sequence probabilities without mislabeling them as streak-anywhere probabilities.
- Keep analytics off until configuration and consent are ready. No privileged connection is needed to build the local site.
- Use simple, original diagrams and system fonts; avoid copied assets and unnecessary frontend dependencies.

## Evidence and limitations

The course homepage returned HTTP 200 through a read-only HTTPS request after the web research fetch failed. Review covered returned HTML, not a rendered visual or functional course audit. The simulation review was pinned to commit `52459b34f108a0f171277adf31012d54094a8020`.

All ten candidate terms were searched individually. Result examples inform intent and content planning; they do not prove audience size. Monthly volumes, numerical organic difficulty, and Google positions remain unknown. English/India audience positioning is a working hypothesis to revisit with post-launch evidence.

Official Astro/Cloudflare documentation was consulted for static rendering, current content-collection conventions, Pages routing/404, and preview indexing. OpenStax sources support the mathematical concepts. Primary links are recorded in the relevant documents. No search claims depend on believing a prediction site's accuracy claims.

## Validation

Documentation checks passed using a one-off Node validation against the files on disk:

- Ten Markdown files checked for broken relative file links, invalid replacement characters, and unbalanced code fences; 28 relative links resolved successfully.
- All 14 required routes mapped exactly once in the canonical page table.
- Ten individual query entries and 30 example result URLs recorded.
- All ten classification rows checked against the size/color sets; overlap arithmetic and the unbiased-sampling rejection threshold checked independently.
- Git whitespace checks passed. Tracked changes are limited to documentation and the README; the original handoff remains unchanged.

These checks validate the specification's consistency, not runtime software. Application build, unit, browser, Lighthouse, PageSpeed, live analytics, and live indexing checks are not yet applicable; those are assigned to later phases.

## Learning recap

Search intent determines what a page should help someone do; a keyword appearing in results is not proof of search volume. A model's assumptions determine its probabilities, and those assumptions do not automatically describe a real external game. Static rendering lets a search engine and reader receive useful article HTML before any interactive JavaScript runs.

## Next phase

Phase 2 will scaffold the selected Astro stack, implement the original responsive design, write the six guides, and build all 14 routes. It will add runnable local previews and an initial validation workflow. Phase 3 then makes the tools functional. Future contact details, Cloudflare access, domain authorization, analytics configuration, and Search Console access are documented release inputs, not blockers to local implementation.
