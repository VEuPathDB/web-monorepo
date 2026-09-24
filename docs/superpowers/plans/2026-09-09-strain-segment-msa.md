# Strain-Segment MSA/FASTA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the broken `VariantStrainFilter` prototype with a working feature, embedded on both the Gene and Variant record pages, that lets a user pick a genomic region and a metadata filter over strains, then either download the matching strain segments as FASTA or submit them to Clustal Omega via the existing async MSA infrastructure.

**Architecture:** A new shared component (`StrainMsaForm`) renders editable start/end/strand controls plus the existing `FilterParamNew` metadata-filter widget, backed by the standard `updateActiveQuestion`/`updateParamValue` Redux flow against a new search, `StrainSegmentsByMeta`. Two new per-record-class epics seed that search's fixed params (organism, sequence ID) from each record's own attributes. On submit, the component calls `wdkService.getTemporaryResultPath` directly against `StrainSegmentsByMeta` — no step, no answer, no results table — requesting either a `fasta` report (shown in a new tab) or a `bed` report (parsed to `Feature[]` and submitted to the already-shipped `compute-platform-job` async-job flow, exactly as the Gene page's Orthologs table already does). Two small pieces of the existing Orthologs code (`parseBedToFeatures`, the pre-opened-tab submit/navigate pattern) are extracted into a new shared util so neither feature carries a duplicate copy.

**Tech Stack:** TypeScript, React, Redux (`connect`/`react-redux`), RxJS epics, `@veupathdb/wdk-client` (`WdkService`, `QuestionActions`, `FilterParamNew`), `@veupathdb/compute-platform-job` (`SequenceRetrievalApi`), `@veupathdb/web-common` (`ClustalAlignmentForm`), Jest.

**Spec:** `docs/superpowers/specs/2026-09-08-strain-segment-msa-design.md`

## Global Constraints

- `sequenceType` for the seq-ret-service submission is always the literal `'dnaseq'` — never invent a different value or make it configurable.
- `msaOptions.format` is always `'clustal'` — no output-format choice, unlike the Orthologs feature.
- No results table, no row selection, no per-row checkboxes anywhere in this feature — every strain segment matching the current params is included automatically.
- No step/answer/strategy is ever created for `StrainSegmentsByMeta`. Submission is always a direct `wdkService.getTemporaryResultPath({searchName: 'StrainSegmentsByMeta', searchConfig}, reportName, reportConfig)` call — never `QuestionActions.submitQuestion`.
- `eda_sample_table_suffix` is never sent by the client — omit it from `initialParamData` and from the submit payload's `searchConfig.parameters` in every task that touches either.
- Strand (`sequence_strand`) is a plain UI control defaulting to `+`. Never read strand from a record attribute (no `strand_plus_minus` lookup, no `bed`-report resolution) in either the Gene or Variant context.
- `organismSinglePick`/`sequenceId` are fixed, non-editable values seeded from the record's own attributes — never rendered as UI controls. The source attribute names differ per record class: Gene uses `organism_full`/`sequence_id`; Variant uses `organism_text`/`sequence_source_id`.
- Region input differs by record class and is never unified into one shared UI shape: Gene renders editable start/end inputs defaulted from `start_min`/`end_max`; Variant renders a single editable offset input (default `1000`) applied symmetrically around its `location` attribute (`start_point = location - offset`, `end_point_segment = location + offset`). `StrainMsaForm` receives `record` as an explicit prop from its caller (never reads it from Redux) specifically so it can branch on `record.recordClassName` for this.
- Do not modify `compute-platform-job`, `ClustalAlignmentForm`, or any Orthologs code path except the one extraction this plan calls for (`parseBedToFeatures` and the tab-submit helper moving to a shared location).
- New files are `.ts`/`.tsx`, never `.js`/`.jsx` (per this repo's CLAUDE.md), even though several files this plan edits (`Record.js`, `GeneRecordClasses.GeneRecordClass.jsx`, `VariantRecordClasses.VariantRecordClass.jsx`) are existing `.js`/`.jsx` — those are edited in place, not converted, per Task boundaries below.

---

## File Structure

**New in `packages/libs/web-common/src/util/`** (shared pieces extracted from the Orthologs implementation, reused by both Orthologs and this feature):

- `msaJobSubmission.ts` — `parseBedToFeatures(bedText: string): Feature[]` and `fetchTemporaryResultText(temporaryResultPath: string): Promise<string>` (both moved from `resolveTranscriptFeatures.ts`, now exported), plus `submitClustalMsaJob(...)` (the pre-opened-tab submit/navigate helper, extracted from `TranscriptMsaSubmission.handleConfirm`).
- `msaJobSubmission.test.ts` — tests for all three functions.

**New in `packages/sites/genomics-site/webapp/wdkCustomization/js/client/`:**

- `components/common/StrainMsaForm.tsx` — the new shared component, embedded from both Gene and Variant record classes.
- `components/common/StrainMsaForm.test.tsx` — component tests.

**Modified in `packages/sites/genomics-site/webapp/wdkCustomization/js/client/`:**

- `util/resolveTranscriptFeatures.ts` — remove the private `parseBedToFeatures` and `fetchTemporaryResultText`, import both shared versions from `web-common` instead.
- `util/resolveTranscriptFeatures.test.ts` — unaffected in behavior; no changes expected (still tests the public `resolveTranscriptFeatures` function).
- `storeModules/Record.js` — add `observeStrainMsaFilter`, keyed on both Gene and Variant record classes, wired into `observe()`.
- `components/records/GeneRecordClasses.GeneRecordClass.jsx` — add a new `case` to the existing `RecordAttributeSection` switch, rendering `StrainMsaForm` inside a `CollapsibleSection`.
- `components/records/VariantRecordClasses.VariantRecordClass.jsx` — retarget `StrainFilterSection` to render `StrainMsaForm` instead of `VariantStrainFilter`.
- `components/records/GeneRecordClasses.GeneRecordClass.jsx`'s `TranscriptMsaSubmission.handleConfirm` — replaced with a call to the new shared `submitClustalMsaJob` helper (behavior-preserving refactor).

**Deleted:**

- `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/common/VariantStrainFilter.tsx` — fully superseded by `StrainMsaForm`.

**Not modified:** `compute-platform-job` (any file), `ClustalAlignmentForm.tsx`, `computeJobRoutes.tsx`, `routes.jsx` (the existing `/workspace/msa` mount already covers this feature's MSA result page — no new route needed).

---

## Task 1: Extract `parseBedToFeatures` into a shared util

**Files:**

- Create: `packages/libs/web-common/src/util/msaJobSubmission.ts`
- Test: `packages/libs/web-common/src/util/msaJobSubmission.test.ts`
- Modify: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/util/resolveTranscriptFeatures.ts`

**Interfaces:**

- Consumes: `Feature` from `@veupathdb/compute-platform-job/src/lib/Service/ServiceTypes` (same deep-import path already used by `resolveTranscriptFeatures.ts`); `endpoint` from `@veupathdb/web-common/lib/config`.
- Produces: `parseBedToFeatures(bedText: string): Feature[]` and `fetchTemporaryResultText(temporaryResultPath: string): Promise<string>`. Task 6 (`StrainMsaForm`'s FASTA/MSA submit paths) and `resolveTranscriptFeatures.ts` (modified in this task) both import both functions from `@veupathdb/web-common/lib/util/msaJobSubmission` — this task extracts `fetchTemporaryResultText` alongside `parseBedToFeatures` specifically so Task 6 does not need a second, duplicate copy of it.

- [ ] **Step 1: Write the failing test for `parseBedToFeatures`**

This is a direct copy of the existing BED-parsing assertions already proven correct in `resolveTranscriptFeatures.test.ts` (the function's behavior is not changing, only its location/export status):

```typescript
// packages/libs/web-common/src/util/msaJobSubmission.test.ts
import { parseBedToFeatures } from './msaJobSubmission';

describe('parseBedToFeatures', () => {
  it('parses a single BED line into a Feature', () => {
    const features = parseBedToFeatures(
      'PF3D7_0200300\t100\t500\tPF3D7_0200300.1\t0\t+\n'
    );

    expect(features).toEqual([
      {
        contig: 'PF3D7_0200300',
        start: 100,
        end: 500,
        query: 'PF3D7_0200300.1',
        strand: 'POSITIVE',
      },
    ]);
  });

  it('parses multiple BED lines, one Feature per line', () => {
    const features = parseBedToFeatures(
      'PF3D7_0200300\t100\t500\tPF3D7_0200300.1\t0\t+\n' +
        'PF3D7_0300400\t200\t900\tPF3D7_0300400.1\t0\t-\n'
    );

    expect(features).toHaveLength(2);
    expect(features[1]).toEqual({
      contig: 'PF3D7_0300400',
      start: 200,
      end: 900,
      query: 'PF3D7_0300400.1',
      strand: 'NEGATIVE',
    });
  });

  it('skips blank lines', () => {
    const features = parseBedToFeatures(
      'PF3D7_0200300\t100\t500\tPF3D7_0200300.1\t0\t+\n\n'
    );

    expect(features).toHaveLength(1);
  });

  it('maps an unrecognized strand symbol to NONE', () => {
    const features = parseBedToFeatures(
      'PF3D7_0200300\t100\t500\tPF3D7_0200300.1\t0\t.\n'
    );

    expect(features[0].strand).toBe('NONE');
  });
});

describe('fetchTemporaryResultText', () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('GETs the endpoint-relative temporary-result path and returns its text', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue({ text: () => Promise.resolve('>seq1\nACGT\n') });

    const text = await fetchTemporaryResultText('/temporary-results/xyz');

    expect(text).toBe('>seq1\nACGT\n');
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('/temporary-results/xyz');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn --cwd packages/libs/web-common test msaJobSubmission.test.ts`
Expected: FAIL — `Cannot find module './msaJobSubmission'`

- [ ] **Step 3: Write `msaJobSubmission.ts` with `parseBedToFeatures` and `fetchTemporaryResultText`**

```typescript
// packages/libs/web-common/src/util/msaJobSubmission.ts
import { Feature } from '@veupathdb/compute-platform-job/src/lib/Service/ServiceTypes';
import { endpoint } from '../config';

/**
 * Parses standard 6-column BED text (chrom, chromStart, chromEnd, name,
 * score, strand) into Feature[]. Shared by any feature that resolves a WDK
 * 'bed' report into sequence-retrieval-service Feature coordinates.
 */
export function parseBedToFeatures(bedText: string): Feature[] {
  return bedText
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const [chrom, chromStart, chromEnd, name, , strandSymbol] =
        line.split('\t');
      return {
        contig: chrom,
        start: Number(chromStart),
        end: Number(chromEnd),
        query: name,
        strand:
          strandSymbol === '+'
            ? 'POSITIVE'
            : strandSymbol === '-'
            ? 'NEGATIVE'
            : 'NONE',
      } as Feature;
    });
}

/**
 * Temporary-result paths are plain GET-able URLs relative to the WDK
 * service base (the same base the site's own WDK requests use). That base
 * comes from the site's build-time config (window.__SITE_CONFIG__), not
 * from WdkService#getConfig() — the latter's ServiceConfig has no
 * service-base-URL field.
 */
export async function fetchTemporaryResultText(
  temporaryResultPath: string
): Promise<string> {
  const response = await fetch(`${endpoint}${temporaryResultPath}`);
  return response.text();
}
```

Note: `import { endpoint } from '../config';` assumes `web-common`'s own `src/config` module is where `endpoint` is actually defined (`resolveTranscriptFeatures.ts` currently imports it as `@veupathdb/web-common/lib/config`, i.e. from this same package's public entry point) — confirm the correct relative path into `web-common`'s own source tree at implementation time (it may need to be a deeper relative path than `../config` depending on `msaJobSubmission.ts`'s exact directory depth under `src/util/`); the important constraint is that this file must not import its own package's `lib/` (compiled) output via the `@veupathdb/web-common` package-root alias, only a relative `src`-relative import, to avoid a self-referential package import.

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn --cwd packages/libs/web-common test msaJobSubmission.test.ts`
Expected: PASS (5 tests: 4 for `parseBedToFeatures` + 1 for `fetchTemporaryResultText`)

- [ ] **Step 5: Update `resolveTranscriptFeatures.ts` to use the shared exports**

Remove the private `parseBedToFeatures` function (currently lines 109-129) and the private `fetchTemporaryResultText` function (currently lines 102-107); import both from the shared location instead.

```typescript
// packages/sites/genomics-site/webapp/wdkCustomization/js/client/util/resolveTranscriptFeatures.ts
// Replace the existing `import { endpoint } from '@veupathdb/web-common/lib/config';`
// line with:
import {
  fetchTemporaryResultText,
  parseBedToFeatures,
} from '@veupathdb/web-common/lib/util/msaJobSubmission';

// Remove the private `async function fetchTemporaryResultText(...)` block
// (previously lines 102-107) and the private
// `function parseBedToFeatures(bedText: string): Feature[] { ... }` block
// (previously lines 109-129) entirely — the import above replaces both. The
// call sites `fetchTemporaryResultText(temporaryResultPath)` and
// `parseBedToFeatures(bedText)` inside `resolveTranscriptFeatures` itself
// are unchanged.
```

- [ ] **Step 6: Run `resolveTranscriptFeatures`'s existing tests to verify no regression**

Run: `yarn --cwd packages/sites/genomics-site test resolveTranscriptFeatures.test.ts`
Expected: PASS (all existing tests, unchanged — this step only relocated a private helper, the public function's behavior is identical)

- [ ] **Step 7: Commit**

```bash
git add packages/libs/web-common/src/util/msaJobSubmission.ts \
  packages/libs/web-common/src/util/msaJobSubmission.test.ts \
  packages/sites/genomics-site/webapp/wdkCustomization/js/client/util/resolveTranscriptFeatures.ts
git commit -m "Extract parseBedToFeatures into shared web-common util"
```

---

## Task 2: Extract the pre-opened-tab MSA submit/navigate helper

**Files:**

- Modify: `packages/libs/web-common/src/util/msaJobSubmission.ts`
- Modify: `packages/libs/web-common/src/util/msaJobSubmission.test.ts`

**Interfaces:**

- Consumes: `SequenceRetrievalApi` and `Feature`, `MsaFormat` from `@veupathdb/compute-platform-job/src/lib/Service/*` (same deep-import convention already established); no dependency on WDK or React.
- Produces: `submitClustalMsaJob(options): Promise<void>` (exact signature below). Task 3 (Orthologs refactor) and Task 6 (`StrainMsaForm`'s MSA path) both call it.

- [ ] **Step 1: Write the failing tests**

The pre-opened-tab pattern is tested by injecting a fake `window.open` (returning a fake tab object) and a fake `SequenceRetrievalApi`-shaped object, so the test never touches a real browser window:

```typescript
// packages/libs/web-common/src/util/msaJobSubmission.test.ts
// (add to the existing file from Task 1 — new import + new describe block)
import { submitClustalMsaJob } from './msaJobSubmission';

function makeFakeTab() {
  return { location: { replace: jest.fn() }, close: jest.fn() };
}

function makeFakeApi(job: { jobID: string }) {
  return { submitJob: jest.fn().mockResolvedValue(job) } as any;
}

describe('submitClustalMsaJob', () => {
  const originalOpen = window.open;
  afterEach(() => {
    window.open = originalOpen;
  });

  it('opens a blank tab before submitting, then navigates it to the result URL', async () => {
    const fakeTab = makeFakeTab();
    window.open = jest.fn().mockReturnValue(fakeTab);
    const api = makeFakeApi({ jobID: 'abc123' });
    const features = [{ contig: 'x', start: 0, end: 10 }];

    await submitClustalMsaJob({
      api,
      sequenceType: 'dnaseq',
      features,
      msaFormat: 'clustal',
      resultRouteBase: '/app/workspace/msa',
      paramsSummary: '5 Strain Segments',
    });

    expect(window.open).toHaveBeenCalledWith('about:blank', '_blank');
    expect(api.submitJob).toHaveBeenCalledWith('dnaseq', {
      features,
      postProcess: 'MSA',
      msaOptions: { format: 'clustal' },
    });
    expect(fakeTab.location.replace).toHaveBeenCalledTimes(1);
    const [navigatedUrl] = fakeTab.location.replace.mock.calls[0];
    expect(navigatedUrl).toContain('/app/workspace/msa/result/abc123');
    expect(navigatedUrl).toContain('paramsSummary=');
    expect(navigatedUrl).toContain('format=clustal');
  });

  it('closes the tab and rethrows if submitJob rejects', async () => {
    const fakeTab = makeFakeTab();
    window.open = jest.fn().mockReturnValue(fakeTab);
    const api = {
      submitJob: jest.fn().mockRejectedValue(new Error('service down')),
    } as any;

    await expect(
      submitClustalMsaJob({
        api,
        sequenceType: 'dnaseq',
        features: [],
        msaFormat: 'clustal',
        resultRouteBase: '/app/workspace/msa',
        paramsSummary: '0 Strain Segments',
      })
    ).rejects.toThrow('service down');

    expect(fakeTab.close).toHaveBeenCalledTimes(1);
    expect(fakeTab.location.replace).not.toHaveBeenCalled();
  });

  it('does not throw if window.open returns null (popup blocked)', async () => {
    window.open = jest.fn().mockReturnValue(null);
    const api = makeFakeApi({ jobID: 'abc123' });

    await expect(
      submitClustalMsaJob({
        api,
        sequenceType: 'dnaseq',
        features: [],
        msaFormat: 'clustal',
        resultRouteBase: '/app/workspace/msa',
        paramsSummary: '0 Strain Segments',
      })
    ).resolves.toBeUndefined();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `yarn --cwd packages/libs/web-common test msaJobSubmission.test.ts`
Expected: FAIL — `submitClustalMsaJob is not a function` (or `undefined`)

- [ ] **Step 3: Write `submitClustalMsaJob`**

Extracted from `TranscriptMsaSubmission.handleConfirm`'s current body (`GeneRecordClasses.GeneRecordClass.jsx:1676-1757`), generalized to take the caller's own `sequenceType`/`features`/`msaFormat`/route base/summary rather than hardcoding Orthologs' own values:

```typescript
// packages/libs/web-common/src/util/msaJobSubmission.ts
// (add below parseBedToFeatures in the same file)
import { SequenceRetrievalApi } from '@veupathdb/compute-platform-job/src/lib/Service/SequenceRetrievalApi';
import {
  MsaFormat,
  SequenceType,
} from '@veupathdb/compute-platform-job/src/lib/Service/ServiceTypes';

interface SubmitClustalMsaJobOptions {
  api: SequenceRetrievalApi;
  sequenceType: SequenceType;
  features: Feature[];
  msaFormat: MsaFormat;
  /** e.g. "/app/workspace/msa" — the result path is `${resultRouteBase}/result/${jobID}`. */
  resultRouteBase: string;
  /** Shown on the result page; e.g. "13 Transcripts, CLUSTAL output format". */
  paramsSummary: string;
}

/**
 * Submits an MSA job and navigates a pre-opened tab to its result page.
 *
 * The tab must be opened synchronously by the caller's event handler,
 * before any await, or browsers may treat it as no longer "in direct
 * response to a user gesture" and silently block it as a popup — this
 * function itself does the opening (as its very first, synchronous
 * statement) so every caller gets that guarantee for free.
 */
export async function submitClustalMsaJob({
  api,
  sequenceType,
  features,
  msaFormat,
  resultRouteBase,
  paramsSummary,
}: SubmitClustalMsaJobOptions): Promise<void> {
  const resultTab = window.open('about:blank', '_blank');

  try {
    const job = await api.submitJob(sequenceType, {
      features,
      postProcess: 'MSA',
      msaOptions: { format: msaFormat },
    });

    // The already-open tab can't receive React Router location.state, so
    // paramsSummary/format travel as query params instead.
    const resultUrl = new URL(
      `${window.location.origin}${resultRouteBase}/result/${job.jobID}`
    );
    resultUrl.searchParams.set('paramsSummary', paramsSummary);
    resultUrl.searchParams.set('format', msaFormat);
    if (resultTab) {
      resultTab.location.replace(resultUrl.toString());
    }
  } catch (error) {
    // Don't leave a dead blank tab open if submit fails — the caller's own
    // confirm-dialog error handling shows the failure in the original tab.
    if (resultTab) {
      resultTab.close();
    }
    throw error;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn --cwd packages/libs/web-common test msaJobSubmission.test.ts`
Expected: PASS (7 tests total: 4 from Task 1 + 3 from this task)

- [ ] **Step 5: Commit**

```bash
git add packages/libs/web-common/src/util/msaJobSubmission.ts \
  packages/libs/web-common/src/util/msaJobSubmission.test.ts
git commit -m "Add submitClustalMsaJob shared helper to web-common"
```

---

## Task 3: Refactor Orthologs' `TranscriptMsaSubmission` to use the shared helper

**Files:**

- Modify: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/records/GeneRecordClasses.GeneRecordClass.jsx`

**Interfaces:**

- Consumes: `submitClustalMsaJob` from `@veupathdb/web-common/lib/util/msaJobSubmission` (Task 2).
- Produces: no new interface — this is a behavior-preserving refactor of `TranscriptMsaSubmission.handleConfirm`. Nothing later in this plan depends on this task directly, but skipping it would leave a second, diverging copy of the tab-submit logic in the codebase, which the design doc calls out as something to avoid.

This task has no new automated test of its own — `TranscriptMsaSubmission` has no existing unit test to preserve (it's a JSX component embedded deep in a large `.jsx` file with no test file), so correctness is verified by manual smoke-testing the existing Orthologs "Run Clustal Omega" flow after the change (Step 3 below), matching how this code was validated before this plan.

- [ ] **Step 1: Replace `handleConfirm`'s body with a call to `submitClustalMsaJob`**

Current code (`GeneRecordClasses.GeneRecordClass.jsx:1676-1757`) inlines everything `submitClustalMsaJob` now does starting from the `api.submitJob(...)` call onward. Replace it with:

```jsx
// packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/records/GeneRecordClasses.GeneRecordClass.jsx
// Replace the body of handleConfirm (previously lines 1676-1757) with:
const handleConfirm = async () => {
  // sequenceTypeChoice is the radio the user picked (Protein / CDS
  // (spliced) / Genomic). It maps to two different things that don't
  // collapse the same way:
  //  - the bed report's own `type` (coordinate resolution) — CDS needs
  //    its own distinct 'spliced_genomic' value, plus splicedGenomic:
  //    'cds' (always sent, harmless for the other two types).
  //  - the sequenceType path segment submitJob POSTs to — CDS submits
  //    as 'genomic' there, not as its own type.
  const bedReportType =
    sequenceTypeChoice === 'genomic'
      ? 'genomic'
      : sequenceTypeChoice === 'CDS'
      ? 'spliced_genomic'
      : 'protein';
  const sequenceType = sequenceTypeChoice === 'protein' ? 'protein' : 'genomic';

  const resolvedFeatures = await resolveTranscriptFeatures(
    wdkService,
    [sourceId, ...selectedTranscriptIds],
    bedReportType,
    sequenceTypeChoice === 'genomic'
      ? {
          upstream: Number(oneOffset) || 0,
          downstream: Number(twoOffset) || 0,
        }
      : undefined
  );

  const outFormat = CLUSTAL_OUT_FORMAT_TO_MSA_FORMAT[clustalOutFormat];

  // Protein reference sequences have no strand — the service rejects a
  // stranded feature on an unstranded (protein) reference.
  const features =
    sequenceType === 'protein'
      ? resolvedFeatures.map(({ strand, ...feature }) => feature)
      : resolvedFeatures;

  const api = SequenceRetrievalApi.getClient(
    SEQUENCE_RETRIEVAL_BASE_URL,
    wdkService
  );

  await submitClustalMsaJob({
    api,
    sequenceType,
    features,
    msaFormat: outFormat,
    resultRouteBase: `${rootUrl}/workspace/msa`,
    paramsSummary: `${
      selectedTranscriptIds.length + 1
    } Transcripts, ${outFormat.toUpperCase()} output format`,
  });
};
```

Add the new import alongside the existing MSA-related imports (near line 59-61):

```jsx
import { submitClustalMsaJob } from '@veupathdb/web-common/lib/util/msaJobSubmission';
```

- [ ] **Step 2: Verify the file still compiles**

Run: `yarn --cwd packages/sites/genomics-site compile:check` (the site's own type-check script, `tsc --noEmit` under the hood — confirmed at `packages/sites/genomics-site/package.json:15`)
Expected: no new type errors introduced by this change (the file is `.jsx`, so this mainly catches import-resolution issues, not full type-checking of the JSX body).

- [ ] **Step 3: Manually smoke-test the Orthologs "Run Clustal Omega" flow**

Since this task has no automated regression test, manually verify the existing behavior is unchanged: on a Gene record page with orthologs, select 2+ transcript rows, click "Run Clustal Omega for selected genes", confirm the dialog, and verify a new tab opens and eventually shows/redirects to the MSA result page exactly as before this refactor (this is a pre-existing, already-working flow — this task only changes where its code lives, not what it does).

- [ ] **Step 4: Commit**

```bash
git add packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/records/GeneRecordClasses.GeneRecordClass.jsx
git commit -m "Refactor Orthologs MSA submission to use shared submitClustalMsaJob helper"
```

---

## Task 4: `observeStrainMsaFilter` epic (Gene + Variant param seeding)

**Files:**

- Modify: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/storeModules/Record.js`
- Test: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/storeModules/Record.test.js`

**Interfaces:**

- Consumes: `RecordActions.RECORD_UPDATE`, `QuestionActions.updateActiveQuestion` (both already imported in this file).
- Produces: `observeStrainMsaFilter(action$)` wired into `observe()`. Nothing later in this plan directly imports this function (epics are consumed by the Redux store setup, not by other modules) — Task 6/7's `StrainMsaForm` relies on its _effect_ (that `state.question.questions['StrainSegmentsByMeta']` gets populated), not on calling it directly.

No existing test file covers this module today (`Record.js` has no `Record.test.js` currently) — this task creates the first one, scoped only to the new epic, using the same `TestScheduler`-free, plain-Observable-collection style suited to a `merge`/`filter`/`mergeMap`/`map` pipeline over a manually constructed `action$`.

- [ ] **Step 1: Write the failing tests**

```javascript
// packages/sites/genomics-site/webapp/wdkCustomization/js/client/storeModules/Record.test.js
import { of } from 'rxjs';
import { toArray } from 'rxjs/operators';
import {
  RecordActions,
  QuestionActions,
} from '@veupathdb/wdk-client/lib/Actions';
import { observeStrainMsaFilter } from './Record';

function makeRecordUpdateAction(recordClassName, attributes) {
  return {
    type: RecordActions.RECORD_UPDATE,
    payload: {
      record: {
        recordClassName,
        attributes,
      },
    },
  };
}

describe('observeStrainMsaFilter', () => {
  it('seeds StrainSegmentsByMeta from a Gene record', (done) => {
    const action$ = of(
      makeRecordUpdateAction('GeneRecordClasses.GeneRecordClass', {
        organism_full: 'Plasmodium falciparum 3D7',
        sequence_id: 'Pf3D7_11_v3',
      })
    );

    observeStrainMsaFilter(action$)
      .pipe(toArray())
      .subscribe((actions) => {
        expect(actions).toHaveLength(1);
        expect(actions[0]).toEqual({
          type: QuestionActions.UPDATE_ACTIVE_QUESTION,
          payload: {
            searchName: 'StrainSegmentsByMeta',
            initialParamData: {
              organismSinglePick: 'Plasmodium falciparum 3D7',
              sequenceId: 'Pf3D7_11_v3',
              sequence_strand: '+',
              variation_sample_meta: JSON.stringify({ filters: [] }),
            },
          },
        });
        done();
      });
  });

  it('seeds StrainSegmentsByMeta from a Variant record, using Variant-specific attribute names', (done) => {
    const action$ = of(
      makeRecordUpdateAction('VariantRecordClasses.VariantRecordClass', {
        organism_text: 'Plasmodium falciparum 3D7',
        sequence_source_id: 'Pf3D7_11_v3',
      })
    );

    observeStrainMsaFilter(action$)
      .pipe(toArray())
      .subscribe((actions) => {
        expect(actions).toHaveLength(1);
        expect(actions[0].payload.searchName).toBe('StrainSegmentsByMeta');
        expect(actions[0].payload.initialParamData).toEqual(
          expect.objectContaining({
            organismSinglePick: 'Plasmodium falciparum 3D7',
            sequenceId: 'Pf3D7_11_v3',
          })
        );
        done();
      });
  });

  it('emits nothing for an unrelated record class', (done) => {
    const action$ = of(
      makeRecordUpdateAction('PathwayRecordClasses.PathwayRecordClass', {})
    );

    observeStrainMsaFilter(action$)
      .pipe(toArray())
      .subscribe((actions) => {
        expect(actions).toHaveLength(0);
        done();
      });
  });

  it('emits nothing for actions that are not RECORD_UPDATE', (done) => {
    const action$ = of({ type: 'some/other-action' });

    observeStrainMsaFilter(action$)
      .pipe(toArray())
      .subscribe((actions) => {
        expect(actions).toHaveLength(0);
        done();
      });
  });
});
```

`QuestionActions.UPDATE_ACTIVE_QUESTION` is confirmed as the exact exported constant name, value `'question/update-active-question'` (`packages/libs/wdk-client/src/Actions/QuestionActions.ts:38`) — imported directly above rather than hardcoded, so the test can't silently drift from the real action type.

- [ ] **Step 2: Run tests to verify they fail**

Run: `yarn --cwd packages/sites/genomics-site test Record.test.js`
Expected: FAIL — `observeStrainMsaFilter is not exported` (or `undefined`)

- [ ] **Step 3: Write `observeStrainMsaFilter` and wire it into `observe()`**

Modeled directly on `observeVariantStrainFilter` (`Record.js:329-348`) and `isGeneRecord`/`isSnpsRecord` (`Record.js:408-414`), but keyed on either Gene or Variant (a single epic covering both record classes, per the design doc's decision to embed one shared component on both pages):

```javascript
// packages/sites/genomics-site/webapp/wdkCustomization/js/client/storeModules/Record.js
// Add near observeVariantStrainFilter (after its closing brace, ~line 349):

/**
 * Seeds StrainSegmentsByMeta's fixed params (organism, sequence ID) from
 * whichever of Gene or Variant record is currently loaded. Both record
 * classes embed the same StrainMsaForm component and share this one epic
 * rather than each having their own, since the rest of the seeding logic
 * (search name, defaults) is identical — only the source attribute names
 * differ per record class, since Gene and Variant do not share an
 * attribute schema:
 *   - Gene:    organism_full, sequence_id
 *   - Variant: organism_text, sequence_source_id
 *
 * sequence_strand is deliberately NOT read from the record — it's a plain
 * UI control defaulting to '+' here, never resolved from a record
 * attribute (see the design doc's Non-goals).
 */
export function observeStrainMsaFilter(action$) {
  return action$.pipe(
    filter((action) => action.type === RecordActions.RECORD_UPDATE),
    mergeMap((action) => {
      const { record } = action.payload;
      if (isGeneRecord(record)) {
        return of({
          organismSinglePick: record.attributes.organism_full,
          sequenceId: record.attributes.sequence_id,
        });
      }
      if (isVariantRecord(record)) {
        return of({
          organismSinglePick: record.attributes.organism_text,
          sequenceId: record.attributes.sequence_source_id,
        });
      }
      return EMPTY;
    }),
    map(({ organismSinglePick, sequenceId }) =>
      QuestionActions.updateActiveQuestion({
        searchName: 'StrainSegmentsByMeta',
        initialParamData: {
          organismSinglePick,
          sequenceId,
          sequence_strand: '+',
          variation_sample_meta: JSON.stringify({ filters: [] }),
        },
      })
    )
  );
}
```

Add the `isVariantRecord` helper alongside the existing `isGeneRecord`/`isSnpsRecord` (`Record.js:408-414`):

```javascript
function isVariantRecord(record) {
  return record.recordClassName === 'VariantRecordClasses.VariantRecordClass';
}
```

Wire the new epic into `observe()` (`Record.js:39-46`):

```javascript
export function observe(action$, state$, services) {
  return merge(
    RecordStoreModule.observe(action$, state$, services),
    observeSnpsAlignment(action$, state$, services),
    observeVariantStrainFilter(action$, state$, services),
    observeStrainMsaFilter(action$, state$, services),
    observeRequestedOrganisms(action$, state$, services)
  );
}
```

Note: `start_point`/`end_point_segment` are intentionally **not** seeded by this epic — the search's own model definition already defaults `start_point` to `1`, and neither param has one safe default across both record classes: Gene wants `start_min`/`end_max` directly, while Variant wants `location - 1000`/`location + 1000` (see Task 5's `deriveRegion`). Task 5 (`StrainMsaForm`) computes both, branching on `record.recordClassName`, from the `record` prop passed in at each embedding site (Tasks 7-8) — a component-level default, not epic-seeded.

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn --cwd packages/sites/genomics-site test Record.test.js`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add packages/sites/genomics-site/webapp/wdkCustomization/js/client/storeModules/Record.js \
  packages/sites/genomics-site/webapp/wdkCustomization/js/client/storeModules/Record.test.js
git commit -m "Add observeStrainMsaFilter epic seeding StrainSegmentsByMeta from Gene/Variant records"
```

---

## Task 5: `StrainMsaForm` component — rendering only (no submit yet)

**Files:**

- Create: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/common/StrainMsaForm.tsx`
- Test: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/common/StrainMsaForm.test.tsx`

**Interfaces:**

- Consumes: `FilterParamNew` from `@veupathdb/wdk-client/lib/Components`; `QuestionActions` from `@veupathdb/wdk-client/lib/Actions`; `RootState` from `@veupathdb/wdk-client/lib/Core/State/Types`; `isType as isFilterParamNew` from `@veupathdb/wdk-client/lib/Views/Question/Params/FilterParamNew/FilterParamUtils` (all already used by `VariantStrainFilter.tsx` today, same import paths).
- Produces: `StrainMsaForm` (named export), a `connect`-wrapped React component taking one required prop, `record` (the WDK record object — same shape `props.record` has in `RecordAttributeSection`, e.g. `record.recordClassName`/`record.attributes`, the same way `SNPsAlignment` in `GeneRecordClasses.GeneRecordClass.jsx:741` reads `props.record.attributes` directly). `record` is how the component knows which record class it's in for the region-input branching below, without reaching into Redux for something its caller already has. Task 6 adds submit handling to this same component; Tasks 7-8 pass `record` in from each embedding site.

This task builds the rendering half only — region-input (start/end for Gene, a single offset for Variant), strand inputs, and the metadata filter widget — deferring submit/FASTA/MSA handling to Task 6, so each task stays reviewable independently.

**Region input differs by record class** (per the design doc): Gene has a natural start/end
range (`start_min`/`end_max` attributes) and renders two editable number inputs defaulted from
them. Variant is a single point (`location` attribute) with no range to default from, so it
renders one editable **offset** number input (default `1000`), and `start_point`/
`end_point_segment` are always _derived_ from `location ± offset` rather than edited directly.
This task introduces a small `deriveRegion(record)` helper (pure, easily unit-tested in
isolation) that branches on `record.recordClassName` and returns
`{ kind: 'range', start, end } | { kind: 'point', location, offset }`, so the render logic
itself just switches on `region.kind` without repeating the record-class check.

- [ ] **Step 1: Write the failing test**

```typescript
// packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/common/StrainMsaForm.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { StrainMsaForm, deriveRegion } from './StrainMsaForm';

const GENE_RECORD = {
  recordClassName: 'GeneRecordClasses.GeneRecordClass',
  attributes: { start_min: '100', end_max: '5000' },
};

const VARIANT_RECORD = {
  recordClassName: 'VariantRecordClasses.VariantRecordClass',
  attributes: { location: '2500' },
};

function renderWithQuestionState(questionState: unknown, record = GENE_RECORD) {
  const store = createStore((state = { question: { questions: {} } }) => ({
    ...state,
    question: { questions: { StrainSegmentsByMeta: questionState } },
  }));
  return render(
    <Provider store={store}>
      <StrainMsaForm record={record} />
    </Provider>
  );
}

describe('deriveRegion', () => {
  it('returns a range for a Gene record, from start_min/end_max', () => {
    expect(deriveRegion(GENE_RECORD)).toEqual({
      kind: 'range',
      start: '100',
      end: '5000',
    });
  });

  it('returns a point + default 1000 offset for a Variant record, from location', () => {
    expect(deriveRegion(VARIANT_RECORD)).toEqual({
      kind: 'point',
      location: '2500',
      offset: 1000,
    });
  });
});

describe('StrainMsaForm', () => {
  it('renders nothing while the question is not yet loaded', () => {
    const { container } = renderWithQuestionState(undefined);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing while the question status is not complete', () => {
    const { container } = renderWithQuestionState({
      questionStatus: 'loading',
    });
    expect(container).toBeEmptyDOMElement();
  });

  it('renders start/end/strand inputs and the metadata filter for a Gene record', () => {
    const fakeParameter = {
      name: 'variation_sample_meta',
      type: 'filter',
    };
    renderWithQuestionState(
      {
        questionStatus: 'complete',
        question: {
          urlSegment: 'StrainSegmentsByMeta',
          parametersByName: { variation_sample_meta: fakeParameter },
        },
        paramValues: {
          start_point: '100',
          end_point_segment: '5000',
          variation_sample_meta: JSON.stringify({ filters: [] }),
        },
        paramUIState: { variation_sample_meta: {} },
      },
      GENE_RECORD
    );

    expect(screen.getByLabelText(/start/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/offset/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/forward/i)).toBeChecked();
  });

  it('renders a single offset input (not start/end) for a Variant record', () => {
    const fakeParameter = {
      name: 'variation_sample_meta',
      type: 'filter',
    };
    renderWithQuestionState(
      {
        questionStatus: 'complete',
        question: {
          urlSegment: 'StrainSegmentsByMeta',
          parametersByName: { variation_sample_meta: fakeParameter },
        },
        paramValues: {
          start_point: '1500',
          end_point_segment: '3500',
          variation_sample_meta: JSON.stringify({ filters: [] }),
        },
        paramUIState: { variation_sample_meta: {} },
      },
      VARIANT_RECORD
    );

    expect(screen.getByLabelText(/offset/i)).toHaveValue(1000);
    expect(screen.queryByLabelText(/^start$/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^end$/i)).not.toBeInTheDocument();
  });
});
```

Note: `FilterParamNew` itself is not mocked here — `isFilterParamNew(fakeParameter)` (the real type guard, `packages/libs/wdk-client/src/Views/Question/Params/FilterParamNew/FilterParamUtils.ts:31-33`) checks `parameter.type === 'filter'` (confirmed — not `'filter-param-new'`), so the fake parameter object above satisfies that guard. If `FilterParamNew`'s own render still throws on the minimal fake `parameter`/`uiState` shapes above (it has its own internal expectations about ontology data beyond the type discriminant), wrap it in a lightweight `jest.mock('@veupathdb/wdk-client/lib/Components', ...)` that mocks out just `FilterParamNew` as a stub while leaving other named exports (if any are used later in this component) untouched — add this mock only if Step 2/4 reveals it's actually needed, don't add it speculatively.

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn --cwd packages/sites/genomics-site test StrainMsaForm.test.tsx`
Expected: FAIL — `Cannot find module './StrainMsaForm'`

- [ ] **Step 3: Write `StrainMsaForm.tsx` (rendering only)**

```tsx
// packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/common/StrainMsaForm.tsx
import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { FilterParamNew } from '@veupathdb/wdk-client/lib/Components';
import { QuestionActions } from '@veupathdb/wdk-client/lib/Actions';
import { QuestionState } from '@veupathdb/wdk-client/lib/StoreModules/QuestionStoreModule';
import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';
import { DispatchAction } from '@veupathdb/wdk-client/lib/Core/CommonTypes';
import { isType as isFilterParamNew } from '@veupathdb/wdk-client/lib/Views/Question/Params/FilterParamNew/FilterParamUtils';

const SEARCH_NAME = 'StrainSegmentsByMeta';
const METADATA_FILTER_PARAM = 'variation_sample_meta';
const START_PARAM = 'start_point';
const END_PARAM = 'end_point_segment';
const STRAND_PARAM = 'sequence_strand';
const DEFAULT_VARIANT_OFFSET = 1000;

type WdkRecord = {
  recordClassName: string;
  attributes: Record<string, string | null>;
};

type Region =
  | { kind: 'range'; start: string; end: string }
  | { kind: 'point'; location: string; offset: number };

/**
 * Gene has a natural start/end range (start_min/end_max) to default from.
 * Variant is a single point (location) with no range — its region input is
 * a symmetric offset around that point instead, defaulting to 1000nt each
 * direction. Pulled out as its own pure function so the render logic below
 * only has to switch on `region.kind`, not repeat the record-class check.
 */
export function deriveRegion(record: WdkRecord): Region {
  if (record.recordClassName === 'VariantRecordClasses.VariantRecordClass') {
    return {
      kind: 'point',
      location: record.attributes.location ?? '',
      offset: DEFAULT_VARIANT_OFFSET,
    };
  }
  return {
    kind: 'range',
    start: record.attributes.start_min ?? '',
    end: record.attributes.end_max ?? '',
  };
}

type Props = {
  record: WdkRecord;
  dispatch: DispatchAction;
  questionState: QuestionState | undefined;
};

const enhance = connect((state: RootState) => ({
  questionState: get(state.question, ['questions', SEARCH_NAME], undefined),
}));

export const StrainMsaForm = enhance(function StrainMsaForm(props: Props) {
  const { record, dispatch, questionState } = props;

  // Renders nothing until observeStrainMsaFilter has seeded this question.
  if (questionState == null || questionState.questionStatus !== 'complete')
    return null;

  const { question, paramValues, paramUIState } = questionState;
  const searchName = question.urlSegment;
  const filterParameter = question.parametersByName[METADATA_FILTER_PARAM];
  const filterUiState = paramUIState[METADATA_FILTER_PARAM];
  const filterValue = paramValues[METADATA_FILTER_PARAM];

  // FilterParamNew (the component) requires the parameter to be the
  // FilterParamNew parameter variant, not the general Parameter union.
  if (filterParameter == null || !isFilterParamNew(filterParameter))
    return null;

  const updateParam = (paramName: string, paramValue: string) => {
    const parameter = question.parametersByName[paramName];
    if (parameter == null) return;
    dispatch(
      QuestionActions.updateParamValue({
        searchName,
        parameter,
        paramValues,
        paramValue,
      })
    );
  };

  const region = deriveRegion(record);

  const setOffset = (offset: number) => {
    if (region.kind !== 'point') return;
    const location = Number(region.location);
    updateParam(START_PARAM, String(location - offset));
    updateParam(END_PARAM, String(location + offset));
  };

  return (
    <div>
      {region.kind === 'range' ? (
        <div>
          <label>
            Start{' '}
            <input
              type="number"
              value={paramValues[START_PARAM] ?? ''}
              onChange={(e) => updateParam(START_PARAM, e.target.value)}
            />
          </label>
          <label>
            End{' '}
            <input
              type="number"
              value={paramValues[END_PARAM] ?? ''}
              onChange={(e) => updateParam(END_PARAM, e.target.value)}
            />
          </label>
        </div>
      ) : (
        <div>
          <label>
            Offset{' '}
            <input
              type="number"
              value={region.offset}
              onChange={(e) => setOffset(Number(e.target.value))}
            />
          </label>
        </div>
      )}
      <div>
        <label>
          <input
            type="radio"
            name="sequence_strand"
            checked={(paramValues[STRAND_PARAM] ?? '+') === '+'}
            onChange={() => updateParam(STRAND_PARAM, '+')}
          />{' '}
          Forward (+)
        </label>
        <label>
          <input
            type="radio"
            name="sequence_strand"
            checked={paramValues[STRAND_PARAM] === '-'}
            onChange={() => updateParam(STRAND_PARAM, '-')}
          />{' '}
          Reverse (-)
        </label>
      </div>
      <FilterParamNew
        ctx={{ searchName, parameter: filterParameter, paramValues }}
        parameter={filterParameter}
        value={filterValue}
        uiState={filterUiState}
        dispatch={dispatch}
        onParamValueChange={(newValue) =>
          updateParam(METADATA_FILTER_PARAM, newValue)
        }
      />
    </div>
  );
});
```

Note: `region.offset` (the value shown in the offset `<input>`) is `deriveRegion`'s constant
default (`1000`) on every render, not tracked back from `paramValues[START_PARAM]`/
`paramValues[END_PARAM]` — i.e. the offset input's displayed value does not "round-trip" if a
user's edit produces `start`/`end` that don't correspond to a whole-number offset. This is
acceptable for this design (the offset control's job is only to _produce_ symmetric start/end
values, not to reverse-derive an offset from arbitrary ones), but note it as a known limitation
if it comes up in implementation review — the alternative (tracking offset as its own local
`useState`, seeded once from `deriveRegion` and never resynced from `paramValues`) is a valid
fix if this proves surprising in practice, deferred here to keep this task's first cut simple.

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn --cwd packages/sites/genomics-site test StrainMsaForm.test.tsx`
Expected: PASS (6 tests: 2 for `deriveRegion` + 4 for `StrainMsaForm`). If `FilterParamNew`'s render throws on the minimal fixture, apply the `jest.mock` fallback described in Step 1's note, then re-run.

- [ ] **Step 5: Commit**

```bash
git add packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/common/StrainMsaForm.tsx \
  packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/common/StrainMsaForm.test.tsx
git commit -m "Add StrainMsaForm component (rendering only)"
```

---

## Task 6: `StrainMsaForm` submit handling — FASTA and MSA paths

**Files:**

- Modify: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/common/StrainMsaForm.tsx`
- Modify: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/common/StrainMsaForm.test.tsx`

**Interfaces:**

- Consumes: `submitClustalMsaJob`, `parseBedToFeatures`, `fetchTemporaryResultText` from `@veupathdb/web-common/lib/util/msaJobSubmission` (Tasks 1-2); `ClustalAlignmentForm` from `@veupathdb/web-common/lib/components`; `SequenceRetrievalApi` from `@veupathdb/compute-platform-job/src/lib/Service/SequenceRetrievalApi`; `WdkDependenciesContext`/`useNonNullableContext` from `@veupathdb/wdk-client` (same hook pattern as `TranscriptMsaSubmission`); `SEQUENCE_RETRIEVAL_BASE_URL` and `rootUrl` from this site's existing `util/computeJobConfig` and `../../config` respectively.
- Produces: the complete `StrainMsaForm` component (submit-capable). Tasks 7-8 embed this finished component; nothing later adds to its interface.

- [ ] **Step 1: Write the failing tests**

```tsx
// packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/common/StrainMsaForm.test.tsx
// (add to the existing file from Task 5 — new imports + new describe block)
import userEvent from '@testing-library/user-event';
import * as msaJobSubmission from '@veupathdb/web-common/lib/util/msaJobSubmission';

jest.mock(
  '@veupathdb/compute-platform-job/src/lib/Service/SequenceRetrievalApi',
  () => ({
    SequenceRetrievalApi: { getClient: jest.fn().mockReturnValue({}) },
  })
);

function makeCompleteQuestionState(overrides = {}) {
  return {
    questionStatus: 'complete',
    question: {
      urlSegment: 'StrainSegmentsByMeta',
      parametersByName: {
        variation_sample_meta: {
          name: 'variation_sample_meta',
          type: 'filter',
        },
      },
    },
    paramValues: {
      organismSinglePick: 'Plasmodium falciparum 3D7',
      sequenceId: 'Pf3D7_11_v3',
      sequence_strand: '+',
      start_point: '1',
      end_point_segment: '5000',
      variation_sample_meta: JSON.stringify({ filters: [] }),
    },
    paramUIState: { variation_sample_meta: {} },
    ...overrides,
  };
}

describe('StrainMsaForm submission', () => {
  const originalOpen = window.open;
  const originalFetch = global.fetch;

  afterEach(() => {
    window.open = originalOpen;
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('FASTA radio: fetches a fasta report and writes it into a pre-opened tab', async () => {
    const fakeTab = { location: { replace: jest.fn() }, close: jest.fn() };
    window.open = jest.fn().mockReturnValue(fakeTab);
    const getTemporaryResultPath = jest
      .fn()
      .mockResolvedValue('/temporary-results/xyz');
    global.fetch = jest
      .fn()
      .mockResolvedValue({ text: () => Promise.resolve('>seq1\nACGT\n') });

    renderWithWdkService(makeCompleteQuestionState(), {
      getTemporaryResultPath,
    });

    await userEvent.click(screen.getByLabelText(/fasta/i));
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(getTemporaryResultPath).toHaveBeenCalledWith(
      expect.objectContaining({
        searchName: 'StrainSegmentsByMeta',
        searchConfig: expect.objectContaining({
          parameters: expect.objectContaining({
            organismSinglePick: 'Plasmodium falciparum 3D7',
            sequenceId: 'Pf3D7_11_v3',
            sequence_strand: '+',
            start_point: '1',
            end_point_segment: '5000',
          }),
        }),
      }),
      'fasta',
      expect.anything()
    );
    expect(
      getTemporaryResultPath.mock.calls[0][0].searchConfig.parameters
    ).not.toHaveProperty('eda_sample_table_suffix');
    expect(fakeTab.location.replace).not.toHaveBeenCalled(); // FASTA writes text directly, doesn't navigate
  });

  it('MSA radio: fetches a bed report, parses it, and submits a dnaseq/clustal job', async () => {
    const submitSpy = jest
      .spyOn(msaJobSubmission, 'submitClustalMsaJob')
      .mockResolvedValue(undefined);
    const getTemporaryResultPath = jest
      .fn()
      .mockResolvedValue('/temporary-results/xyz');
    global.fetch = jest.fn().mockResolvedValue({
      text: () => Promise.resolve('Pf3D7_11_v3\t100\t500\tstrain_1\t0\t+\n'),
    });

    renderWithWdkService(makeCompleteQuestionState(), {
      getTemporaryResultPath,
    });

    // MSA is the default radio selection; ClustalAlignmentForm's own confirm
    // dialog sits between the submit click and the actual job submission —
    // click submit, then confirm.
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    await userEvent.click(
      screen.getByRole('button', { name: /continue alignment/i })
    );

    expect(getTemporaryResultPath).toHaveBeenCalledWith(
      expect.anything(),
      'bed',
      expect.anything()
    );
    expect(submitSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        sequenceType: 'dnaseq',
        features: [
          {
            contig: 'Pf3D7_11_v3',
            start: 100,
            end: 500,
            query: 'strain_1',
            strand: 'POSITIVE',
          },
        ],
        msaFormat: 'clustal',
      })
    );
  });
});
```

Note: `renderWithWdkService` is a small test helper this task must add near the top of the test file (below the existing `renderWithQuestionState` from Task 5), wrapping the component in both the Redux `Provider` and `WdkDependenciesContext.Provider` (supplying `{ wdkService: fakeWdkService }`), since `StrainMsaForm`'s submit path (Step 3 below) needs `wdkService` from that context, the same way `TranscriptMsaSubmission` does:

```tsx
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';

function renderWithWdkService(
  questionState: unknown,
  wdkServiceOverrides = {},
  record = GENE_RECORD
) {
  const store = createStore((state = { question: { questions: {} } }) => ({
    ...state,
    question: { questions: { StrainSegmentsByMeta: questionState } },
  }));
  return render(
    <Provider store={store}>
      <WdkDependenciesContext.Provider
        value={{ wdkService: wdkServiceOverrides } as any}
      >
        <StrainMsaForm record={record} />
      </WdkDependenciesContext.Provider>
    </Provider>
  );
}
```

(`GENE_RECORD` is the same fixture defined in Task 5's test file — this task's `describe` block lives in the same file, so no new import is needed.)

- [ ] **Step 2: Run tests to verify they fail**

Run: `yarn --cwd packages/sites/genomics-site test StrainMsaForm.test.tsx`
Expected: FAIL — no FASTA/MSA radio, no submit button exist yet in the component from Task 5.

- [ ] **Step 3: Add submit handling to `StrainMsaForm.tsx`**

```tsx
// packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/common/StrainMsaForm.tsx
// Add these imports:
import { useState } from 'react';
import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { ClustalAlignmentForm } from '@veupathdb/web-common/lib/components';
import {
  fetchTemporaryResultText,
  parseBedToFeatures,
  submitClustalMsaJob,
} from '@veupathdb/web-common/lib/util/msaJobSubmission';
import { SequenceRetrievalApi } from '@veupathdb/compute-platform-job/src/lib/Service/SequenceRetrievalApi';
import { rootUrl } from '../../config';
import { SEQUENCE_RETRIEVAL_BASE_URL } from '../../util/computeJobConfig';

const SEQUENCE_TYPE = 'dnaseq';
const MSA_FORMAT = 'clustal';

// The six client-known params, in the shape StrainSegmentsByMeta's
// searchConfig.parameters expects. eda_sample_table_suffix is deliberately
// excluded — it is backend-set and must never be sent by the client.
function buildSearchParameters(paramValues: Record<string, string>) {
  return {
    organismSinglePick: paramValues.organismSinglePick,
    sequenceId: paramValues.sequenceId,
    sequence_strand: paramValues.sequence_strand,
    start_point: paramValues.start_point,
    end_point_segment: paramValues.end_point_segment,
    variation_sample_meta: paramValues.variation_sample_meta,
  };
}
```

Inside the component body (after the existing `updateParam` definition from Task 5), add state for the FASTA/MSA radio and the two submit handlers:

```tsx
const { wdkService } = useNonNullableContext(WdkDependenciesContext);
const [outputChoice, setOutputChoice] = useState<'fasta' | 'msa'>('msa');

const searchConfig = { parameters: buildSearchParameters(paramValues) };

const handleFastaSubmit = async () => {
  const resultTab = window.open('about:blank', '_blank');
  try {
    const path = await wdkService.getTemporaryResultPath(
      { searchName, searchConfig },
      'fasta',
      {}
    );
    const fastaText = await fetchTemporaryResultText(path);
    if (resultTab) {
      resultTab.document.write(`<pre>${fastaText}</pre>`);
    }
  } catch (error) {
    if (resultTab) resultTab.close();
    throw error;
  }
};

const handleMsaConfirm = async () => {
  const path = await wdkService.getTemporaryResultPath(
    { searchName, searchConfig },
    'bed',
    {}
  );
  const bedText = await fetchTemporaryResultText(path);
  const features = parseBedToFeatures(bedText);

  const api = SequenceRetrievalApi.getClient(
    SEQUENCE_RETRIEVAL_BASE_URL,
    wdkService
  );

  await submitClustalMsaJob({
    api,
    sequenceType: SEQUENCE_TYPE,
    features,
    msaFormat: MSA_FORMAT,
    resultRouteBase: `${rootUrl}/workspace/msa`,
    paramsSummary: `Strain segments, ${MSA_FORMAT.toUpperCase()} output format`,
  });
};
```

Add the radio and submit UI to the end of the component's returned JSX (after the `<FilterParamNew ... />` element from Task 5), replacing the single closing `</div>`:

```tsx
      <FilterParamNew
        ctx={{ searchName, parameter: filterParameter, paramValues }}
        parameter={filterParameter}
        value={filterValue}
        uiState={filterUiState}
        dispatch={dispatch}
        onParamValueChange={(newValue) =>
          updateParam(METADATA_FILTER_PARAM, newValue)
        }
      />
      <div>
        <label>
          <input
            type="radio"
            name="output_choice"
            checked={outputChoice === 'fasta'}
            onChange={() => setOutputChoice('fasta')}
          />{' '}
          FASTA
        </label>
        <label>
          <input
            type="radio"
            name="output_choice"
            checked={outputChoice === 'msa'}
            onChange={() => setOutputChoice('msa')}
          />{' '}
          Multiple sequence alignment (Clustal Omega)
        </label>
      </div>
      {outputChoice === 'fasta' ? (
        <button type="button" onClick={handleFastaSubmit}>
          Submit
        </button>
      ) : (
        <ClustalAlignmentForm
          action="about:blank"
          sequenceCount={2}
          sequenceType="strain segments"
          onConfirm={handleMsaConfirm}
        >
          <input type="submit" value="Submit" />
        </ClustalAlignmentForm>
      )}
    </div>
  );
});
```

Note on `sequenceCount={2}`: `ClustalAlignmentForm`'s warn/block thresholds compare against `sequenceCount`, but this feature has no known count until after the search actually runs (no results table, no preview) — per the design doc's Non-goals ("no per-sequence-type tuning need here"), pass a fixed, always-below-default-thresholds value so the dialog never shows a spurious warning/block banner it has no real count to justify. `action="about:blank"` is never actually submitted to (this component's form always goes through `onConfirm`, never the native-submit fallback), matching `ClustalAlignmentForm`'s existing contract that `onConfirm`, when provided, always intercepts confirm.

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn --cwd packages/sites/genomics-site test StrainMsaForm.test.tsx`
Expected: PASS (all tests from Task 5 and this task)

- [ ] **Step 5: Commit**

```bash
git add packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/common/StrainMsaForm.tsx \
  packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/common/StrainMsaForm.test.tsx
git commit -m "Add FASTA/MSA submit handling to StrainMsaForm"
```

---

## Task 7: Embed `StrainMsaForm` on the Variant record page, delete `VariantStrainFilter`

**Files:**

- Modify: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/records/VariantRecordClasses.VariantRecordClass.jsx`
- Delete: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/common/VariantStrainFilter.tsx`

**Interfaces:**

- Consumes: `StrainMsaForm` from `../common/StrainMsaForm` (Task 6).
- Produces: nothing new — this is the final integration point for Variant.

- [ ] **Step 1: Retarget `StrainFilterSection` and remove the old import**

```jsx
// packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/records/VariantRecordClasses.VariantRecordClass.jsx
import React from 'react';
import { CollapsibleSection } from '@veupathdb/wdk-client/lib/Components';
import { StrainMsaForm } from '../common/StrainMsaForm';

export function RecordAttributeSection(props) {
  return props.attribute.name === 'variant_strain_form' ? (
    <StrainFilterSection {...props} />
  ) : (
    <props.DefaultComponent {...props} />
  );
}

function StrainFilterSection(props) {
  return (
    <CollapsibleSection
      id={props.attribute.name}
      headerContent={props.attribute.displayName}
      isCollapsed={props.isCollapsed}
      onCollapsedChange={props.onCollapsedChange}
    >
      <StrainMsaForm record={props.record} />
    </CollapsibleSection>
  );
}
```

Note: `props.record` here is the same WDK record object `SNPsAlignment` and other record-page components already read `.attributes` off of (`RecordAttributeSection`'s props always include the current `record`) — `StrainMsaForm` needs it to distinguish Gene from Variant and to read `location` (Variant) for its region-input defaults (see Task 5's `deriveRegion`).

- [ ] **Step 2: Delete the old component**

```bash
git rm packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/common/VariantStrainFilter.tsx
```

- [ ] **Step 3: Search for any other reference to the deleted file**

Run: `grep -rn "VariantStrainFilter" packages/sites/genomics-site/webapp/wdkCustomization/js/client/`
Expected: no output (the only two references — the component's own file and this one import site — are both gone/updated).

- [ ] **Step 4: Verify the file still compiles**

Run: `yarn --cwd packages/sites/genomics-site compile:check` (the site's own type-check script, `tsc --noEmit` under the hood — confirmed at `packages/sites/genomics-site/package.json:15`)
Expected: no new errors.

- [ ] **Step 5: Manually smoke-test the Variant record page**

Load a Variant record page in a dev environment and confirm the Genetic Variation-equivalent section now renders `StrainMsaForm`'s start/end/strand/filter/FASTA-MSA controls instead of the old bare filter widget.

- [ ] **Step 6: Commit**

```bash
git add packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/records/VariantRecordClasses.VariantRecordClass.jsx
git rm packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/common/VariantStrainFilter.tsx
git commit -m "Replace VariantStrainFilter with StrainMsaForm on the Variant record page"
```

---

## Task 8: Embed `StrainMsaForm` on the Gene record page

**Files:**

- Modify: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/records/GeneRecordClasses.GeneRecordClass.jsx`

**Interfaces:**

- Consumes: `StrainMsaForm` from `./common/StrainMsaForm`... actually `../common/StrainMsaForm` (this file lives in `components/records/`, `StrainMsaForm` lives in `components/common/`, same relative path convention as Task 7's Variant file).
- Produces: nothing new — final integration point for Gene.

**Backend dependency (per the design doc):** this task requires a new gating attribute on the Gene record model, mirroring Variant's `variant_strain_form`. Confirmed name: **`strain_msa_form`** (same name on both Gene and Variant). The user is adding this attribute to the backend model separately — this task cannot be completed until that attribute exists and is deployed.

- [ ] **Step 1: Add a new case to `RecordAttributeSection`, add the `CollapsibleSection`/`StrainMsaForm` import**

```jsx
// packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/records/GeneRecordClasses.GeneRecordClass.jsx
// Add near the top with the other component imports:
import { CollapsibleSection } from '@veupathdb/wdk-client/lib/Components';
import { StrainMsaForm } from '../common/StrainMsaForm';

// Replace the existing RecordAttributeSection (currently lines 463-473):
export function RecordAttributeSection(props) {
  const { DefaultComponent, ...restProps } = props;
  switch (restProps.attribute.name) {
    case 'alphafold_url':
      return <AlphaFoldRecordSection {...restProps} />;
    case 'ai_expression':
      return <AiExpressionSummary {...restProps} />;
    case 'strain_msa_form':
      return (
        <CollapsibleSection
          id={restProps.attribute.name}
          headerContent={restProps.attribute.displayName}
          isCollapsed={restProps.isCollapsed}
          onCollapsedChange={restProps.onCollapsedChange}
        >
          <StrainMsaForm record={restProps.record} />
        </CollapsibleSection>
      );
    default:
      return <DefaultComponent {...restProps} />;
  }
}
```

`CollapsibleSection` is likely already imported in this file (check the existing import block from `@veupathdb/wdk-client/lib/Components`, line 17-23 per Task 3's research — `Dialog`, `HelpIcon`, `Loading`, `RecordTable as WdkRecordTable` are already there) — if `CollapsibleSection` is not already among them, add it to that same import rather than a new one.

- [ ] **Step 2: Verify the file still compiles**

Run: `yarn --cwd packages/sites/genomics-site compile:check` (the site's own type-check script, `tsc --noEmit` under the hood — confirmed at `packages/sites/genomics-site/package.json:15`)
Expected: no new errors.

- [ ] **Step 3: Manually smoke-test the Gene record page**

Load a Gene record page whose model now includes the new gating attribute (per the backend dependency above) and confirm the new section appears, renders `StrainMsaForm`, and that submitting either the FASTA or MSA path behaves as expected end-to-end (FASTA opens a tab with plain text; MSA opens a tab that lands on `/workspace/msa/result/:jobId` and eventually shows a Clustal alignment).

- [ ] **Step 4: Commit**

```bash
git add packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/records/GeneRecordClasses.GeneRecordClass.jsx
git commit -m "Embed StrainMsaForm on the Gene record page"
```

---

## Self-Review Notes

- **Spec coverage:** every section of the design doc has a corresponding task — search params/seeding (Task 4), component rendering (Task 5), FASTA path (Task 6), MSA path (Task 6), shared-piece extraction (Tasks 1-2), Orthologs refactor to consume the extraction (Task 3), both record-class embeddings (Tasks 7-8). The two "Backend dependencies" the spec calls out are both resolved: Gene's gating attribute is `strain_msa_form` (Task 8), and Variant's real attribute names are `organism_text`/`sequence_source_id`, distinct from Gene's `organism_full`/`sequence_id` (Task 4's epic branches on record class accordingly).
- **No placeholders left unresolved:** all values, signatures, and code blocks are concrete, including the previously-open items: the Gene gating attribute name (`strain_msa_form`, confirmed by the user, same name used on Variant), Variant's real attribute names (`organism_text`/`sequence_source_id`, distinct from Gene's `organism_full`/`sequence_id` — Task 4's epic now branches per record class), `FilterParamNew`'s real type discriminant (`'filter'`, not the originally guessed `'filter-param-new'` — corrected in Tasks 5 and 6's test fixtures), `QuestionActions.UPDATE_ACTIVE_QUESTION`'s exact value (imported directly in Task 4's test rather than hardcoded), and the site's real type-check script name (`compile:check`, confirmed at `packages/sites/genomics-site/package.json:15`, used in Tasks 3/7/8). Task 8's only remaining precondition is that the backend attribute must actually be deployed before that task can be implemented — an external dependency, not a plan gap.
- **Type/signature consistency check:** `submitClustalMsaJob`'s options shape (Task 2) is used identically in Task 3 (Orthologs refactor) and Task 6 (`StrainMsaForm`'s MSA path) — same field names (`api`, `sequenceType`, `features`, `msaFormat`, `resultRouteBase`, `paramsSummary`). `parseBedToFeatures`'s signature (Task 1) is unchanged from its pre-existing private implementation, so Task 6's usage matches exactly. `buildSearchParameters` (Task 6) is the single place that assembles `searchConfig.parameters`, used by both the FASTA and MSA handlers — no duplicated/divergent param-building code exists between the two paths.
- **Fixed during self-review:** the first draft of Task 6 redefined `fetchTemporaryResultText` locally inside `StrainMsaForm.tsx` rather than reusing the copy already being extracted in Task 1 for `resolveTranscriptFeatures.ts` — a second inlined copy of exactly the kind the design doc's "Shared pieces" section warns against. Fixed by having Task 1 extract `fetchTemporaryResultText` into `msaJobSubmission.ts` alongside `parseBedToFeatures`, and having Task 6 import it instead of redefining it.
- **Fixed after user follow-up (Variant is a point, not a range):** the original Task 4/5 draft assumed Gene and Variant share one region-input shape (start/end inputs defaulted from `start_min`/`end_max`) and that `StrainMsaForm` needed no explicit `record` prop at all (it would read only from Redux, like `VariantStrainFilter`). Neither holds: Variant has no `start_min`/`end_max` — it exposes a single `location` point — so its region control is a symmetric offset (default `1000`) instead of two independent inputs, and the component needs `record.recordClassName` to know which shape to render. Fixed by: (1) adding `deriveRegion(record)` to Task 5, a pure function branching on record class and returning a tagged `{kind: 'range'|'point', ...}` value; (2) changing `StrainMsaForm`'s `Props` to require `record`, passed in explicitly from each of the four embed/test call sites (Tasks 5-8), mirroring how `SNPsAlignment` already reads `props.record.attributes` elsewhere in `GeneRecordClasses.GeneRecordClass.jsx`, rather than reaching into Redux for something the caller already has.
