# Plan: AI-Assisted User Comments — Front End

## Context

VEuPathDB is adding a new kind of user comment: an **AI-assisted gene-publication summary**. A user supplies a gene (via URL param `stableId`) and a publication (either a PubMed ID or an uploaded PDF). A new back-end service resolves the publication text (via PMC API or the uploaded PDF), checks that the gene or its synonyms are mentioned, runs an LLM to produce a gene-function description from the publication's perspective, and creates a user comment record whose `aiProvenance` field records the source. The user is redirected to an edit/review page where they refine the comment before it becomes visible.

This plan covers the front-end pieces only: the new initiation form, the imaginary back-end contract (so we can agree on the interface), additions to `AiProvenance`, and a view-level branch in the existing `/user-comments/edit` route so AI comments render a minimal modern review form rather than the heavyweight general form.

Out of scope: modernising `/user-comments/show` (card layout + tabs), adding a provenance column to the gene-page comments table, de-duplication. Each is tracked as a follow-up below.

## Backend contract (proposal for the new WDK endpoints)

The flow is **asynchronous: submit-and-poll**. LLM work is slow (tens of seconds to minutes), broken into distinct stages (article fetch → synonym lookup → mention scan → summary → optional validation → optional persistence). Surfacing per-stage progress is the primary UX reason for going async over a single long synchronous call.

Three endpoints (exact paths TBD by back-end):

| Verb   | Path                                         | Purpose                                            |
| ------ | -------------------------------------------- | -------------------------------------------------- |
| POST   | `/user-comments/ai-gene-publication`         | Submit a new job. Returns `{ jobId }` (202).       |
| GET    | `/user-comments/ai-gene-publication/{jobId}` | Poll job status / terminal result.                 |
| DELETE | `/user-comments/ai-gene-publication/{jobId}` | Cancel an in-flight job (optional — nice-to-have). |

### Submit request (POST, `multipart/form-data`)

| Field                                | Required                | Notes                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------ | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `geneId` (stableId)                  | yes                     | From URL query param in the form.                                                                                                                                                                                                                                                                                                           |
| `source`                             | yes                     | `'pubmed'` \| `'upload'`.                                                                                                                                                                                                                                                                                                                   |
| `pubmedId`                           | if `source=pubmed`      | String digits.                                                                                                                                                                                                                                                                                                                              |
| `pdf`                                | if `source=upload`      | File. **Not persisted** on the back end — transient input only, held in memory/tempdir for the job's lifetime.                                                                                                                                                                                                                              |
| `externalUrl`                        | only if `source=upload` | User-supplied link (e.g. bioRxiv), optional.                                                                                                                                                                                                                                                                                                |
| `externalTitle`                      | only if `source=upload` | Link text for `externalUrl`, optional.                                                                                                                                                                                                                                                                                                      |
| `options.generateProductDescription` | no                      | Boolean. Back-end includes a suggested product description in the AI output if true.                                                                                                                                                                                                                                                        |
| `options.validate`                   | no                      | Boolean. Back-end runs the optional validation LLM step if true.                                                                                                                                                                                                                                                                            |
| `options.createUserComment`          | no                      | Boolean, default **false**. If true, back-end persists a `user_comment` row with the AI output as its `content`/`headline` and populates `aiProvenance`. The front-end add form sets this to `true` in this first phase. Treating DB side-effects as opt-in keeps the endpoint useful for future preview/try-it-out flows without DB churn. |

Submit response: `202 Accepted`, body `{ jobId: string }`. Validation of required/mutually-exclusive fields happens synchronously — if the submission is malformed, the server returns `400` with `{ errors: string[] }` and no job is created.

### Poll response

```ts
interface AiOutput {
  headline: string; // suggested comment headline
  content: string; // main AI-generated description
  productDescription?: string; // present iff options.generateProductDescription
  // validation notes / confidence can fold in here later
}

type JobStage =
  | 'queued'
  | 'fetching-article' // PMC fetch or uploaded PDF text extraction
  | 'fetching-gene-synonyms'
  | 'scanning-gene-mentions'
  | 'generating-summary' // the main LLM step
  | 'validating' // iff options.validate
  | 'generating-product-description' // iff options.generateProductDescription
  | 'persisting'; // iff options.createUserComment

interface JobProgress {
  stage: JobStage;
  message: string; // human-readable, e.g. "Scanning article for PF3D7_0315200…"
  startedAt: string; // ISO timestamp
  updatedAt: string;
}

type AiGenePublicationJobStatus =
  // non-terminal
  | { type: 'running'; progress: JobProgress }
  // terminal — success
  | {
      type: 'success';
      aiOutput: AiOutput; // always present; clients that didn't persist use this directly
      commentId?: number; // present iff options.createUserComment was true
      // additional created-record IDs go here as side-effects grow (product-description records TBD)
    }
  // terminal — job-level failures the user should see
  | { type: 'gene-not-mentioned'; synonymsChecked: string[] }
  | { type: 'text-unavailable'; reason: string } // licensing, 404, OCR failure, etc.
  | { type: 'validation-error'; errors: string[] }
  | { type: 'internal-error'; error: string }
  | { type: 'cancelled' };
```

A `GET` against an unknown or expired `jobId` returns `404` — the front-end treats this as "session lost" and resets the form.

### Notes

- **Job lifetime / TTL**: the back end should keep completed job records around long enough for the front-end to pick up the terminal state after a network blip (≥5 minutes suggested). Persistence of the `aiOutput` beyond that is optional; for `success` cases the `user_comment` row is already the durable record (when `createUserComment` was true).
- **In this first front-end phase**, the add form **always** sends `options.createUserComment: true`. On terminal `success`, the front-end navigates to `/user-comments/edit?commentId={commentId}`. The back end has already created the comment row with `aiProvenance.reviewLevel = 'unreviewed'` during the `persisting` stage.
- Because `aiOutput` is always returned, preview/no-side-effect flows become trivial to add later without back-end changes.
- **Polling cadence**: front-end polls every ~1 s during `running`. No exponential back-off for v1 — stages are typically seconds-long; simple fixed-interval polling gives responsive UI without pathological load. Back-end can short-circuit by returning the next stage in the same response if it advanced between polls.
- **Stages are advisory, not guaranteed.** The back end only emits the stages relevant to the chosen options (e.g. `validating` only appears if `options.validate`). The front-end must render them defensively — unknown future stages should fall through to showing the raw `message`.
- Back-end responsibilities per stage: PMC text fetch, synonym lookup from VEuPathDB, gene-mention check (terminal `gene-not-mentioned` if absent), LLM reasoning, optional validation, optional product-description generation, conditional comment-row creation (with authorship attribution from the session).
- Product-description side-effects (separate DB record creation) are not sketched here — if/when that becomes a persisted entity, it gets its own `options.create...` flag and corresponding ID field in the `success` variant.

## Type additions

### `packages/sites/genomics-site/webapp/wdkCustomization/js/client/types/userCommentTypes.ts`

Extend `AiProvenance` beyond what the state-management plan currently specifies. `externalUrl` and `externalTitle` live **inside the `upload` variant** (PubMed-sourced comments rely on the PMID alone):

```ts
export type AiReviewLevel = 'unreviewed' | 'reviewed' | 'edited';

export type AiProvenanceSource =
  | { kind: 'pubmed'; pubmedId: string }
  | { kind: 'upload'; externalUrl?: string; externalTitle?: string };

export interface AiProvenance {
  reviewLevel: AiReviewLevel;
  source: AiProvenanceSource;
}
```

This supersedes the simpler `{ reviewLevel }` shape in `CLAUDE-plan-ai-user-comments-state-management.md` §Design. Everything else in that plan (absent = human-written, `UserCommentFormFields`/`UserCommentGetResponse` extensions, the `getResponseToPostRequest` one-line addition) still applies unchanged — TypeScript will cover the extra fields via the updated interface.

## Routing

### `packages/sites/genomics-site/webapp/wdkCustomization/js/client/userCommentRoutes.tsx`

Add one new route:

```tsx
{
  path: '/user-comments/ai-gene-publication/add',
  requiresLogin: true,
  component: (props: RouteComponentProps<{}>) => {
    const { stableId = '', jobId } = parseQueryString(props);
    return <AiGenePublicationAddController stableId={stableId} jobId={jobId} />;
  },
},
```

The optional `jobId` query param lets a user refresh mid-job (or revisit via browser history) and resume polling rather than lose the in-flight run. The controller writes the jobId into the URL (via `history.replace`) the moment it gets one back from the submit call.

`/user-comments/edit` stays as-is at the route level; the view branch happens inside `UserCommentFormController`.

## Breadcrumb trail

The AI comment flow is presented as a three-step process with a horizontal breadcrumb trail immediately below the page heading. The breadcrumb is a read-only progress indicator — it orients the user and reflects the current phase but is not interactive.

> **Mockup** (all three step states):
> [breadcrumb design](mockups/ai-user-comments/00-breadcrumb-design/mockup-breadcrumb-design.png)

### Steps

| #   | Key                  | Label              | Route(s) where active                                                             |
| --- | -------------------- | ------------------ | --------------------------------------------------------------------------------- |
| 1   | `publication-source` | Publication source | `/user-comments/ai-gene-publication/add` when `phase === 'idle' \| 'submitting'`  |
| 2   | `generating-comment` | Generating comment | `/user-comments/ai-gene-publication/add` when `phase === 'polling' \| 'terminal'` |
| 3   | `review-publish`     | Review & publish   | `/user-comments/edit` when `aiProvenance` is present                              |

### Step transitions

- **Form submit** (`idle → submitting → polling`): the breadcrumb advances from step 1 to step 2. The content pane transitions from the input form to the polling/progress view. The URL gains `&jobId=…` via `history.replace`.
- **Job success** (`polling → terminal success`): the controller calls `history.push('/user-comments/edit?commentId={id}')`. The edit page renders `AiCommentEditView` with step 3 active in its own breadcrumb instance.
- **Cancel / error**: stays on the add page at step 2. The user sees the error UI with a "Try a different publication" button that resets `phase` to `idle`, returning to step 1, and a "Back to gene page" secondary link.

### Step appearance

| State     | Circle                                 | Label                       |
| --------- | -------------------------------------- | --------------------------- |
| Active    | Numbered circle in site primary colour | Bold text, full opacity     |
| Completed | Numbered circle in mid-grey (#888)     | Normal weight, full opacity |
| Future    | Numbered circle at 45% opacity         | Normal weight, 45% opacity  |

Steps are separated by mid-grey `→` arrows. The breadcrumb **never** lets the user click backwards or jump ahead — it is a progress indicator only.

### Layout structure

```tsx
<div>
  <AiGenePublicationBreadcrumb activeStep={activeStep} />
  <div>{/* content pane: input form | progress view | edit form */}</div>
</div>
```

### `AiGenePublicationBreadcrumb.tsx`

New component (same directory as the other `AiGenePublication/` files). Props:

```ts
type AiFlowStep =
  | 'publication-source'
  | 'generating-comment'
  | 'review-publish';

interface AiGenePublicationBreadcrumbProps {
  activeStep: AiFlowStep;
}
```

Renders a horizontal `<nav>` of three steps with `→` separators, using `NumberedHeader` from `@veupathdb/coreui` (or an equivalent inline circle element) for the numbered circles. No `onClick` handlers — the component is entirely display-only.

### Where each breadcrumb instance is mounted

- **Add page** (`AiGenePublicationAddView`): controller derives `activeStep` from `phase`:
  - `idle | submitting` → `'publication-source'`
  - `polling | terminal` → `'generating-comment'`
- **Edit page** (`AiCommentEditView`): `activeStep='review-publish'` hardcoded.

### Files affected by this addition

| Action | Path                                                                                          |
| ------ | --------------------------------------------------------------------------------------------- |
| create | `…/AiGenePublication/AiGenePublicationBreadcrumb.tsx`                                         |
| modify | `…/AiGenePublication/AiGenePublicationAddView.tsx` — render breadcrumb above the content pane |
| modify | `…/AiGenePublication/AiCommentEditView.tsx` — render breadcrumb above the review form         |

## New components

Create under `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/userComments/AiGenePublication/`:

1. **`AiGenePublicationAddView.tsx`** — modern form (CoreUI + emotion, mirroring `packages/libs/user-datasets/src/lib/Components/UploadForm.tsx`). Operates in two visual modes driven by controller state:

   **Input mode** (no active job):

   > **Mockups** (PubMed path):
   > [Frame 01 — initial state, PMID empty, submit disabled](mockups/ai-user-comments/01-add-form-pubmed/mockup-frame-01-pubmed-input.png) ·
   > [Frame 02 — PMID entered, metadata preview shown, submit enabled](mockups/ai-user-comments/01-add-form-pubmed/mockup-frame-02-pubmed-preview.png)
   >
   > **Mockups** (PDF upload path):
   > [Frame 03 — Upload PDF selected, no file chosen, submit disabled](mockups/ai-user-comments/02-add-form-pdf/mockup-frame-03-pdf-upload.png) ·
   > [Frame 04 — file chosen, provenance URL filled, submit enabled](mockups/ai-user-comments/02-add-form-pdf/mockup-frame-04-pdf-chosen.png)

   - Headline: "AI-assisted comment for gene `{stableId}`".
   - Radio group: **PubMed ID** vs **Upload PDF** (discriminated union state).
   - If PubMed: single `TextBox` for PMID. Optional inline PubMed metadata preview using the existing `getPubmedPreview` service (re-use `PubmedIdEntry.tsx` for the rendered chip).
   - If Upload: `<FileInput>` (WDK client) scoped to `.pdf`. **Prominent notice: "This PDF will be sent to our AI service for analysis only and will not be stored. For provenance, optionally add a public link to the publication below."** Optional `TextBox` pair for `externalUrl` and `externalTitle`.
   - "Generate product description" checkbox (maps to `options.generateProductDescription`).
   - "Validate output" checkbox (maps to `options.validate`), default **on**.
   - Submit button. Disable the form during submit.
   - `// TODO(dedup)` marker near the submit button noting where a duplicate-warning UI will plug in later.

   **Progress mode** (job in flight or terminal):

   > **Mockups**:
   > [Frame 05 — mid-job, stage checklist with spinner on current stage, Cancel button](mockups/ai-user-comments/03-add-form-progress/mockup-frame-05-progress.png) ·
   > [Frame 06 — all stages complete, success box, auto-redirect in progress](mockups/ai-user-comments/03-add-form-progress/mockup-frame-06-success-redirect.png) ·
   > [Frame 07 — terminal error: gene not mentioned, synonyms listed, recovery buttons](mockups/ai-user-comments/04-add-form-error/mockup-frame-07-gene-not-mentioned.png)

   - Form inputs hidden or shown read-only (summary of what was submitted).
   - **Stage checklist**: render all stages relevant to the submitted options in fixed order; each stage shows one of three states — _done_ (tick), _current_ (spinner + live `progress.message`), or _pending_ (greyed). Unknown future stages fall through to rendering the raw `message` string so the UI doesn't break if the back end adds stages.
   - Elapsed-time indicator.
   - **Cancel** button (fires `deleteAiGenePublicationJob`; UI shows a "cancelling…" state until the next poll returns `type: 'cancelled'`).
   - On terminal `success`, the controller navigates (`history.push`) to `/user-comments/edit?commentId={commentId}` — no manual "continue" click needed.
   - On terminal errors, show a per-case message (`gene-not-mentioned` lists synonyms checked; `text-unavailable` explains likely cause; `validation-error`/`internal-error` render their strings). Include a "Try a different publication" button (primary) that clears the jobId from the URL and returns to input mode with the previous form values preserved, and a "Back to gene page" link (secondary) for users who decide not to proceed.
   - On `not-found` from the poller (expired / unknown jobId — e.g. the user returned to a stale URL), show a friendly "That job has expired — please submit again" message and fall back to input mode.

2. **`AiGenePublicationAddController.tsx`** — minimal controller. Props: `{ stableId: string; jobId?: string }`. Holds local React state (no Redux — the flow is one-shot and short-lived):

   - Form-field state (source radio, pubmedId, pdf, externalUrl/externalTitle, option checkboxes).
   - Job state: `{ phase: 'idle' } | { phase: 'submitting' } | { phase: 'polling'; jobId: string; lastStatus: AiGenePublicationJobStatus } | { phase: 'terminal'; status: AiGenePublicationJobStatus }`.

   Behaviour:

   - **Resume on mount**: if the `jobId` prop is set, skip submit and start polling immediately.
   - **Submit**: call `postAiGenePublication`; on `{ jobId }`, `history.replace` to `?stableId=...&jobId={jobId}` (so refresh resumes) and transition to polling.
   - **Poll loop**: recursive `setTimeout`-driven (not `setInterval`, to avoid overlapping requests if a poll is slow). Interval 1000 ms. Clear the timeout on unmount and on terminal responses. Do not retry automatically on transient fetch errors — surface a small "reconnecting…" indicator and try again on the next tick. A `404` terminates the loop with `type: 'not-found'`.
   - **Terminal handling**:
     - `success` → navigate to `/user-comments/edit?commentId={commentId}`.
     - `cancelled` / error variants → stay on this page, show the message, offer "Try a different publication" and "Back to gene page".
   - **Cancel**: call `deleteAiGenePublicationJob`; the UI updates when the next poll returns `cancelled`. No need for the controller to optimistically transition — polling is the source of truth. On the cancelled terminal state, offer "Try a different publication" (resets to input mode) and "Back to gene page".

   No Redux store module is needed. The job is a UI-local concern; nothing else in the app cares about its intermediate state.

3. **`AiCommentEditView.tsx`** — the minimal review form for AI comments, rendered when `aiProvenance` is present on the loaded comment. Not a route; it's a view component mounted by `UserCommentFormController`.

   > **Mockup**: [Frame 08 — review & edit form, step 3 active, provenance panel, review-level radio, publish disabled](mockups/ai-user-comments/05-ai-review-edit/mockup-frame-08-review-edit.png)

   - Header: "Review AI-assisted comment for gene `{stableId}`".
   - **Provenance panel (read-only)**: renders source — either a `PubmedIdEntry` for `kind: 'pubmed'` or a link (`externalUrl` / `externalTitle`) plus a "(uploaded PDF, not stored)" note for `kind: 'upload'`.
   - **Review level selector**: radio group over `AiReviewLevel` — `unreviewed` / `reviewed` / `edited`. Default is whatever the server returned. If the user edits the content textarea, automatically bump to `'edited'` (but don't clobber explicit `'reviewed'` → keep last explicit user choice unless content actually changes).
   - **Headline** (`TextBox`) and **Content** (`TextArea`) — editable, bound to the same Redux state as the heavyweight form via existing `updateFormFields` dispatches. This gives us free submit/save plumbing.
   - No Categories/PubMed/DOI/GenBank/location/attachments/related-genes sections. That's the point of the minimal form.
   - **Publish comment** button: disabled (greyed out) when `reviewLevel === 'unreviewed'`; a hint reads "Set review level to 'Reviewed' or 'Edited' to publish." Unreviewed comments are never shown to other users.
   - **Keep as draft** button (secondary, always enabled): saves without publishing via `requestSubmitComment` with the current state.
   - `// TODO(delete)` — a "Delete comment" button should also be offered so users can discard a draft they don't want to keep. Deferred pending confirmation of a back-end delete endpoint for user comments.
   - Submit calls the existing `requestSubmitComment` — no changes to the submit epic needed.

## Controller changes

### `packages/sites/genomics-site/webapp/wdkCustomization/js/client/controllers/UserCommentFormController.tsx`

Single branch in `renderView` (near line 783–815):

```tsx
const isAiComment = stateProps.submission.aiProvenance != null;
// ... existing permissionDenied branch first ...
return isAiComment ? (
  <AiCommentEditView {...viewProps} />
) : (
  <UserCommentFormView {...viewProps} />
);
```

`viewProps` already contains everything `AiCommentEditView` needs (submission, dispatchProps, categoryChoices, submitting/completed/errors). No store-module changes beyond those already in `CLAUDE-plan-ai-user-comments-state-management.md`.

## Service additions

### `packages/sites/genomics-site/webapp/wdkCustomization/js/client/service/UserCommentsService.ts`

Add three functions. Submit mirrors the multipart upload pattern at lines 116–134; poll and cancel use `_fetchJson`.

```ts
function postAiGenePublication(
  request: AiGenePublicationRequest
): Promise<{ jobId: string } | { type: 'validation-error'; errors: string[] }> {
  const fd = new FormData();
  fd.append('geneId', request.geneId);
  fd.append('source', request.source);
  if (request.source === 'pubmed') fd.append('pubmedId', request.pubmedId);
  if (request.source === 'upload') {
    fd.append('pdf', request.pdf, request.pdf.name);
    if (request.externalUrl) fd.append('externalUrl', request.externalUrl);
    if (request.externalTitle)
      fd.append('externalTitle', request.externalTitle);
  }
  if (request.options?.generateProductDescription)
    fd.append('options.generateProductDescription', 'true');
  if (request.options?.validate) fd.append('options.validate', 'true');
  if (request.options?.createUserComment)
    fd.append('options.createUserComment', 'true');

  return fetch(`${base.serviceUrl}/user-comments/ai-gene-publication`, {
    method: 'POST',
    credentials: 'include',
    body: fd,
  }).then(async (response) => {
    if (response.status === 400)
      return { type: 'validation-error', errors: await response.json() };
    return response.json(); // { jobId }
  });
}

function getAiGenePublicationJobStatus(
  jobId: string
): Promise<AiGenePublicationJobStatus | { type: 'not-found' }> {
  return fetch(
    `${base.serviceUrl}/user-comments/ai-gene-publication/${jobId}`,
    { credentials: 'include' }
  ).then((r) => (r.status === 404 ? { type: 'not-found' } : r.json()));
}

function deleteAiGenePublicationJob(jobId: string): Promise<void> {
  return base._fetchJson<void>(
    'delete',
    `/user-comments/ai-gene-publication/${jobId}`
  );
}
```

Expose all three alongside the existing methods in the returned object.

## Entry points (how users reach the new form)

Minimum required: a link from the gene record page. Two small touch-ups:

1. On the existing gene-page "User Comments" section or near the "Add a comment" link, add a sibling "Add an AI-assisted comment from a publication" link pointing to `/user-comments/ai-gene-publication/add?stableId={geneId}`. Could later be refined to a single link with a popup that bifurcates to the two different routes with some more explanation of the new AI tool.
2. No changes yet to the user-comments show page's links or to the record-page comments table — those follow-ups are out of scope.

## Files to create or modify

| Action | Path                                                                                                                                       |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| modify | `packages/sites/genomics-site/webapp/wdkCustomization/js/client/types/userCommentTypes.ts` — extended `AiProvenance` (discriminated union) |
| modify | `packages/sites/genomics-site/webapp/wdkCustomization/js/client/userCommentRoutes.tsx` — new route                                         |
| modify | `packages/sites/genomics-site/webapp/wdkCustomization/js/client/service/UserCommentsService.ts` — `postAiGenePublication`                  |
| modify | `packages/sites/genomics-site/webapp/wdkCustomization/js/client/controllers/UserCommentFormController.tsx` — view branch on `aiProvenance` |
| create | `packages/sites/genomics-site/webapp/wdkCustomization/js/client/controllers/AiGenePublicationAddController.tsx`                            |
| create | `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/userComments/AiGenePublication/AiGenePublicationAddView.tsx`    |
| create | `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/userComments/AiGenePublication/AiCommentEditView.tsx`           |
| create | `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/userComments/AiGenePublication/AiGenePublicationBreadcrumb.tsx` |

Reused without modification:

- `PubmedIdEntry.tsx` — preview chip for PubMed provenance display.
- `getPubmedPreview` (service, lines 38–46) — optional inline metadata hint on the add form.
- `updateFormFields` / `requestSubmitComment` / `UserCommentFormStoreModule` submit + attachment epics.

## Follow-ups (explicitly deferred)

- **Show page modernisation** — rewrite `UserCommentShowView` with card layout + tabs (User-generated / AI-assisted) + provenance column. Non-trivial scope; unblock AI flow first.
- **Gene-page comments table provenance column** — WDK model changes plus a cell renderer.
- **De-duplication warnings** — detect "someone already submitted this gene+publication pair" and warn. Stub locations in the add form are marked with `// TODO(dedup)`.
- **Adaptive / SSE polling** — if fixed 1 s polling proves too chatty or too laggy, switch to exponential back-off or Server-Sent Events. The contract above is agnostic to transport on the front-end side.

## Verification

1. `yarn workspace @veupathdb/genomics-site compile:check` should type-check cleanly, particularly around the new discriminated `AiProvenance`.
2. Run the genomics-site dev server locally. In a browser:
   - Log in, navigate to `/user-comments/ai-gene-publication/add?stableId=PF3D7_0315200` (any gene).
   - **PubMed path**: enter a known PMID that mentions the gene → expect URL to gain a `&jobId=…` on submit; watch the stage checklist advance (`fetching-article` → `fetching-gene-synonyms` → `scanning-gene-mentions` → `generating-summary` → `validating` → `persisting`); on terminal `success`, expect redirect to `/user-comments/edit?commentId={N}` with the AI minimal view. Change the content textarea and confirm `reviewLevel` auto-bumps to `'edited'`; submit succeeds.
   - **Upload path**: upload a PDF → same polling/redirect/edit flow. Check in the resulting edit view that the provenance panel renders the `externalUrl`/`externalTitle` (if supplied) and the "not stored" note.
   - **Refresh-during-job**: mid-poll, reload the page. The URL should still carry `jobId`; polling resumes and the correct stage is shown without resubmitting.
   - **Cancel**: submit, click Cancel mid-stage, confirm UI transitions to the cancelled-terminal state and offers "Start over".
   - **Error paths**: submit a PMID that doesn't mention the gene → terminal `gene-not-mentioned` with synonyms listed. Submit a restricted PMID with no PMC text → terminal `text-unavailable`. Visit a URL whose `jobId` is expired → friendly "job expired" message and fall-back to input mode. These require back-end cooperation; until the back end exists, mock `postAiGenePublication` / `getAiGenePublicationJobStatus` in dev to exercise each branch.
3. Non-AI comments (no `aiProvenance`) continue to render the heavyweight `UserCommentFormView` on `/user-comments/edit` — regression check.
4. The existing `/user-comments/show` page keeps working untouched.
