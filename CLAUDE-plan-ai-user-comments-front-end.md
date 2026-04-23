# Plan: AI-Assisted User Comments — Front End

## Context

VEuPathDB is adding a new kind of user comment: an **AI-assisted gene-publication summary**. A user supplies a gene (via URL param `stableId`) and a publication (either a PubMed ID or an uploaded PDF). A new back-end service resolves the publication text (via PMC API or the uploaded PDF), checks that the gene or its synonyms are mentioned, runs an LLM to produce a gene-function description from the publication's perspective, and creates a user comment record whose `aiProvenance` field records the source. The user is redirected to an edit/review page where they refine the comment before it becomes visible.

This plan covers the front-end pieces only: the new initiation form, the imaginary back-end contract (so we can agree on the interface), additions to `AiProvenance`, and a view-level branch in the existing `/user-comments/edit` route so AI comments render a minimal modern review form rather than the heavyweight general form.

Out of scope: modernising `/user-comments/show` (card layout + tabs), adding a provenance column to the gene-page comments table, de-duplication. Each is tracked as a follow-up below.

## Backend contract (proposal for the new WDK endpoint)

The front-end will talk to one new endpoint. The exact path is TBD by the back-end team, but the shape we want:

```
POST /user-comments/ai-gene-publication
```

Request body: `multipart/form-data` (to accommodate the PDF in one shot).

| Field                                | Required                | Notes                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------ | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `geneId` (stableId)                  | yes                     | From URL query param in the form.                                                                                                                                                                                                                                                                                                           |
| `source`                             | yes                     | `'pubmed'` \| `'upload'`.                                                                                                                                                                                                                                                                                                                   |
| `pubmedId`                           | if `source=pubmed`      | String digits.                                                                                                                                                                                                                                                                                                                              |
| `pdf`                                | if `source=upload`      | File. **Not persisted** on the back end — transient input only.                                                                                                                                                                                                                                                                             |
| `externalUrl`                        | only if `source=upload` | User-supplied link (e.g. bioRxiv), optional.                                                                                                                                                                                                                                                                                                |
| `externalTitle`                      | only if `source=upload` | Link text for `externalUrl`, optional.                                                                                                                                                                                                                                                                                                      |
| `options.generateProductDescription` | no                      | Boolean. Back-end includes a suggested product description in the AI output if true.                                                                                                                                                                                                                                                        |
| `options.validate`                   | no                      | Boolean. Back-end runs the optional validation LLM step if true.                                                                                                                                                                                                                                                                            |
| `options.createUserComment`          | no                      | Boolean, default **false**. If true, back-end persists a `user_comment` row with the AI output as its `content`/`headline` and populates `aiProvenance`. The front-end add form sets this to `true` in this first phase. Treating DB side-effects as opt-in keeps the endpoint useful for future preview/try-it-out flows without DB churn. |

Response shape (discriminated union, matching the existing `UserCommentPostResponseData` pattern in `UserCommentsService.ts:16-28`):

```ts
interface AiOutput {
  headline: string; // suggested comment headline
  content: string; // main AI-generated description
  productDescription?: string; // present iff options.generateProductDescription
  // validation notes / confidence can fold in here later
}

type AiGenePublicationResponse =
  | {
      type: 'success';
      aiOutput: AiOutput; // always present — clients that didn't ask for side-effects use this directly
      commentId?: number; // present iff options.createUserComment was true
      // additional created-record IDs go here as side-effects grow (product-description records TBD)
    }
  | { type: 'gene-not-mentioned'; synonymsChecked: string[] }
  | { type: 'text-unavailable'; reason: string } // licensing, 404, OCR failure, etc.
  | { type: 'validation-error'; errors: string[] }
  | { type: 'internal-error'; error: string };
```

Notes:

- Synchronous call. LLM work may take 30–60s; show an in-form progress indicator. If latency proves unworkable, we can switch to a job-poll pattern in phase 2.
- In this first front-end phase, the add form **always** sends `options.createUserComment: true`. On `success`, the front-end navigates to `/user-comments/edit?commentId={commentId}`. The back end has already created the comment row with `aiProvenance.reviewLevel = 'unreviewed'`.
- Because `aiOutput` is always returned, preview/no-side-effect flows become trivial to add later without back-end changes.
- The back end is responsible for: PMC text fetch, synonym lookup, gene-mention check, LLM reasoning, optional validation/product-description steps, conditional comment-row creation, and authorship attribution (from the session).
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
    const { stableId = '' } = parseQueryString(props);
    return <AiGenePublicationAddController stableId={stableId} />;
  },
},
```

`/user-comments/edit` stays as-is at the route level; the view branch happens inside `UserCommentFormController`.

## New components

Create under `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/userComments/AiGenePublication/`:

1. **`AiGenePublicationAddView.tsx`** — modern form (CoreUI + emotion, mirroring `packages/libs/user-datasets/src/lib/Components/UploadForm.tsx`):

   - Headline: "AI-assisted comment for gene `{stableId}`".
   - Radio group: **PubMed ID** vs **Upload PDF** (discriminated union state).
   - If PubMed: single `TextBox` for PMID. Optional inline PubMed metadata preview using the existing `getPubmedPreview` service (re-use `PubmedIdEntry.tsx` for the rendered chip).
   - If Upload: `<FileInput>` (WDK client) scoped to `.pdf`. **Prominent notice: "This PDF will be sent to our AI service for analysis only and will not be stored. For provenance, optionally add a public link to the publication below."** Optional `TextBox` pair for `externalUrl` and `externalTitle`.
   - "Generate product description" checkbox (maps to `options.generateProductDescription`).
   - "Validate output" checkbox (maps to `options.validate`), default **on**.
   - Submit button shows a progress indicator while the synchronous backend call runs. Disable the form during the in-flight request.
   - On `success`, navigate (via React Router `history.push`) to `/user-comments/edit?commentId={commentId}`.
   - Inline error rendering for each discriminated response case (`gene-not-mentioned` explains synonyms checked; `text-unavailable` explains likely cause; `validation-error` and `internal-error` generic).
   - `// TODO(dedup)` marker near the submit button noting where a duplicate-warning UI will plug in later.

2. **`AiGenePublicationAddController.tsx`** — minimal controller. Props: `{ stableId: string }`. Holds local React state (no Redux — the flow is one-shot and short-lived). Calls the new service method (see below). Emits a `completed` state → React Router redirect.

3. **`AiCommentEditView.tsx`** — the minimal review form for AI comments, rendered when `aiProvenance` is present on the loaded comment. Not a route; it's a view component mounted by `UserCommentFormController`.
   - Header: "Review AI-assisted comment for gene `{stableId}`".
   - **Provenance panel (read-only)**: renders source — either a `PubmedIdEntry` for `kind: 'pubmed'` or a link (`externalUrl` / `externalTitle`) plus a "(uploaded PDF, not stored)" note for `kind: 'upload'`.
   - **Review level selector**: radio group over `AiReviewLevel` — `unreviewed` / `reviewed` / `edited`. Default is whatever the server returned. If the user edits the content textarea, automatically bump to `'edited'` (but don't clobber explicit `'reviewed'` → keep last explicit user choice unless content actually changes).
   - **Headline** (`TextBox`) and **Content** (`TextArea`) — editable, bound to the same Redux state as the heavyweight form via existing `updateFormFields` dispatches. This gives us free submit/save plumbing.
   - **Categories** (`CheckboxList`, wired identically to the heavyweight form).
   - No PubMed/DOI/GenBank/location/attachments/related-genes sections. That's the point of the minimal form.
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

Add one function, mirroring the multipart upload pattern already at lines 116–134:

```ts
function postAiGenePublication(
  request: AiGenePublicationRequest
): Promise<AiGenePublicationResponse> {
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

  return fetch(`${base.serviceUrl}/user-comments/ai-gene-publication`, {
    method: 'POST',
    credentials: 'include',
    body: fd,
  }).then((r) => r.json()) as Promise<AiGenePublicationResponse>;
}
```

Expose it alongside the existing methods in the returned object.

## Entry points (how users reach the new form)

Minimum required: a link from the gene record page. Two small touch-ups:

1. On the existing gene-page "User Comments" section or near the "Add a comment" link, add a sibling "Add an AI-assisted comment from a publication" link pointing to `/user-comments/ai-gene-publication/add?stableId={geneId}`. The exact DOM location depends on WDK model config; keep the plan-side note that this is a one-line WDK/JSP or custom wrapper tweak.
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

Reused without modification:

- `PubmedIdEntry.tsx` — preview chip for PubMed provenance display.
- `getPubmedPreview` (service, lines 38–46) — optional inline metadata hint on the add form.
- `updateFormFields` / `requestSubmitComment` / `UserCommentFormStoreModule` submit + attachment epics.

## Follow-ups (explicitly deferred)

- **Show page modernisation** — rewrite `UserCommentShowView` with card layout + tabs (User-generated / AI-assisted) + provenance column. Non-trivial scope; unblock AI flow first.
- **Gene-page comments table provenance column** — WDK model changes plus a cell renderer.
- **De-duplication warnings** — detect "someone already submitted this gene+publication pair" and warn. Stub locations in the add form are marked with `// TODO(dedup)`.
- **Job-based async** if synchronous LLM calls prove too slow.

## Verification

1. `yarn workspace @veupathdb/web-common build` (or the site-specific build if simpler) should type-check cleanly, particularly around the new discriminated `AiProvenance`.
2. Run the genomics-site dev server locally. In a browser:
   - Log in, navigate to `/user-comments/ai-gene-publication/add?stableId=PF3D7_0315200` (any gene).
   - **PubMed path**: enter a known PMID that mentions the gene → expect redirect to `/user-comments/edit?commentId={N}` with the AI minimal view. Change the content textarea and confirm `reviewLevel` auto-bumps to `'edited'`; submit succeeds.
   - **Upload path**: upload a PDF → same redirect/edit flow. Check in the resulting edit view that the provenance panel renders the `externalUrl`/`externalTitle` (if supplied) and the "not stored" note.
   - **Error paths**: submit a PMID that doesn't mention the gene → `gene-not-mentioned` message with synonyms listed. Submit a restricted PMID with no PMC text → `text-unavailable` message. These require back-end cooperation; until the back end exists, mock the service function to exercise each branch.
3. Non-AI comments (no `aiProvenance`) continue to render the heavyweight `UserCommentFormView` on `/user-comments/edit` — regression check.
4. The existing `/user-comments/show` page keeps working untouched.
