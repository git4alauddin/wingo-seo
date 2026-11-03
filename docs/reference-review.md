# Reference review

Reviewed 2026-11-03. Read-only research; neither reference project was modified. The observations below are technical context, not a recommendation to use an external gambling service.

## Course website

Source: [course.kalam.trade](https://course.kalam.trade/).

The web research fetch could not access this host. A separate HTTPS GET succeeded with HTTP 200, allowing review of the returned HTML. This is an HTML/content review, not a rendered visual, accessibility, performance, or enrollment audit.

The homepage is an English educational course landing page with in-page navigation, number/color/size illustrations, an outline of lessons, and an educational notice. It distinguishes illustrative data from live outcomes. It also includes financial examples and describes future paid course access. Those elements are outside this site's initial tool experience.

Useful lessons for the new project:

- Connect familiar number classifications to probability explanations.
- Label example data where readers encounter it.
- Make the next learning step easy to find.

The new site will provide separate indexable topic pages, a reusable guide collection, and working local experiments. It will use its own visual identity and original diagrams. The reference's payment/access workflow, copy, artwork, and analytics configuration will not be imported. A future course-interest link is optional and disabled until its destination and wording are reviewed.

## WinGo simulation repository

Source: [git4alauddin/wingo-aff](https://github.com/git4alauddin/wingo-aff). Snapshot reviewed: `52459b34f108a0f171277adf31012d54094a8020`.

Reviewed the repository listing and these files:

- [README](https://github.com/git4alauddin/wingo-aff/blob/52459b34f108a0f171277adf31012d54094a8020/README.md): documented routes, behavior, and project boundaries.
- [wingo-engine.js](https://github.com/git4alauddin/wingo-aff/blob/52459b34f108a0f171277adf31012d54094a8020/js/wingo-engine.js): classification, round advancement, and settlement implementation.
- [studio-config.js](https://github.com/git4alauddin/wingo-aff/blob/52459b34f108a0f171277adf31012d54094a8020/js/studio-config.js): configured outcomes and sample history.

The classification function supports Small 0-4 and Big 5-9. It assigns Red plus Violet to 0, Green plus Violet to 5, and parity-based Red/Green to the other digits. This supplies a concrete, versioned example ruleset for our educational model. It does not establish universal rules for unrelated services.

Crucially, the engine advances through configured outcomes and permits overrides. Its initial history is predefined. It is not a suitable source of independent random samples. We will implement a fresh uniform sampler and never use the reference's outcome cycle as evidence of randomness.

The reference also contains wallets, settlement, access gates, predictions, and affiliate flows. None belongs in this site. No source code or visual assets were copied into this repository during Phase 1.

## Resulting decisions

| Reference observation | New project decision |
| --- | --- |
| Classification can attach two colors to a digit | Represent colors as a set/list, not one exclusive enum value |
| Configured outcomes can produce convincing animations | Generate outcomes independently of the display, and disclose the model |
| Landing-page navigation serves a course introduction | Build separate pages for distinct learning questions |
| Reference branding and flows serve different purposes | Create original educational UI without wallets, gates, or operator calls to action |

No runtime tests, transactions, account interactions, or external prediction checks were performed against either reference.
