# Plan: AI-Assisted User Comments — Front End

## Context

VEuPathDB is adding a new kind of user comment: an **AI-assisted gene-publication summary**. A user supplies a gene (via URL param `stableId`) and a publication (either a PubMed ID or an uploaded PDF). A new back-end service resolves the publication text, checks that the gene or its synonyms are mentioned, runs an LLM to produce a gene-function description from the publication's perspective, and creates a user comment record whose `aiProvenance` field records the source. The user is redirected to an edit/review page where they refine the comment before it becomes visible.

**Upload-path PDFs never leave the user's machine.** Text extraction happens client-side using **MuPDF.js** (WASM, lazy-loaded only when the user picks the upload tab); the front-end also computes a SHA-256 of the PDF bytes via Web Crypto. The POST body for an upload submission carries `paper_text` plus `pdf_content_sha256` — the back end never sees the PDF. This was a deliberate pivot from server-side extraction; see the BE plan (`CLAUDE-ai-user-comments.md`) for rationale.

The back end identifies jobs by a deterministic **content-digest `job_id`** (hex SHA-256 over gene + resolved synonyms + source-key + model + prompt version + canonical-JSON options). This means double-tap submits, cross-user resubmissions, and "I refreshed the tab" all naturally dedupe to the same in-flight job or the same cached result.

This plan covers the front-end pieces only: the new initiation form (including the client-side PDF extraction pipeline), the back-end contract (now confirmed against the BE plan), additions to `AiProvenance`, a sibling-summary banner for cache-hit cases, and a view-level branch in the existing `/user-comments/edit` route so AI comments render a minimal modern review form rather than the heavyweight general form.

Out of scope: modernising `/user-comments/show` (card layout + tabs), adding a provenance column to the gene-page comments table, de-duplication. Each is tracked as a follow-up below.

## Backend contract (locked against the BE plan)

The flow is **asynchronous: submit-and-poll**, with one important wrinkle — the POST itself can return a _terminal_ state directly when the job's `job_id` already has a cached result or another submitter is mid-flight. Wire-format keys are **snake_case** to match the existing comments-service JSON convention (the FE's existing snake_case ↔ camelCase boundary still applies internally).

Three endpoints:

| Verb   | Path                                          | Purpose                                                                                           |
| ------ | --------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| POST   | `/user-comments/ai-gene-publication`          | Submit a job. Returns either `running` (fresh/attached) or a terminal state directly (cache hit). |
| GET    | `/user-comments/ai-gene-publication/{job_id}` | Poll job status / terminal result. `job_id` is a hex SHA-256.                                     |
| DELETE | `/user-comments/ai-gene-publication/{job_id}` | Cancel an in-flight job. Cancels for **all** attached followers in v1.                            |

### `job_id` is a content digest, not a UUID

The back end derives `job_id = sha256(gene_id ‖ sorted-resolved-synonyms ‖ source-key ‖ model ‖ prompt_version ‖ canonical-JSON options)` in a synchronous prelude (target <2s) before any async work starts. `source-key` is the PubMed id (PubMed path) or the FE-supplied `pdf_content_sha256` (upload path). This means:

- A second user submitting the same gene + publication **gets the same `job_id`** and either attaches to the in-flight run or hits the persistent cache.
- The FE may safely include `job_id` in the URL (`history.replace`) for resume-on-refresh — there's no security concern with leaking it, and a stale `job_id` returns a friendly cache-hit response.
- Identical resubmits don't create duplicate AI work.

### Submit request (POST, `application/json`)

PDF uploads are handled client-side: by the time we POST, the FE has already extracted `paper_text` via MuPDF.js and computed `pdf_content_sha256` over the original bytes. The server never sees the PDF.

```json
{
  "gene_id": "string",
  "document_type": "pubmed | upload",
  "pubmed_id": "string (iff document_type=pubmed)",
  "paper_text": "string (iff document_type=upload) — extracted by MuPDF.js",
  "pdf_content_sha256": "string (iff document_type=upload) — hex SHA-256 of the PDF bytes",
  "external_url": "string (optional, upload provenance)",
  "external_title": "string (optional, upload provenance)",
  "options": {
    "validate": true,
    "generate_product_description": false,
    "create_user_comment": true
  }
}
```

Typical `paper_text` is 30–200 KB — well under standard servlet POST limits. No `user_id` field; WDK identifies the caller from the session.

In this first front-end phase the add form **always** sends `options.create_user_comment: true`. `options.generate_product_description` is wired up but deferred (the back end ignores it in v1 — see "Follow-ups" below).

Validation of required / mutually-exclusive fields happens synchronously — malformed requests return `400` with `{ errors: string[] }` and no job is created.

### Submit response — same union as the GET status response

POST may resolve to _any_ state from the union below, not just `running`. The three live paths:

- **Fresh miss** → `running { job_id, stage: "queued" }` (or further along; the prelude is allowed to short-circuit if it can).
- **In-flight attach** → `running { job_id, stage: "<current-stage>" }` for an existing job whose `job_id` matches. The caller becomes a "follower" and gets their own `comment_id` when the persist stage runs.
- **Cache hit** (`comment_ai_run` row already exists) → terminal state directly, with the submitter's `comment_id` already created in-line and `sibling_summary` populated.

Plus one infrastructural failure:

- **Pool exhausted** → `503 Service Unavailable` with a `Retry-After` header. The FE surfaces a friendly toast ("Server is busy — please try again in a moment") with a retry button. **No client-side queueing or auto-retry** — surface the failure plainly.

### Status union

```ts
interface AiOutput {
  headline: string; // suggested comment headline
  content: string; // main AI-generated description, plain text valid as markdown
  // future: validation notes / confidence
}

// Counts over comment_ai_provenance rows pointing at the same run_job_id.
// Anonymous aggregate — no other user identities revealed.
interface SiblingSummary {
  unreviewed: number;
  reviewed: number;
  edited: number;
  latest_reviewed_at: string | null; // ISO-8601
}

type JobStage =
  | 'queued'
  | 'fetching-article' // PMC fetch on the PubMed path; symbolic no-op for upload (text already in body)
  | 'scanning-gene-mentions' // deterministic regex scan
  | 'generating-summary' // first LLM call
  | 'validating' // iff options.validate
  | 'persisting'; // iff options.create_user_comment

interface JobProgress {
  stage: JobStage;
  message: string; // human-readable, e.g. "Scanning article for PF3D7_0315200…"
  updated_at: string; // ISO timestamp
}

type AiGenePublicationJobStatus =
  // non-terminal
  | { type: 'running'; job_id: string; progress: JobProgress }
  // terminal — success (LLM produced a real summary)
  | {
      type: 'success';
      job_id: string;
      ai_output: AiOutput;
      comment_id: number; // always present in v1 (create_user_comment is always true)
      sibling_summary: SiblingSummary;
    }
  // terminal — LLM ran but flagged the gene as only mentioned in passing
  | {
      type: 'mentioned-in-passing';
      job_id: string;
      synonyms_checked: string[];
      comment_id: number; // submitter's comment is still created (no AI body content)
      sibling_summary: SiblingSummary;
    }
  // terminal — regex scan found zero mentions, never reached the LLM
  | {
      type: 'gene-not-mentioned';
      job_id: string;
      synonyms_checked: string[];
      comment_id: number;
      sibling_summary: SiblingSummary;
    }
  // terminal — fetch failed (not cached; retry is free)
  | { type: 'text-unavailable'; reason: string }
  // terminal — validation pass found unrecoverable issues
  | { type: 'validation-error'; errors: string[] }
  | { type: 'internal-error'; error: string }
  | { type: 'cancelled' };
```

`gene-not-mentioned` vs `mentioned-in-passing`:

- **`gene-not-mentioned`** comes from the deterministic regex scan in stage `scanning-gene-mentions`. The LLM never ran.
- **`mentioned-in-passing`** comes from the first LLM pass returning `only_in_passing: true`. The gene was lexically present but the paper isn't really about it.

Both are cache-able outcomes (persisted to `comment_ai_run`) and both still create a comment row for the submitter so they can edit/expand it manually if they choose.

A `GET` against an unknown / expired / never-existed `jobId` returns `404`. The FE poll treats this as `{ type: 'not-found' }` — see "Resume / lifetime" below for when this can happen.

### Resume / lifetime

- The back-end **in-memory registry** holds running jobs and keeps terminal jobs around for **10 minutes** after they finish. This is what `GET` polls hit while the job is live.
- The **`comment_ai_run` cache table** is permanent. After the 10-minute window, a fresh `POST` with the same `(gene, source, options)` digest still cache-hits via the DB and returns a terminal state directly — the user just resubmits and gets an instant result.
- Server restart drops the in-memory registry. An in-flight job becomes `404` on the next poll; for completed jobs the user has already navigated to the edit page (the `comment_id` row is durable). FE handles `not-found` from the poller with a "That job has expired — please submit again" message that re-uses the previous form values.

### Notes

- **Polling cadence**: ~1 s during `running`. No exponential back-off in v1 — stages are seconds-long. Recursive `setTimeout` to avoid overlapping requests.
- **Stages are advisory, not guaranteed.** The back end only emits stages relevant to the chosen options (e.g. `validating` only appears if `options.validate`). The FE renders defensively — an unknown future stage should fall through to showing the raw `message`.
- **Reviewer level** (`reviewed` vs `edited`) is derived by the BE at publish time by comparing the user's submitted headline+content against `comment_ai_run.ai_headline` / `ai_content`. The FE doesn't pick this.
- **Cache-hit comment is the submitter's own.** The BE inserts a `comments` row and a `comment_ai_provenance` row for the submitter inside the cache-hit POST handler — there's nothing FE-side to do beyond navigating to `/user-comments/edit?commentId={comment_id}`. The `sibling_summary` rendered on that edit page tells the user how many others have already passed through.
- **Per-follower DELETE not supported in v1.** A DELETE from any follower cancels the underlying job for _all_ attached followers. In practice this is fine — followers attaching to in-flight jobs is rare; the user-visible "Cancel" button still does what the user expects (it kills _their_ job).

## Type additions

### `packages/sites/genomics-site/webapp/wdkCustomization/js/client/types/userCommentTypes.ts`

Extend `AiProvenance` beyond what the state-management plan currently specifies. `externalUrl` and `externalTitle` live **inside the `upload` variant** (PubMed-sourced comments rely on the PMID alone). Internal TS uses camelCase — the existing user-comments service code does the snake_case↔camelCase boundary mapping, so this interface follows the existing FE convention.

```ts
export type AiReviewLevel = 'unreviewed' | 'reviewed' | 'edited';

export type AiProvenanceSource =
  | { kind: 'pubmed'; pubmedId: string }
  | { kind: 'upload'; externalUrl?: string; externalTitle?: string };

export interface AiProvenance {
  reviewLevel: AiReviewLevel;
  source: AiProvenanceSource;
  originalHeadline: string; // AI-generated headline at creation time; used by the Restore button
  originalContent: string; // AI-generated content at creation time; used by the Restore button
}
```

This supersedes the simpler `{ reviewLevel }` shape in `CLAUDE-plan-ai-user-comments-state-management.md` §Design. Everything else in that plan (absent = human-written, `UserCommentFormFields`/`UserCommentGetResponse` extensions, the `getResponseToPostRequest` one-line addition) still applies unchanged — TypeScript will cover the extra fields via the updated interface.

### New types for the AI gene-publication flow

Add to the same file (or a sibling `aiGenePublicationTypes.ts` if it cleans up imports — judgement call at implementation time). These are the FE-internal camelCase mirrors of the wire shapes documented in the Backend contract section. The service-layer code (`UserCommentsService.ts`) does the snake_case↔camelCase mapping at the boundary.

```ts
export interface AiOutput {
  headline: string;
  content: string;
}

export interface SiblingSummary {
  unreviewed: number;
  reviewed: number;
  edited: number;
  latestReviewedAt: string | null;
}

export type AiGenePublicationJobStage =
  | 'queued'
  | 'fetching-article'
  | 'scanning-gene-mentions'
  | 'generating-summary'
  | 'validating'
  | 'persisting';

export interface JobProgress {
  stage: AiGenePublicationJobStage;
  message: string;
  updatedAt: string;
}

export type AiGenePublicationJobStatus =
  | { type: 'running'; jobId: string; progress: JobProgress }
  | {
      type: 'success';
      jobId: string;
      aiOutput: AiOutput;
      commentId: number;
      siblingSummary: SiblingSummary;
    }
  | {
      type: 'mentioned-in-passing';
      jobId: string;
      synonymsChecked: string[];
      commentId: number;
      siblingSummary: SiblingSummary;
    }
  | {
      type: 'gene-not-mentioned';
      jobId: string;
      synonymsChecked: string[];
      commentId: number;
      siblingSummary: SiblingSummary;
    }
  | { type: 'text-unavailable'; reason: string }
  | { type: 'validation-error'; errors: string[] }
  | { type: 'internal-error'; error: string }
  | { type: 'cancelled' };

// Returned by the service wrapper for the 503-busy case so callers can render the toast.
export type AiGenePublicationSubmitOutcome =
  | AiGenePublicationJobStatus
  | { type: 'server-busy'; retryAfterSeconds?: number }
  | { type: 'validation-error'; errors: string[] };
```

`{ type: 'not-found' }` is returned from the poll wrapper (not from the BE) when the GET returns 404. Modelling it as a status variant keeps the poller's switch statement exhaustive.

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

- **Form submit, fresh job** (`idle → submitting → polling`): the breadcrumb advances from step 1 to step 2. The content pane transitions from the input form to the polling/progress view. The URL gains `&jobId=…` via `history.replace`.
- **Form submit, cache hit** (`idle → submitting → terminal success`): POST returns a terminal `success` / `mentioned-in-passing` / `gene-not-mentioned` directly with a `commentId` and `siblingSummary`. The controller skips the polling view and immediately `history.push`es to `/user-comments/edit?commentId={id}`. From the user's perspective the breadcrumb goes step 1 → step 3 with no visible step 2. The sibling-summary banner on the edit page is what tells them they hit a cached result.
- **Form submit, in-flight attach** (`idle → submitting → polling`): identical to fresh-job from the FE's perspective — POST returns `running { jobId }`; the controller starts polling.
- **Form submit, pool busy** (`idle → submitting → idle`): POST returns 503. The controller surfaces a "Server busy" toast (with optional `Retry-After` countdown) and returns to step 1 with form values preserved. The breadcrumb stays on step 1.
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
   - If Upload: `<FileInput>` (WDK client) scoped to `.pdf`. **Prominent privacy notice: "Your PDF is processed entirely in your browser — only the extracted text is sent to our servers, never the file itself. For provenance, optionally add a public link to the publication below."** Optional `TextBox` pair for `externalUrl` and `externalTitle`. See "Client-side PDF extraction" below for the full sub-flow this triggers on file selection.
   - "Validate output" checkbox (maps to `options.validate`), default **on**. (No product-description checkbox in v1 — see Follow-ups.)
   - Submit button. Disable the form during submit. For the upload path, also disable until the client-side extraction has produced both `paperText` and `pdfContentSha256` (or shown an error).
   - `// TODO(dedup)` marker near the submit button noting where a duplicate-warning UI will plug in later.

   **Progress mode** (job in flight or terminal):

   > **Mockups**:
   > [Frame 05 — mid-job, stage checklist with spinner on current stage, Cancel button](mockups/ai-user-comments/03-add-form-progress/mockup-frame-05-progress.png) ·
   > [Frame 06 — all stages complete, success box, auto-redirect in progress](mockups/ai-user-comments/03-add-form-progress/mockup-frame-06-success-redirect.png) ·
   > [Frame 07 — terminal error: gene not mentioned, synonyms listed, recovery buttons](mockups/ai-user-comments/04-add-form-error/mockup-frame-07-gene-not-mentioned.png)

   - Form inputs hidden or shown read-only (summary of what was submitted).
   - **Stage checklist**: render all stages relevant to the submitted options in fixed order — `fetching-article` → `scanning-gene-mentions` → `generating-summary` → `validating` (iff `options.validate`) → `persisting`. Each stage shows _done_ (tick), _current_ (spinner + live `progress.message`), or _pending_ (greyed). Unknown future stages fall through to rendering the raw `message` string so the UI doesn't break if the back end adds stages.
   - For the upload path, BE still emits a `fetching-article` event for symmetry but resolves it immediately (the text was in the POST body). The FE doesn't need to special-case this.
   - Elapsed-time indicator.
   - **Cancel** button (fires `deleteAiGenePublicationJob`; UI shows a "cancelling…" state until the next poll returns `type: 'cancelled'`). The cancel cancels for _all_ attached followers in v1 — fine in practice (see BE contract notes).
   - On terminal `success`, the controller navigates (`history.push`) to `/user-comments/edit?commentId={commentId}` — no manual "continue" click needed.
   - On terminal `mentioned-in-passing`, show an inline notice ("The AI determined this paper only mentions the gene in passing — no summary was generated. A draft comment has been created so you can write your own observations if you wish.") with two buttons: **Open draft** (navigates to `/user-comments/edit?commentId={commentId}`) and **Try a different publication** (returns to input mode).
   - On terminal `gene-not-mentioned`, render the existing gene-not-mentioned UI (lists `synonymsChecked`) but also surface the **Open draft** button alongside the existing recovery buttons, since a draft comment now exists.
   - On other terminal errors, show a per-case message (`text-unavailable` explains likely cause; `validation-error`/`internal-error` render their strings). Include a "Try a different publication" button (primary) that clears the jobId from the URL and returns to input mode with the previous form values preserved, and a "Back to gene page" link (secondary).
   - On `not-found` from the poller (expired / unknown jobId — e.g. the user returned to a stale URL after server restart), show a friendly "That job has expired — please submit again" message and fall back to input mode. The user can resubmit; if the original job completed before restart, the resubmission will hit the `comment_ai_run` cache and resolve instantly.
   - On `server-busy` (503) from the submit call, surface a toast — see "Pool exhaustion" below.

   ### Client-side PDF extraction (upload path only)

   When the user selects a file in the upload tab:

   1. **Lazy-load MuPDF.js.** Dynamic-`import` the module so the WASM bundle is only downloaded when the user actually picks the upload tab — not on every visit to the add page. Show a "Preparing PDF reader…" indicator while the import resolves. See <https://mupdf.readthedocs.io/en/1.27.2/guide/using-with-javascript.html>.
   2. **Compute SHA-256.** Read the file as an `ArrayBuffer` and pass it through `crypto.subtle.digest('SHA-256', bytes)`. Hex-encode the result and stash it as `pdfContentSha256` in local state.
   3. **Extract text.** Hand the `ArrayBuffer` to MuPDF, iterate pages, concatenate their text into a single string `paperText`. Show a small "Extracting text…" indicator with a page counter if the PDF is large.
   4. **Error UI** — this is the case that previously would have surfaced as a server-side `text-unavailable` and now lives entirely on the client. If MuPDF throws (corrupt PDF, password-protected, scanned image with no text layer, etc.) show an inline error block in the file-input area: "We couldn't extract any text from that PDF. It may be scanned (image-only) or password-protected. Try a different file, or use a PubMed ID instead." Provide a "Clear" button and keep the form on the upload tab with the file deselected.
   5. Once `paperText` and `pdfContentSha256` are both present, enable the Submit button. Display the page count and a character count as a small reassurance ("Extracted 87,432 characters across 12 pages").

   The text-extraction quality matches the Python pipeline (MuPDF.js and PyMuPDF share the same engine), so prompts tuned against the Python output should transfer cleanly.

   ### Pool exhaustion (503)

   When the submit call returns 503, render a non-blocking toast (CoreUI `Notification` or equivalent): "The AI service is busy. Please try again in a moment." If the response carries a `Retry-After` header, the controller exposes it as `retryAfterSeconds` and the toast can show a countdown. The form stays on step 1 with values intact. **No automatic retry** — the user re-clicks Submit when they're ready.

2. **`AiGenePublicationAddController.tsx`** — minimal controller. Props: `{ stableId: string; jobId?: string }`. Holds local React state (no Redux — the flow is one-shot and short-lived):

   - Form-field state (source radio, pubmedId, the selected `File` plus derived `paperText` + `pdfContentSha256`, externalUrl/externalTitle, option checkboxes, and an extraction-status sub-state for the upload path).
   - Job state: `{ phase: 'idle' } | { phase: 'submitting' } | { phase: 'polling'; jobId: string; lastStatus: AiGenePublicationJobStatus } | { phase: 'terminal'; status: AiGenePublicationJobStatus } | { phase: 'server-busy'; retryAfterSeconds?: number }`.

   Behaviour:

   - **Resume on mount**: if the `jobId` prop is set, skip submit and start polling immediately. (The `jobId` is now a hex digest, but it's still just an opaque string to the FE — no structural change.)
   - **PDF file selection** (upload path): kicks off the lazy MuPDF load + SHA-256 + text extraction described above. The controller owns the extraction-state machine; Submit stays disabled until extraction completes successfully.
   - **Submit**: build the JSON body with snake_case keys (`gene_id`, `document_type`, `pubmed_id` | `paper_text` + `pdf_content_sha256`, `external_url`, `external_title`, `options`). Call `postAiGenePublication`. The result is one of:
     - `running { jobId }` → `history.replace` to `?stableId=...&jobId={jobId}` and start the poll loop.
     - terminal `success` / `mentioned-in-passing` / `gene-not-mentioned` (cache hit, comment already created) → navigate immediately to `/user-comments/edit?commentId={commentId}`. No `jobId` needs to land in the URL because the user is leaving the page.
     - terminal `text-unavailable` (rare — PubMed path only) / `validation-error` → transition to `terminal` phase and render the error UI in place.
     - `server-busy` (503) → transition to `server-busy` phase to drive the toast; auto-revert to `idle` after the user dismisses or after the `retryAfterSeconds` countdown.
   - **Poll loop**: recursive `setTimeout`-driven (not `setInterval`, to avoid overlapping requests if a poll is slow). Interval 1000 ms. Clear the timeout on unmount and on terminal responses. Do not retry automatically on transient fetch errors — surface a small "reconnecting…" indicator and try again on the next tick. A `404` terminates the loop with `type: 'not-found'`.
   - **Terminal handling**:
     - `success` → navigate to `/user-comments/edit?commentId={commentId}`.
     - `mentioned-in-passing` / `gene-not-mentioned` → stay on this page, show the per-case message. Offer **Open draft** (navigates to `/user-comments/edit?commentId={commentId}`) plus **Try a different publication**.
     - `cancelled` / `text-unavailable` / `validation-error` / `internal-error` → stay on this page, show the message, offer "Try a different publication" and "Back to gene page".
   - **Cancel**: call `deleteAiGenePublicationJob`; the UI updates when the next poll returns `cancelled`. No need for the controller to optimistically transition — polling is the source of truth. On the cancelled terminal state, offer "Try a different publication" (resets to input mode) and "Back to gene page".

   No Redux store module is needed. The job is a UI-local concern; nothing else in the app cares about its intermediate state.

3. **`AiCommentEditView.tsx`** — the minimal review form for AI comments, rendered when `aiProvenance` is present on the loaded comment. Not a route; it's a view component mounted by `UserCommentFormController`.

   > **Mockup**: [Frame 08 — review & edit form, step 3 active, provenance panel, editable content, restore button, confirmation checkbox, publish disabled](mockups/ai-user-comments/05-ai-review-edit/mockup-frame-08-review-edit.png)

   Vertical layout from top to bottom:

   - Header: "Review AI-assisted comment for gene `{stableId}`".
   - **Sibling-summary banner** (conditional — see `SiblingSummaryBanner` below): rendered above the provenance panel when the just-arrived terminal status carried a non-zero `siblingSummary`. Tells the user "this combination has already been processed by N others" without revealing identities. Dismissable; not re-shown on subsequent visits.
   - **Provenance panel (read-only)**: renders source — either a `PubmedIdEntry` for `kind: 'pubmed'` or a link (`externalUrl` / `externalTitle`) plus a "(uploaded PDF, processed in your browser — file not stored)" note for `kind: 'upload'`.
   - **Headline** (`TextBox`) and **Content** (`TextArea`) — editable, bound to Redux via `updateFormFields`. No Categories/PubMed/DOI/GenBank/location/attachments/related-genes sections.
     - If the just-arrived terminal was `mentioned-in-passing` or `gene-not-mentioned`, the AI content fields will be empty (no LLM summary was produced); render a small explanatory note above the editor: "The AI didn't generate content for this combination — see the banner above. You can still publish a comment by writing your own."
   - **Encouragement copy** (small italic text below the content area): e.g. "Please review the AI-generated content above and edit as needed before publishing."
   - **Restore original** button (outlined secondary, below the verbiage): resets Headline and Content to the AI-generated originals stored in `aiProvenance.originalHeadline` / `aiProvenance.originalContent`. Only enabled when the current field values differ from those originals.
   - **Confirmation checkbox** (required): "I have reviewed this content and it is appropriate for public release." Must be checked before the publish button is enabled.
   - **Publish comment** button (primary): disabled (greyed out) until the checkbox is checked. On submit, calls `requestSubmitComment`. The back end derives `reviewLevel` automatically — `'reviewed'` if the submitted headline + content match the originals, `'edited'` otherwise. No `reviewLevel` radio is shown to the user.
   - **Delete comment** button (danger/destructive style, right-aligned or below publish): opens a WDK `Dialog` "Are you sure?" confirmation before calling `deleteUserComment` on the service (same confirmation pattern as the subscription-management pages). On confirm, deletes the draft and redirects away.

4. **`SiblingSummaryBanner.tsx`** — small presentational component rendered at the top of `AiCommentEditView` when arriving from a cache-hit (or any terminal status that carried a non-zero `siblingSummary`).

   Props:

   ```ts
   interface SiblingSummaryBannerProps {
     summary: SiblingSummary;
     onDismiss?: () => void;
   }
   ```

   Rendering rules:

   - If `unreviewed + reviewed + edited === 0`, render nothing (this is the freshly-computed case from the user's own job; no siblings exist yet — only the row about to be inserted, which isn't counted in their banner).
   - Otherwise render a CoreUI info-banner with a message like: "This gene + publication has already been processed by {total} other user(s) ({reviewed} reviewed, {edited} edited, {unreviewed} drafts). You can still review and publish under your name."
   - Optional `latestReviewedAt` rendered as a relative timestamp ("most recent review: 3 days ago").
   - The banner is dismissable for the current page lifetime; no persistence.

   How the banner gets the data: the controller arriving from the add flow stashes the terminal status (or just the `siblingSummary`) in route state (`history.push(..., { siblingSummary })`) or in a small in-memory key keyed by `commentId`. `AiCommentEditView` reads it on mount and renders the banner if present. If absent (user came in via direct URL or refresh), no banner is shown — that's fine, it's only meant as an arrival hint.

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

Add three functions for the AI flow plus a `deleteUserComment`. POST is now plain JSON (the PDF never leaves the browser — see "Client-side PDF extraction"). All wire keys are snake_case; the service-layer functions are the boundary that maps to/from the camelCase TS types.

```ts
interface AiGenePublicationRequest {
  geneId: string;
  source: 'pubmed' | 'upload';
  pubmedId?: string; // iff source === 'pubmed'
  paperText?: string; // iff source === 'upload', extracted client-side via MuPDF.js
  pdfContentSha256?: string; // iff source === 'upload', hex SHA-256 over the PDF bytes
  externalUrl?: string;
  externalTitle?: string;
  options: {
    validate: boolean;
    createUserComment: boolean;
    // generateProductDescription is wire-supported but ignored by the BE in v1; not exposed in v1 UI.
  };
}

function postAiGenePublication(
  request: AiGenePublicationRequest
): Promise<AiGenePublicationSubmitOutcome> {
  const body: Record<string, unknown> = {
    gene_id: request.geneId,
    document_type: request.source,
    options: {
      validate: request.options.validate,
      create_user_comment: request.options.createUserComment,
    },
  };
  if (request.source === 'pubmed') {
    body.pubmed_id = request.pubmedId;
  } else {
    body.paper_text = request.paperText;
    body.pdf_content_sha256 = request.pdfContentSha256;
    if (request.externalUrl) body.external_url = request.externalUrl;
    if (request.externalTitle) body.external_title = request.externalTitle;
  }
  return fetch(`${base.serviceUrl}/user-comments/ai-gene-publication`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(async (response) => {
    if (response.status === 503) {
      const retryAfter = response.headers.get('Retry-After');
      return {
        type: 'server-busy',
        retryAfterSeconds: retryAfter ? Number(retryAfter) : undefined,
      };
    }
    if (response.status === 400) {
      return { type: 'validation-error', errors: await response.json() };
    }
    const payload = await response.json();
    return deserializeJobStatus(payload);
  });
}

function getAiGenePublicationJobStatus(
  jobId: string
): Promise<AiGenePublicationJobStatus | { type: 'not-found' }> {
  return fetch(
    `${base.serviceUrl}/user-comments/ai-gene-publication/${jobId}`,
    { credentials: 'include' }
  ).then(async (r) => {
    if (r.status === 404) return { type: 'not-found' };
    return deserializeJobStatus(await r.json());
  });
}

function deleteAiGenePublicationJob(jobId: string): Promise<void> {
  return base._fetchJson<void>(
    'delete',
    `/user-comments/ai-gene-publication/${jobId}`
  );
}

function deleteUserComment(commentId: number): Promise<void> {
  return base._fetchJson<void>('delete', `/user-comments/${commentId}`);
}
```

`deserializeJobStatus` is a small helper that maps the BE's snake_case discriminated union into the camelCase `AiGenePublicationJobStatus`. Two strategies are reasonable — pick whichever the codebase already prefers:

- A targeted per-variant mapper (`switch (payload.type)`), explicit and tiny but a touch verbose.
- A generic snake-to-camel deep-key transformer applied to the whole payload. Equivalent here because none of the payload values contain underscored strings that need to survive.

The BE plan documents the exact wire shape under "Status union" in `CLAUDE-ai-user-comments.md`.

`deleteUserComment` requires the existing `DELETE /user-comments/{id}` endpoint on `UserCommentsService` — already implemented per the BE plan ("Reused without modification" §).

Expose all four alongside the existing methods in the returned object.

## Entry points (how users reach the new form)

One change to the gene record page:

1. In the gene-page "User Comments" section header, replace the existing "Add a comment" text link with **two small outlined buttons** on a new row below the existing "Download" / "Discuss" links:

   - **"Add a comment"** — navigates to the existing `/user-comments/add?stableId={geneId}` route (unchanged behaviour)
   - **"Add AI-assisted comment"** with a small teal "Beta" pill badge — navigates to `/user-comments/ai-gene-publication/add?stableId={geneId}`

   Both buttons: white background, 1px solid light-grey border, dark-grey label text, ~4px border radius, compact padding. See `mockups/ai-user-comments/00-entry-point/mockup-frame-01-option-a-three-buttons.png` for the approved design.

2. No changes yet to the user-comments show page's links or to the record-page comments table — those follow-ups are out of scope.

## Files to create or modify

| Action | Path                                                                                                                                                                                                                             |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| modify | `packages/sites/genomics-site/package.json` — add MuPDF.js dependency (and `@types/...` if it ships separately)                                                                                                                  |
| modify | `packages/sites/genomics-site/webapp/wdkCustomization/js/client/types/userCommentTypes.ts` — extended `AiProvenance` plus AI-job types (or split into a sibling `aiGenePublicationTypes.ts`)                                     |
| modify | `packages/sites/genomics-site/webapp/wdkCustomization/js/client/userCommentRoutes.tsx` — new route                                                                                                                               |
| modify | `packages/sites/genomics-site/webapp/wdkCustomization/js/client/service/UserCommentsService.ts` — `postAiGenePublication` (JSON, snake_case), `getAiGenePublicationJobStatus`, `deleteAiGenePublicationJob`, `deleteUserComment` |
| modify | `packages/sites/genomics-site/webapp/wdkCustomization/js/client/controllers/UserCommentFormController.tsx` — view branch on `aiProvenance`                                                                                       |
| create | `packages/sites/genomics-site/webapp/wdkCustomization/js/client/controllers/AiGenePublicationAddController.tsx`                                                                                                                  |
| create | `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/userComments/AiGenePublication/AiGenePublicationAddView.tsx`                                                                                          |
| create | `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/userComments/AiGenePublication/AiCommentEditView.tsx`                                                                                                 |
| create | `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/userComments/AiGenePublication/AiGenePublicationBreadcrumb.tsx`                                                                                       |
| create | `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/userComments/AiGenePublication/SiblingSummaryBanner.tsx`                                                                                              |
| create | `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/userComments/AiGenePublication/extractPdfText.ts` — lazy-loads MuPDF.js, extracts text, computes SHA-256, with structured error returns for the view  |

Reused without modification:

- `PubmedIdEntry.tsx` — preview chip for PubMed provenance display.
- `getPubmedPreview` (service, lines 38–46) — optional inline metadata hint on the add form.
- `updateFormFields` / `requestSubmitComment` / `UserCommentFormStoreModule` submit + attachment epics.
- Web Crypto (`crypto.subtle.digest`) for the PDF SHA-256 — built into modern browsers, no dependency needed.

## Follow-ups (explicitly deferred)

- **Product-description generation** — `options.generate_product_description` exists in the wire schema but the BE ignores it in v1 (BE plan §"Out of scope" item 4). When it lights up, add the checkbox back to the form, surface a `generating-product-description` stage in the checklist, and render the resulting `product_description` in the edit view (separate persistence target TBD).
- **Show page modernisation** — rewrite `UserCommentShowView` with card layout + tabs (User-generated / AI-assisted) + provenance column. Non-trivial scope; unblock AI flow first.
- **Gene-page comments table provenance column** — WDK model changes plus a cell renderer.
- **De-duplication warnings** — pre-submit, warn "someone already submitted this gene+publication pair." The BE's `comment_ai_run` table already gives us a deterministic key for this; the sibling-summary banner is a post-hoc version of the same idea. Stub locations in the add form are marked with `// TODO(dedup)`.
- **Per-follower DELETE semantics** — currently a DELETE from any one follower cancels the underlying BE job for _all_ attached followers. A future BE addition could let one follower detach without killing the job for others; if/when that lands, update the Cancel button copy/behaviour accordingly.
- **Adaptive / SSE polling** — if fixed 1 s polling proves too chatty or too laggy, switch to exponential back-off or Server-Sent Events. The contract above is agnostic to transport on the front-end side.
- **Markdown rendering on show page** — BE flattens `ai_content` to plain text that happens to also be valid markdown. The show page currently renders plain text; future work could plug in a markdown renderer to format the bulleted evidence sections nicely.

## Verification

1. `yarn workspace @veupathdb/genomics-site compile:check` should type-check cleanly, particularly around the new discriminated `AiProvenance` and the `AiGenePublicationJobStatus` / `SiblingSummary` types.
2. Run the genomics-site dev server locally. In a browser:
   - Log in, navigate to `/user-comments/ai-gene-publication/add?stableId=PF3D7_0315200` (any gene).
   - **PubMed happy path**: enter a known PMID that mentions the gene → expect URL to gain a `&jobId=…` on submit; watch the stage checklist advance (`fetching-article` → `scanning-gene-mentions` → `generating-summary` → `validating` → `persisting`). On terminal `success`, expect redirect to `/user-comments/edit?commentId={N}` with the AI minimal view. Check the confirmation checkbox and submit — confirm publish succeeds.
   - **Restore button**: edit the headline or content, then click "Restore original" — confirm both fields reset to the AI-generated values stored in `aiProvenance.originalHeadline` / `aiProvenance.originalContent`.
   - **Delete draft**: click "Delete comment", confirm the Dialog appears, click "Delete" in the Dialog, confirm the comment is deleted and the user is redirected away.
   - **Upload path — client-side PDF extraction**:
     - Select a valid text-bearing PDF. Confirm a "Preparing PDF reader…" indicator flashes on first selection (MuPDF.js lazy-loads only on this tab), then "Extracting text…" with a page counter, then the Submit button enables with a "Extracted N chars across M pages" summary.
     - Open browser DevTools → Network → confirm the POST body is `application/json` with `paper_text` (long string) and `pdf_content_sha256` (64 hex chars); confirm **no PDF bytes are transmitted**.
     - Verify lazy-load: visit the add page on the PubMed tab and confirm no MuPDF-related JS / WASM is requested in the Network panel until the user switches to the Upload tab.
     - In the resulting edit view, confirm the provenance panel renders the `externalUrl` / `externalTitle` (if supplied) and the "processed in your browser — file not stored" note.
   - **Upload path — MuPDF parse error**: select an image-only / scanned PDF (zero extractable text) or a corrupt PDF. Confirm the inline error block appears in the file-input area ("We couldn't extract any text from that PDF…") and that Submit remains disabled. Use the "Clear" button to reset.
   - **Cache hit (same user, second submit)**: submit the same gene + PMID combination a second time. POST should return a terminal `success` directly (no `&jobId=` lands in the URL, no polling UI is shown), and the controller should navigate straight to `/user-comments/edit?commentId={N2}` where N2 is a _new_ comment id. The edit page renders the **sibling-summary banner** showing `{ reviewed/edited/unreviewed: ≥1 }` (the first submission counts as a sibling for the second).
   - **`mentioned-in-passing`**: submit a PMID where the gene appears only trivially → terminal `mentioned-in-passing`. Confirm the in-place message renders, an "Open draft" button appears, and clicking it lands on the edit page with the sibling-summary banner and the "AI didn't generate content" note above the (empty) editor.
   - **`gene-not-mentioned`**: submit a PMID that doesn't mention the gene → terminal `gene-not-mentioned` with `synonymsChecked` listed and an "Open draft" button. Confirm the same edit-page behaviour as above.
   - **Pool exhaustion (503)**: with the BE bounded to 8 concurrent jobs, saturate the pool from multiple browser tabs; the ninth submit should surface the "Server is busy" toast (with a `Retry-After` countdown if the BE returned one). The form stays on step 1 with values intact.
   - **Refresh-during-job**: mid-poll, reload the page. The URL should still carry `jobId` (a hex SHA-256); polling resumes and the correct stage is shown without resubmitting.
   - **Cancel**: submit, click Cancel mid-stage, confirm UI transitions to the cancelled-terminal state and offers "Try a different publication" + "Back to gene page".
   - **`text-unavailable`**: submit a restricted PMID with no PMC text → terminal `text-unavailable`. Re-submitting the same PMID re-runs the fetch (this outcome is intentionally **not** cached). Until the back end exists, mock to exercise this branch.
   - **Expired `jobId`**: visit a URL whose `jobId` is unknown (server restart, or hand-edited) → poll returns `not-found` → friendly "That job has expired — please submit again" message; form values preserved.
3. Non-AI comments (no `aiProvenance`) continue to render the heavyweight `UserCommentFormView` on `/user-comments/edit` — regression check.
4. The existing `/user-comments/show` page keeps working untouched.
