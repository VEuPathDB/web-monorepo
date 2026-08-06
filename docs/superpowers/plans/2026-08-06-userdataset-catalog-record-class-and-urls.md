# User Dataset Catalog: Record-Class Filtering and Service-Supplied URLs

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the curated path's record-class filter to user dataset searches, and stop reconstructing search URLs client-side — take them from the `url` the service already supplies.

**Architecture:** Both changes are confined to `InternalGeneDataset.tsx`. The record-class fix adds one `.filter()` at the point where user dataset searches merge into the shared `InternalQuestionRecord[]`. The URL fix replaces a hand-built query string (which encoded a per-parameter `EDAUD_`-prefix rule the client should not know) with the query string parsed off the service-supplied `url`, threaded onto the row as `search_url`.

**Tech Stack:** TypeScript, React 18, Redux, Yarn 4 workspaces, Nx 16.

**Source document — read before starting:**

- Design: `docs/superpowers/specs/2026-08-06-userdataset-internal-search-catalog-design.md`

**Status:** Implemented on branch `fix-internal-srch-pg-bugs`, 2026-08-06. Typecheck and Prettier pass; **browser verification not yet run** (Task 5).

## Global Constraints

- **`question_name` is namespaced and is not `queryName`.** These are different fields. `pluginConfig.tsx`
  matches on `queryName`; this table carries `question_name`. Do not "fix" one because the other changed.
- **`record_class`, not `record_type`.** A now-deleted root-level plan said `record_type`; the live service
  says `record_class`. Trust the service.
- **A search with no `url` is a service defect.** Throw; do not reconstruct a link. Reconstruction is the bug
  being removed, and a fallback that reintroduces it would be dead code that never gets tested.
- **Do not add null-guards or warnings opportunistically.** The silent row-drop and spinner-on-throw issues are
  real (see the spec's "Known weaknesses") but deliberately out of scope — they need their own change.
- **No test harness** in `packages/sites/genomics-site` (no test files, no `test` script). The per-task gate is
  `npx tsc --noEmit -p tsconfig.json` from `packages/sites/genomics-site`, plus Prettier.
- Run commands from the repo root unless stated.

---

## File Structure

**Modified:**

| Path                                                                                                          | Change                |
| ------------------------------------------------------------------------------------------------------------- | --------------------- |
| `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/questions/InternalGeneDataset.tsx` | Both fixes; all edits |

**Deleted separately:** the root-level `USERDATASET_INTEGRATION_PLAN.md` this work superseded. Its durable
content lives in the spec above.

---

## Task 1: Type definitions

- [ ] In `UserDatasetQuestionRecord`, remove `dataset_id_param` and add `url: string` (required — the throw in
      Task 2 guarantees it).
- [ ] In `DatasourceRecord`, replace `dataset_id_param?: string` with `search_url?: string`, commented as
      absent on curated rows.

`search_url` is optional on `DatasourceRecord` because that type is shared with curated rows, which have no
URL. `UserDatasetQuestionRecord.url` is required because every user dataset search must have one. The
asymmetry is intentional.

**Gate:** `npx tsc --noEmit` will fail until Task 4 — expected.

---

## Task 2: Require `url` in `getUserDatasetInternalQuestions`

- [ ] Convert the `.map()` body from an expression to a block.
- [ ] Throw when `url` is missing or empty, naming both the dataset and the question:

```ts
if (typeof search.url !== 'string' || search.url === '') {
  throw new Error(
    `ExploreWebsiteSearches entry for UserDataset ${record.attributes.dataset_id} / ${search.question_name} has no url`
  );
}
```

- [ ] Return `url: search.url` alongside the existing fields; drop `dataset_id_param`.
- [ ] Read `search.url` only — **not** `search.url ?? search.search_link?.url`. Both exist and are identical;
      coding around two spellings when the service emits one adds an untaken branch.

The throw surfaces as an error modal with this message and is reported server-side, via the existing
`useWdkService` rejection handling. It does leave the page behind the modal on `<Loading />` — a known,
out-of-scope weakness (spec, "Known weaknesses" #2), not a reason to soften the check.

---

## Task 3: Filter user dataset searches by record class

- [ ] At the merge in the `useWdkService` callback, insert a `.filter()` before the existing `.map()`:

```ts
...userdatasetInternalQuestions
  // Mirror the datasource path (see getInternalQuestions), which keeps
  // only references whose record type matches this page's output.
  .filter((udq) => udq.record_class === outputRecordClass.fullName)
  .map((udq) => ({ ... }))
```

- [ ] Keep `record_type: udq.record_class` in the mapped object — the merged shape is
      `InternalQuestionRecord`, whose field is named `record_type`.

`outputRecordClass` is non-null here; the callback early-returns otherwise. Compare against `.fullName`, which
is what the curated path uses (`getInternalQuestions` is called with `outputRecordClass.fullName`).

No presence gate: absence of `record_class` means a mismatch and the row is dropped. This was a deliberate
choice over failing open — the field is confirmed present in the live response, and the doc that claimed
otherwise was stale.

---

## Task 4: Use the supplied URL

- [ ] In `getUserDatasetRecords`, replace the `dataset_id_param` assignment with
      `search_url: userDatasetRecord.tables?.ExploreWebsiteSearches?.[0]?.url`.
- [ ] Rewrite `getCategorySearchUrl` to take `(questionName, source, internalSearchName, searchUrl: string)` —
      dropping `datasetId` and `datasetIdParam` — and branch on `source === 'userdataset'` alone:

```ts
const queryStart = searchUrl.indexOf('?');
const queryString = queryStart === -1 ? '' : searchUrl.slice(queryStart);
return `${internalSearchName}${queryString}#${questionName}`;
```

- [ ] Delete the `eda_dataset_id` / `EDAUD_`-stripping block entirely.
- [ ] Update the call site in the `searches` column renderer: destructure `search_url` instead of `dataset_id`
      and `dataset_id_param`, and pass the new argument order.

Do **not** write `source === 'userdataset' && searchUrl`. The truthiness check cannot fail given Task 2's
throw, and it silently re-admits the link-less button the throw exists to prevent.

Only the query string is used, so the `rootUrl` prefix never reaches `<Link>` — no basename stripping and no
`rootUrl` import.

**Gate:** `npx tsc --noEmit -p tsconfig.json` from `packages/sites/genomics-site` → clean.
`npx prettier --check` on the file → clean.
`grep -n "dataset_id_param" InternalGeneDataset.tsx` → no matches.

---

## Task 5: Browser verification — NOT YET RUN

Requires user dataset rows to be rendering, i.e. the search present in the category ontology. Two fixtures were
available on PlasmoDB during implementation: `EDAUD_MhR5FF8cE40Z8` (Private) and `EDAUD_xoR5M00Ug90RN`
(Public), both _P. falciparum_ 3D7, both offering `GeneQuestions.GenesByDESeqUserDataset` with param
`eda_dataset_id`.

On `search/transcript/GenesByRNASeqEvidence`:

- [ ] Both user dataset rows render. **Primary check** — a wrong comparison in Task 3 empties the table
      silently rather than erroring.
- [ ] Override `record_class` to a non-transcript value (e.g. `GeneRecordClasses.GeneRecordClass`) in DevTools
      → that row disappears, the other remains.
- [ ] A category button's `href` is
      `/a/app/search/transcript/GenesByRNASeqEvidence?param.eda_dataset_id=EDAUD_MhR5FF8cE40Z8#GenesByDESeqUserDataset`
      — no doubled `/a/app`, `EDAUD_` intact, hash present. Should be byte-identical to pre-change.
- [ ] Clicking it opens the in-page tab with the parameter pre-filled.
- [ ] Loading the page with `#GenesByDESeqUserDataset` selects the right tab.
- [ ] Delete `url` from a response entry → error modal naming dataset and question. (Page behind it stays on
      `<Loading />` — expected, out of scope.)
- [ ] Override `url` to a different param name and non-prefixed id (e.g. `?param.rna_seq_dataset=MhR5FF8cE40Z8`)
      → the button follows it verbatim. **This is the point of Task 4.**
- [ ] Curated rows' buttons unchanged.
- [ ] One sibling catalog page (any question with `datasetCategory` + `datasetSubtype`) still behaves.
