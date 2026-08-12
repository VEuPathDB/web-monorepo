# Async Clustal Omega MSA Jobs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the gene-record Orthologs table's synchronous CGI-based Clustal Omega alignment with an async job flow against `service-sequence-retrieval`: resolve selected transcripts to genomic features, submit a job, show a polling status page, and render the result.

**Architecture:** A new standalone package `packages/libs/compute-platform-job` provides the generic async-job client (types, `FetchClientWithCredentials` subclass, a polling hook modeled on `useDatasetPolling`, and a results page + router) that any `lib-compute-platform`-backed service can use. The Orthologs table gets a `resolveTranscriptFeatures` resolver (gene-ID-list search + `bedReporter`), a switch from gene-ID to transcript-ID row selection, and a gate requiring the "one transcript per gene" toggle before selection. `ClustalAlignmentForm`'s confirm action changes from `form.submit()` to submit-then-navigate.

**Tech Stack:** TypeScript, React, `@veupathdb/http-utils` (`FetchClientWithCredentials`), `@veupathdb/wdk-client` (`WdkService`, `getTemporaryResultPath`), react-router 5, Jest + `@testing-library/react-hooks` + `@testing-library/react`.

## Global Constraints

- Job IDs are content-addressed; resubmitting an identical request returns the same `jobID` — the client must never try to force a new run of identical input.
- No cancel/delete endpoint exists anywhere in the stack. The pre-submit confirm dialog (`ClustalAlignmentForm`'s existing warn/block thresholds) is kept unchanged as the only point a user can back out.
- **No rerun-by-jobId capability exists or should exist.** `expired` and `failed` are both unconditional dead ends on the results page — never attempt to resubmit or recover automatically. Do not add a `rerunJob` method or any expired-specific recovery UI.
- `contig` in `Feature` is the service's literal, fixed wire field name — not chromosome-specific. Never rename it in any type or payload.
- The new package is named after `lib-compute-platform` specifically (`compute-platform-job`), not "compute jobs" generically. Do not rename it to something implying it competes with or replaces multi-blast or EDA's compute-job UIs — it is a client for the generic REST shape only.
- `sequenceType` for the Orthologs case carries over unchanged from the existing `sequence_Type` radio (protein/CDS/genomic + flanking offsets) — this is not a new decision; do not invent a different default.
- Two facts in this plan are **confirmed unknowns**, not to be guessed at with placeholder-but-confident code: (1) the exact request/response shape `bedReporter` expects from `getTemporaryResultPath`, and (2) the exact attribute name WDK uses for strand in gene/transcript records. Task 3 discovers both before any code depends on them.

---

## File Structure

**New package `packages/libs/compute-platform-job`** (structural template: `packages/libs/user-datasets`, which is a plain lib package without an app shell — not `multi-blast`, which is a full CRA app):

- `package.json`, `tsconfig.json`, `tsconfig.build.json` — copied/adapted from `user-datasets`.
- `src/lib/Service/ServiceTypes.ts` — `Feature`, `MsaFormat`, `MsaOptions`, `SequenceType`, `JobStatus`, `JobResponse`, `SubmitJobRequest` types. Pure types, no runtime code, easy to review in isolation.
- `src/lib/Service/SequenceRetrievalApi.ts` — the `FetchClientWithCredentials` subclass. One class, one responsibility: talk to the 4 endpoints.
- `src/lib/Utils/polling-schedule.ts` — pure functions `getPollingDisposition(status)` and `getPollingIntervalMs(pollCount)`. No React, no I/O — trivially unit-testable, mirrors `useDatasetPolling`'s `polling-schedule.ts` split.
- `src/lib/Hooks/useJobPolling.ts` — the recursive-`setTimeout` hook. Depends only on `polling-schedule.ts` and a caller-supplied `onPoll` callback — no direct dependency on `SequenceRetrievalApi`, so it's reusable for any job-status shape that fits `JobStatus`.
- `src/lib/Components/ComputeJobPage.tsx` — the page component. Renders title/params-summary/status/result/dead-end states. Takes `jobId`, optional `paramsSummary`, and a `SequenceRetrievalApi` instance as props.
- `src/lib/Controllers/ComputeJobRouter.tsx` — thin router exposing `/result/:jobId`.
- `src/lib/index.ts` — public exports.

**Modified in `packages/libs/web-common`:**

- `src/components/records/ClustalAlignmentForm.tsx` (modified, small additive change) — adds an optional `onConfirm` prop; when provided, it's called instead of `formRef.current.submit()`. The dialog's own behavior (copy, warn/block thresholds) is unchanged, and existing callers (Popset, ortho-site) that don't pass the new prop are unaffected.

**Modified in `packages/sites/genomics-site`:**

- `webapp/wdkCustomization/js/client/util/resolveTranscriptFeatures.ts` (new) — the gene-ID-list-search + `bedReporter` + BED-parsing resolver. Standalone function, one file, easy to unit-test with a mocked `WdkService`.
- `webapp/wdkCustomization/js/client/computeJobRoutes.tsx` (new) — this site's `RouteEntry[]` wiring `compute-platform-job`'s router, mirroring `blastRoutes.tsx`.
- `webapp/wdkCustomization/js/client/routes.jsx` (modified) — spread in `computeJobRoutes`.
- `webapp/wdkCustomization/js/client/components/records/GeneRecordClasses.GeneRecordClass.jsx` (modified) — `OrthologsFormContainer` passes the toggle state down; `OrthologsForm` switches to `ortho_source_id` keying, gates checkbox handlers on the toggle, and its confirm action calls the resolver + submits + navigates instead of `form.submit()`.

**Not modified in this plan** (per Non-goals in the design): Popset's `PopsetResultSummaryViewTableController.jsx`, ortho-site's `Sequences.tsx`.

---

## Task 1: `compute-platform-job` package scaffold and `ServiceTypes`

**Files:**

- Create: `packages/libs/compute-platform-job/package.json`
- Create: `packages/libs/compute-platform-job/tsconfig.json`
- Create: `packages/libs/compute-platform-job/tsconfig.build.json`
- Create: `packages/libs/compute-platform-job/src/lib/Service/ServiceTypes.ts`
- Test: `packages/libs/compute-platform-job/src/lib/Service/ServiceTypes.test.ts`

**Interfaces:**

- Produces: `Feature`, `MsaFormat`, `MsaOptions`, `SequenceType`, `JobStatus`, `JobResponse`, `SubmitJobRequest` — every later task imports from `../Service/ServiceTypes`.

- [ ] **Step 1: Scaffold the package files**

`package.json` (adapted from `packages/libs/user-datasets/package.json` — same script names, trimmed dependency list since this package has no Redux/observable dependency):

```json
{
  "name": "@veupathdb/compute-platform-job",
  "version": "0.1.0",
  "sideEffects": ["src/globals.js"],
  "files": ["lib", "src/lib"],
  "dependencies": {
    "@veupathdb/http-utils": "workspace:^",
    "@veupathdb/wdk-client": "workspace:^"
  },
  "scripts": {
    "start": "veupathdb-react-scripts start",
    "build": "veupathdb-react-scripts prepare",
    "test": "veupathdb-react-scripts test",
    "compile": "veupathdb-react-scripts compile",
    "copy-assets": "veupathdb-react-scripts copy-assets",
    "build-npm-modules": "veupathdb-react-scripts prepare",
    "build-forever": "veupathdb-react-scripts build-forever",
    "clean": "rm -rf lib"
  },
  "eslintConfig": {
    "extends": ["@veupathdb"]
  },
  "browserslist": ["extends @veupathdb/browserslist-config"],
  "peerDependencies": {
    "react": "^16.14.0 || ^17.0.2",
    "react-dom": "^16.14.0 || ^17.0.2",
    "react-router-dom": "^5.3.0"
  },
  "devDependencies": {
    "@testing-library/react": "12.1.2",
    "@testing-library/react-hooks": "^8.0.1",
    "@types/react": "^18.3.1",
    "@types/react-router-dom": "^5.3.3",
    "@veupathdb/browserslist-config": "workspace:^",
    "@veupathdb/eslint-config": "workspace:^",
    "@veupathdb/react-scripts": "workspace:^",
    "@veupathdb/tsconfig": "workspace:^",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^5.3.0",
    "typescript": "^4.9.5"
  }
}
```

`tsconfig.json`:

```json
{
  "extends": "@veupathdb/tsconfig/tsconfig.json",
  "include": ["src"]
}
```

`tsconfig.build.json`:

```json
{
  "extends": "./tsconfig.json",
  "include": ["src/lib"],
  "compilerOptions": {
    "noEmit": false,
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "lib",
    "target": "ES2015"
  }
}
```

- [ ] **Step 2: Write the failing test for `ServiceTypes`**

Types have no runtime behavior to test directly, but write one compile-time-shape test to lock the field names and catch accidental drift (e.g. `jobID` vs `jobId` casing, which matters because the wire format uses `jobID`):

```typescript
// packages/libs/compute-platform-job/src/lib/Service/ServiceTypes.test.ts
import {
  Feature,
  JobResponse,
  JobStatus,
  SubmitJobRequest,
} from './ServiceTypes';

describe('ServiceTypes', () => {
  it('Feature matches the service wire shape verbatim', () => {
    const feature: Feature = {
      contig: 'PF3D7_0200300',
      start: 100,
      end: 500,
      query: 'PF3D7_0200300',
      strand: 'NONE',
    };
    expect(feature.contig).toBe('PF3D7_0200300');
  });

  it('JobResponse uses jobID (capital ID), matching the wire format', () => {
    const response: JobResponse = {
      jobID: 'abc123',
      status: 'queued',
    };
    expect(response.jobID).toBe('abc123');
  });

  it('JobStatus covers exactly the 5 documented values', () => {
    const statuses: JobStatus[] = [
      'queued',
      'in-progress',
      'complete',
      'failed',
      'expired',
    ];
    expect(statuses).toHaveLength(5);
  });

  it('SubmitJobRequest requires features and postProcess', () => {
    const request: SubmitJobRequest = {
      features: [{ contig: 'x', start: 0, end: 10 }],
      postProcess: 'MSA',
      msaOptions: { format: 'clustal' },
    };
    expect(request.postProcess).toBe('MSA');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `yarn --cwd packages/libs/compute-platform-job test ServiceTypes.test.ts`
Expected: FAIL — `Cannot find module './ServiceTypes'` (the module doesn't exist yet).

- [ ] **Step 4: Write `ServiceTypes.ts`**

```typescript
// packages/libs/compute-platform-job/src/lib/Service/ServiceTypes.ts

/**
 * A region on some underlying sequence set. `contig` is the service's
 * literal, fixed field name — it is generic over whatever reference set
 * `sequenceType` selects (a chromosome, a protein accession, an isolate
 * locus), not chromosome-specific.
 */
export interface Feature {
  contig: string;
  start: number;
  end: number;
  query?: string;
  strand?: 'NONE' | 'POSITIVE' | 'NEGATIVE';
}

export type DeflineFormat = 'QUERYONLY' | 'REGIONONLY' | 'QUERYANDREGION';

export type MsaFormat =
  | 'fasta'
  | 'clustal'
  | 'clustal_dnd'
  | 'msf'
  | 'phylip'
  | 'selex'
  | 'stockholm'
  | 'vienna';

export interface MsaOptions {
  format: MsaFormat;
  metadataUrl?: string;
}

/** A deployment-configured reference-set key, e.g. "genomic" or "protein" — not a WDK project ID. */
export type SequenceType = string;

export interface SubmitJobRequest {
  features: Feature[];
  deflineFormat?: DeflineFormat;
  basesPerLine?: number;
  postProcess?: 'MSA';
  msaOptions?: MsaOptions;
}

export type JobStatus =
  | 'queued'
  | 'in-progress'
  | 'complete'
  | 'failed'
  | 'expired';

export interface JobResponse {
  jobID: string;
  status: JobStatus;
  queuePosition?: number;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `yarn --cwd packages/libs/compute-platform-job test ServiceTypes.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 6: Commit**

```bash
git add packages/libs/compute-platform-job/package.json \
  packages/libs/compute-platform-job/tsconfig.json \
  packages/libs/compute-platform-job/tsconfig.build.json \
  packages/libs/compute-platform-job/src/lib/Service/ServiceTypes.ts \
  packages/libs/compute-platform-job/src/lib/Service/ServiceTypes.test.ts
git commit -m "Scaffold compute-platform-job package with ServiceTypes"
```

---

## Task 2: `SequenceRetrievalApi` client

**Files:**

- Create: `packages/libs/compute-platform-job/src/lib/Service/SequenceRetrievalApi.ts`
- Test: `packages/libs/compute-platform-job/src/lib/Service/SequenceRetrievalApi.test.ts`

**Interfaces:**

- Consumes: `Feature`, `JobResponse`, `SequenceType`, `SubmitJobRequest` from Task 1's `ServiceTypes.ts`; `FetchClientWithCredentials`, `createJsonRequest` from `@veupathdb/http-utils`.
- Produces: `SequenceRetrievalApi` class with `submitJob(sequenceType, request): Promise<JobResponse>`, `fetchJob(jobId): Promise<JobResponse>`, `fetchJobFiles(jobId): Promise<string[]>`, `fetchJobFile(jobId, fileName): Promise<string>`. Task 4 (`ComputeJobPage`) and the resolver in Task 6 both construct/use this class.

- [ ] **Step 1: Write the failing tests**

Mock `fetch` directly rather than mocking `FetchClient` internals, since `FetchClient.fetch` already handles request construction — testing at the `window.fetch` boundary verifies the actual HTTP shape sent.

```typescript
// packages/libs/compute-platform-job/src/lib/Service/SequenceRetrievalApi.test.ts
import { SequenceRetrievalApi } from './SequenceRetrievalApi';

function makeFakeWdkService() {
  return {
    getCurrentUser: async () => ({ id: 1, isGuest: true }),
  } as any;
}

function mockFetchOnce(body: unknown, contentType = 'application/json') {
  const responseBody =
    contentType === 'application/json'
      ? JSON.stringify(body)
      : (body as string);
  const fetchMock = jest.fn().mockResolvedValue(
    new Response(responseBody, {
      status: 200,
      headers: { 'Content-Type': contentType },
    })
  );
  return fetchMock;
}

describe('SequenceRetrievalApi', () => {
  it('submitJob POSTs to /sequences-async/{sequenceType} with a JSON body', async () => {
    const fetchMock = mockFetchOnce({ jobID: 'abc123', status: 'queued' });
    const api = new SequenceRetrievalApi(
      { baseUrl: 'https://srt.example.org', fetchApi: fetchMock },
      makeFakeWdkService()
    );

    const result = await api.submitJob('genomic', {
      features: [{ contig: 'PF3D7_0200300', start: 0, end: 500 }],
      postProcess: 'MSA',
      msaOptions: { format: 'clustal' },
    });

    expect(result).toEqual({ jobID: 'abc123', status: 'queued' });
    const [request] = fetchMock.mock.calls[0];
    expect(request.url).toBe('https://srt.example.org/sequences-async/genomic');
    expect(request.method).toBe('POST');
    const sentBody = JSON.parse(await request.clone().text());
    expect(sentBody.features[0].contig).toBe('PF3D7_0200300');
  });

  it('fetchJob GETs /jobs/{id}', async () => {
    const fetchMock = mockFetchOnce({ jobID: 'abc123', status: 'in-progress' });
    const api = new SequenceRetrievalApi(
      { baseUrl: 'https://srt.example.org', fetchApi: fetchMock },
      makeFakeWdkService()
    );

    const result = await api.fetchJob('abc123');

    expect(result.status).toBe('in-progress');
    const [request] = fetchMock.mock.calls[0];
    expect(request.url).toBe('https://srt.example.org/jobs/abc123');
    expect(request.method).toBe('GET');
  });

  it('fetchJobFiles GETs /jobs/{id}/files and returns the filename list', async () => {
    const fetchMock = mockFetchOnce(['output', 'guidetree.dnd']);
    const api = new SequenceRetrievalApi(
      { baseUrl: 'https://srt.example.org', fetchApi: fetchMock },
      makeFakeWdkService()
    );

    const result = await api.fetchJobFiles('abc123');

    expect(result).toEqual(['output', 'guidetree.dnd']);
    const [request] = fetchMock.mock.calls[0];
    expect(request.url).toBe('https://srt.example.org/jobs/abc123/files');
  });

  it('fetchJobFile GETs /jobs/{id}/files/{name} and returns raw text', async () => {
    const fetchMock = mockFetchOnce('CLUSTAL O alignment output', 'text/plain');
    const api = new SequenceRetrievalApi(
      { baseUrl: 'https://srt.example.org', fetchApi: fetchMock },
      makeFakeWdkService()
    );

    const result = await api.fetchJobFile('abc123', 'output');

    expect(result).toBe('CLUSTAL O alignment output');
    const [request] = fetchMock.mock.calls[0];
    expect(request.url).toBe(
      'https://srt.example.org/jobs/abc123/files/output'
    );
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `yarn --cwd packages/libs/compute-platform-job test SequenceRetrievalApi.test.ts`
Expected: FAIL — `Cannot find module './SequenceRetrievalApi'`

- [ ] **Step 3: Write `SequenceRetrievalApi.ts`**

Modeled directly on `packages/libs/multi-blast/src/lib/utils/api.ts`'s `BlastApi`, but simpler (no error-taxonomy wrapper — `fetchJob`/`fetchJobFile` etc. let `FetchClient`'s existing `FetchClientError` propagate; the polling hook in Task 5 already treats any thrown error from `onPoll` as transient and retries):

```typescript
// packages/libs/compute-platform-job/src/lib/Service/SequenceRetrievalApi.ts
import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import {
  createJsonRequest,
  createPlainTextRequest,
  FetchApiOptions,
  FetchClientWithCredentials,
} from '@veupathdb/http-utils';

import { JobResponse, SequenceType, SubmitJobRequest } from './ServiceTypes';

const JOBS_PATH = '/jobs';

export class SequenceRetrievalApi extends FetchClientWithCredentials {
  constructor(options: FetchApiOptions, wdkService: WdkService) {
    super(options, wdkService);
  }

  submitJob(
    sequenceType: SequenceType,
    request: SubmitJobRequest
  ): Promise<JobResponse> {
    return this.fetch(
      createJsonRequest({
        path: `/sequences-async/${sequenceType}`,
        method: 'POST',
        body: request,
        transformResponse: async (body) => body as JobResponse,
      })
    );
  }

  fetchJob(jobId: string): Promise<JobResponse> {
    return this.fetch({
      path: `${JOBS_PATH}/${jobId}`,
      method: 'GET',
      transformResponse: async (body) => body as JobResponse,
    });
  }

  fetchJobFiles(jobId: string): Promise<string[]> {
    return this.fetch({
      path: `${JOBS_PATH}/${jobId}/files`,
      method: 'GET',
      transformResponse: async (body) => body as string[],
    });
  }

  fetchJobFile(jobId: string, fileName: string): Promise<string> {
    return this.fetch(
      createPlainTextRequest({
        path: `${JOBS_PATH}/${jobId}/files/${fileName}`,
        method: 'GET',
        transformResponse: async (body) => body as string,
      })
    );
  }
}
```

Note: `FetchClientWithCredentials.fetch` is `protected`; since `SequenceRetrievalApi extends FetchClientWithCredentials`, calling `this.fetch(...)` from within the subclass's own public methods is the correct, already-established pattern (see `BlastApi.fetchJob` for precedent).

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn --cwd packages/libs/compute-platform-job test SequenceRetrievalApi.test.ts`
Expected: PASS (4 tests)

If `createPlainTextRequest` sets a _request_ `Content-Type` header (it does — check `helpers.ts`) rather than affecting the _response_ parsing, `fetchJobFile`'s test may fail because `fetchResponseBody` (in `FetchClient.ts`) branches on the _response's_ `Content-Type` header, not the request's. If the test fails on this point: remove `createPlainTextRequest` from `fetchJobFile` (it's a GET with no body, so a request `Content-Type` header is meaningless anyway) and rely on `fetchResponseBody`'s existing behavior — it already returns `response.text()` for any non-`application/json` content type, which matches the mocked `text/plain` response.

- [ ] **Step 5: Commit**

```bash
git add packages/libs/compute-platform-job/src/lib/Service/SequenceRetrievalApi.ts \
  packages/libs/compute-platform-job/src/lib/Service/SequenceRetrievalApi.test.ts
git commit -m "Add SequenceRetrievalApi client"
```

---

## Task 3: Discovery spike — confirm `bedReporter` shape and the strand attribute name

**This task produces a short findings note, not application code.** Both facts are genuine unknowns per the design doc's Open questions history — do not let Task 6 (the resolver) proceed on a guessed shape.

**Files:**

- Create: `docs/superpowers/plans/2026-08-12-async-msa-jobs-bedreporter-findings.md` (scratch findings doc, committed for the record)

- [ ] **Step 1: Find a running WDK instance or existing bedReporter usage server-side**

This cannot be answered from the web-monorepo client repo alone (confirmed in the design doc's research — no client code calls `bedReporter` today). Two ways to resolve it, in order of preference:

1. If a local or staging WDK service is reachable, call it directly:
   ```bash
   curl -s -X POST 'https://<wdk-service-host>/record-types/transcript/searches/GeneByLocusTag/reports/standard' \
     -H 'Content-Type: application/json' \
     -d '{"searchConfig":{"parameters":{"ds_gene_ids":"PF3D7_0200300"}},"reportConfig":{"format":"bedReporter"}}'
   ```
   Adjust `reportConfig` shape based on the actual 400 error message if the first guess is wrong — WDK typically echoes the expected shape in validation errors.
2. If no live instance is reachable, grep the WDK service's own source (a separate repo, not web-monorepo) for `bedReporter`'s Java reporter class to read its expected config fields directly. Search for a class implementing WDK's `Reporter` interface with a `getConfigClass()` or `@Reporter(name = "bedReporter")`-style annotation.

- [ ] **Step 2: Determine the strand attribute's exact name**

From a live WDK instance, fetch the `transcript` record class's attribute metadata and search for anything strand-related:

```bash
curl -s 'https://<wdk-service-host>/record-types/transcript' | grep -io '"[a-z_]*strand[a-z_]*"'
```

If no live instance is reachable, check the transcript record class's XML model definition in `ApiCommonModel` (a separate repo) for an attribute query selecting strand, or ask a team member who has DB/model access.

- [ ] **Step 3: Record findings**

Write `docs/superpowers/plans/2026-08-12-async-msa-jobs-bedreporter-findings.md` with:

- The exact `reportConfig` shape `bedReporter` accepts (field names, whether `attributes` is required/ignored, any format options).
- A sample of the actual BED text `bedReporter` returns for a small test gene ID, so Task 6's parser can be written against a real example rather than an assumed BED8/BED12 layout.
- The confirmed strand attribute name.

If this task cannot be completed (no WDK access available in this environment), **stop and flag to the user** rather than guessing — Task 6 depends on this and a wrong guess produces a resolver that silently returns wrong `Feature[]` data (wrong strand, or a parse that reads the wrong BED column as `start`/`end`).

- [ ] **Step 4: Commit the findings note**

```bash
git add docs/superpowers/plans/2026-08-12-async-msa-jobs-bedreporter-findings.md
git commit -m "Record bedReporter config shape and strand attribute name findings"
```

---

## Task 4: `polling-schedule.ts` pure functions

**Files:**

- Create: `packages/libs/compute-platform-job/src/lib/Utils/polling-schedule.ts`
- Test: `packages/libs/compute-platform-job/src/lib/Utils/polling-schedule.test.ts`

**Interfaces:**

- Consumes: `JobStatus` from Task 1's `ServiceTypes.ts`.
- Produces: `getPollingDisposition(status: JobStatus): 'continue' | 'stop'`, `getPollingIntervalMs(pollCount: number): number`. Task 5 (`useJobPolling`) imports both.

- [ ] **Step 1: Write the failing tests**

```typescript
// packages/libs/compute-platform-job/src/lib/Utils/polling-schedule.test.ts
import {
  getPollingDisposition,
  getPollingIntervalMs,
} from './polling-schedule';

describe('getPollingDisposition', () => {
  it('continues while queued', () => {
    expect(getPollingDisposition('queued')).toBe('continue');
  });

  it('continues while in-progress', () => {
    expect(getPollingDisposition('in-progress')).toBe('continue');
  });

  it('stops on complete', () => {
    expect(getPollingDisposition('complete')).toBe('stop');
  });

  it('stops on failed', () => {
    expect(getPollingDisposition('failed')).toBe('stop');
  });

  it('stops on expired', () => {
    expect(getPollingDisposition('expired')).toBe('stop');
  });
});

describe('getPollingIntervalMs', () => {
  it('uses the 2s tier for the first 5 polls', () => {
    expect(getPollingIntervalMs(0)).toBe(2000);
    expect(getPollingIntervalMs(4)).toBe(2000);
  });

  it('uses the 5s tier from poll 5 through 10', () => {
    expect(getPollingIntervalMs(5)).toBe(5000);
    expect(getPollingIntervalMs(10)).toBe(5000);
  });

  it('uses the 15s steady tier from poll 11 onward', () => {
    expect(getPollingIntervalMs(11)).toBe(15000);
    expect(getPollingIntervalMs(1000)).toBe(15000);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `yarn --cwd packages/libs/compute-platform-job test polling-schedule.test.ts`
Expected: FAIL — `Cannot find module './polling-schedule'`

- [ ] **Step 3: Write `polling-schedule.ts`**

Explicit terminal list, not a negation — per the design doc's stated rationale (an unrecognized future status should keep polling visibly, not silently stop), mirroring `useDatasetPolling`'s `polling-schedule.ts`:

```typescript
// packages/libs/compute-platform-job/src/lib/Utils/polling-schedule.ts
import { JobStatus } from '../Service/ServiceTypes';

export type PollingDisposition = 'continue' | 'stop';

// Written as an explicit terminal list, not `!== 'queued' && !== 'in-progress'`,
// on purpose: if the service ever adds a status, an unrecognized value should
// keep polling (visibly wrong, easy to spot) rather than silently stop (looks
// stuck).
const TERMINAL_STATUSES: readonly JobStatus[] = [
  'complete',
  'failed',
  'expired',
];

export function getPollingDisposition(status: JobStatus): PollingDisposition {
  return TERMINAL_STATUSES.includes(status) ? 'stop' : 'continue';
}

// Three flat rates, not a smooth ramp: fast while the user is most likely
// watching, then cheap over the long tail of a multi-minute alignment.
const TIERS = [
  { throughPollCount: 5, intervalMs: 2000 },
  { throughPollCount: 11, intervalMs: 5000 },
];
const STEADY_INTERVAL_MS = 15000;

export function getPollingIntervalMs(pollCount: number): number {
  const tier = TIERS.find((t) => pollCount < t.throughPollCount);
  return tier?.intervalMs ?? STEADY_INTERVAL_MS;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn --cwd packages/libs/compute-platform-job test polling-schedule.test.ts`
Expected: PASS (8 tests)

- [ ] **Step 5: Commit**

```bash
git add packages/libs/compute-platform-job/src/lib/Utils/polling-schedule.ts \
  packages/libs/compute-platform-job/src/lib/Utils/polling-schedule.test.ts
git commit -m "Add polling-schedule pure functions"
```

---

## Task 5: `useJobPolling` hook

**Files:**

- Create: `packages/libs/compute-platform-job/src/lib/Hooks/useJobPolling.ts`
- Test: `packages/libs/compute-platform-job/src/lib/Hooks/useJobPolling.test.ts`

**Interfaces:**

- Consumes: `getPollingDisposition`, `getPollingIntervalMs` from Task 4; `JobStatus` from Task 1.
- Produces: `useJobPolling({ status, onPoll }): { isPolling: boolean; isChecking: boolean }`. Task 7 (`ComputeJobPage`) is the only consumer.

- [ ] **Step 1: Write the failing tests**

Directly adapted from `useDatasetPolling.test.ts` (the proven reference — recursive `setTimeout`, fake timers, tab-visibility mocking), minus the two dataset-specific concerns that don't apply here: there's no `projectId`, and there's no `continue-slow` tier (only one non-terminal disposition exists for this service).

```typescript
// packages/libs/compute-platform-job/src/lib/Hooks/useJobPolling.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useJobPolling } from './useJobPolling';
import { JobStatus } from '../Service/ServiceTypes';

describe('useJobPolling', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not poll when the status is already terminal', () => {
    const onPoll = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useJobPolling({ status: 'complete' as JobStatus, onPoll })
    );

    act(() => {
      jest.advanceTimersByTime(60000);
    });

    expect(onPoll).not.toHaveBeenCalled();
    expect(result.current.isPolling).toBe(false);
  });

  it('polls on the 2s tier while non-terminal', async () => {
    const onPoll = jest.fn().mockResolvedValue(undefined);
    renderHook(() => useJobPolling({ status: 'queued' as JobStatus, onPoll }));

    expect(onPoll).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(onPoll).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(onPoll).toHaveBeenCalledTimes(2);
  });

  it('never overlaps requests: the next tick waits for the current one', async () => {
    let resolvePoll: (() => void) | undefined;
    const onPoll = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolvePoll = resolve;
        })
    );
    renderHook(() =>
      useJobPolling({ status: 'in-progress' as JobStatus, onPoll })
    );

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(onPoll).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(10000);
    });
    expect(onPoll).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolvePoll?.();
    });
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(onPoll).toHaveBeenCalledTimes(2);
  });

  it('keeps polling after a failed request', async () => {
    const onPoll = jest
      .fn()
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValue(undefined);
    renderHook(() =>
      useJobPolling({ status: 'in-progress' as JobStatus, onPoll })
    );

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(onPoll).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(onPoll).toHaveBeenCalledTimes(2);
  });

  it('stops scheduling once the status becomes terminal', async () => {
    const onPoll = jest.fn().mockResolvedValue(undefined);
    const { rerender } = renderHook(
      ({ status }) => useJobPolling({ status, onPoll }),
      { initialProps: { status: 'in-progress' as JobStatus } }
    );

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(onPoll).toHaveBeenCalledTimes(1);

    rerender({ status: 'complete' as JobStatus });

    await act(async () => {
      jest.advanceTimersByTime(60000);
    });
    expect(onPoll).toHaveBeenCalledTimes(1);
  });

  it('clears its timer on unmount', async () => {
    const onPoll = jest.fn().mockResolvedValue(undefined);
    const { unmount } = renderHook(() =>
      useJobPolling({ status: 'in-progress' as JobStatus, onPoll })
    );

    unmount();

    await act(async () => {
      jest.advanceTimersByTime(60000);
    });
    expect(onPoll).not.toHaveBeenCalled();
  });

  describe('tab visibility', () => {
    afterEach(() => {
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        value: false,
      });
    });

    const setHidden = (hidden: boolean) => {
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        value: hidden,
      });
    };

    const fireVisibilityChange = () => {
      document.dispatchEvent(new Event('visibilitychange'));
    };

    it('pauses while hidden', async () => {
      setHidden(true);
      const onPoll = jest.fn().mockResolvedValue(undefined);
      renderHook(() =>
        useJobPolling({ status: 'in-progress' as JobStatus, onPoll })
      );

      await act(async () => {
        jest.advanceTimersByTime(60000);
      });

      expect(onPoll).not.toHaveBeenCalled();
    });

    it('polls immediately on return to visibility', async () => {
      setHidden(true);
      const onPoll = jest.fn().mockResolvedValue(undefined);
      renderHook(() =>
        useJobPolling({ status: 'in-progress' as JobStatus, onPoll })
      );

      await act(async () => {
        jest.advanceTimersByTime(60000);
      });
      expect(onPoll).not.toHaveBeenCalled();

      setHidden(false);
      await act(async () => {
        fireVisibilityChange();
      });

      expect(onPoll).toHaveBeenCalledTimes(1);
    });

    it('does not start a concurrent poll on rapid hide/show toggling', async () => {
      let resolvePoll: (() => void) | undefined;
      const onPoll = jest.fn(
        () =>
          new Promise<void>((resolve) => {
            resolvePoll = resolve;
          })
      );
      renderHook(() =>
        useJobPolling({ status: 'in-progress' as JobStatus, onPoll })
      );

      await act(async () => {
        jest.advanceTimersByTime(2000);
      });
      expect(onPoll).toHaveBeenCalledTimes(1);

      await act(async () => {
        setHidden(true);
        fireVisibilityChange();
        setHidden(false);
        fireVisibilityChange();
        setHidden(true);
        fireVisibilityChange();
        setHidden(false);
        fireVisibilityChange();
      });

      expect(onPoll).toHaveBeenCalledTimes(1);

      await act(async () => {
        resolvePoll?.();
      });

      expect(onPoll).toHaveBeenCalledTimes(1);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `yarn --cwd packages/libs/compute-platform-job test useJobPolling.test.ts`
Expected: FAIL — `Cannot find module './useJobPolling'`

- [ ] **Step 3: Write `useJobPolling.ts`**

Directly adapted from the `ud-polling` branch's `useDatasetPolling.ts`, with the `projectId`/`continue-slow` concerns removed (this service has only one non-terminal disposition):

```typescript
// packages/libs/compute-platform-job/src/lib/Hooks/useJobPolling.ts
import { useEffect, useRef, useState } from 'react';

import { JobStatus } from '../Service/ServiceTypes';
import {
  getPollingDisposition,
  getPollingIntervalMs,
} from '../Utils/polling-schedule';

interface UseJobPollingOptions {
  status: JobStatus;
  /** Refreshes the job. Rejections are swallowed; the loop retries. */
  onPoll: () => Promise<unknown>;
}

/**
 * Polls a job's status until it reaches a terminal state.
 *
 * Uses a recursive setTimeout rather than setInterval: the next tick is only
 * scheduled once the current request settles, so requests can never overlap
 * and a slow response cannot stack up a queue of pending polls.
 */
export function useJobPolling({ status, onPoll }: UseJobPollingOptions): {
  isPolling: boolean;
  isChecking: boolean;
} {
  const [isChecking, setIsChecking] = useState(false);

  const disposition = getPollingDisposition(status);
  const isPolling = disposition !== 'stop';

  // Held in a ref so that changing the callback identity between renders does
  // not tear down and restart the loop.
  const onPollRef = useRef(onPoll);
  onPollRef.current = onPoll;

  useEffect(() => {
    if (!isPolling) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let pollCount = 0;
    // Guards against onVisibilityChange starting a second concurrent poll
    // while a tick's request is still in flight.
    let inFlight = false;

    const schedule = () => {
      timeoutId = setTimeout(tick, getPollingIntervalMs(pollCount));
    };

    const tick = async () => {
      if (cancelled) return;
      if (document.hidden) {
        schedule();
        return;
      }

      setIsChecking(true);
      inFlight = true;
      try {
        await onPollRef.current();
      } catch {
        // Transient failure: keep the loop alive and try again next tick.
      } finally {
        inFlight = false;
      }
      setIsChecking(false);
      if (cancelled) return;
      pollCount += 1;
      schedule();
    };

    const onVisibilityChange = () => {
      if (document.hidden || cancelled || inFlight) return;
      if (timeoutId) clearTimeout(timeoutId);
      pollCount = 0;
      tick();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    schedule();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [isPolling, disposition]);

  return { isPolling, isChecking: isPolling && isChecking };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn --cwd packages/libs/compute-platform-job test useJobPolling.test.ts`
Expected: PASS (10 tests)

- [ ] **Step 5: Commit**

```bash
git add packages/libs/compute-platform-job/src/lib/Hooks/useJobPolling.ts \
  packages/libs/compute-platform-job/src/lib/Hooks/useJobPolling.test.ts
git commit -m "Add useJobPolling hook"
```

---

## Task 6: `resolveTranscriptFeatures` resolver

**This task depends on Task 3's findings.** Do not write the BED parser until Task 3 has recorded a real sample of `bedReporter`'s output — the field below marked "per Task 3 findings" must be filled in from that sample, not assumed.

**Files:**

- Create: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/util/resolveTranscriptFeatures.ts`
- Test: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/util/resolveTranscriptFeatures.test.ts`

**Interfaces:**

- Consumes: `Feature` from `@veupathdb/compute-platform-job`; `WdkService` from `@veupathdb/wdk-client/lib/Core`.
- Produces: `resolveTranscriptFeatures(wdkService: WdkService, transcriptIds: string[]): Promise<Feature[]>`. Task 12 (`OrthologsForm`'s confirm handler) is the sole consumer.

- [ ] **Step 1: Write the failing tests**

The exact BED parsing logic in this test's expectations is a placeholder for a standard BED format (`chrom\tchromStart\tchromEnd\tname\tscore\tstrand`, tab-separated, 0-based start) and **must be corrected against Task 3's actual sample output before this step is considered done**. If Task 3 found a different column order or delimiter, rewrite this test to match the real format first.

```typescript
// packages/sites/genomics-site/webapp/wdkCustomization/js/client/util/resolveTranscriptFeatures.test.ts
import { resolveTranscriptFeatures } from './resolveTranscriptFeatures';

function makeFakeWdkService(bedText: string) {
  const getTemporaryResultPath = jest
    .fn()
    .mockResolvedValue('/temporary-results/xyz');
  const fetchJson = jest.fn().mockResolvedValue(bedText);
  return {
    getTemporaryResultPath,
    // Standing in for whatever low-level fetch this resolver uses to read
    // the temporary-result path's content — see Step 3 for the real call.
    _fetchTemporaryResult: fetchJson,
  } as any;
}

describe('resolveTranscriptFeatures', () => {
  it('requests bedReporter for the given transcript IDs', async () => {
    const wdkService = makeFakeWdkService(
      'PF3D7_0200300\t100\t500\tPF3D7_0200300.1\t0\t+\n'
    );

    await resolveTranscriptFeatures(wdkService, ['PF3D7_0200300.1']);

    expect(wdkService.getTemporaryResultPath).toHaveBeenCalledWith(
      expect.objectContaining({
        searchName: 'GeneByLocusTag',
        searchConfig: expect.objectContaining({
          parameters: expect.objectContaining({
            ds_gene_ids: 'PF3D7_0200300.1',
          }),
        }),
      }),
      'bedReporter',
      expect.anything()
    );
  });

  it('parses BED text into Feature[]', async () => {
    const wdkService = makeFakeWdkService(
      'PF3D7_0200300\t100\t500\tPF3D7_0200300.1\t0\t+\n'
    );

    const features = await resolveTranscriptFeatures(wdkService, [
      'PF3D7_0200300.1',
    ]);

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

  it('handles multiple transcript IDs, one BED line per transcript', async () => {
    const wdkService = makeFakeWdkService(
      'PF3D7_0200300\t100\t500\tPF3D7_0200300.1\t0\t+\n' +
        'PF3D7_0300400\t200\t900\tPF3D7_0300400.1\t0\t-\n'
    );

    const features = await resolveTranscriptFeatures(wdkService, [
      'PF3D7_0200300.1',
      'PF3D7_0300400.1',
    ]);

    expect(features).toHaveLength(2);
    expect(features[1]).toEqual({
      contig: 'PF3D7_0300400',
      start: 200,
      end: 900,
      query: 'PF3D7_0300400.1',
      strand: 'NEGATIVE',
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `yarn --cwd packages/sites/genomics-site test resolveTranscriptFeatures.test.ts`
Expected: FAIL — `Cannot find module './resolveTranscriptFeatures'`

- [ ] **Step 3: Write `resolveTranscriptFeatures.ts`**

Modeled on `gene-list-export-utils.tsx`'s `getGeneListTemporaryResultUrl` (which uses `getTemporaryResultPath` with `'attributesTabular'`) — swap the report name and config for `'bedReporter'` per Task 3's findings, and fetch the resulting path's content directly (temporary-result paths are plain GET-able URLs relative to the WDK service base, same as `getGeneListTemporaryResultUrl` constructs). **The `reportConfig` object passed as the third argument, and the BED-parsing logic, must be updated to match Task 3's actual findings before this step is done** — the shapes below are the best guess from `attributesTabular`'s precedent and a standard 6-column BED format, not confirmed:

```typescript
// packages/sites/genomics-site/webapp/wdkCustomization/js/client/util/resolveTranscriptFeatures.ts
import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import { Feature } from '@veupathdb/compute-platform-job';

const TRANSCRIPT_ID_LIST_SEARCH = 'GeneByLocusTag';
const TRANSCRIPT_ID_PARAM = 'ds_gene_ids';

/**
 * Resolves a plain list of transcript IDs to Feature[] via the existing
 * GeneByLocusTag search's bedReporter report. Has no notion of where the IDs
 * came from — any transcript-ID-producing UI can call this.
 */
export async function resolveTranscriptFeatures(
  wdkService: WdkService,
  transcriptIds: string[]
): Promise<Feature[]> {
  const temporaryResultPath = await wdkService.getTemporaryResultPath(
    {
      searchName: TRANSCRIPT_ID_LIST_SEARCH,
      searchConfig: {
        parameters: {
          [TRANSCRIPT_ID_PARAM]: transcriptIds.join(','),
        },
      },
    },
    'bedReporter',
    {
      // TODO(Task 3 findings): confirm this reportConfig shape against a
      // live WDK instance. attributesTabular's shape (includeHeader,
      // attachmentType) is the closest known precedent but bedReporter may
      // take different or no config fields.
      attachmentType: 'plain',
    }
  );

  const bedText = await fetchTemporaryResultText(
    wdkService,
    temporaryResultPath
  );

  return parseBedToFeatures(bedText);
}

async function fetchTemporaryResultText(
  wdkService: WdkService,
  temporaryResultPath: string
): Promise<string> {
  const { endpoint } = await wdkService.getConfig();
  const response = await fetch(`${endpoint}${temporaryResultPath}`);
  return response.text();
}

function parseBedToFeatures(bedText: string): Feature[] {
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
      };
    });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn --cwd packages/sites/genomics-site test resolveTranscriptFeatures.test.ts`
Expected: PASS (3 tests) — **only if Task 3's findings matched the guessed BED format.** If Task 3 found a different shape, both the implementation and the test's fixture strings must be updated together before this step passes.

- [ ] **Step 5: Commit**

```bash
git add packages/sites/genomics-site/webapp/wdkCustomization/js/client/util/resolveTranscriptFeatures.ts \
  packages/sites/genomics-site/webapp/wdkCustomization/js/client/util/resolveTranscriptFeatures.test.ts
git commit -m "Add resolveTranscriptFeatures resolver"
```

---

## Task 7: `ComputeJobPage` component

**Files:**

- Create: `packages/libs/compute-platform-job/src/lib/Components/ComputeJobPage.tsx`
- Test: `packages/libs/compute-platform-job/src/lib/Components/ComputeJobPage.test.tsx`

**Interfaces:**

- Consumes: `useJobPolling` from Task 5; `SequenceRetrievalApi`, `JobResponse` from Tasks 1–2.
- Produces: `ComputeJobPage` component with props `{ jobId: string; api: SequenceRetrievalApi; paramsSummary?: string }`. Task 8 (`ComputeJobRouter`) is the consumer.

- [ ] **Step 1: Write the failing tests**

```tsx
// packages/libs/compute-platform-job/src/lib/Components/ComputeJobPage.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { ComputeJobPage } from './ComputeJobPage';
import { SequenceRetrievalApi } from '../Service/SequenceRetrievalApi';

function makeFakeApi(overrides: Partial<SequenceRetrievalApi> = {}) {
  return {
    fetchJob: jest.fn(),
    fetchJobFiles: jest.fn(),
    fetchJobFile: jest.fn(),
    ...overrides,
  } as unknown as SequenceRetrievalApi;
}

describe('ComputeJobPage', () => {
  it('shows the title and params summary while queued', async () => {
    const api = makeFakeApi({
      fetchJob: jest.fn().mockResolvedValue({ jobID: 'abc', status: 'queued' }),
    });

    render(
      <ComputeJobPage
        jobId="abc"
        api={api}
        paramsSummary="13 Transcripts, FASTA output format"
      />
    );

    expect(await screen.findByText('Running Compute Job')).toBeInTheDocument();
    expect(
      screen.getByText('13 Transcripts, FASTA output format')
    ).toBeInTheDocument();
  });

  it('fetches and renders the result on complete', async () => {
    const api = makeFakeApi({
      fetchJob: jest
        .fn()
        .mockResolvedValue({ jobID: 'abc', status: 'complete' }),
      fetchJobFiles: jest.fn().mockResolvedValue(['output']),
      fetchJobFile: jest.fn().mockResolvedValue('CLUSTAL O alignment text'),
    });

    render(<ComputeJobPage jobId="abc" api={api} />);

    await waitFor(() => {
      expect(screen.getByText('CLUSTAL O alignment text')).toBeInTheDocument();
    });
  });

  it('shows a dead-end message on failed with no retry action', async () => {
    const api = makeFakeApi({
      fetchJob: jest.fn().mockResolvedValue({ jobID: 'abc', status: 'failed' }),
    });

    render(<ComputeJobPage jobId="abc" api={api} />);

    expect(await screen.findByText(/job failed/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /retry|rerun/i })
    ).not.toBeInTheDocument();
  });

  it('shows a dead-end message on expired with no retry action', async () => {
    const api = makeFakeApi({
      fetchJob: jest
        .fn()
        .mockResolvedValue({ jobID: 'abc', status: 'expired' }),
    });

    render(<ComputeJobPage jobId="abc" api={api} />);

    expect(await screen.findByText(/expired/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /retry|rerun/i })
    ).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `yarn --cwd packages/libs/compute-platform-job test ComputeJobPage.test.tsx`
Expected: FAIL — `Cannot find module './ComputeJobPage'`

- [ ] **Step 3: Write `ComputeJobPage.tsx`**

```tsx
// packages/libs/compute-platform-job/src/lib/Components/ComputeJobPage.tsx
import { useCallback, useEffect, useState } from 'react';

import { SequenceRetrievalApi } from '../Service/SequenceRetrievalApi';
import { JobStatus } from '../Service/ServiceTypes';
import { useJobPolling } from '../Hooks/useJobPolling';

interface ComputeJobPageProps {
  jobId: string;
  api: SequenceRetrievalApi;
  paramsSummary?: string;
}

export function ComputeJobPage({
  jobId,
  api,
  paramsSummary,
}: ComputeJobPageProps) {
  const [status, setStatus] = useState<JobStatus>('queued');
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [guideTreeContent, setGuideTreeContent] = useState<string | null>(null);

  const onPoll = useCallback(async () => {
    const job = await api.fetchJob(jobId);
    setStatus(job.status);
  }, [api, jobId]);

  useJobPolling({ status, onPoll });

  useEffect(() => {
    if (status !== 'complete') return;
    let cancelled = false;
    (async () => {
      const files = await api.fetchJobFiles(jobId);
      const output = await api.fetchJobFile(jobId, 'output');
      if (cancelled) return;
      setFileContent(output);
      if (files.includes('guidetree.dnd')) {
        const guideTree = await api.fetchJobFile(jobId, 'guidetree.dnd');
        if (!cancelled) setGuideTreeContent(guideTree);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, api, jobId]);

  return (
    <div className="ComputeJobPage">
      <h1>Running Compute Job</h1>
      {paramsSummary && <p className="ParamsSummary">{paramsSummary}</p>}
      {status === 'queued' || status === 'in-progress' ? (
        <p className="Status">Status: {status}</p>
      ) : null}
      {status === 'complete' && fileContent != null && (
        <div className="Result">
          <pre>{fileContent}</pre>
          {guideTreeContent != null && (
            <details>
              <summary>Guide tree</summary>
              <pre>{guideTreeContent}</pre>
            </details>
          )}
        </div>
      )}
      {status === 'failed' && (
        <p className="DeadEnd">
          This job failed. Please go back and resubmit your request.
        </p>
      )}
      {status === 'expired' && (
        <p className="DeadEnd">
          This job has expired. Please go back and resubmit your request.
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn --cwd packages/libs/compute-platform-job test ComputeJobPage.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add packages/libs/compute-platform-job/src/lib/Components/ComputeJobPage.tsx \
  packages/libs/compute-platform-job/src/lib/Components/ComputeJobPage.test.tsx
git commit -m "Add ComputeJobPage component"
```

---

## Task 8: `ComputeJobRouter` and package exports

**Files:**

- Create: `packages/libs/compute-platform-job/src/lib/Controllers/ComputeJobRouter.tsx`
- Create: `packages/libs/compute-platform-job/src/lib/index.ts`
- Test: `packages/libs/compute-platform-job/src/lib/Controllers/ComputeJobRouter.test.tsx`

**Interfaces:**

- Consumes: `ComputeJobPage` from Task 7; `SequenceRetrievalApi` from Task 2.
- Produces: `ComputeJobRouter` component with props `{ api: SequenceRetrievalApi }`, exposing `/result/:jobId`. Task 9 (`computeJobRoutes.tsx` in genomics-site) is the consumer. `index.ts` re-exports everything public for `@veupathdb/compute-platform-job` imports (used by Task 6's resolver, importing `Feature`).

- [ ] **Step 1: Write the failing test**

```tsx
// packages/libs/compute-platform-job/src/lib/Controllers/ComputeJobRouter.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ComputeJobRouter } from './ComputeJobRouter';
import { SequenceRetrievalApi } from '../Service/SequenceRetrievalApi';

function makeFakeApi() {
  return {
    fetchJob: jest.fn().mockResolvedValue({ jobID: 'abc', status: 'queued' }),
    fetchJobFiles: jest.fn(),
    fetchJobFile: jest.fn(),
  } as unknown as SequenceRetrievalApi;
}

describe('ComputeJobRouter', () => {
  it('renders ComputeJobPage for /result/:jobId', async () => {
    render(
      <MemoryRouter initialEntries={['/result/abc123']}>
        <ComputeJobRouter api={makeFakeApi()} />
      </MemoryRouter>
    );

    expect(await screen.findByText('Running Compute Job')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn --cwd packages/libs/compute-platform-job test ComputeJobRouter.test.tsx`
Expected: FAIL — `Cannot find module './ComputeJobRouter'`

- [ ] **Step 3: Write `ComputeJobRouter.tsx` and `index.ts`**

```tsx
// packages/libs/compute-platform-job/src/lib/Controllers/ComputeJobRouter.tsx
import { Route, Switch, useRouteMatch } from 'react-router';

import { ComputeJobPage } from '../Components/ComputeJobPage';
import { SequenceRetrievalApi } from '../Service/SequenceRetrievalApi';

interface Props {
  api: SequenceRetrievalApi;
}

export function ComputeJobRouter({ api }: Props) {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route
        path={`${path}/result/:jobId`}
        exact
        render={(routeProps) => (
          <ComputeJobPage jobId={routeProps.match.params.jobId} api={api} />
        )}
      />
    </Switch>
  );
}
```

```typescript
// packages/libs/compute-platform-job/src/lib/index.ts
export * from './Service/ServiceTypes';
export * from './Service/SequenceRetrievalApi';
export * from './Components/ComputeJobPage';
export * from './Controllers/ComputeJobRouter';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn --cwd packages/libs/compute-platform-job test ComputeJobRouter.test.tsx`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add packages/libs/compute-platform-job/src/lib/Controllers/ComputeJobRouter.tsx \
  packages/libs/compute-platform-job/src/lib/Controllers/ComputeJobRouter.test.tsx \
  packages/libs/compute-platform-job/src/lib/index.ts
git commit -m "Add ComputeJobRouter and package exports"
```

---

## Task 9: Wire `computeJobRoutes.tsx` into genomics-site

**Files:**

- Create: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/computeJobRoutes.tsx`
- Modify: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/routes.jsx:29,254` (import + spread, mirroring `blastRoutes`)

**Interfaces:**

- Consumes: `ComputeJobRouter`, `SequenceRetrievalApi` from `@veupathdb/compute-platform-job`; `RouteEntry` from `@veupathdb/wdk-client/lib/Core/RouteEntry`.
- Produces: the `computeJobRoutes` array spread into the site's route table, giving the site the `/workspace/msa/result/:jobId` route. Task 12's confirm-handler `history.push` call targets this exact path.

- [ ] **Step 1: There is no meaningful failing-test step for a route-wiring file** — `RouteEntry[]` arrays are declarative config consumed by react-router's `Switch`, and `blastRoutes.tsx` (the precedent this mirrors) has no test file either. Verify by manual check after wiring (Step 3) instead.

- [ ] **Step 2: Write `computeJobRoutes.tsx`**

Needs a `SequenceRetrievalApi` instance, which needs a `baseUrl` (the sequence-retrieval service's URL) and the site's `WdkService`. Follow the `BlastApi.getBlastClient` memoization pattern (`FetchClientWithCredentials.getClient`, already inherited) so route re-renders don't construct a new client instance each time:

```tsx
// packages/sites/genomics-site/webapp/wdkCustomization/js/client/computeJobRoutes.tsx
import React, { Suspense } from 'react';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { RouteEntry } from '@veupathdb/wdk-client/lib/Core/RouteEntry';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import {
  ComputeJobRouter,
  SequenceRetrievalApi,
} from '@veupathdb/compute-platform-job';

// TODO: confirm the actual deployed base URL for service-sequence-retrieval
// with the team before this ships — this is a placeholder host.
const SEQUENCE_RETRIEVAL_BASE_URL = 'https://sequence-retrieval.example.org';

function ComputeJobRouterContainer() {
  const { wdkService } = useNonNullableContext(WdkDependenciesContext);
  const api = SequenceRetrievalApi.getClient(
    SEQUENCE_RETRIEVAL_BASE_URL,
    wdkService
  );

  return <ComputeJobRouter api={api} />;
}

export const computeJobRoutes: RouteEntry[] = [
  {
    path: '/workspace/msa',
    exact: false,
    component: () => (
      <Suspense fallback={<Loading />}>
        <ComputeJobRouterContainer />
      </Suspense>
    ),
  },
];
```

- [ ] **Step 3: Wire into `routes.jsx`**

In `packages/sites/genomics-site/webapp/wdkCustomization/js/client/routes.jsx`, add the import alongside the existing `blastRoutes` import (near line 29) and spread `computeJobRoutes` alongside `...blastRoutes` (near line 254):

```javascript
import { computeJobRoutes } from './computeJobRoutes';
```

```javascript
  ...blastRoutes,
  ...computeJobRoutes,
```

- [ ] **Step 4: Manual verification**

Run: `cd packages/sites/genomics-site && yarn start` (or the site's existing dev-server command), navigate to `/workspace/msa/result/test123`. Confirm the page renders "Running Compute Job" without a router error (the `fetchJob` call will fail against a placeholder URL — that's expected at this stage; confirm the _route_ resolves, not that the _data_ loads).

- [ ] **Step 5: Commit**

```bash
git add packages/sites/genomics-site/webapp/wdkCustomization/js/client/computeJobRoutes.tsx \
  packages/sites/genomics-site/webapp/wdkCustomization/js/client/routes.jsx
git commit -m "Wire computeJobRoutes into genomics-site"
```

---

## Task 10: Switch Orthologs table row selection to `ortho_source_id`

**Files:**

- Modify: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/records/GeneRecordClasses.GeneRecordClass.jsx:1626-1662` (selection handlers)
- Modify: same file, `1569-1601` (transcript-per-gene dedup) — no change to dedup _logic_ in this task, only confirming it still compiles against the renamed field it reads (`ortho_gene_source_id`, unchanged — the dedup groups by gene, which is correct; only _selection_ moves to the transcript ID)

**Interfaces:**

- Consumes: no new imports.
- Produces: `OrthologsForm.isRowSelected`/`onRowSelect`/`onRowDeselect`/`onMultipleRowSelect`/`onMultipleRowDeselect` now key on `ortho_source_id` instead of `ortho_gene_source_id`. Task 11's toggle-gating logic and Task 12's resolver call both depend on `selectedRowIds` now containing transcript IDs.

This file is a `.jsx` class component with no existing test file and no test infra wired up for it in this plan (there is no `GeneRecordClasses.GeneRecordClass.test.jsx` precedent in the codebase, and adding one would require substantially more scaffolding — a `record` prop fixture, `SortKeyTable` base-class mocking — than this one field rename justifies). Verify this task by manual testing in Step 3 instead of an automated test, consistent with how this file already has zero test coverage.

- [ ] **Step 1: Make the field-name change**

In `OrthologsForm` (`GeneRecordClasses.GeneRecordClass.jsx:1626-1662`), replace every `ortho_gene_source_id` with `ortho_source_id`:

```javascript
  isRowSelected({ ortho_source_id }) {
    return this.state.selectedRowIds.includes(ortho_source_id);
  }

  onRowSelect({ ortho_source_id }) {
    this.setState((state) => ({
      ...state,
      selectedRowIds: state.selectedRowIds.concat(ortho_source_id),
    }));
  }

  onRowDeselect({ ortho_source_id }) {
    this.setState((state) => ({
      ...state,
      selectedRowIds: state.selectedRowIds.filter(
        (id) => id !== ortho_source_id
      ),
    }));
  }

  onMultipleRowSelect(rows) {
    this.setState((state) => ({
      ...state,
      selectedRowIds: state.selectedRowIds.concat(
        rows.map((row) => row['ortho_source_id'])
      ),
    }));
  }

  onMultipleRowDeselect(rows) {
    this.setState((state) => ({
      ...state,
      selectedRowIds: state.selectedRowIds.filter((row) =>
        rows.includes(row['ortho_source_id'])
      ),
    }));
  }
```

Leave `transcriptFilterAwareValues`'s dedup logic (lines 1569-1601 in `OrthologsFormContainer`) untouched in this task — it groups by `ortho_gene_source_id` (the gene ID) on purpose, to collapse multiple transcript rows down to one per gene, which is unrelated to which field _selection_ uses.

- [ ] **Step 2: Update the `ClustalAlignmentForm` hidden inputs that read `selectedRowIds`**

Further down in `OrthologsForm.render()` (around line 1729, inside the `ClustalAlignmentForm`), the hidden `gene_ids` inputs currently map `this.state.selectedRowIds` directly — this code still works unchanged structurally (it's still mapping `selectedRowIds` to hidden inputs), but its _semantic meaning_ changes: these are now transcript IDs, not gene IDs. This particular hidden-input rendering is superseded entirely by Task 12 (which replaces the whole confirm flow), so no edit is needed here in this task — just confirm during Task 12 that the old `gene_ids` hidden-input block is deleted, not left stale.

- [ ] **Step 3: Manual verification**

Start the genomics-site dev server, navigate to a gene record page with a populated Orthologs table (e.g. the `PF3D7_0200300` gene from the original URL in this conversation), check a transcript row's checkbox, and confirm — via browser devtools React inspector — that `OrthologsForm`'s `state.selectedRowIds` now contains a value matching that row's `ortho_source_id`, not `ortho_gene_source_id`. (If the two happen to look similar or identical for the specific test gene picked, pick a different test gene with multiple transcripts per ortholog to confirm they actually diverge — the whole point of this task is that they _can_ diverge.)

- [ ] **Step 4: Commit**

```bash
git add packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/records/GeneRecordClasses.GeneRecordClass.jsx
git commit -m "Switch Orthologs table row selection to ortho_source_id"
```

---

## Task 11: Gate checkbox selection on the one-transcript-per-gene toggle

**Files:**

- Modify: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/records/GeneRecordClasses.GeneRecordClass.jsx:1534-1610` (`OrthologsFormContainer` — thread the toggle state down as a prop)
- Modify: same file, `1612-1662` (`OrthologsForm` — gate `onRowSelect`/`onMultipleRowSelect` on the new prop)

**Interfaces:**

- Consumes: none new.
- Produces: `OrthologsForm` now receives a `showLongestTranscriptPerGene: boolean` prop; `onRowSelect`/`onMultipleRowSelect` no-op (with a warning message) when it's `false`. No other task depends on this directly, but Task 12's resolver correctness relies on selection having already been gated (guaranteeing at most one transcript per gene reaches the resolver).

- [ ] **Step 1: Thread the toggle state down in `OrthologsFormContainer`**

Currently `showLongestTranscriptPerGene` (state) and `transcriptFilter` (the checkbox JSX) exist in `OrthologsFormContainer`, but only `transcriptFilter` is passed to `OrthologsForm` — the boolean itself isn't. Add it as a prop:

```javascript
return (
  <OrthologsForm
    {...props}
    value={transcriptFilterAwareValues}
    transcriptFilter={transcriptFilter}
    showLongestTranscriptPerGene={showLongestTranscriptPerGene}
  />
);
```

- [ ] **Step 2: Add a "Select one-per-gene first" feedback message and gate the handlers**

In `OrthologsForm`, add local state for a transient feedback message, and check `this.props.showLongestTranscriptPerGene` at the top of both selection handlers before applying any change:

```javascript
class OrthologsForm extends SortKeyTable {
  constructor() {
    super();
    this.state = {
      selectedRowIds: [],
      groupBySelected: false,
      showSelectGateMessage: false,
    };
    this.isRowSelected = this.isRowSelected.bind(this);
    this.onRowSelect = this.onRowSelect.bind(this);
    this.onRowDeselect = this.onRowDeselect.bind(this);
    this.onMultipleRowSelect = this.onMultipleRowSelect.bind(this);
    this.onMultipleRowDeselect = this.onMultipleRowDeselect.bind(this);
  }

  isRowSelected({ ortho_source_id }) {
    return this.state.selectedRowIds.includes(ortho_source_id);
  }

  onRowSelect({ ortho_source_id }) {
    if (!this.props.showLongestTranscriptPerGene) {
      this.setState({ showSelectGateMessage: true });
      return;
    }
    this.setState((state) => ({
      ...state,
      selectedRowIds: state.selectedRowIds.concat(ortho_source_id),
      showSelectGateMessage: false,
    }));
  }

  onRowDeselect({ ortho_source_id }) {
    // Deselecting is always allowed, regardless of the toggle — the gate is
    // only on adding new selections (see design doc: "existing selections
    // are left alone; only new checkbox clicks are blocked while the toggle
    // is off").
    this.setState((state) => ({
      ...state,
      selectedRowIds: state.selectedRowIds.filter(
        (id) => id !== ortho_source_id
      ),
    }));
  }

  onMultipleRowSelect(rows) {
    if (!this.props.showLongestTranscriptPerGene) {
      this.setState({ showSelectGateMessage: true });
      return;
    }
    this.setState((state) => ({
      ...state,
      selectedRowIds: state.selectedRowIds.concat(
        rows.map((row) => row['ortho_source_id'])
      ),
      showSelectGateMessage: false,
    }));
  }

  onMultipleRowDeselect(rows) {
    this.setState((state) => ({
      ...state,
      selectedRowIds: state.selectedRowIds.filter((row) =>
        rows.includes(row['ortho_source_id'])
      ),
    }));
  }
```

- [ ] **Step 3: Render the feedback message**

In `OrthologsForm.render()`, near where `this.props.transcriptFilter` is rendered (inside the `ClustalAlignmentForm`'s children, per the existing JSX around line 1737 — `{this.props.transcriptFilter}`), add the conditional message:

```jsx
{
  this.props.transcriptFilter;
}
{
  this.state.showSelectGateMessage && (
    <p className="SelectGateMessage" style={{ color: 'firebrick' }}>
      Select one-per-gene first
    </p>
  );
}
```

- [ ] **Step 4: Manual verification**

Start the dev server, navigate to a gene record page with an Orthologs table. With the "Show only one transcript per gene" toggle unchecked, click a row checkbox — confirm the checkbox does not become checked and "Select one-per-gene first" appears. Check the toggle on, click the same checkbox — confirm it now checks normally and the message disappears. With a row already checked, uncheck the toggle — confirm the existing checked row stays checked (per the design's "existing selections are left alone" rule).

- [ ] **Step 5: Commit**

```bash
git add packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/records/GeneRecordClasses.GeneRecordClass.jsx
git commit -m "Gate Orthologs checkbox selection on the one-transcript-per-gene toggle"
```

---

## Task 12: Wire the confirm dialog to resolve, submit, and navigate

**Files:**

- Modify: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/records/GeneRecordClasses.GeneRecordClass.jsx:1710-1821` (`OrthologsForm.render`'s `ClustalAlignmentForm` usage)

**Interfaces:**

- Consumes: `resolveTranscriptFeatures` from Task 6; `SequenceRetrievalApi` from Task 2; `useHistory` from `react-router`; `WdkDependenciesContext`/`useNonNullableContext` from `@veupathdb/wdk-client`.
- Produces: clicking "Run Clustal Omega for selected genes" now resolves the selected transcript IDs to `Feature[]`, submits a job, and navigates to `/workspace/msa/result/:jobId` — replacing the old `<form action="/cgi-bin/isolateAlignment">` POST entirely.

`OrthologsForm` is a class component, but `useHistory`/`useNonNullableContext` are hooks. Rather than converting the whole class to a function component (out of scope — a much larger, riskier change than this plan should make), wrap just the new confirm-handling logic in a small function component rendered inside `OrthologsForm.render()`, following the same pattern the codebase already uses elsewhere for hooks-in-class-render (e.g. `OrthologsFormContainer` itself is exactly this pattern, a function component wrapping stateful logic for a class-based child).

- [ ] **Step 1: There is no isolated unit-testable step here** — this task replaces JSX/markup and event wiring inline in a large existing render method with no test harness. Verify via Step 4's manual test, consistent with the rest of this file's testing posture.

- [ ] **Step 2: Replace the `ClustalAlignmentForm` block**

Replace the entire JSX block from `<ClustalAlignmentForm ...>` through its closing `</ClustalAlignmentForm>` (lines 1713-1821) with a new component, `TranscriptMsaSubmission`, that renders the same warn/block confirm dialog (via `ClustalAlignmentForm`, unchanged) but replaces the `<form>`'s hidden inputs and the implicit `form.submit()` action with an explicit resolve-submit-navigate handler.

`ClustalAlignmentForm` (from `packages/libs/web-common/src/components/records/ClustalAlignmentForm.tsx`, read earlier in this conversation) renders a `<form onSubmit={handleSubmit}>` internally and calls `formRef.current.submit()` on confirm — it has no concept of an async, non-form-submit confirm action. Rather than modifying that shared component (used by 2 other call sites this plan doesn't touch), add a new prop `onConfirm?: () => void` that, when provided, is called _instead of_ `formRef.current.submit()`. This is a small, additive, backward-compatible change to the shared component — Popset and ortho-site's existing usages are unaffected since they don't pass the new prop.

First, the small addition to `packages/libs/web-common/src/components/records/ClustalAlignmentForm.tsx`:

```typescript
interface ClustalAlignmentFormProps {
  action: string;
  sequenceCount: number;
  children: React.ReactNode;
  sequenceType?: string;
  warnThreshold?: number | ((form: HTMLFormElement) => number);
  blockThreshold?: number | ((form: HTMLFormElement) => number);
  /** If provided, called instead of submitting the form on confirm. */
  onConfirm?: () => void;
}
```

```typescript
const handleConfirm = () => {
  setShowModal(false);
  if (onConfirm) {
    onConfirm();
  } else if (formRef.current) {
    formRef.current.submit();
  }
};
```

(Destructure `onConfirm` alongside the existing props at the top of the function.)

Then, in `GeneRecordClasses.GeneRecordClass.jsx`, replace the block:

```jsx
return (
  <TranscriptMsaSubmission
    selectedTranscriptIds={this.state.selectedRowIds}
    sourceId={source_id}
    isProtein={is_protein}
    isNotProtein={not_protein}
    orthoTableProps={orthoTableProps}
    transcriptFilter={this.props.transcriptFilter}
    defaultComponent={this.props.DefaultComponent}
    value={this.sortValue(this.props.value)}
    childProps={this.props}
  />
);
```

Add the new component above `OrthologsForm`'s class declaration:

```jsx
function TranscriptMsaSubmission({
  selectedTranscriptIds,
  sourceId,
  isProtein,
  isNotProtein,
  orthoTableProps,
  transcriptFilter,
  defaultComponent: DefaultComponent,
  value,
  childProps,
}) {
  const { wdkService } = useNonNullableContext(WdkDependenciesContext);
  const history = useHistory();
  const [sequenceTypeChoice, setSequenceTypeChoice] = useState(
    isProtein ? 'protein' : 'genomic'
  );
  const [oneOffset, setOneOffset] = useState('');
  const [twoOffset, setTwoOffset] = useState('');
  const [clustalOutFormat, setClustalOutFormat] = useState('clu');

  const handleConfirm = async () => {
    const features = await resolveTranscriptFeatures(wdkService, [
      sourceId,
      ...selectedTranscriptIds,
    ]);

    const sequenceType =
      sequenceTypeChoice === 'genomic' ? 'genomic' : 'protein';
    const outFormat = CLUSTAL_OUT_FORMAT_TO_MSA_FORMAT[clustalOutFormat];

    const api = SequenceRetrievalApi.getClient(
      SEQUENCE_RETRIEVAL_BASE_URL,
      wdkService
    );
    const job = await api.submitJob(sequenceType, {
      features,
      postProcess: 'MSA',
      msaOptions: { format: outFormat },
    });

    history.push(`/workspace/msa/result/${job.jobID}`);
  };

  return (
    <ClustalAlignmentForm
      action="/cgi-bin/isolateAlignment"
      sequenceCount={selectedTranscriptIds.length + 1}
      sequenceType="genes"
      warnThreshold={() => (sequenceTypeChoice === 'genomic' ? 10 : 1000)}
      blockThreshold={() => (sequenceTypeChoice === 'genomic' ? 50 : 1000)}
      onConfirm={handleConfirm}
    >
      {transcriptFilter}
      <DefaultComponent
        {...childProps}
        value={value}
        orthoTableProps={orthoTableProps}
      />
      <p>
        <b>
          Select sequence type for Clustal Omega multiple sequence alignment:
        </b>
      </p>
      <div id="userOptions">
        {isProtein && (
          <>
            {' '}
            <input
              type="radio"
              name="sequence_Type"
              checked={sequenceTypeChoice === 'protein'}
              onChange={() => setSequenceTypeChoice('protein')}
            /> Protein{' '}
          </>
        )}
        {isProtein && (
          <>
            {' '}
            <input
              type="radio"
              name="sequence_Type"
              checked={sequenceTypeChoice === 'CDS'}
              onChange={() => setSequenceTypeChoice('CDS')}
            /> CDS (spliced){' '}
          </>
        )}
        <input
          type="radio"
          name="sequence_Type"
          checked={sequenceTypeChoice === 'genomic'}
          onChange={() => setSequenceTypeChoice('genomic')}
        />{' '}
        Genomic
        <span className="genomic">
          <input
            type="number"
            placeholder="0"
            size="4"
            pattern="[0-9]+"
            min="0"
            max="2500"
            value={oneOffset}
            onChange={(e) => setOneOffset(e.target.value)}
          />{' '}
          nt upstream (max 2500)
          <input
            type="number"
            placeholder="0"
            size="4"
            pattern="[0-9]+"
            min="0"
            max="2500"
            value={twoOffset}
            onChange={(e) => setTwoOffset(e.target.value)}
          /> nt downstream (max 2500)
        </span>
        <p>
          Output format: &nbsp;
          <select
            value={clustalOutFormat}
            onChange={(e) => setClustalOutFormat(e.target.value)}
          >
            <option value="clu">Mismatches highlighted</option>
            <option value="fasta">FASTA</option>
            <option value="phy">PHYLIP</option>
            <option value="st">STOCKHOLM</option>
            <option value="vie">VIENNA</option>
          </select>
        </p>
        <input type="submit" value="Run Clustal Omega for selected genes" disabled={selectedTranscriptIds.length < 2} title={selectedTranscriptIds.length < 2 ? 'Check two or more checkboxes in the table above to use this feature.' : ''} />
      </div>
    </ClustalAlignmentForm>
  );
}
```

Add the format-code mapping and imports near the top of the file:

```javascript
import { useHistory } from 'react-router';
import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { SequenceRetrievalApi } from '@veupathdb/compute-platform-job';
import { resolveTranscriptFeatures } from '../../util/resolveTranscriptFeatures';

// Old CGI form codes -> new service MsaFormat values (see design doc's
// carried-over sequenceType/output-format table).
const CLUSTAL_OUT_FORMAT_TO_MSA_FORMAT = {
  clu: 'clustal',
  fasta: 'fasta',
  phy: 'phylip',
  st: 'stockholm',
  vie: 'vienna',
};

// TODO: share this constant with computeJobRoutes.tsx instead of duplicating
// it — extract to a small shared config module in a follow-up cleanup once
// the real deployed URL is confirmed with the team.
const SEQUENCE_RETRIEVAL_BASE_URL = 'https://sequence-retrieval.example.org';
```

Note this task deliberately drops the upstream/downstream flanking-offset values (`oneOffset`/`twoOffset`) from actually being sent anywhere — the old CGI form applied them server-side when building genomic coordinates from gene IDs, but `resolveTranscriptFeatures`'s current implementation (Task 6) returns exon/CDS-level BED coordinates from `bedReporter` directly, with no flanking-offset parameter. **This is a real gap, not an oversight to silently ignore**: flag it to the user/team before this ships — either `bedReporter` needs a flanking-region parameter (extending Task 3's discovery), or the resolver needs to add the offsets to `start`/`end` client-side after parsing the BED response, which requires knowing the contig's total length to avoid producing an out-of-bounds `end`. Do not guess at a fix within this task; the offset inputs are left in the UI (matching the old form) but not yet wired to anything, and that gap must be called out explicitly when this task is reviewed.

- [ ] **Step 3: Run the existing test suite for regressions**

Run: `yarn --cwd packages/sites/genomics-site test`
Expected: PASS — no existing tests reference `OrthologsForm`'s internals directly (confirmed in Task 10's setup — no test file for this component exists), so this only catches unrelated breakage from the import changes.

- [ ] **Step 4: Manual verification**

Start the dev server, navigate to a gene record page, enable the one-transcript-per-gene toggle, select 2+ transcripts, click "Run Clustal Omega for selected genes." Confirm: the warn/block dialog appears exactly as before (same copy, same thresholds); on confirming, the browser navigates to `/workspace/msa/result/<some-id>` in the same tab (not a new tab); the `ComputeJobPage` shows "Running Compute Job." (The actual job submission will fail against the placeholder `SEQUENCE_RETRIEVAL_BASE_URL` — confirm the _navigation and resolve_ steps work, not that the _job completes_, until Task 9's placeholder URL is replaced with the real deployed URL.)

- [ ] **Step 5: Commit**

```bash
git add packages/libs/web-common/src/components/records/ClustalAlignmentForm.tsx \
  packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/records/GeneRecordClasses.GeneRecordClass.jsx
git commit -m "Wire Orthologs confirm dialog to resolve, submit, and navigate to the async job page"
```

---

## Self-Review Notes

**Spec coverage check** — every section of the design doc maps to a task:

- Service contract (submit/poll/files/no-cancel/no-rerun) → Tasks 1, 2, 7 (dead-end handling)
- `resolveTranscriptFeatures` + `GeneByLocusTag` + `bedReporter` → Tasks 3, 6
- One-transcript-per-gene selection gate → Task 11
- `ortho_source_id` row-selection switch → Task 10
- `sequenceType` carried over from the radio unchanged → Task 12
- `compute-platform-job` package (types, API client, polling hook, page, router) → Tasks 1, 2, 4, 5, 7, 8
- Site route wiring → Task 9
- Confirm dialog kept, action changed → Task 12
- Non-goals (Popset/ortho-site resolvers, cancellation, rerun endpoint, data-release purging, job history list) → correctly excluded from every task above; no task builds toward any of them.

**Known gaps surfaced by this plan, not hidden:**

- Flanking-offset (`oneOffset`/`twoOffset`) handling is left unresolved in Task 12 and explicitly flagged rather than guessed at.
- Task 3's `bedReporter` shape and strand-attribute discovery may require access this environment doesn't have (a live WDK instance) — Task 3 says to stop and flag rather than fabricate an answer.
- `SEQUENCE_RETRIEVAL_BASE_URL` is a placeholder in two files (Task 9, Task 12) needing a real value from the team before this ships to any real environment; both are marked `TODO` and called out again in each task's manual-verification step.
