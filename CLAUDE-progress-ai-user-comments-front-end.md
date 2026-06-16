# Progress Log — AI-Assisted User Comments (Front End)

Execution log for `CLAUDE-plan-ai-user-comments-front-end.md`. Designed so a fresh
session can resume cold. Update the **Task status** table and **Session notes** as work proceeds.

- **Branch:** `feature-ai-user-comments` (work directly here — no worktree)
- **Execution model:** Opus orchestrates via subagent-driven-development; Sonnet subagents
  implement well-specified presentational/service tasks. Opus owns the contract layer
  (types), the controller state machine, and the MuPDF/WASM webpack wiring.
- **Backend:** Live dev service at `https://bmaccallum.plasmodb.org` (proxied by the
  genomics-site webpack dev server via `BASE_PROXY_URL`). Not yet smoke-tested. No mock needed.
- **Mockups:** `mockups/ai-user-comments/**` — the design source of truth.
- **MuPDF spike:** branch `feature-test-mupdf` (PR #1700), standalone `packages/sites/mupdf-test/`.

## Key findings / deviations from the plan

1. **`deleteUserComment` already exists** in `UserCommentsService.ts` (line ~111, already
   exported). The plan's bullet to "add" it is stale — skip it. Only the 4 AI service
   functions + `deserializeJobStatus` are new.
2. **Neither sibling plan has landed yet.** `userCommentTypes.ts` currently has NO
   `AiProvenance` and no `aiProvenance` field on `UserCommentGetResponse`/`UserComment`.
   The state-management plan (`CLAUDE-plan-ai-user-comments-state-management.md`) defines a
   _simple_ `AiProvenance { reviewLevel }`; **this front-end plan supersedes it** with
   `{ isEdited, source, originalHeadline, originalContent }`. Fold the state-mgmt plumbing
   (the `aiProvenance?` field additions + the one-line `getResponseToPostRequest` change in
   `UserCommentFormStoreModule.ts` ~line 103) into the types task, using the **superseding**
   shape. The post-publish `AiCommentEditView` branch depends on this plumbing.
3. **MuPDF dev-server resolved:** genomics-site dev server runs through
   `webpack.config.local.mjs` (via `veupathdb-react-scripts run-site-dev-server --config`),
   NOT raw react-scripts. Both `webpack.config.js` (bundles) and `webpack.config.local.mjs`
   (dev server) received the MuPDF additions. `configure()` uses `webpack-merge` (arrays
   concat, objects deep-merge); the `.mjs` re-spreads `additionalConfig.plugins` because its
   explicit `plugins:` key would otherwise drop them.
4. **MuPDF needs a TS shim (TS 4.9 vs mupdf's TS-5.7 types).** mupdf 1.27's bundled `.d.ts`
   uses generic `Uint8Array<ArrayBufferLike>` (TS 5.7) and is only exposed via the `exports`
   map (classic `moduleResolution: node` ignores it). So `types/mupdf.d.ts` hand-declares just
   the 5 methods extractPdfText uses. The spike never hit this because it has no `compile:check`
   — it only proved runtime/bundling (babel erases types, webpack reads `exports`).

## STYLING CONVENTION (decided — applies to ALL remaining view tasks 5,6,7,9,10)

**Site-level genomics-site TSX does NOT have emotion's `css` prop available** — `site-babel-config`
uses classic `@babel/preset-react` with no emotion plugin/jsxImportSource, and no site webapp file
uses emotion. The plan's "emotion mirroring UploadForm" was aspirational (UploadForm is in the
user-datasets **lib**, which has its own emotion-enabled babel config).

**Use instead, matching the neighbouring `UserCommentForm/` components:**

- Inline `style={{…}}` for small/dynamic styling (what the breadcrumb does), and/or
- A co-located `.scss` file imported into the component (like `UserCommentFormView.scss`).
- CoreUI components (`@veupathdb/coreui`) where they fit (buttons, TextBox, banners, theming via
  `useUITheme`).
  Do **not** add `@emotion/react`/`@emotion/styled` to site-level components.

## MuPDF wiring reference (from `feature-test-mupdf`)

- Dependency: `"mupdf": "^1.27.0"` (resolves to 1.27.0).
- Loader: `const mupdf = await import('mupdf');` then
  `mupdf.Document.openDocument(new Uint8Array(arrayBuffer), 'application/pdf')`,
  `doc.countPages()`, `doc.loadPage(i).toStructuredText('preserve-whitespace').asText()`.
- Webpack additions: `experiments: { asyncWebAssembly: true, topLevelAwait: true }`;
  `resolve.alias['process/browser'] = require.resolve('process/browser')`;
  `resolve.fallback: { module: false, url: false }`;
  `new webpack.NormalModuleReplacementPlugin(/^node:/, r => r.request = r.request.replace(/^node:/,''))`.

## Task status

| #   | Task                                                                                               | Executor | Status                      |
| --- | -------------------------------------------------------------------------------------------------- | -------- | --------------------------- |
| 1   | Types: `aiGenePublicationTypes.ts` + extend `AiProvenance`/`UserComment*` + store-module one-liner | Opus     | ✅ done                     |
| 2   | Service: 4 AI fns + `deserializeJobStatus` in `UserCommentsService.ts`                             | Sonnet   | ✅ done (commit a977dbaaee) |
| 3   | MuPDF dep + webpack wiring + `extractPdfText.ts`                                                   | Opus     | ✅ done (commit 33c50f97d4) |
| 4   | `AiGenePublicationBreadcrumb.tsx`                                                                  | Sonnet   | ✅ done (commit 271c1de38d) |
| 5   | `SiblingSummaryBanner.tsx`                                                                         | Sonnet   | ✅ done (commit bfe63922f9) |
| 6   | `AiGenePublicationAddView.tsx` (input + progress modes)                                            | Sonnet   | ✅ done (commit 0f6d012c95) |
| 7   | Shared review sub-component + `AiCommentReviewView.tsx` + `AiCommentEditView.tsx`                  | Sonnet   | pending                     |
| 8   | `AiGenePublicationAddController.tsx` (state machine, poll, publish, nav guard)                     | Opus     | pending                     |
| 9   | Route addition + `UserCommentFormController` `aiProvenance` branch                                 | Sonnet   | pending                     |
| 10  | Entry-point buttons on gene record page                                                            | Sonnet   | pending                     |

Each Sonnet task goes through two-stage review (spec compliance, then code quality) per
subagent-driven-development. Opus tasks are self-reviewed + compile-checked.

Verification gate (per plan §Verification):
`yarn workspace @veupathdb/genomics-site compile:check` must pass before finishing.

## Session notes

- 2026-06-16: Plan reviewed, mockups studied, MuPDF spike inspected. Setup complete; beginning Task 1.
- 2026-06-16 (session 1): Tasks 1–5 complete & committed (foundation + 2 leaf components).
  Styling convention decided (inline/SCSS/CoreUI, NOT emotion — see above). Baseline
  `compile:check` has 9 PRE-EXISTING errors in `userDatasetRoutes.tsx` + `libs/user-datasets/lib/*.d.ts`
  (stale lib build / missing `@veupathdb/web-common/lib/config` exports) — unrelated to this feature;
  all AI-comment code is type-clean. Checkpoint here for possible fresh-context restart.

- 2026-06-16 (session 2): Task 6 done (commit 0f6d012c95). **Key contract decisions (Task 8 must honour):**
  - `AiGenePublicationAddView` is fully **presentational/controlled** — exports `PublicationSource`,
    `UploadExtractionState`, `SubmittedSummary`, `AiGenePublicationAddViewProps`. The controller (Task 8)
    supplies all state + callbacks (incl. the optional `getPubmedPreview` chip and the extraction sub-state).
    The view does NO fetching.
  - **Routing of terminal statuses:** AddView's progress mode renders only `running` + the **non-publishable**
    terminals (`cancelled`/`text-unavailable`/`internal-error`) as error UIs. The **publishable** terminals
    (`success`/`mentioned-in-passing`/`gene-not-mentioned`) are routed by the controller to the review view
    (Task 7), NOT AddView — AddView just shows a brief "preparing review…" fallback for them. This follows the
    plan prose (post-pivot), even though mockup `04-add-form-error` drew gene-not-mentioned inside the stage view.
  - Breadcrumb `activeStep`: `job==null → 'publication-source'`, else `'generating-comment'` (incl. terminal-error,
    per plan "cancel/error stays on step 2"). Review step (3) lives in Task 7's component.
  - Compile baseline is now FULLY CLEAN (0 errors) — the previously-noted 9 user-datasets errors no longer appear
    (lib likely rebuilt). Treat any new compile error as caused by this feature.

### Resume instructions (cold start)

1. `git log --oneline -8` to see commits; branch `feature-ai-user-comments`.
2. Remaining tasks 6–10 (see table). Recommended order: 6 → 7 → 8 → 9 → 10.
   - Task 6 `AiGenePublicationAddView.tsx`: input mode (PubMed/Upload radio, PMID TextBox +
     optional `getPubmedPreview` chip via `PubmedIdEntry.tsx`, FileInput + privacy notice +
     extraction status from `extractPdfText.ts`, submit gating) AND progress mode (stage
     checklist `fetching-article → scanning-gene-mentions → generating-summary → persisting`
     — NB mockup frame-05 also shows a "Fetching gene synonyms" row; render known stages and
     fall through unknown stages to raw `message`; elapsed timer; Cancel; terminal error UIs).
     Mockups: `mockups/ai-user-comments/01-add-form-pubmed`, `02-add-form-pdf`, `03-add-form-progress`,
     `04-add-form-error`. Sonnet + review.
   - Task 7 `AiCommentReviewView.tsx` (pre-publish create-on-approval) + `AiCommentEditView.tsx`
     (post-publish Redux update) + a shared sub-component (provenance panel, headline/content,
     Restore, SiblingSummaryBanner). Mockup `05-ai-review-edit/mockup-frame-08-review-edit.png`. Sonnet.
   - Task 8 `AiGenePublicationAddController.tsx` — **Opus inline** (state machine: idle/submitting/
     polling/review/terminal-error/server-busy; recursive setTimeout poll @1s; publish; resume-on-mount
     via jobId; beforeunload + in-app route-leave nav guard; history.replace jobId). Renders breadcrumb
     - AddView/ReviewView by phase. Uses service fns from Task 2.
   - Task 9: add route to `userCommentRoutes.tsx` (`/user-comments/ai-gene-publication/add`,
     requiresLogin, parse stableId+jobId) + branch `UserCommentFormController.tsx` to render
     `AiCommentEditView` when `submission.aiProvenance != null`. Sonnet.
   - Task 10: gene-page User Comments header — two outlined buttons ("Add a comment" + "Add
     AI-assisted comment" w/ teal Beta pill). Mockup `00-entry-point`. Find the gene-page comments
     section component first. Sonnet.
3. Each Sonnet task: dispatch implementer (model sonnet) with full spec + tell it to Read the
   relevant mockup PNG; then Opus reviews diff (spec + quality). Tell subagents: ignore the 9
   pre-existing user-datasets compile errors; use inline/SCSS not emotion; regular imports not `import type`.
4. Finish: run full `compile:check` (expect only the 9 pre-existing errors), then
   superpowers:finishing-a-development-branch.
