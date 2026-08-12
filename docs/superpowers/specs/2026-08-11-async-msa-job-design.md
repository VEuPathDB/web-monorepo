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
   row's own transcript ID is a separate field, `ortho_source_id`. Row selection (the checkbox
   handlers at `1626-1662`) and the "one transcript per gene" dedup are currently keyed on the
   gene ID, not the transcript ID — meaning the current UI cannot distinguish two different
   transcripts of the same selected gene. **This design's implementation includes switching
   that keying to `ortho_source_id`** — required, not optional cleanup, since
   `resolveTranscriptFeatures` (below) needs the transcript ID, not the gene ID, for each
   selected row. The user selects orthologous transcripts, chooses sequence type (protein/CDS/
   genomic + flanking offsets), and output format.
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
- **Expiration:** per `lib-compute-platform`'s readme, job results are pruned after a
  configurable idle period (30 days by default) and the job record moves to `expired`.
  Resubmitting the _identical_ request via `POST` transparently restarts an expired job under
  the same content-addressed `jobID` — this is the platform's actual "rerun" mechanism, not a
  distinct endpoint. That means a `GET /jobs/{id}` poll can only ever observe `expired` on a
  job nobody has resubmitted since it lapsed — practically, a bookmarked/returned-to
  `/result/:jobId` page, since that path only ever calls `GET`, never re-`POST`s (see the
  Confirm dialog and results-page behavior below). The client cannot itself resubmit in that
  situation: the page holds only the `jobId` from the URL, not the original `Feature[]`/
  `msaOptions` that produced it, and the service never echoes those back. Restarting a
  bookmarked job by ID alone would need a new endpoint that doesn't exist today — tracked as a
  backend follow-up, not something this design can build around (see Non-goals). Whether a
  data release should also purge/expire jobs (independent of the 30-day idle prune) is a
  separate backend/ops concern, also tracked in Non-goals.

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
consequence of the table's data shape. Submit the IDs as the ID-list parameter to the existing
`GeneByLocusTag` search (confirmed: despite the gene-sounding name, this search — like "gene"
searches generally in this model — returns a transcript-level answer, so it is exactly the
right search for a list of transcript IDs, not a workaround), requesting the `bedReporter`
report format via `wdkService.getTemporaryResultPath(answerSpec, 'bedReporter',
reportConfig)` — the same mechanism `gene-list-export-utils.tsx` already uses with
`'attributesTabular'`. Fetch the resulting BED text from `/temporary-results/{id}` and parse
it into `Feature[]`. This reuses an existing search and reporter rather than adding a new WDK
attribute-fetch call.

The Orthologs table is simply the first caller of this resolver, not something the resolver is
aware of or specialized for. Any other place in the UI that ends up with a list of transcript
IDs — a different table, a basket, a step result — can call the same
`resolveTranscriptFeatures` with no changes.

#### Orthologs table: selection requires "one transcript per gene"

MSA alignment across multiple transcripts of the _same_ gene isn't a meaningful operation —
an alignment is meant to compare orthologs across genes, one representative sequence per gene.
So checking a transcript row must require the table's existing "Show only one transcript per
gene" toggle to be on first; this isn't an independent feature, it's a precondition for
selection.

- **Toggle off, user clicks a checkbox:** the check does not take effect (the row does not
  become selected). Show "Select one-per-gene first" as feedback. This is a hard gate, not a
  disabled-looking control — no selection can be made at all while the toggle is off.
- **Toggle on, then user unchecks it after already selecting rows:** existing selections are
  left alone; only _new_ checkbox clicks are blocked while the toggle is off. Submission stays
  available with whatever was already selected.
- This sidesteps a harder problem entirely: with the toggle enforced at selection time, only
  one transcript row per gene is ever selectable in the first place, so there's no scenario
  where the user has checked two transcripts of the same gene and the resolver has to pick a
  winner between them.
- This also means the toggle's own correctness now matters for submission, not just display
  — see the note on `transcript_length` below.

**Aside, not part of the client-side design above:** the toggle
(`GeneRecordClasses.GeneRecordClass.jsx:1569-1601`) currently dedups by comparing
`protein_length`, which does not reliably select the longest transcript. A fix is planned
separately (an internal `transcript_length` attribute, not shown as a column but readable from
row data client-side, the same way `sort_key` already is via `SortKeyTable`).

#### Orthologs table: `sequenceType` carries over from the existing radio button unchanged

The old form's `sequence_Type` radio (protein/CDS/genomic, plus upstream/downstream flanking
offsets when genomic) is preserved as-is — same options, same default (protein when the gene
is protein-coding, genomic otherwise, per `GeneRecordClasses.GeneRecordClass.jsx:1757,1773`).
This is a straight carryover, not a new decision: the radio's choice maps directly to the
`sequenceType` path segment on `POST /sequences-async/{sequenceType}`.

**Popset and ortho-site (follow-on, same shape):** each needs its own `IdList search +
bed-capable reporter` (or, for ortho-site, a "whole sequence" resolver producing
`{contig: accession, start: 0, end: length}` per selected protein). Note: today Popset's old
CGI form posts `sid`/`start`/`end` hidden inputs that are never populated (dead fields) — so
this isn't a like-for-like migration for Popset, it's a fix. Building the real resolver is
separate work; this design defines the interface it must satisfy (`Promise<Feature[]>`) and
scopes only `resolveTranscriptFeatures` for initial implementation.

### 2. Shared submit/poll/results package

New package, `packages/libs/compute-platform-job`, following the `multi-blast` package as a
structural template (a standalone lib each site imports and wires into its own routes, the way
`packages/sites/ortho-site/.../blastRoutes.tsx` imports `@veupathdb/multi-blast`). Named after
`lib-compute-platform` specifically, not "compute jobs" generically — BLAST and EDA already
have their own compute-job UIs, on different, incompatible backend contracts (BLAST's own
bespoke `/jobs`/`/reports` service; EDA wraps `lib-compute-platform` behind its own
`/computes/{name}` API rather than exposing the generic shape). This package is the client for
`lib-compute-platform`'s generic job REST shape itself (submit → `GET /jobs/{id}` →
`GET /jobs/{id}/files`), reusable by any future service that exposes that shape directly, the
way `service-sequence-retrieval` does — not a third, competing "compute job" package.

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
- **Restarting an expired job from just its `jobId`.** No such endpoint exists in
  `service-sequence-retrieval` today, so a bookmarked `/result/:jobId` page that hits `expired`
  has no way to recover on its own; it shows a terminal state directing the user back to
  reselect and resubmit. This is confirmed buildable, though: `lib-compute-platform`'s
  `AsyncJob.config` (the original submitted request) is preserved in Postgres even after a job
  expires — only the S3-side output/config copy is pruned — so `service-sequence-retrieval`
  could add a `POST /jobs/{id}/rerun`-style endpoint using only `lib-compute-platform`'s
  existing public API (`AsyncPlatform.getJob(jobID)` to read back `config`, then
  `AsyncPlatform.submitJob(...)` with that same `jobID`) — no `lib-compute-platform` change
  needed. Still a backend feature request outside this design's scope, but a small, well-
  scoped, service-local one rather than an open-ended ask.
- **Data-release-driven job expiration/purging.** Flagged as desired (expire all jobs on new
  data release, ~every 2 months) but this is backend/ops policy (a queue purge or TTL
  configured around the release cadence), not something the client can or should enforce.
  Tracked as a follow-up outside this design's scope.
- **A jobs history/list page.** Not requested; the shared package only needs the single
  result-by-ID route.
