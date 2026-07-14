# Design: Upload-path external reference (PMID / DOI)

**Date:** 2026-06-25
**Branch:** feature-ai-user-comments
**Status:** Draft (design); pending user review before implementation plan

## Context

The AI-assisted user-comments feature (see `CLAUDE-plan-ai-user-comments-front-end.md`
and `ApiCommonWebsite/Service/CLAUDE-ai-user-comments.md`) lets a user generate a
gene-publication summary from either a **PubMed ID** (the back end fetches PMC text) or
an **uploaded PDF** (text is extracted client-side with MuPDF.js; the PDF never leaves
the browser).

On the PubMed path, the source publication is identified by its PMID. It surfaces on
**two distinct display surfaces**, which must be kept in mind throughout:

1. **Comment service / show page** — the PMID rides on the comment's `aiProvenance`
   and is displayed via a PubMed preview chip, kept **separate** from the comment
   system's existing `pubMedRefs` references sidecar.
2. **Gene-record-page comments table** (the WDK `GeneComments` query in
   `ApiCommonModel/Model/lib/wdk/model/records/commentTableQueries.xml`) — a `pmids`
   column aggregated by **UNION** of the human `CommentReference` PMIDs and the AI
   run-row `pubmed_id`. This is the "third source of PMIDs" added in `ApiCommonModel`
   commit `5c0a4a`.

The upload path must thread its PMID into **both** surfaces, mirroring the PubMed path.

On the **upload path** there is currently no way to record _which_ publication the PDF
came from. UX/Outreach have asked that the upload form optionally let the user record
the PMID **or DOI** of the uploaded paper, purely so it can be displayed as provenance.

Two columns have already been added to `usercomments.comment_ai_run`:

```
external_ref        VARCHAR(255)   -- the PMID or DOI string (normalised)
external_ref_kind   VARCHAR(255)   -- 'pubmed' | 'doi' | NULL
```

This spec covers wiring those columns end-to-end as **store-and-display-only**
provenance metadata.

## Core principle: `external_ref` is inert metadata

`external_ref` / `external_ref_kind` are descriptive only. They do **not** participate
in job identity or deduplication:

- **Not in the `job_id` digest.** The digest stays
  `sha256(gene ‖ synonyms ‖ source-key ‖ model ‖ promptVersion ‖ options)`, where the
  upload source-key is `pdf_content_sha256`. Adding `external_ref` would split the cache
  (same PDF, different/blank ref → different `job_id` → wasted LLM runs). `JobDigest`
  is **not touched**.
- **Not in any already-published / cache lookup.** Identity remains `pubmed_id`
  (PubMed path) or `pdf_content_sha256` (upload path). A PubMed-path already-published
  lookup must never match an upload row whose `external_ref` happens to equal that PMID,
  and vice versa — the two are different sources (PMC text vs the user's PDF) even when
  they cite the same paper. The rule is simply: **`external_ref` is never added to a
  matching `WHERE` clause, in either direction.** This is the default (don't add the
  column to those queries), not new code.

### Consequence: cache-hit display inherits the first submitter's ref (accepted)

Because `external_ref` is not in the digest, identical PDF bytes share one
`comment_ai_run` row. A second user who publishes against that cached run displays
whatever ref the **first** submitter stored. This is identical to how the existing
`external_url` / `external_title` provenance fields already behave, and it is benign:
for identical bytes it is the same paper, so inheriting the first ref (or filling a
blank one) is _more_ provenance, not wrong provenance. **No per-comment storage, no
publish-body change.** `external_ref` lives on the run row only, exactly like
`external_url` / `external_title`.

## Front end

### Input form — `AiGenePublicationAddView.tsx` (upload tab)

Add one optional field to the upload tab, beside the existing optional
`externalUrl` / `externalTitle` provenance inputs:

- A single **`TextBox`** labelled e.g. "PubMed ID or DOI (optional)".
- **Client-side kind auto-detection**, debounced (~400 ms after typing stops):
  - `pubmed` if the trimmed value matches `^\d{1,9}$` (also accept a leading `PMID:`).
  - `doi` if it matches `^10\.\d{4,9}/\S+$` (also accept a leading `https?://(dx\.)?doi\.org/`).
  - otherwise `undefined` (no chip; treated as "not yet a valid ref").
- A small read-only **chip** appears after the debounce stating what was detected
  ("PubMed ID" / "DOI"). **No manual override control** — the formats are structurally
  disjoint, so detection is reliable; the chip is purely confirmatory feedback.
- When `pubmed` is detected, reuse the existing `getPubmedPreview` service +
  `PubmedIdEntry` chip to show the title/authors inline — the human-eyeball check that
  the PMID matches the uploaded paper. **This preview is the verification**; there is no
  deterministic title-grep against the PDF text (unreliable — ligatures, hyphenation,
  Unicode dashes, running-header truncation) and no extra LLM verification (out of
  scope).
- The field is **optional**; leaving it blank submits no ref. It never gates Submit.

### Submit request — `UserCommentsService.postAiGenePublication`

Extend `AiGenePublicationRequest` (FE camelCase) and the POST body (snake_case) with the
detected values, upload path only:

```ts
externalRef?: string;                      // normalised PMID or DOI
externalRefKind?: 'pubmed' | 'doi';        // omitted when externalRef is absent
```

Wire keys: `external_ref`, `external_ref_kind`. Only sent on `document_type === 'upload'`
and only when a kind was detected.

### Provenance type — `types/userCommentTypes.ts`

Extend the `upload` variant of `AiProvenanceSource`:

```ts
export type AiProvenanceSource =
  | { kind: 'pubmed'; pubmedId: string }
  | {
      kind: 'upload';
      externalUrl?: string;
      externalTitle?: string;
      pdfContentSha256?: string;
      externalRef?: string; // NEW
      externalRefKind?: 'pubmed' | 'doi'; // NEW
    };
```

### Display — provenance panel (review form + show-page card)

When an upload comment carries an `externalRef`:

- `externalRefKind === 'pubmed'` → render via the **same separate provenance channel**
  as the PubMed path (PubMed preview chip / `LazyPubmedPreview`). It must **not** be
  injected into the comment's `pubMedRefs` (preserves the `bd0fb09e0e` no-duplicate-PMID
  contract; AI source PMIDs always render through provenance, never the references
  sidecar).
- `externalRefKind === 'doi'` → render a plain link to `https://doi.org/{externalRef}`
  (no DOI preview service exists; a bare link is sufficient). Asymmetric-by-design with
  the rich PubMed chip.
- Wording distinguishes it from a PubMed-path source — this is a paper the user
  _indicates_ the uploaded PDF corresponds to, not the text the AI actually read
  (e.g. "Uploaded PDF — user indicates: PMID 12345678").

## Back end

All changes are additive store-and-display. The DB columns already exist on
`comment_ai_run`.

### Request DTO + normalisation — `AiGenePublicationRequest.java`, `SyncPrelude`

- Add `externalRef` (`@JsonProperty("external_ref")`) and `externalRefKind`
  (`@JsonProperty("external_ref_kind")`) to the request DTO.
- **Normalise + validate** in the sync prelude (upload path only):
  - strip a leading `PMID:` / `https?://(dx\.)?doi\.org/` and surrounding whitespace;
  - if `kind=pubmed`, require `^\d{1,9}$`; if `kind=doi`, require `^10\.\d`;
  - on malformed input return `400` (consistent with the prelude's existing shape
    validation) — don't store garbage that renders a broken preview/link.
  - both fields absent → fine (NULL/NULL stored).
- **`JobDigest` is not touched** — `external_ref` does not enter the digest.

### Persistence — `CommentAiRun` POJO + `InsertCommentAiRunQuery`

- Add `externalRef` / `externalRefKind` to the `CommentAiRun` POJO and bind the two new
  columns in `InsertCommentAiRunQuery` (the row already exists; this adds two bind
  values). `GetCommentAiRunQuery` reads them back.

### Surfacing on a published comment — provenance read path

- The publish endpoint already builds `AiProvenance.fromRun(run, …)`; extend the
  provenance POJO / `aiProvenance` read path (the `GetCommentQuery` LEFT JOIN to the run
  row) so `external_ref` / `external_ref_kind` reach the FE on the upload variant —
  the same channel that already carries `external_url` / `external_title`. No
  publish-body change; the value is read from the run row.

### Service response shaping — `AiGenePublicationCommentService.sourceJson`

- Include `external_ref` / `external_ref_kind` in the `source` object emitted for upload
  rows (cache-hit, running, and terminal responses), alongside the existing
  `external_url` / `external_title`, so the review form can render the provenance before
  publish.

### Gene-page comments table — `ApiCommonModel` `GeneComments` query (the missed surface)

`Model/lib/wdk/model/records/commentTableQueries.xml`, `<sqlQuery name="GeneComments">`.
Its `refs` sub-select builds the `pmids` aggregate by UNION-ing human PubMed references
with the AI run-row PMID (PubMed path, added in `5c0a4a`):

```sql
SELECT comment_id, source_id
FROM @REMOTE_COMMENT_SCHEMA@CommentReference
WHERE database_name='pubmed'
UNION
SELECT cap.comment_id, car.pubmed_id AS source_id
FROM @REMOTE_COMMENT_SCHEMA@comment_ai_provenance cap
JOIN @REMOTE_COMMENT_SCHEMA@comment_ai_run car ON cap.run_job_id = car.job_id
WHERE car.source_kind = 'pubmed' AND car.pubmed_id IS NOT NULL
```

Add a **third** UNION branch for the upload path's PMID-kind external ref:

```sql
UNION
SELECT cap.comment_id, car.external_ref AS source_id
FROM @REMOTE_COMMENT_SCHEMA@comment_ai_provenance cap
JOIN @REMOTE_COMMENT_SCHEMA@comment_ai_run car ON cap.run_job_id = car.job_id
WHERE car.source_kind = 'upload'
  AND car.external_ref_kind = 'pubmed'
  AND car.external_ref IS NOT NULL
```

Notes:

- **Only `external_ref_kind = 'pubmed'`** enters this aggregate. DOIs never appear in the
  `pmids` column (it feeds a `pmid2title` / PubMed-search link). DOI provenance lives
  only on the show-page provenance channel.
- **Only the `GeneComments` query** needs this branch. AI gene-publication comments are
  gene-targeted, so they never surface in `CommunityComments` / `PopsetComments` /
  `GenomeComments` / `PhenotypeComments` — `5c0a4a` left those untouched for the PubMed
  path too, and we follow suit.
- The `ai_source_kind` column (via the `car2` join) is unaffected — it stays
  `'pubmed'` / `'upload'`; `external_ref` does not change it.

## Out of scope

- Deterministic title verification (PDF-text grep) — unreliable; rejected above.
- LLM-based PMID/DOI correctness check — more LLM work; deferred.
- DOI preview metadata service — bare `doi.org` link only.
- Any change to job identity, dedup, or the already-published lookup.
- DOI/PMID `external_ref` on the **PubMed** path (that path already has a PMID; the field
  is upload-tab only).
- **DB migration scripting** — the two `external_ref` / `external_ref_kind` columns
  already exist in `userdb_devn`; the SQL lives in Slack but is not yet committed to the
  GitHub repos. The user will reconcile migration scripts separately at beta deployment.
  This implementation assumes the columns exist.

## Files touched (summary)

**Front end (genomics-site client):**

- `components/userComments/AiGenePublication/AiGenePublicationAddView.tsx` — optional
  field + debounced detection + chip + reuse PubMed preview.
- `controllers/AiGenePublicationAddController.tsx` — hold `externalRef`/`externalRefKind`
  state; include in submit body.
- `service/UserCommentsService.ts` — extend `AiGenePublicationRequest` + POST body
  mapping (+ `source` deserialisation).
- `types/userCommentTypes.ts` — extend the `upload` `AiProvenanceSource` variant.
- Provenance display component(s) (review form + show-page card / `CommentReferences`
  neighbourhood) — render `external_ref` by kind; keep out of `pubMedRefs`.

**Back end (ApiCommonWebsite):**

- `service/services/ai/AiGenePublicationRequest.java` — two new fields.
- `service/services/ai/SyncPrelude.java` — normalise + validate (400 on malformed).
- `service/services/ai/AiGenePublicationCommentService.java` — `sourceJson` emits the
  two keys for upload rows.
- `model/comment/pojo/CommentAiRun.java` — two new fields.
- `model/comment/repo/InsertCommentAiRunQuery.java` / `GetCommentAiRunQuery.java` — bind
  / read the two columns.
- `model/comment/pojo/AiProvenance.java` (+ `GetCommentQuery` read path) — carry the two
  values onto a published comment's `aiProvenance` upload source.
- `ApiCommonModel/Model/lib/wdk/model/records/commentTableQueries.xml` — add the third
  UNION branch (upload-path `external_ref` where `external_ref_kind='pubmed'`) to the
  `GeneComments` query's `pmids` aggregate, mirroring `5c0a4a`.

## Verification

1. `yarn workspace @veupathdb/genomics-site compile:check` clean (extended union type).
2. Upload tab: type `12345678` → after debounce, "PubMed ID" chip + PubMed preview
   appears. Type a DOI → "DOI" chip, no preview. Type junk → no chip, Submit still
   enabled (field is optional).
3. DevTools: POST body carries `external_ref` / `external_ref_kind` only for uploads,
   only when detected.
4. Malformed `external_ref` (e.g. `kind=pubmed` but value `abc`) → `400`.
5. Publish an upload comment with a PMID ref → the published comment's provenance panel
   shows the PubMed chip; the PMID does **not** also appear in the references sidecar.
6. Publish with a DOI ref → provenance shows a `doi.org` link.
7. Cache hit: user B uploads the same PDF bytes with a blank/different ref → displays
   user A's stored ref (accepted behaviour); the run is reused, no new LLM call.
8. Regression: `JobDigest` output for a given upload is unchanged whether or not an
   `external_ref` is supplied (proves it's out of the digest).
9. Gene-record page: publish an upload comment with `external_ref_kind='pubmed'` →
   the comment's row in the gene-page comments table shows that PMID in the `PMID(s)`
   column (third UNION branch). Publish one with `external_ref_kind='doi'` → the DOI
   does **not** appear in that column.
