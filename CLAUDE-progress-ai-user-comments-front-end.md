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
3. **MuPDF dev-server risk:** genomics-site dev server may run via react-scripts and ignore a
   custom `webpack.config.js`. Verify how `yarn nx start @veupathdb/genomics-site` builds and
   where to inject `experiments.asyncWebAssembly` + the `node:` strip plugin. Solvable.

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
| 4   | `AiGenePublicationBreadcrumb.tsx`                                                                  | Sonnet   | pending                     |
| 5   | `SiblingSummaryBanner.tsx`                                                                         | Sonnet   | pending                     |
| 6   | `AiGenePublicationAddView.tsx` (input + progress modes)                                            | Sonnet   | pending                     |
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
