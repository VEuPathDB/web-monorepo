# Plan: AI-Assisted User Comments — Front End

**TO DO:** validation step has been removed from the back-end. Remove also from the front end plan and mock-up prompts (and user to remake relevant mockups via ChatGPT).

## Context

VEuPathDB is adding a new kind of user comment: an **AI-assisted gene-publication summary**. A user supplies a gene (via URL param `stableId`) and a publication (either a PubMed ID or an uploaded PDF). A new back-end service resolves the publication text, checks that the gene or its synonyms are mentioned, runs an LLM to produce a gene-function description from the publication's perspective, and caches that output server-side (a `comment_ai_run` row). The user is taken to a **review-and-publish** step seeded with that AI output; **a user-comment record is created only when they click Publish** — at which point its `aiProvenance` field records the source.

> **Design pivot (2026-06-02): review-on-approval.** Earlier drafts had the back end create a `comments` row (in an "unreviewed" state) the moment a run completed, then redirect to `/user-comments/edit?commentId=…`. We dropped that to avoid forcing every consumer of the comments table to filter out unreviewed AI rows. Now: a completed run yields only the cached AI output (keyed by `job_id`); the review form is seeded from that output and the comment row is created **only on Publish**, via a dedicated `POST …/{job_id}/publish` endpoint. Abandoning the review creates nothing. To minimise accidental abandonment the add/review page installs an **"are you sure you want to leave?" navigation guard** while an un-published result is on screen. Consequences threaded through this plan: terminal statuses no longer carry a `comment_id`; the review step is keyed by `job_id` (not `commentId`) and lives inside the AI flow; `SiblingSummary` loses its `unreviewed` count; `AiProvenance.reviewLevel` collapses to `isEdited`; there is no "delete draft" (no draft exists).

**Upload-path PDFs never leave the user's machine.** Text extraction happens client-side using **MuPDF.js** (WASM, lazy-loaded only when the user picks the upload tab); the front-end also computes a SHA-256 of the PDF bytes via Web Crypto. The POST body for an upload submission carries `paper_text` plus `pdf_content_sha256` — the back end never sees the PDF. This was a deliberate pivot from server-side extraction; see the BE plan (`CLAUDE-ai-user-comments.md`) for rationale.

The MuPDF.js approach has been validated end-to-end in a PoC: [PR #1700](https://github.com/VEuPathDB/web-monorepo/pull/1700). The PoC confirms lazy-load, text extraction, and the webpack/WASM bundling story all work; that PR's build config and loader pattern are the starting point for the production wiring described below.

The back end identifies jobs by a deterministic **content-digest `job_id`** (hex SHA-256 over gene + resolved synonyms + source-key + model + prompt version + canonical-JSON options). This means double-tap submits, cross-user resubmissions, and "I refreshed the tab" all naturally dedupe to the same in-flight job or the same cached result.

This plan covers the front-end pieces only: the new initiation form (including the client-side PDF extraction pipeline), the back-end contract (now confirmed against the BE plan), additions to `AiProvenance`, a sibling-summary banner for cache-hit cases, and a view-level branch in the existing `/user-comments/edit` route so AI comments render a minimal modern review form rather than the heavyweight general form.

Out of scope: modernising `/user-comments/show` (card layout + tabs), adding a provenance column to the gene-page comments table, de-duplication. Each is tracked as a follow-up below.

## Backend contract (locked against the BE plan)

The flow is **asynchronous: submit-and-poll**, with one important wrinkle — the POST itself can return a _terminal_ state directly when the job's `job_id` already has a cached result or another submitter is mid-flight. Wire-format keys are **snake_case** to match the existing comments-service JSON convention (the FE's existing snake_case ↔ camelCase boundary still applies internally).

Three endpoints:

| Verb   | Path                                                  | Purpose                                                                                                                                       |
| ------ | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/user-comments/ai-gene-publication`                  | Submit a job. Returns either `running` (fresh/attached) or a terminal state directly (cache hit). No comment is created.                      |
| GET    | `/user-comments/ai-gene-publication/{job_id}`         | Poll job status / terminal result. `job_id` is a hex SHA-256.                                                                                 |
| DELETE | `/user-comments/ai-gene-publication/{job_id}`         | Cancel an in-flight job. Cancels for **all** attached followers in v1.                                                                        |
| POST   | `/user-comments/ai-gene-publication/{job_id}/publish` | **Create the comment on user approval.** Body `{ headline, content }`; returns `{ comment_id }`. The only call that creates a `comments` row. |

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
    "generate_product_description": false
  }
}
```

Typical `paper_text` is 30–200 KB — well under standard servlet POST limits. No `user_id` field; WDK identifies the caller from the session.

`options.generate_product_description` is wired up but deferred (the back end ignores it in v1 — see "Follow-ups" below). (`create_user_comment` was removed in the review-on-approval pivot — the generate POST never creates a comment, so the flag gated nothing; the comment is created by the separate publish call.)

Validation of required / mutually-exclusive fields happens synchronously — malformed requests return `400` with `{ errors: string[] }` and no job is created.

### Submit response — same union as the GET status response

POST may resolve to _any_ state from the union below, not just `running`. The three live paths:

- **Fresh miss** → `running { job_id, stage: "queued" }` (or further along; the prelude is allowed to short-circuit if it can).
- **In-flight attach** → `running { job_id, stage: "<current-stage>" }` for an existing job whose `job_id` matches. The caller becomes a "follower" and receives the same terminal `ai_output` when the run finishes. (No per-follower comment — each follower reviews and publishes independently.)
- **Cache hit** (`comment_ai_run` row already exists) → terminal state directly, carrying the cached `ai_output` + `sibling_summary`. **No comment is created** — the FE seeds its review form from `ai_output`; the comment is created only on Publish.

Plus one infrastructural failure:

- **Pool exhausted** → `503 Service Unavailable` with a `Retry-After` header. The FE surfaces a friendly toast ("Server is busy — please try again in a moment") with a retry button. **No client-side queueing or auto-retry** — surface the failure plainly.

### Publish request (POST `…/{job_id}/publish`, `application/json`)

When the user clicks Publish on the review form:

```json
{ "headline": "string", "content": "string" }
```

Returns `{ comment_id: number }` (HTTP 201). The back end reads the run row for the `{job_id}`, creates the `comments` row + `comment_ai_provenance` row in one transaction, and derives `is_edited` by comparing the submitted text to the cached AI original (so the FE doesn't send it). Errors: **404** if the `job_id` has no cached run (e.g. it was a `text-unavailable`/error outcome — not publishable); **400** if `headline`/`content` are empty. After a successful publish the FE leaves the AI flow (the comment is now an ordinary published comment).

### Status union

```ts
interface AiOutput {
  headline: string; // suggested comment headline
  content: string; // main AI-generated description, plain text valid as markdown
  // future: validation notes / confidence
}

// Counts over comment_ai_provenance rows pointing at the same run_job_id.
// Provenance rows exist only for PUBLISHED comments, so there is no
// "unreviewed" count. Anonymous aggregate — no other user identities revealed.
interface SiblingSummary {
  reviewed: number; // published without edits (is_edited = false)
  edited: number; // published with edits (is_edited = true)
  latest_at: string | null; // ISO-8601, most recent publish
}

type JobStage =
  | 'queued'
  | 'fetching-article' // PMC fetch on the PubMed path; symbolic no-op for upload (text already in body)
  | 'scanning-gene-mentions' // deterministic regex scan
  | 'generating-summary' // first LLM call
  | 'validating' // iff options.validate
  | 'persisting'; // writes the comment_ai_run cache row (always, for a cacheable outcome)

interface JobProgress {
  stage: JobStage;
  message: string; // human-readable, e.g. "Scanning article for PF3D7_0315200…"
  updated_at: string; // ISO timestamp
}

type AiGenePublicationJobStatus =
  // non-terminal
  | { type: 'running'; job_id: string; progress: JobProgress }
  // terminal — success (LLM produced a real summary). NO comment_id — the
  // comment is created later by the publish call.
  | {
      type: 'success';
      job_id: string;
      ai_output: AiOutput;
      sibling_summary: SiblingSummary;
    }
  // terminal — LLM ran but flagged the gene as only mentioned in passing
  | {
      type: 'mentioned-in-passing';
      job_id: string;
      synonyms_checked: string[];
      sibling_summary: SiblingSummary;
    }
  // terminal — regex scan found zero mentions, never reached the LLM
  | {
      type: 'gene-not-mentioned';
      job_id: string;
      synonyms_checked: string[];
      sibling_summary: SiblingSummary;
    }
  // terminal — fetch failed (not cached; retry is free; not publishable)
  | { type: 'text-unavailable'; reason: string }
  // terminal — validation pass found unrecoverable issues
  | { type: 'validation-error'; errors: string[] }
  | { type: 'internal-error'; error: string }
  | { type: 'cancelled' };
```

The three publishable terminals (`success`, `mentioned-in-passing`, `gene-not-mentioned`) all carry a `job_id` and `sibling_summary`; the FE uses `job_id` to seed and later publish the review form. The two "not really about this gene" outcomes carry no `ai_output` (the user writes their own body).

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
- **`is_edited`** is derived by the BE at publish time by comparing the user's submitted headline+content against `comment_ai_run.ai_headline` / `ai_content`. The FE doesn't send or pick it.
- **No comment exists until Publish.** A cache hit (or a freshly-finished run) returns only the cached `ai_output` + `sibling_summary`. The FE seeds its review form from that and stays in the AI flow keyed by `job_id`; on Publish it calls `…/{job_id}/publish` to create the comment, then leaves the flow. A page refresh on the review step re-fetches via `GET …/{job_id}` (served from the in-memory registry or, after eviction, the permanent `comment_ai_run` cache), so the review survives reload without resubmitting.
- **Per-follower DELETE not supported in v1.** A DELETE from any follower cancels the underlying job for _all_ attached followers. In practice this is fine — followers attaching to in-flight jobs is rare; the user-visible "Cancel" button still does what the user expects (it kills _their_ job).

## Type additions

### `packages/sites/genomics-site/webapp/wdkCustomization/js/client/types/userCommentTypes.ts`

Extend `AiProvenance` beyond what the state-management plan currently specifies. `externalUrl` and `externalTitle` live **inside the `upload` variant** (PubMed-sourced comments rely on the PMID alone). Internal TS uses camelCase — the existing user-comments service code does the snake_case↔camelCase boundary mapping, so this interface follows the existing FE convention.

```ts
export type AiProvenanceSource =
  | { kind: 'pubmed'; pubmedId: string }
  | { kind: 'upload'; externalUrl?: string; externalTitle?: string };

export interface AiProvenance {
  isEdited: boolean; // true iff the published text differs from the AI original (was reviewLevel)
  source: AiProvenanceSource;
  originalHeadline: string; // AI-generated headline; used by the Restore button
  originalContent: string; // AI-generated content; used by the Restore button
}
```

This is present only on **published** AI comments (loaded by `commentId`), and supersedes the simpler `{ reviewLevel }` shape in `CLAUDE-plan-ai-user-comments-state-management.md` §Design — the multi-valued `AiReviewLevel` is gone (an unreviewed AI comment is no longer a thing that exists as a record). Everything else in that plan (absent = human-written, `UserCommentFormFields`/`UserCommentGetResponse` extensions, the `getResponseToPostRequest` one-line addition) still applies unchanged — TypeScript will cover the extra fields via the updated interface.

### New types for the AI gene-publication flow

Add to the same file (or a sibling `aiGenePublicationTypes.ts` if it cleans up imports — judgement call at implementation time). These are the FE-internal camelCase mirrors of the wire shapes documented in the Backend contract section. The service-layer code (`UserCommentsService.ts`) does the snake_case↔camelCase mapping at the boundary.

```ts
export interface AiOutput {
  headline: string;
  content: string;
}

export interface SiblingSummary {
  reviewed: number; // published without edits
  edited: number; // published with edits
  latestAt: string | null;
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
      siblingSummary: SiblingSummary;
    }
  | {
      type: 'mentioned-in-passing';
      jobId: string;
      synonymsChecked: string[];
      siblingSummary: SiblingSummary;
    }
  | {
      type: 'gene-not-mentioned';
      jobId: string;
      synonymsChecked: string[];
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

// Result of the publish call (create-on-approval).
export type AiGenePublicationPublishOutcome =
  | { type: 'published'; commentId: number }
  | { type: 'not-found' } // job_id had no cached run (e.g. text-unavailable)
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

The optional `jobId` query param lets a user refresh mid-job (or revisit via browser history) and resume **polling or the review step** rather than lose the run. The controller writes the jobId into the URL (via `history.replace`) the moment it gets one back from the submit call, and keeps it there through the review step. This single `/add` route now hosts the whole pre-publish flow: input → polling → **review-and-publish** (seeded from the cached `ai_output`). On Publish the controller navigates away to the published comment; on refresh anywhere in the flow, the `jobId` re-fetches the live/terminal state via `GET …/{jobId}`.

`/user-comments/edit` stays as-is at the route level; its `aiProvenance` branch (inside `UserCommentFormController`) now applies **only to editing an already-published AI comment** (loaded by `commentId`), not to the first review pass — which lives in the AI flow above.

## Breadcrumb trail

The AI comment flow is presented as a three-step process with a horizontal breadcrumb trail immediately below the page heading. The breadcrumb is a read-only progress indicator — it orients the user and reflects the current phase but is not interactive.

> **Mockup** (all three step states):
> [breadcrumb design](mockups/ai-user-comments/00-breadcrumb-design/mockup-breadcrumb-design.png)

### Steps

| #   | Key                  | Label              | Route(s) where active                                                                        |
| --- | -------------------- | ------------------ | -------------------------------------------------------------------------------------------- |
| 1   | `publication-source` | Publication source | `/user-comments/ai-gene-publication/add` when `phase === 'idle' \| 'submitting'`             |
| 2   | `generating-comment` | Generating comment | `/user-comments/ai-gene-publication/add` when `phase === 'polling'`                          |
| 3   | `review-publish`     | Review & publish   | `/user-comments/ai-gene-publication/add` when `phase === 'review'` (seeded from `ai_output`) |

All three steps now live on the **same** `/add` route, driven by controller `phase` — the review step is no longer a separate `/user-comments/edit` page (no comment exists yet). (When the user later edits an _already-published_ AI comment via `/user-comments/edit`, that page can show its own step-3 breadcrumb, but that's a separate post-publish visit.)

### Step transitions

- **Form submit, fresh job** (`idle → submitting → polling`): the breadcrumb advances from step 1 to step 2. The content pane transitions from the input form to the polling/progress view. The URL gains `&jobId=…` via `history.replace`.
- **Form submit, cache hit** (`idle → submitting → review`): POST returns a terminal `success` / `mentioned-in-passing` / `gene-not-mentioned` directly with `ai_output`/`siblingSummary` (no comment). The controller skips the polling view and goes straight to the **review** step (breadcrumb step 1 → step 3, no visible step 2), seeding the form from `ai_output`. The `jobId` is written to the URL so the review survives refresh.
- **Form submit, in-flight attach** (`idle → submitting → polling`): identical to fresh-job from the FE's perspective — POST returns `running { jobId }`; the controller starts polling.
- **Form submit, pool busy** (`idle → submitting → idle`): POST returns 503. The controller surfaces a "Server busy" toast (with optional `Retry-After` countdown) and returns to step 1 with form values preserved. The breadcrumb stays on step 1.
- **Job success** (`polling → review`): the controller transitions to the **review** step in place (step 2 → step 3), rendering the review form seeded from `ai_output`. No navigation.
- **Publish** (`review → leaves the flow`): the controller calls `…/{jobId}/publish`, gets `{ commentId }`, and navigates away to the now-published comment (e.g. `/user-comments/show` or back to the gene page). The nav-away guard is lifted just before this programmatic navigation.
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
  - `polling` → `'generating-comment'`
  - `review` → `'review-publish'`
- **Post-publish edit** (`/user-comments/edit` with `aiProvenance`): if a breadcrumb is shown at all there, `activeStep='review-publish'` hardcoded (secondary path).

### Files affected by this addition

| Action | Path                                                                                                                                                                    |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| create | `…/AiGenePublication/AiGenePublicationBreadcrumb.tsx`                                                                                                                   |
| modify | `…/AiGenePublication/AiGenePublicationAddView.tsx` — render breadcrumb above the content pane; the review step (`phase==='review'`) renders the review-and-publish form |
| modify | `…/AiGenePublication/AiCommentReviewView.tsx` — render breadcrumb above the review form (the pre-publish review component)                                              |

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
   - On terminal `success`, the controller transitions to `phase: 'review'` **in place** (no navigation) and renders the review-and-publish form seeded from `ai_output`. The `jobId` stays in the URL so a refresh re-fetches the cached output.
   - On terminal `mentioned-in-passing`, transition to `phase: 'review'` but render an inline notice above the (empty) editor ("The AI determined this paper only mentions the gene in passing — no summary was generated. You can still write and publish your own observations below.") plus a **Try a different publication** button.
   - On terminal `gene-not-mentioned`, transition to `phase: 'review'` with the `synonymsChecked` listed and the same empty-body review form ("none of these names were found in the paper — you can still publish your own comment"), plus **Try a different publication**.
   - On other terminal errors, show a per-case message (`text-unavailable` explains likely cause; `validation-error`/`internal-error` render their strings) — these are **not publishable** (no cached run), so no review form. Include a "Try a different publication" button (primary) that clears the jobId from the URL and returns to input mode with the previous form values preserved, and a "Back to gene page" link (secondary).
   - On `not-found` from the poller (expired / unknown jobId — e.g. the user returned to a stale URL after server restart), show a friendly "That job has expired — please submit again" message and fall back to input mode. The user can resubmit; if the original job completed before restart, the resubmission will hit the `comment_ai_run` cache and resolve instantly.
   - On `server-busy` (503) from the submit call, surface a toast — see "Pool exhaustion" below.

   ### Client-side PDF extraction (upload path only)

   The end-to-end approach (lazy-load, extraction, webpack/WASM bundling) has been validated in [PR #1700](https://github.com/VEuPathDB/web-monorepo/pull/1700). Lift the loader pattern and webpack config from that PR — the non-obvious bundling work is already solved.

   When the user selects a file in the upload tab:

   1. **Lazy-load MuPDF.js.** Dynamic-`import` the module so the WASM bundle is only downloaded when the user actually picks the upload tab — not on every visit to the add page. Show a "Preparing PDF reader…" indicator while the import resolves. See PR #1700 for the working loader, and <https://mupdf.readthedocs.io/en/1.27.2/guide/using-with-javascript.html> for the API reference.
   2. **Compute SHA-256.** Read the file as an `ArrayBuffer` and pass it through `crypto.subtle.digest('SHA-256', bytes)`. Hex-encode the result and stash it as `pdfContentSha256` in local state.
   3. **Extract text.** Hand the `ArrayBuffer` to MuPDF, iterate pages, concatenate their text into a single string `paperText`. Show a small "Extracting text…" indicator with a page counter if the PDF is large.
   4. **Error UI** — this is the case that previously would have surfaced as a server-side `text-unavailable` and now lives entirely on the client. If MuPDF throws (corrupt PDF, password-protected, scanned image with no text layer, etc.) show an inline error block in the file-input area: "We couldn't extract any text from that PDF. It may be scanned (image-only) or password-protected. Try a different file, or use a PubMed ID instead." Provide a "Clear" button and keep the form on the upload tab with the file deselected.
   5. Once `paperText` and `pdfContentSha256` are both present, enable the Submit button. Display the page count and a character count as a small reassurance ("Extracted 87,432 characters across 12 pages").

   The text-extraction quality matches the Python pipeline (MuPDF.js and PyMuPDF share the same engine), so prompts tuned against the Python output should transfer cleanly.

   ### Pool exhaustion (503)

   When the submit call returns 503, render a non-blocking toast (CoreUI `Notification` or equivalent): "The AI service is busy. Please try again in a moment." If the response carries a `Retry-After` header, the controller exposes it as `retryAfterSeconds` and the toast can show a countdown. The form stays on step 1 with values intact. **No automatic retry** — the user re-clicks Submit when they're ready.

2. **`AiGenePublicationAddController.tsx`** — minimal controller. Props: `{ stableId: string; jobId?: string }`. Holds local React state (no Redux — the flow is one-shot and short-lived):

   - Form-field state (source radio, pubmedId, the selected `File` plus derived `paperText` + `pdfContentSha256`, externalUrl/externalTitle, option checkboxes, and an extraction-status sub-state for the upload path).
   - Job state: `{ phase: 'idle' } | { phase: 'submitting' } | { phase: 'polling'; jobId: string; lastStatus: AiGenePublicationJobStatus } | { phase: 'review'; jobId: string; status: AiGenePublicationJobStatus; publishing?: boolean } | { phase: 'terminal-error'; status: AiGenePublicationJobStatus } | { phase: 'server-busy'; retryAfterSeconds?: number }`. The `review` phase holds a _publishable_ terminal (`success`/`mentioned-in-passing`/`gene-not-mentioned`); `terminal-error` holds the non-publishable ones (`text-unavailable`/`validation-error`/`internal-error`/`cancelled`).

   Behaviour:

   - **Resume on mount**: if the `jobId` prop is set, skip submit and start polling immediately. A `GET …/{jobId}` that comes back already-terminal-and-publishable drops straight into `phase: 'review'`; this is how a refresh on the review step restores it.
   - **PDF file selection** (upload path): kicks off the lazy MuPDF load + SHA-256 + text extraction described above. The controller owns the extraction-state machine; Submit stays disabled until extraction completes successfully.
   - **Submit**: build the JSON body with snake_case keys (`gene_id`, `document_type`, `pubmed_id` | `paper_text` + `pdf_content_sha256`, `external_url`, `external_title`, `options`). Call `postAiGenePublication`. The result is one of:
     - `running { jobId }` → `history.replace` to `?stableId=...&jobId={jobId}` and start the poll loop.
     - publishable terminal `success` / `mentioned-in-passing` / `gene-not-mentioned` (cache hit, **no comment yet**) → `history.replace` the `jobId` into the URL and transition straight to `phase: 'review'`, seeding the form from `ai_output` (empty for the two passing/not-mentioned cases).
     - terminal `text-unavailable` (rare — PubMed path only) / `validation-error` → transition to `terminal-error` and render the error UI in place.
     - `server-busy` (503) → transition to `server-busy` phase to drive the toast; auto-revert to `idle` after the user dismisses or after the `retryAfterSeconds` countdown.
   - **Poll loop**: recursive `setTimeout`-driven (not `setInterval`, to avoid overlapping requests if a poll is slow). Interval 1000 ms. Clear the timeout on unmount and on terminal responses. Do not retry automatically on transient fetch errors — surface a small "reconnecting…" indicator and try again on the next tick. A `404` terminates the loop with `type: 'not-found'`.
   - **Terminal handling**:
     - `success` / `mentioned-in-passing` / `gene-not-mentioned` → transition to `phase: 'review'` (no navigation); render the review-and-publish form.
     - `cancelled` / `text-unavailable` / `validation-error` / `internal-error` → `phase: 'terminal-error'`; show the message, offer "Try a different publication" and "Back to gene page".
     - `not-found` → friendly "that job has expired" message, fall back to input mode.
   - **Publish** (from the `review` phase): set `publishing: true`, call `publishAiGenePublication(jobId, { headline, content })`. On `{ type: 'published', commentId }` → lift the nav-away guard and navigate to the published comment (e.g. `/user-comments/show?…` or back to the gene page). On `not-found` (run evicted _and_ never cached — should be rare) → show "this result is no longer available, please resubmit". On `validation-error` → surface inline (empty headline/content).
   - **Cancel** (from `polling`): call `deleteAiGenePublicationJob`; the UI updates when the next poll returns `cancelled`. Polling is the source of truth.
   - **Navigation guard**: while in `phase: 'review'` (a finished-but-unpublished result is on screen), install a `beforeunload` + in-app route-leave guard ("You haven't published this comment yet — leave anyway?"). Lifted automatically on a successful publish and on the explicit "Try a different publication" / "Back to gene page" actions. This is what keeps abandoned results low (the BE keeps the `comment_ai_run` row regardless).

   No Redux store module is needed. The job is a UI-local concern; nothing else in the app cares about its intermediate state.

3. **`AiCommentReviewView.tsx`** — the **review-and-publish** form, rendered by `AiGenePublicationAddController` when `phase === 'review'`. It is **not** loaded from a comment record (none exists yet); it is seeded from the terminal job status (`aiOutput` + `siblingSummary`) the controller already holds, and on Publish it **creates** the comment via the publish endpoint. (A separate, lighter post-publish edit path reuses the normal comment form — see Controller changes.) This component is local React state, **not** wired to the Redux comment store.

   > **Mockup**: [Frame 08 — review & edit form, step 3 active, provenance panel, editable content, restore button, confirmation checkbox, publish disabled](mockups/ai-user-comments/05-ai-review-edit/mockup-frame-08-review-edit.png)

   Props (from the controller): `{ stableId, jobId, status }` where `status` is the publishable terminal, plus the resolved source (pubmed id / external url+title) from the original form submission, and an `onPublished(commentId)` callback.

   Vertical layout from top to bottom:

   - Header: "Review AI-assisted comment for gene `{stableId}`".
   - **Sibling-summary banner** (conditional — see `SiblingSummaryBanner` below): rendered above the provenance panel when `status.siblingSummary` is non-zero. Tells the user "this combination has already been published by N others" without revealing identities. Dismissable.
   - **Provenance panel (read-only)**: renders source — either a `PubmedIdEntry` for the pubmed path or a link (`externalUrl` / `externalTitle`) plus a "(uploaded PDF, processed in your browser — file not stored)" note for the upload path. (Source comes from the submitted form, mirroring what the BE stored on the run row.)
   - **Headline** (`TextBox`) and **Content** (`TextArea`) — editable local state, seeded from `aiOutput` (empty for `mentioned-in-passing` / `gene-not-mentioned`). No Categories/PubMed/DOI/GenBank/location/attachments/related-genes sections.
     - For `mentioned-in-passing` / `gene-not-mentioned`, the body starts empty; render a small explanatory note above the editor: "The AI didn't generate content for this combination — see the banner above. You can still publish a comment by writing your own."
   - **Encouragement copy** (small italic text below the content area): e.g. "Please review the AI-generated content above and edit as needed before publishing."
   - **Restore original** button (outlined secondary): resets Headline and Content to the AI originals (`aiOutput.headline` / `aiOutput.content`). Only enabled when the current values differ, and only present when there was AI output (i.e. `success`).
   - **Confirmation checkbox** (required): "I have reviewed this content and it is appropriate for public release." Must be checked before Publish is enabled.
   - **Publish comment** button (primary): disabled until the checkbox is checked (and headline+content are non-empty). On click, calls the controller's publish handler → `publishAiGenePublication(jobId, { headline, content })`. The BE derives `is_edited` (submitted text vs the cached AI original); the FE neither sends nor shows it. On success the controller navigates away.
   - **Discard** / **Try a different publication** (secondary): abandons the review (no DB write — there's nothing to delete) and returns to input mode; **Back to gene page** link as a tertiary exit. _(No "Delete comment" button — there is no draft comment to delete in the review-on-approval model.)_

4. **`SiblingSummaryBanner.tsx`** — small presentational component rendered at the top of `AiCommentReviewView` when the terminal status carried a non-zero `siblingSummary`.

   Props:

   ```ts
   interface SiblingSummaryBannerProps {
     summary: SiblingSummary;
     onDismiss?: () => void;
   }
   ```

   Rendering rules:

   - If `reviewed + edited === 0`, render nothing (no one else has _published_ this combination yet).
   - Otherwise render a CoreUI info-banner with a message like: "This gene + publication has already been published by {total} other user(s) ({reviewed} as-is, {edited} edited). You can still review and publish under your name."
   - Optional `latestAt` rendered as a relative timestamp ("most recent: 3 days ago").
   - The banner is dismissable for the current page lifetime; no persistence.

   How the banner gets the data: the controller already holds the terminal `status` (it polled or cache-hit it) and passes `status.siblingSummary` straight into `AiCommentReviewView` — no route-state stashing needed, since the review form lives in the same controller. On a refresh-driven resume, the re-fetched `GET …/{jobId}` carries `siblingSummary` again.

## Controller changes

### `packages/sites/genomics-site/webapp/wdkCustomization/js/client/controllers/UserCommentFormController.tsx`

This branch is now for the **post-publish edit** of an already-published AI comment only (the first review-and-publish pass lives entirely in `AiGenePublicationAddController` / `AiCommentReviewView`). When a user later opens `/user-comments/edit?commentId={id}` for a comment that has `aiProvenance`, render a minimal AI-aware edit view rather than the heavyweight general form:

```tsx
const isAiComment = stateProps.submission.aiProvenance != null;
// ... existing permissionDenied branch first ...
return isAiComment ? (
  <AiCommentEditView {...viewProps} />
) : (
  <UserCommentFormView {...viewProps} />
);
```

Here `AiCommentEditView` is the _post-publish_ editor: it loads from the comment record (so `aiProvenance.isEdited` and the AI originals are available for a Restore button), edits via the normal Redux `updateFormFields` / `requestSubmitComment` path, and **updates** the existing comment (the BE recomputes `is_edited` on save). It does **not** create comments. `viewProps` already contains everything it needs (submission, dispatchProps, categoryChoices, submitting/completed/errors). No store-module changes beyond those already in `CLAUDE-plan-ai-user-comments-state-management.md`.

> Implementation note: `AiCommentReviewView` (pre-publish, create-on-approval) and `AiCommentEditView` (post-publish, update-existing) share most of their layout — provenance panel, headline/content editors, Restore, sibling banner. Factor the shared presentation into a common sub-component and let the two thin wrappers differ only in their submit action (publish-endpoint create vs Redux update) and data source (job `aiOutput` vs loaded comment).

## Service additions

### `packages/sites/genomics-site/webapp/wdkCustomization/js/client/service/UserCommentsService.ts`

Add four functions for the AI flow (`postAiGenePublication`, `getAiGenePublicationJobStatus`, `deleteAiGenePublicationJob`, **`publishAiGenePublication`**) plus a `deleteUserComment`. POST is now plain JSON (the PDF never leaves the browser — see "Client-side PDF extraction"). All wire keys are snake_case; the service-layer functions are the boundary that maps to/from the camelCase TS types.

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
    // generateProductDescription is wire-supported but ignored by the BE in v1; not exposed in v1 UI.
    // (create_user_comment removed — the generate POST never creates a comment.)
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

// Create the comment on user approval. Body carries only the (possibly edited)
// text; the BE reads provenance from the cached run row and derives is_edited.
function publishAiGenePublication(
  jobId: string,
  body: { headline: string; content: string }
): Promise<AiGenePublicationPublishOutcome> {
  return fetch(
    `${base.serviceUrl}/user-comments/ai-gene-publication/${jobId}/publish`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  ).then(async (response) => {
    if (response.status === 404) return { type: 'not-found' };
    if (response.status === 400) {
      return { type: 'validation-error', errors: await response.json() };
    }
    const payload = await response.json(); // { comment_id }
    return { type: 'published', commentId: payload.comment_id };
  });
}

function deleteUserComment(commentId: number): Promise<void> {
  return base._fetchJson<void>('delete', `/user-comments/${commentId}`);
}
```

`deserializeJobStatus` is a small helper that maps the BE's snake_case discriminated union into the camelCase `AiGenePublicationJobStatus`. Two strategies are reasonable — pick whichever the codebase already prefers:

- A targeted per-variant mapper (`switch (payload.type)`), explicit and tiny but a touch verbose.
- A generic snake-to-camel deep-key transformer applied to the whole payload. Equivalent here because none of the payload values contain underscored strings that need to survive.

The BE plan documents the exact wire shape under "Status union" in `CLAUDE-ai-user-comments.md`.

`deleteUserComment` requires the existing `DELETE /user-comments/{id}` endpoint on `UserCommentsService` — already implemented per the BE plan ("Reused without modification" §). It is **not** used to discard an un-published review (none exists); it remains available for deleting a _published_ AI comment like any other.

Expose all five alongside the existing methods in the returned object.

## Entry points (how users reach the new form)

One change to the gene record page:

1. In the gene-page "User Comments" section header, replace the existing "Add a comment" text link with **two small outlined buttons** on a new row below the existing "Download" / "Discuss" links:

   - **"Add a comment"** — navigates to the existing `/user-comments/add?stableId={geneId}` route (unchanged behaviour)
   - **"Add AI-assisted comment"** with a small teal "Beta" pill badge — navigates to `/user-comments/ai-gene-publication/add?stableId={geneId}`

   Both buttons: white background, 1px solid light-grey border, dark-grey label text, ~4px border radius, compact padding. See `mockups/ai-user-comments/00-entry-point/mockup-frame-01-option-a-three-buttons.png` for the approved design.

2. No changes yet to the user-comments show page's links or to the record-page comments table — those follow-ups are out of scope.

## Files to create or modify

| Action | Path                                                                                                                                                                                                                                                             |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| modify | `packages/sites/genomics-site/package.json` + webpack config — add MuPDF.js dependency and WASM-loading config. Lift both from [PR #1700](https://github.com/VEuPathDB/web-monorepo/pull/1700) (PoC, validated)                                                  |
| modify | `packages/sites/genomics-site/webapp/wdkCustomization/js/client/types/userCommentTypes.ts` — extended `AiProvenance` plus AI-job types (or split into a sibling `aiGenePublicationTypes.ts`)                                                                     |
| modify | `packages/sites/genomics-site/webapp/wdkCustomization/js/client/userCommentRoutes.tsx` — new route                                                                                                                                                               |
| modify | `packages/sites/genomics-site/webapp/wdkCustomization/js/client/service/UserCommentsService.ts` — `postAiGenePublication` (JSON, snake_case), `getAiGenePublicationJobStatus`, `deleteAiGenePublicationJob`, **`publishAiGenePublication`**, `deleteUserComment` |
| modify | `packages/sites/genomics-site/webapp/wdkCustomization/js/client/controllers/UserCommentFormController.tsx` — view branch on `aiProvenance` (now post-publish edit only)                                                                                          |
| create | `packages/sites/genomics-site/webapp/wdkCustomization/js/client/controllers/AiGenePublicationAddController.tsx` — hosts input → polling → review; calls the publish endpoint                                                                                     |
| create | `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/userComments/AiGenePublication/AiGenePublicationAddView.tsx`                                                                                                                          |
| create | `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/userComments/AiGenePublication/AiCommentReviewView.tsx` — **pre-publish** review-and-publish form (create-on-approval), seeded from the job `aiOutput`                                |
| create | `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/userComments/AiGenePublication/AiCommentEditView.tsx` — **post-publish** edit of a published AI comment (loaded by `commentId`); shares layout with the review view                   |
| create | `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/userComments/AiGenePublication/AiGenePublicationBreadcrumb.tsx`                                                                                                                       |
| create | `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/userComments/AiGenePublication/SiblingSummaryBanner.tsx`                                                                                                                              |
| create | `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/userComments/AiGenePublication/extractPdfText.ts` — lazy-loads MuPDF.js, extracts text, computes SHA-256, with structured error returns for the view                                  |

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
   - **PubMed happy path**: enter a known PMID that mentions the gene → expect URL to gain a `&jobId=…` on submit; watch the stage checklist advance (`fetching-article` → `scanning-gene-mentions` → `generating-summary` → `validating` → `persisting`). On terminal `success`, expect the **review step in place** (no navigation; breadcrumb on step 3) with the headline/content seeded from `ai_output`. Check the confirmation checkbox and click **Publish** → confirm the publish call returns a `commentId`, the nav-away guard lifts, and you're taken to the published comment. Confirm a `comments` row + `comment_ai_provenance` row now exist (and **did not** exist before Publish).
   - **Restore button**: in the review step, edit the headline or content, then click "Restore original" — confirm both fields reset to the AI-generated values from `ai_output`.
   - **Nav-away guard**: from the review step (un-published), attempt to navigate away (browser back, close tab, in-app link) → confirm the "you haven't published yet" guard fires. Confirm it does **not** fire after a successful Publish or after clicking "Try a different publication".
   - **Upload path — client-side PDF extraction**:
     - Select a valid text-bearing PDF. Confirm a "Preparing PDF reader…" indicator flashes on first selection (MuPDF.js lazy-loads only on this tab), then "Extracting text…" with a page counter, then the Submit button enables with a "Extracted N chars across M pages" summary.
     - Open browser DevTools → Network → confirm the POST body is `application/json` with `paper_text` (long string) and `pdf_content_sha256` (64 hex chars); confirm **no PDF bytes are transmitted**.
     - Verify lazy-load: visit the add page on the PubMed tab and confirm no MuPDF-related JS / WASM is requested in the Network panel until the user switches to the Upload tab.
     - In the review step, confirm the provenance panel renders the `externalUrl` / `externalTitle` (if supplied) and the "processed in your browser — file not stored" note.
   - **Upload path — MuPDF parse error**: select an image-only / scanned PDF (zero extractable text) or a corrupt PDF. Confirm the inline error block appears in the file-input area ("We couldn't extract any text from that PDF…") and that Submit remains disabled. Use the "Clear" button to reset.
   - **Cache hit (same user, second submit)**: publish once (above), then submit the same gene + PMID combination a second time. POST should return a terminal `success` directly (straight to the review step, no polling UI), and the review form renders the **sibling-summary banner** showing `{ reviewed: 1 }` (your first published comment). Publishing again creates a _second_, distinct comment referencing the same run.
   - **`mentioned-in-passing`**: submit a PMID where the gene appears only trivially → terminal `mentioned-in-passing` → review step with an **empty** editor and the "AI didn't generate content" note. Write your own body and Publish → confirm a comment is created with `aiProvenance.isEdited === true`.
   - **`gene-not-mentioned`**: submit a PMID that doesn't mention the gene → terminal `gene-not-mentioned` with `synonymsChecked` listed → review step with empty editor; same publish behaviour as above.
   - **Pool exhaustion (503)**: with the BE bounded to 8 concurrent jobs, saturate the pool from multiple browser tabs; the ninth submit should surface the "Server is busy" toast (with a `Retry-After` countdown if the BE returned one). The form stays on step 1 with values intact.
   - **Refresh-during-job**: mid-poll, reload the page. The URL should still carry `jobId` (a hex SHA-256); polling resumes and the correct stage is shown without resubmitting.
   - **Refresh-during-review**: after a run finishes (review step, un-published), reload the page → confirm the `jobId` re-fetches the cached `ai_output` and restores the review form (no resubmit, no lost work apart from un-saved edits — which is acceptable; the AI original is re-seeded).
   - **Cancel**: submit, click Cancel mid-stage, confirm UI transitions to the cancelled-terminal state and offers "Try a different publication" + "Back to gene page".
   - **`text-unavailable`**: submit a restricted PMID with no PMC text → terminal `text-unavailable` (error UI, **no review form** — not publishable). Re-submitting the same PMID re-runs the fetch (this outcome is intentionally **not** cached). Until the back end exists, mock to exercise this branch.
   - **Expired `jobId`**: visit a URL whose `jobId` is unknown (server restart, or hand-edited) → poll returns `not-found` → friendly "That job has expired — please submit again" message; form values preserved.
3. Non-AI comments (no `aiProvenance`) continue to render the heavyweight `UserCommentFormView` on `/user-comments/edit` — regression check. A **published** AI comment opened on `/user-comments/edit` renders the minimal `AiCommentEditView` and can be re-edited (BE recomputes `is_edited`).
4. The existing `/user-comments/show` page keeps working untouched. **No consumer of the comments list shows un-published AI runs** — they were never persisted as comments.
