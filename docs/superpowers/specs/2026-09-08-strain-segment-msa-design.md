# Design: Strain-segment MSA/FASTA for Gene and Variant pages

**Date:** 2026-09-08
**Branch:** isolates-msa
**Status:** Designed, not implemented

## Context

The Variant record page currently embeds `<VariantStrainFilter />`
(`packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/common/VariantStrainFilter.tsx`),
rendered from `VariantRecordClasses.VariantRecordClass.jsx:5`'s `RecordAttributeSection`
override when the record's `variant_strain_form` attribute is present
(`componentWrappers.jsx:396` looks up `RecordAttributeSection` per record class by
`recordClass.fullName`, so this override applies only to
`VariantRecordClasses.VariantRecordClass`). **The Gene record page has no such embedding
today** — adding one, alongside fixing Variant's, is part of this design's scope. This
component is broken two ways:

1. It dispatches against the wrong search, `VariantAlignmentForm`, which returns **variants**,
   not strain genomic segments — the wrong shape of result for what this feature needs.
2. It never actually runs a search. `VariantStrainFilter` only renders the `FilterParamNew`
   metadata-filter widget and dispatches `QuestionActions.updateParamValue` on change; nothing
   in the codebase ever submits `VariantAlignmentForm` or reads its answer. It is param-UI-only,
   a dead end with no result.

Separately, the Gene record page's Orthologs table already ships a working async-MSA flow
against `service-sequence-retrieval` (see `docs/superpowers/specs/2026-08-11-async-msa-job-design.md`,
implemented and merged in #1852): selected transcript IDs are resolved to `Feature[]` via a
`bed` report, submitted to the already-built `compute-platform-job` package
(`packages/libs/compute-platform-job`), and the result is shown on a polling results page at
`/workspace/msa/result/:jobId`. This design reuses that infrastructure unchanged.

This design replaces `VariantStrainFilter` with a working feature, embedded identically on
**both** the Gene and Variant record pages: pick a genomic region (defaulted from the record,
user-adjustable) and a metadata filter over strains, then either download the matching strain
segments as FASTA or submit them to Clustal Omega via the existing async MSA infrastructure.

## The `StrainSegmentsByMeta` search

Route: `search/strain-genomic-segment/StrainSegmentsByMeta`. Its rows are strain genomic
segments (intervals on a strain's genomic sequence) — not variants, not genes. Params (from
the WDK model):

| Param                                            | Source in this design                                                                                   | User-editable?                                      |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `organismSinglePick`                             | fixed, from the record's organism attribute (Gene: `organism_full`; Variant: `organism_text`)           | no                                                  |
| `sequenceId`                                     | fixed, from the record's sequence attribute (Gene: `sequence_id`; Variant: `sequence_source_id`)        | no                                                  |
| `sequence_strand` (`SpanParams.sequence_strand`) | UI control, defaults to `+` (forward)                                                                   | **yes**                                             |
| `start_point`                                    | Gene: user-adjustable, defaulted from `start_min`. Variant: computed as `location - offset` (see below) | yes (Gene directly; Variant via the offset control) |
| `end_point_segment`                              | Gene: user-adjustable, defaulted from `end_max`. Variant: computed as `location + offset` (see below)   | yes (Gene directly; Variant via the offset control) |
| `variation_sample_meta`                          | the `FilterParamNew` metadata-filter widget — this _is_ the strain-selection mechanism                  | yes                                                 |
| `eda_sample_table_suffix`                        | backend-set                                                                                             | omitted from client submission entirely             |

Strand is **not** read from any record attribute (no `strand_plus_minus` or similar) in either
the Gene or Variant context — it is purely a UI control defaulting to `+`, identical in both
places. This was a deliberate pivot during design: reading a gene's real strand would have
required either a new default attribute or a `bed`-report lookup (the way Orthologs resolves a
gene's strand), and neither is needed since the user can simply choose it.

`organismSinglePick`/`sequenceId` are the only two attributes read off the record.
**Confirmed: Gene and Variant do not share attribute names.** Gene uses `organism_full`/
`sequence_id`; Variant uses `organism_text`/`sequence_source_id`. The per-record-class seeding
step (below) branches on `recordClassName` to read the correct pair — the search params
(`organismSinglePick`, `sequenceId`) stay identical regardless, only the seeding source
differs.

### Region input differs by record class: Gene is a range, Variant is a point

Gene has a natural start/end range (`start_min`/`end_max`), so its region-input UI is the two
editable `start_point`/`end_point_segment` number inputs described in "The component" below,
defaulted from those two attributes.

Variant has no range — it is a single point on the genome, exposed via a `location` attribute.
There is nothing for a Gene-style start/end pair to default from. Instead, Variant's region
input is a single **offset** number control, defaulting to **1000**, applied symmetrically
around `location` to derive the same two search params Gene uses directly:

- `start_point = location - offset`
- `end_point_segment = location + offset`

This is a genuine UI difference between the two embeddings, not just a different attribute
name to read — `StrainMsaForm` renders a different region-input control depending on which
record class embeds it (Gene: two inputs, start and end; Variant: one input, the offset),
while everything downstream of that (`sequence_strand`, the metadata filter, the FASTA/MSA
radio, submission) is identical between the two.

## What's genuinely new vs. what the Orthologs flow already solved

The Orthologs table only ever needed **backend-plumbing** search execution: given a selection
already on screen (rows from an existing, already-rendered table), resolve IDs to `Feature[]`
via an invisible, fire-and-forget call to `GeneByLocusTag`'s `bed` report
(`resolveTranscriptFeatures.ts`). The user never sees or drives that search.

This feature has no pre-existing table to select from — `StrainSegmentsByMeta` **is** the
selection mechanism. Its metadata-filter param is how the user picks which strains they want.
That means, for the first time in this codebase, a record-page component must let the user
drive a search's params directly (not just consume a resolver's output). Explored and
deliberately avoided:

- **No results table, no row selection.** Confirmed with the user: every strain segment
  matching the metadata filter (within the chosen start/end/strand) is auto-included in
  whatever the user submits — there is no intermediate "browse matches, check some" step. This
  avoids having to build the first-ever inline live-search-with-visible-answer widget in this
  codebase (no existing precedent for that combination exists; every current embedding,
  including `VariantStrainFilter`'s own predecessor `SnpsAlignmentForm`, is param-UI-only).
- **No step/answer/strategy is ever created.** Submission calls
  `wdkService.getTemporaryResultPath({searchName: 'StrainSegmentsByMeta', searchConfig}, reportName, reportConfig)`
  directly with the current param values, exactly mirroring `resolveTranscriptFeatures`'s
  direct-report-fetch style — one-shot, synchronous report fetch, no WDK step ever persisted.
- **One search, one report, no second lookup.** Confirmed: `StrainSegmentsByMeta`'s own answer
  supports both `bed` and `fasta` reports directly. Unlike Orthologs (which needed a second
  search, `GeneByLocusTag`, to turn transcript IDs into BED rows), there is no second search
  here — the same search that filters strains also produces the report.

## Param seeding

Modeled directly on the existing `observeVariantStrainFilter` epic
(`packages/sites/genomics-site/webapp/wdkCustomization/js/client/storeModules/Record.js:329`),
which today seeds `VariantAlignmentForm`'s one param (`organismSinglePick`) from
`record.attributes.organism_text` whenever a Variant record loads. This design uses a single
epic covering both record classes (since the seeding logic is otherwise identical), branching
on `recordClassName` to pick the right attribute names — Gene's `organism_full`/`sequence_id`
or Variant's `organism_text`/`sequence_source_id` — then dispatching the same shape of action
either way:

```js
QuestionActions.updateActiveQuestion({
  searchName: 'StrainSegmentsByMeta',
  initialParamData: {
    organismSinglePick,
    sequenceId,
    sequence_strand: '+',
    variation_sample_meta: JSON.stringify({ filters: [] }),
  },
});
```

`eda_sample_table_suffix` is never included — omitted entirely from `initialParamData` and
from the later submission payload, trusting the backend to fill it in.

Since `RecordAttributeSection` is looked up per-record-class
(`componentWrappers.jsx:396`, `findComponent('RecordAttributeSection', props.recordClass.fullName)`)
and each record class file exports its own override, there is no single shared wrapper
component to embed from. `VariantRecordClasses.VariantRecordClass.jsx:5-24`'s existing
`RecordAttributeSection`/`StrainFilterSection` case is retargeted to render the new shared
inner component (see below) instead of `VariantStrainFilter`. `GeneRecordClasses.GeneRecordClass.jsx:463`'s
`RecordAttributeSection` gets a new, analogous case added — it has no strain-related case
today — gated on a new WDK-model attribute on the Gene record class, mirroring Variant's own
`variant_strain_form` gate. Confirmed name: **`strain_msa_form`** (the same name is used on
both Gene and Variant). **This remains a backend dependency**: the attribute does not exist yet
on Gene and must be added to the Gene record model before the client-side gating case can be
wired, even though its name is now settled.

## The component (replaces `VariantStrainFilter`)

New shared component (exact name/location TBD at planning time, e.g.
`packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/common/StrainMsaForm.tsx`),
embedded from both record classes' `RecordAttributeSection`. Reads
`state.question.questions['StrainSegmentsByMeta']` the same way `VariantStrainFilter` reads
its question state today (`get(state.question, ['questions', 'StrainSegmentsByMeta'], undefined)`),
rendering nothing until `questionStatus === 'complete'`.

Renders:

- **Region input, which differs by record class** (see above): on Gene, editable `start_point`/
  `end_point_segment` number inputs; on Variant, a single editable offset number input
  (default `1000`) that computes `start_point`/`end_point_segment` from the record's `location`
  attribute. Either way, dispatching `QuestionActions.updateParamValue` on change to update the
  same two underlying search params.
- A `sequence_strand` +/- radio or toggle, default `+`, same dispatch pattern.
- The `FilterParamNew` widget bound to `variation_sample_meta` — this part is a direct carry
  from today's `VariantStrainFilter`, just retargeted at the new search/param name.
- A FASTA/MSA radio.
- A submit control.

`organismSinglePick`/`sequenceId` are never rendered — passed through silently as fixed values
seeded by the epic above; the user has no way to see or change them.

## Submit handling

On submit, read the current `paramValues` off `state.question.questions['StrainSegmentsByMeta']`
(via `connect`/`useSelector`, same slot the component already reads for rendering), build
`searchConfig.parameters` from all six client-known params (`eda_sample_table_suffix`
excluded), and call:

```ts
wdkService.getTemporaryResultPath(
  { searchName: 'StrainSegmentsByMeta', searchConfig: { parameters } },
  reportName,
  reportConfig
);
```

No step, no answer, no strategy — a one-shot report fetch, exactly like
`resolveTranscriptFeatures`'s call against `GeneByLocusTag`.

### FASTA path (`reportName: 'fasta'`)

Synchronous, no compute-platform-job involvement (no async-job precedent exists anywhere in
this codebase for bare FASTA, and none is needed here). Pre-open a blank tab before the
`await` (`window.open('about:blank', '_blank')`, the same popup-blocker-safe trick
`TranscriptMsaSubmission.handleConfirm` already uses for Orthologs), fetch the temporary-result
URL as text, write it into that tab via `location.replace` on success or `.close()` on error.
No `ClustalAlignmentForm` confirm dialog — this isn't a multi-minute job, there's nothing to
warn about.

### MSA path (`reportName: 'bed'`)

Fetch BED text, parse to `Feature[]` via `parseBedToFeatures` — extracted from its current
private location inside `resolveTranscriptFeatures.ts` into a shared util (see Shared pieces
below), reused verbatim rather than reimplemented.

Wrap the submit control in `ClustalAlignmentForm` (`sequenceType="strain segments"`, default
warn/block thresholds — no per-sequence-type tuning need here, unlike Orthologs' genomic/CDS/
protein split). `onConfirm`:

```ts
const api = SequenceRetrievalApi.getClient(
  SEQUENCE_RETRIEVAL_BASE_URL,
  wdkService
);
const job = await api.submitJob('dnaseq', {
  features,
  postProcess: 'MSA',
  msaOptions: { format: 'clustal' },
});
```

`sequenceType` is always the literal `'dnaseq'` (the sequence-retrieval service's fixed name
for the FASTA index containing strain sequence) and `msaOptions.format` is always `'clustal'`
— per explicit instruction, there is no MSA configuration exposed to the user at all (no
sequence-type radio, no output-format choice, no flanking offsets). Navigation reuses the
pre-opened-tab pattern, landing on the existing `/workspace/msa/result/:jobId` page — zero
changes to `compute-platform-job`, `ComputeJobPage`, or `ComputeJobRouter`.

## Shared pieces factored out of the Orthologs implementation

Two pieces of the existing Orthologs code are reused verbatim by this feature and should be
extracted to a shared location (exact path TBD at planning time, candidate:
`packages/libs/web-common/src/util/`):

- **`parseBedToFeatures`** — currently a private function inside
  `resolveTranscriptFeatures.ts`. Pure BED-text-to-`Feature[]` parser; both features need
  identical parsing since both consume the same `bed` report shape.
- **The pre-opened-tab submit/navigate pattern** — currently inlined in
  `TranscriptMsaSubmission.handleConfirm` (open blank tab before awaiting async work, replace
  its location with the result URL on success, close it on error). Both features do
  submit-job → get `jobID` → build result URL → replace tab in the same shape; worth a small
  shared helper (signature TBD at planning time, e.g. taking the `SequenceRetrievalApi`
  instance, `sequenceType`, `Feature[]`, MSA format, and the result-route base) rather than a
  second inlined copy.

Explicitly **not** shared, because the mechanisms are genuinely different:

- **`resolveTranscriptFeatures` itself.** Orthologs resolves a plain ID list by uploading a WDK
  dataset and querying a _second_ search (`GeneByLocusTag`)'s `bed` report. This feature never
  uploads a dataset and never queries a second search — `StrainSegmentsByMeta`'s own answer is
  the report source. They share only the output type (`Feature[]`) and the BED-parsing step
  above, not the resolution mechanism.
- **`ClustalAlignmentForm`, `SequenceRetrievalApi`, `compute-platform-job`.** Already fully
  shared as-is (no code changes needed) — not "factored out" so much as already-shared
  infrastructure this feature consumes unchanged.

## Non-goals

- **No results table or row-level selection.** The metadata filter is the entire selection
  mechanism; every matching strain segment (within the chosen region/strand) is included.
- **No MSA configuration.** Always `dnaseq` sequence type, always `clustal` output format — no
  sequence-type radio, no flanking-offset inputs, no output-format choice (unlike Orthologs).
- **No gene/variant strand attribute.** Strand is purely a UI control defaulting to `+`; no
  new backend attribute is required for this design (a prior draft considered reading a real
  `strand_plus_minus` attribute or resolving it via a `bed`-report lookup — both dropped).
- **No changes to `compute-platform-job`, `ClustalAlignmentForm`, or any Orthologs code path**
  beyond extracting the two shared pieces above into a shared location.

## Backend dependencies

- **A new gating attribute on the Gene record model**, mirroring Variant's
  `variant_strain_form`, needed for `GeneRecordClasses.GeneRecordClass.jsx`'s
  `RecordAttributeSection` to know when to render the new section. Confirmed name:
  **`strain_msa_form`** (the same name is used on both Gene and Variant). Does not exist yet on
  Gene — the user is adding it to the backend model separately; this remains a blocking
  dependency for the Gene-embedding task specifically, even though the name is now settled.
- **Variant record attribute names, confirmed.** Variant does **not** expose the same attribute
  names as Gene. Gene uses `organism_full`/`sequence_id`; Variant uses
  `organism_text`/`sequence_source_id`. The per-record-class seeding epic (see Param seeding)
  must read the correct pair for whichever record class fired it — it cannot use one shared
  attribute-name pair for both.
