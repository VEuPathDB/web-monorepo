# Design: Async Clustal Omega MSA jobs (replacing the CGI form)

**Date:** 2026-08-11
**Branch:** msa-form
**Status:** Designed, not implemented

## Context

Three places in the app let a user select a batch of records and submit them to Clustal
Omega for multiple sequence alignment, via a shared `ClustalAlignmentForm`
(`packages/libs/web-common/src/components/records/ClustalAlignmentForm.tsx`):

1. **Gene record Orthologs table**
   (`packages/sites/genomics-site/.../GeneRecordClasses.GeneRecordClass.jsx:1713-1821`) —
   rows are **transcripts**, not genes. `ortho_gene_source_id` is the parent gene's ID; the
   row's own transcript ID is a separate field, `ortho_source_id`, which the row data carries
   but which no code in this file currently reads (row selection, the checkbox handlers, and
   the "one transcript per gene" dedup are all keyed on the gene ID today, not the transcript
   ID — meaning the current UI cannot distinguish two different transcripts of the same
   selected gene). `resolveTranscriptFeatures` (below) uses `ortho_source_id`, not
   `ortho_gene_source_id`. The user selects orthologous transcripts, chooses sequence type
   (protein/CDS/genomic + flanking offsets), and output format.
2. **Popset isolate summary table**
   (`packages/sites/genomics-site/.../PopsetResultSummaryViewTableController.jsx`) — select
   isolates, align the locus used to type them.
3. **Ortho-site protein tree**
   (`packages/sites/ortho-site/.../records/Sequences.tsx:803-834`) — select proteins from a
   tree view, align full sequences.

All three currently render a plain `<form target="_blank" method="post">` that POSTs to a
CGI script (`/cgi-bin/isolateAlignment`, `/cgi-bin/msaOrthoMCL`) after a confirmation dialog.
The CGI script runs synchronously and streams its result into a newly opened, initially blank
tab.

We are moving to `service-sequence-retrieval`, a service built on the shared
`lib-compute-platform` async-job engine, which runs Clustal Omega as a background job:
submit once, get a job ID back immediately, poll for status, fetch the result once complete.
This design covers the client-side replacement.

## What's common across all three sites

Despite different domains (genes, isolates, OrthoMCL proteins), each site's selection reduces
to the same shape the service wants: a list of `Feature` objects — `{contig, start, end,
strand?, query?}` — describing a region on some underlying sequence set. `contig` is the
service's literal, fixed field name (confirmed in `schema/library.raml` and the generated
`Feature` DTO in `service-sequence-retrieval`) — it is not chromosome-specific despite the
name. It is whatever key the configured `sequenceType`'s FASTA index uses to look up a
sequence (`ReferenceDAO`/`FastaSequenceIndexEntry` are generic over the loaded reference set),
so a protein accession or an isolate locus ID is just as valid a `contig` value as a
chromosome/scaffold ID. For whole-sequence alignment (as in ortho-site) a `Feature` is just
`{contig: <accession>, start: 0, end: <length>}`.

This split is what makes one shared implementation possible: only the "which records did the
user select, and what coordinates do they resolve to" step is genuinely site-specific.
Everything after that — submit, poll, show status, fetch and render the result — is identical
regardless of which table the user started from.

## Service contract (`service-sequence-retrieval`)

- **Submit:** `POST /sequences-async/{sequenceType}`, body:
  ```json
  {
    "features": [
      {
        "contig": "...",
        "start": 100,
        "end": 500,
        "query": "PF3D7_0102000",
        "strand": "NONE"
      }
    ],
    "deflineFormat": "REGIONONLY",
    "basesPerLine": 60,
    "postProcess": "MSA",
    "msaOptions": { "format": "clustal" }
  }
  ```
  → `200 { jobID: string, status: JobStatus, queuePosition?: number }`.
  `sequenceType` is a deployment-configured key (e.g. `genomic`, `protein`), not a WDK project
  ID. **Job IDs are content-addressed** (MD5 of the request JSON): resubmitting an identical
  request returns the same `jobID` and short-circuits to its existing status rather than
  re-running Clustal Omega. This is a deliberate dedup mechanism in the service, not something
  the client needs to work around.
- **Poll:** `GET /jobs/{jobID}` → `{ jobID, status, queuePosition? }`, `status` one of
  `queued | in-progress | complete | failed | expired`.
- **Result:** once `complete`, `GET /jobs/{jobID}/files` → `string[]` filenames (always
  `output`; also `guidetree.dnd` when `msaOptions.format` is `clustal_dnd`), then
  `GET /jobs/{jobID}/files/{name}` → raw content, always served as `text/plain` (even the
  `clustal_dnd` HTML-flavored output — the client renders it, the service doesn't set the
  content type).
- **Auth:** `Auth-Key` header, same convention `FetchClientWithCredentials` already uses for
  multi-blast.
- **No cancel/delete endpoint exists anywhere in `lib-compute-platform` or
  `service-sequence-retrieval`.** Once submitted, a job cannot be stopped early — the client
  can only stop watching it.
- **Expiration:** what triggers `expired`, and whether a data release should purge/expire old
  jobs, is a backend/ops concern (tracked separately — see Non-goals). The client's only
  obligation is to handle `expired` as a terminal status like any other, with no assumption
  about why it occurred.

## Architecture: three layers

```
┌─────────────────────────────┐   ┌──────────────────────────────────┐   ┌───────────────────┐
│ Per-site resolver            │   │ Shared submit/poll/results        │   │ Confirm dialog     │
│ selectedIds -> Feature[]     │──▶│ package (new)                     │◀──│ (existing, kept)   │
│ site-specific                │   │ - submit job                      │   │ ClustalAlignmentForm│
└─────────────────────────────┘   │ - poll GET /jobs/:id               │   └───────────────────┘
                                   │ - fetch + render result            │
                                   │ - route: /result/:jobId            │
                                   └──────────────────────────────────┘
```

### 1. Per-site resolvers

Each site implements `resolveFeatures(selection): Promise<Feature[]>`.

**Transcripts, from any transcript-ID-producing UI (built first):** the resolver here is
`resolveTranscriptFeatures(transcriptIds: string[]): Promise<Feature[]>` — it takes a plain
list of transcript IDs and has no notion of where they came from. `bedReporter` is naturally a
transcript-level report (BED features are exon/CDS structures, which only make sense per
transcript, not per gene), so working in transcript IDs is the right fit, not an awkward
consequence of the table's data shape. Submit the IDs as the ID-list parameter to an
appropriate transcript-based ID-list search (the existing `GeneByLocusTag`-style search
family, exact search TBD — see Open questions), requesting the `bedReporter` report format via
`wdkService.getTemporaryResultPath(answerSpec, 'bedReporter', reportConfig)` — the same
mechanism `gene-list-export-utils.tsx` already uses with `'attributesTabular'`. Fetch the
resulting BED text from `/temporary-results/{id}` and parse it into `Feature[]`. This reuses
an existing search and reporter rather than adding a new WDK attribute-fetch call.

The Orthologs table is simply the first caller of this resolver, not something the resolver is
aware of or specialized for. Any other place in the UI that ends up with a list of transcript
IDs — a different table, a basket, a step result — can call the same
`resolveTranscriptFeatures` with no changes.

**Aside, not part of this design:** the Orthologs table's "Show only one transcript per gene"
toggle (`GeneRecordClasses.GeneRecordClass.jsx:1569-1601`) currently dedups by comparing
`protein_length`, which does not reliably select the longest transcript. A fix is planned
separately (an internal `transcript_length` attribute, not shown as a column but readable from
row data client-side, the same way `sort_key` already is via `SortKeyTable`) — unrelated to the
MSA migration, noted here only because it was discovered while investigating this table.

**Popset and ortho-site (follow-on, same shape):** each needs its own `IdList search +
bed-capable reporter` (or, for ortho-site, a "whole sequence" resolver producing
`{contig: accession, start: 0, end: length}` per selected protein). Note: today Popset's old
CGI form posts `sid`/`start`/`end` hidden inputs that are never populated (dead fields) — so
this isn't a like-for-like migration for Popset, it's a fix. Building the real resolver is
separate work; this design defines the interface it must satisfy (`Promise<Feature[]>`) and
scopes only `resolveTranscriptFeatures` for initial implementation.

### 2. Shared submit/poll/results package

New package, `packages/libs/compute-jobs` (name open — see Open questions), following the
`multi-blast` package as a structural template (a standalone lib each site imports and wires
into its own routes, the way `packages/sites/ortho-site/.../blastRoutes.tsx` imports
`@veupathdb/multi-blast`):

- **`lib/utils/ServiceTypes.ts`** — `Feature`, `MsaOptions`, `MsaFormat`, `JobResponse`
  (`jobID`/`status`/`queuePosition`), `JobStatus` union.
- **`lib/utils/api.ts`** — `SequenceRetrievalApi extends FetchClientWithCredentials`:
  `submitJob(sequenceType, request)`, `fetchJob(jobId)`, `fetchJobFiles(jobId)`,
  `fetchJobFile(jobId, name)`. Modeled on `multi-blast`'s `BlastApi`.
- **`lib/hooks/useJobPolling.ts`** — recursive-`setTimeout` hook modeled on
  `useDatasetPolling`/`polling-schedule.ts` (tiered backoff: 2s for the first ~10s, 5s to
  ~40s, 15s steady-state; pause while `document.hidden`, force-poll + backoff reset on tab
  focus; no-overlap guard via an in-flight ref). Adds one refinement from EDA's
  `useComputeJobStatus`: transient fetch _errors_ get their own short exponential backoff
  (1s/2s/4s, cap 3 retries) before surfacing, separate from the normal status-polling
  interval — so a single dropped request doesn't fall back to the slow tier.
- **`lib/components/ComputeJobPage.tsx`** — the "Running Compute Job" page. Renders:
  - Title ("Running Compute Job").
  - Params summary (e.g. "13 Transcripts, FASTA output format") — passed in as props at
    submit time, not re-derived from the job response (the service doesn't echo back the
    params).
  - Live status while polling (spinner + "queued"/"running" copy, matching the persistent,
    content-changing indicator style validated in the user-datasets polling design — no
    flashing/disappearing status text).
  - On `complete`: fetch file list, fetch `output` (and `guidetree.dnd` if present), render
    inline (plain text / HTML preview for `clustal_dnd`) plus a download link.
  - On `failed`/`expired`: an error state with no retry action (no rerun endpoint exists),
    directing the user back to the record page to resubmit if they want to try again.
- **`lib/controllers/ComputeJobRouter.tsx`** — exposes `/result/:jobId`.

Each site adds a thin `computeJobRoutes.tsx` (its own `RouteEntry[]`, e.g. path
`/workspace/msa/result/:jobId`) spread into that site's `routes.jsx`, mirroring the existing
`blastRoutes.tsx` wiring.

**Revisit/return behavior:** the route is keyed purely on `jobId` in the URL, and job status
comes from `GET /jobs/:id` — nothing is cached client-side across navigations. A user can
leave the page and come back (bookmark, browser back/forward, sharing the URL) and the page
re-derives correct state from scratch: if still running, polling resumes; if complete, the
result is fetched and shown; if failed/expired, that's shown. There is no separate "job
history" list for this feature (unlike multi-blast's `/all` jobs list) — out of scope unless
requested.

### 3. Confirm dialog (kept, action changed)

`ClustalAlignmentForm` keeps its existing warn/block-threshold confirmation dialog and copy
almost as-is — this is deliberate, not a leftover: since there's no cancel endpoint, the
pre-submit dialog is the only point where a user can back out before committing to a
multi-minute job. The only change is what happens on confirm: instead of
`formRef.current.submit()` (opening a blank CGI tab), the component calls the site's
`resolveFeatures()`, then the shared package's `submitJob()`, then navigates to
`/result/:jobId` in the same tab.

## Non-goals

- **Popset and ortho-site resolvers.** This design defines the interface; building them is
  follow-on work once each site's ID-list-search + reporter combination is confirmed to exist
  server-side (Popset in particular needs its dead `sid`/`start`/`end` fields replaced with a
  real lookup).
- **Job cancellation.** Not possible — no such endpoint exists in `lib-compute-platform` or
  `service-sequence-retrieval`.
- **Data-release-driven job expiration/purging.** Flagged as desired (expire all jobs on new
  data release, ~every 2 months) but this is backend/ops policy (a queue purge or TTL
  configured around the release cadence), not something the client can or should enforce.
  Tracked as a follow-up outside this design's scope.
- **A jobs history/list page.** Not requested; the shared package only needs the single
  result-by-ID route.

## Open questions

- Exact name/home for the new package (`packages/libs/compute-jobs` proposed, following the
  `multi-blast` precedent of "one package per reusable async-job UI").
- Whether `sequenceType` for the transcript case should be `genomic` or `protein` by default,
  matching the old form's `sequence_Type` radio choice — carries over 1:1, just renamed.
- **Which ID-list search `resolveTranscriptFeatures` submits to.** `GeneByLocusTag` takes gene
  IDs (`ds_gene_ids`); submitting `ortho_source_id` values needs a transcript-ID-list search,
  which may be a different existing search or may need its own param — TBD.
- **Row selection should switch from `ortho_gene_source_id` to `ortho_source_id`.** Since the
  current Orthologs table selection/checkbox state (`isRowSelected`/`onRowSelect`/etc.,
  `GeneRecordClasses.GeneRecordClass.jsx:1626-1662`) is keyed on the gene ID, implementing this
  design means switching that keying to the transcript ID — otherwise selecting one transcript
  of a multi-transcript gene would show as selected for all of that gene's transcript rows, and
  the resolver would receive the wrong ID. This is a required part of the migration, not
  optional cleanup.
- Exact attribute name for strand in the `bedReporter` output (not confirmed by name from
  web-monorepo alone, since record-class attribute definitions live in ApiCommonModel; should
  fall out naturally once `bedReporter`'s actual output is inspected during implementation).
