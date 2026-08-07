# Dataset Source Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the duplicated dataset-source filter into one shared module, and add the rule that public datasets owned by the VEuPathDB curator account appear in the VEuPathDB Datasets category.

**Architecture:** A new `datasetSourceCategory.tsx` module owns a pure classifier (`getDatasetCategory`), a state hook (`useDatasetSourceFilter`), and two presentational components (`DatasetSourceFilters`, `DatasetSourceIcon`). Both consuming pages keep their existing filtering _mechanism_ — `InternalGeneDataset` passes a `filterPredicate` to `CommonResultTable`; `AllDatasetsAnswerController` pre-filters and overrides `stateProps` — and share only the _logic_. The classifier takes a normalized `DatasetSourceInfo` rather than a raw record, because the two pages store the discriminator under different field names.

**Tech Stack:** TypeScript, React (function components + hooks), SCSS, `@material-ui/icons`. No new dependencies.

**Design spec:** `docs/superpowers/specs/2026-08-07-dataset-source-filter-design.md`

## Global Constraints

- **No new dependencies.** `genomics-site` has no test runner (no jest/vitest, no `test` script, zero test files). Adding one is a team decision and is explicitly out of scope.
- **Verification is `npx tsc --noEmit` plus the manual browser checklist in Task 5.** There are no automated tests to write or run.
- **Attribute name:** `owner_is_veupathdb_curator`, on the `userdataset` record class, `results` scope. Already added to the WDK model XML (separate repo).
- **Serialization — verified 2026-08-07.** `owner_is_veupathdb_curator` arrives as the lowercase STRING `"yes"`. It may change to `"Yes"`; `parseYesNo` trims and lowercases, so both work with no code change. (`is_public` arrives as `"Public"`/`"Private"`.)
- **The record link must not change.** Curator datasets stay `/record/userdataset/...`; they are genuinely `userdataset` records.
- **Private curator datasets stay in Private User Datasets.** The rule is a conjunction, written explicitly.
- Commit after each task. Do not commit unrelated files — the user handles their own commits, so **stop and report** rather than committing if instructed otherwise.

## File Structure

| File                                                                           | Responsibility                                                                  |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `.../js/client/util/datasetSourceCategory.tsx` _(new)_                         | Category type, classifier, `parseYesNo`, state hook, checkbox + icon components |
| `.../js/client/components/questions/InternalGeneDataset.tsx` _(modify)_        | Consumes the shared module; adds the attribute to its hardcoded fetch config    |
| `.../js/client/component-wrappers/AllDatasetsAnswerController.tsx` _(modify)_  | Consumes the shared module; fixes the non-default-attribute fetch bug           |
| `.../js/client/components/questions/InternalGeneDataset.scss` _(modify)_       | Drops its duplicated `SourceFilters` rules                                      |
| `.../js/client/component-wrappers/AllDatasetsAnswerController.scss` _(modify)_ | Drops its duplicated `SourceFilters` rules                                      |

All paths are under `packages/sites/genomics-site/webapp/wdkCustomization/`.

**Note on line numbers:** verified against the current working tree on branch `handle-veupath-staff-users` (post-merge, 2026-08-07). `AllDatasetsAnswerController.tsx` is 601 lines. If they have drifted, locate by the quoted code rather than by number.

---

### Task 1: Create the shared module

Self-contained: creates one new file, imported by nobody yet. Compiles independently.

**Files:**

- Create: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/util/datasetSourceCategory.tsx`
- Create: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/util/datasetSourceCategory.scss`

**Interfaces:**

- Consumes: nothing from other tasks.
- Produces: `DatasetCategory`, `DatasetSourceInfo`, `getDatasetCategory(info): DatasetCategory`, `parseYesNo(value: unknown): boolean`, `useDatasetSourceFilter(): {visibility, setVisibility}`, `<DatasetSourceFilters visibility setVisibility />`, `<DatasetSourceIcon category />`.

- [ ] **Step 1: Create the SCSS file**

Copy the shared rules from the two existing stylesheets. Note the AllDatasets copy's `display:none` / `.positioned` hack is **already gone** (the DOM-injection removal branch merged), so it is not carried over. Margins differ between the two pages, so they stay with the callers.

```scss
.DatasetSourceFilters {
  display: flex;
  gap: 1.5rem;
  padding: 0.5rem;

  label {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    cursor: pointer;
    font-size: 110%;

    svg,
    img {
      flex-shrink: 0;
    }
  }
}
```

- [ ] **Step 2: Create the module**

```tsx
import React from 'react';
import LockIcon from '@material-ui/icons/Lock';
import PublicIcon from '@material-ui/icons/Public';
import { projectId, webAppUrl } from '@veupathdb/web-common/lib/config';

import './datasetSourceCategory.scss';

export type DatasetCategory = 'veupathdb' | 'publicUser' | 'privateUser';

/**
 * The normalized inputs the classifier needs. Callers adapt their own record
 * shape into this — InternalGeneDataset stores the discriminator as
 * `source: 'datasource' | 'userdataset'`, AllDatasets as
 * `dataset_source: 'dataset' | 'userdataset'`.
 */
export interface DatasetSourceInfo {
  isUserDataset: boolean;
  isPublic: boolean;
  ownerIsVeupathdbCurator: boolean;
}

/**
 * WDK serializes yes/no attributes as strings. Always lowercase (and trim)
 * whatever the backend sends before comparing — never compare raw. The exact
 * casing of `owner_is_veupathdb_curator` is not guaranteed and could change
 * without notice, so a case-sensitive comparison is a latent silent failure.
 *
 * Anything unrecognized — including undefined — is false, so a missing or
 * unexpected value leaves a dataset in its current category rather than
 * promoting it into the VEuPathDB bucket.
 */
export function parseYesNo(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return false;
  const normalized = value.trim().toLowerCase();
  return normalized === 'yes' || normalized === 'true' || normalized === 'y';
}

/**
 * A public dataset owned by the VEuPathDB curator account is presented as a
 * VEuPathDB dataset. A *private* curator dataset stays private — the rule is
 * a conjunction, not a fallthrough.
 */
export function getDatasetCategory(info: DatasetSourceInfo): DatasetCategory {
  if (!info.isUserDataset) return 'veupathdb';
  if (info.ownerIsVeupathdbCurator && info.isPublic) return 'veupathdb';
  return info.isPublic ? 'publicUser' : 'privateUser';
}

const ICON_STYLE = { width: '20px', height: '20px' } as const;

export function DatasetSourceIcon({ category }: { category: DatasetCategory }) {
  switch (category) {
    case 'veupathdb':
      return (
        <img
          src={`${webAppUrl}/images/${projectId}/favicon.ico`}
          alt="VEuPathDB dataset"
          title="VEuPathDB dataset"
          style={{ ...ICON_STYLE, objectFit: 'contain' }}
        />
      );
    case 'publicUser':
      return (
        <PublicIcon titleAccess="Public User Dataset" style={ICON_STYLE} />
      );
    case 'privateUser':
      return <LockIcon titleAccess="Private User Dataset" style={ICON_STYLE} />;
  }
}

const CATEGORY_CONFIG: { category: DatasetCategory; label: string }[] = [
  { category: 'veupathdb', label: 'VEuPathDB datasets' },
  { category: 'publicUser', label: 'Public User Datasets' },
  { category: 'privateUser', label: 'Private User Datasets' },
];

export type CategoryVisibility = Record<DatasetCategory, boolean>;

export function useDatasetSourceFilter(): {
  visibility: CategoryVisibility;
  setVisibility: (category: DatasetCategory, visible: boolean) => void;
} {
  const [visibility, setVisibilityState] = React.useState<CategoryVisibility>({
    veupathdb: true,
    publicUser: true,
    privateUser: true,
  });

  const setVisibility = React.useCallback(
    (category: DatasetCategory, visible: boolean) => {
      setVisibilityState((prev) => ({ ...prev, [category]: visible }));
    },
    []
  );

  return { visibility, setVisibility };
}

export function DatasetSourceFilters({
  visibility,
  setVisibility,
  className,
}: {
  visibility: CategoryVisibility;
  setVisibility: (category: DatasetCategory, visible: boolean) => void;
  className?: string;
}) {
  return (
    <div
      className={
        className ? `DatasetSourceFilters ${className}` : 'DatasetSourceFilters'
      }
    >
      {CATEGORY_CONFIG.map(({ category, label }) => (
        <label key={category}>
          <input
            type="checkbox"
            checked={visibility[category]}
            onChange={(e) => setVisibility(category, e.target.checked)}
          />
          <DatasetSourceIcon category={category} />
          {` ${label}`}
        </label>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Verify it compiles**

```bash
cd packages/sites/genomics-site && npx tsc --noEmit
```

Expected: no errors. (Pre-existing errors elsewhere are possible — confirm none reference `datasetSourceCategory`.)

- [ ] **Step 4: Sanity-check the classifier by hand**

Read `getDatasetCategory` against this table and confirm each row. There is no test runner, so this reading is the check.

| `isUserDataset` | `isPublic` | `ownerIsVeupathdbCurator` | expected                                      |
| --------------- | ---------- | ------------------------- | --------------------------------------------- |
| false           | —          | —                         | `veupathdb`                                   |
| true            | true       | true                      | `veupathdb` ← the new rule                    |
| true            | false      | true                      | `privateUser` ← private curator stays private |
| true            | true       | false                     | `publicUser`                                  |
| true            | false      | false                     | `privateUser`                                 |
| true            | true       | `undefined` attr          | `publicUser` ← fail-safe                      |

- [ ] **Step 5: Commit**

```bash
git add packages/sites/genomics-site/webapp/wdkCustomization/js/client/util/datasetSourceCategory.tsx \
        packages/sites/genomics-site/webapp/wdkCustomization/js/client/util/datasetSourceCategory.scss
git commit -m "Add shared dataset source category module"
```

---

### Task 2: Adopt the shared module in InternalGeneDataset — ✅ DONE (2026-08-07, uncommitted)

**Verified in the browser:** a public curator-owned dataset now appears under "VEuPathDB datasets" with the favicon. `tsc --noEmit` passes. 92 lines removed, 37 added.

Notes from implementation:

- The file had drifted from this plan — `dataset_id_param` is gone, replaced by `search_url`. Locate by code, not line number.
- Three imports became unused and were removed: `LockIcon`, `PublicIcon`, and the `projectId`/`webAppUrl` config import.
- A dev server that has been running since before the new `util/datasetSourceCategory.*` files were created will not pick them up. Restart it; a new module is exactly what webpack watchers miss.

**Files:**

- Modify: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/questions/InternalGeneDataset.tsx`
- Modify: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/questions/InternalGeneDataset.scss`

**Interfaces:**

- Consumes: everything exported by Task 1.
- Produces: nothing for later tasks.

- [ ] **Step 1: Add the attribute to the fetch config**

In `USERDATASET_REPORT_CONFIG` (~line 748), add to the `attributes` array after `'is_public'`:

```ts
    'is_public',
    'owner_is_veupathdb_curator',
```

This list is hardcoded, so it is not affected by the AllDatasets fetch bug.

- [ ] **Step 2: Carry the attribute onto the record**

`DatasourceRecord` (~line 91) gains a field:

```ts
  source: 'datasource' | 'userdataset';
  is_public?: boolean;
  owner_is_veupathdb_curator?: boolean;
```

In the user-dataset record builder (~line 990, where `source: 'userdataset' as const` and `is_public: attrs.is_public === 'Public'` are set), add:

```ts
        source: 'userdataset' as const,
        is_public: attrs.is_public === 'Public',
        owner_is_veupathdb_curator: parseYesNo(attrs.owner_is_veupathdb_curator),
```

Leave the curated builder (~line 931, `source: 'datasource' as const`) alone — the classifier short-circuits on `!isUserDataset` before reading either flag.

- [ ] **Step 3: Add the import**

Alongside the existing `@material-ui/icons` imports (~lines 58-59):

```ts
import {
  DatasetSourceFilters,
  DatasetSourceIcon,
  getDatasetCategory,
  parseYesNo,
  useDatasetSourceFilter,
} from '../../util/datasetSourceCategory';
```

Verify the relative path resolves from `components/questions/` to `util/`; adjust the `../` depth if not.

- [ ] **Step 4: Replace the state and predicate**

Replace lines 239-249 — the three `useState` and `sourceTypeFilterPredicate`:

```tsx
const { visibility, setVisibility } = useDatasetSourceFilter();

const toSourceInfo = useCallback(
  (record: DatasourceRecord) => ({
    isUserDataset: record.source !== 'datasource',
    isPublic: record.is_public === true,
    ownerIsVeupathdbCurator: record.owner_is_veupathdb_curator === true,
  }),
  []
);

const sourceTypeFilterPredicate = useCallback(
  (record: DatasourceRecord) =>
    visibility[getDatasetCategory(toSourceInfo(record))],
  [visibility, toSourceInfo]
);
```

The `filterPredicate={sourceTypeFilterPredicate}` prop on `InternalGeneDatasetTable` (~line 415) is unchanged.

- [ ] **Step 5: Replace the checkbox block**

Replace the whole `<div className={cx('SourceFilters')}>…</div>` (lines 370-402):

```tsx
<DatasetSourceFilters
  visibility={visibility}
  setVisibility={setVisibility}
  className={cx('SourceFilters')}
/>
```

- [ ] **Step 6: Replace the icon cell renderer**

In the `source` column's `renderCell` (lines 422-451), replace the whole if/else-if/else body:

```tsx
            renderCell: ({ row }: any) => (
              <DatasetSourceIcon category={getDatasetCategory(toSourceInfo(row))} />
            ),
```

- [ ] **Step 7: Trim the stylesheet**

In `InternalGeneDataset.scss`, the `&SourceFilters` block (~lines 25-45) keeps only what the shared component does not set — its margins:

```scss
&SourceFilters {
  margin-top: 1.5rem;
  margin-bottom: 0.25rem;
}
```

Delete the `display`, `gap`, `padding`, and nested `label` rules; they now live in `datasetSourceCategory.scss`.

- [ ] **Step 8: Remove now-unused imports**

If `LockIcon` and `PublicIcon` (lines 58-59) are no longer referenced anywhere in the file, delete those imports. Check first — `webAppUrl`/`projectId` are used elsewhere in this file and must stay.

- [ ] **Step 9: Verify it compiles**

```bash
cd packages/sites/genomics-site && npx tsc --noEmit
```

Expected: no errors mentioning `InternalGeneDataset`.

- [ ] **Step 10: Commit**

```bash
git add packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/questions/InternalGeneDataset.tsx \
        packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/questions/InternalGeneDataset.scss
git commit -m "Use shared dataset source filter in InternalGeneDataset"
```

---

### Task 3: Fix the non-default attribute fetch bug — ✅ DONE (2026-08-07, uncommitted)

Kept separate from Task 4 because it is an independent pre-existing bug with its own manual check — a reviewer could reasonably accept this and reject the refactor, or vice versa.

**Implemented and verified in the browser.** Both fetch lists now derive from `allHarmonizedAttributes`, and `owner_is_veupathdb_curator` is pinned explicitly. Non-default attributes populate; the new attribute arrives as `"yes"`. `tsc --noEmit` passes.

**Also done out of order:** Task 2 Step 1 (adding `owner_is_veupathdb_curator` to `USERDATASET_REPORT_CONFIG` in `InternalGeneDataset.tsx`) was applied alongside this, so both pages fetch the attribute. The rest of Task 2 is untouched.

**Files:**

- Modify: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/component-wrappers/AllDatasetsAnswerController.tsx`

**Interfaces:**

- Consumes: nothing from other tasks.
- Produces: `owner_is_veupathdb_curator` present in the fetched user-dataset attributes, which Task 4 relies on.

**Background:** the Add/Remove Columns panel is built from the _unfiltered_ `allHarmonizedAttributes`, but the fetch lists are built from the defaults-filtered set, and adding a column never refetches (`useWdkService` deps are `[]`, line 246). `normalizeRecords` then assigns `value ?? null`, so non-default columns render empty with no error.

- [ ] **Step 1: Fetch all result-scope attributes**

At lines 177-183, both fetch lists are derived from `harmonizedAttributesWithDisplayNameAsKey` (defaults only). Build them from the full set instead. Immediately before line 177, add:

```ts
// Fetch every result-scope attribute, not just the question defaults.
// The Add/Remove Columns panel offers all of them, and adding a column
// does not refetch (the useWdkService deps below are empty), so any
// attribute missing here renders as an empty column with no error.
const allHarmonizedWithKeyForFetch = withDisplayNameAsKey(
  allHarmonizedAttributes
);
```

Then change both `.map` sources from `harmonizedAttributesWithDisplayNameAsKey` to `allHarmonizedWithKeyForFetch`:

```ts
const datasetAttrsToFetch = allHarmonizedWithKeyForFetch
  .map((a) => a.datasetAttrName)
  .filter((name): name is string => name !== null);

const userDatasetAttrsToFetch = allHarmonizedWithKeyForFetch
  .map((a) => a.userDatasetAttrName)
  .filter((name): name is string => name !== null);
```

Leave `harmonizedAttributesWithDisplayNameAsKey` in place — it is still used for `mergedState.harmonizedAttributes` at line 237.

- [ ] **Step 2: Guarantee the curator attribute is fetched**

The classifier needs this attribute whether or not the column is ever displayed, so do not rely on it surviving harmonization. After the block above:

```ts
// The source-category classifier needs this attribute even when the
// column is hidden, so pin it explicitly rather than relying on
// harmonization to carry it.
if (!userDatasetAttrsToFetch.includes('owner_is_veupathdb_curator')) {
  userDatasetAttrsToFetch.push('owner_is_veupathdb_curator');
}
```

Change `const userDatasetAttrsToFetch` to `let` if the linter objects to mutating a const-bound array (it should not — `push` is fine on a `const`).

- [ ] **Step 3: Verify it compiles**

```bash
cd packages/sites/genomics-site && npx tsc --noEmit
```

- [ ] **Step 4: Verify the fix in the browser**

Start the dev server (`yarn start` in `packages/sites/genomics-site`, or the project's usual command), then:

1. Open `/search/dataset/AllDatasets/result`
2. Open Add/Remove Columns and add a **non-default** user-dataset column
3. **Expected:** values populate. Before this fix the column was empty.
4. In devtools Network, confirm the `AllUserDatasets` request body's `attributes` array includes `owner_is_veupathdb_curator`

Step 4 is the highest-value check in this plan — it is what catches the silent failure that presents as "the feature doesn't work."

- [ ] **Step 5: Commit**

```bash
git add packages/sites/genomics-site/webapp/wdkCustomization/js/client/component-wrappers/AllDatasetsAnswerController.tsx
git commit -m "Fetch all result-scope attributes on AllDatasets page

Non-default attributes were offered in Add/Remove Columns but never
requested, so they rendered as empty columns with no error."
```

---

### Task 4: Adopt the shared module in AllDatasetsAnswerController

**Files:**

- Modify: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/component-wrappers/AllDatasetsAnswerController.tsx`
- Modify: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/component-wrappers/AllDatasetsAnswerController.scss`

**Interfaces:**

- Consumes: Task 1's exports; Task 3's guarantee that `owner_is_veupathdb_curator` is fetched.
- Produces: nothing for later tasks.

- [ ] **Step 1: Add the import, and extend NormalizedRecord**

Replace the `LockIcon`/`PublicIcon` imports (lines 17-18) with:

```ts
import {
  DatasetSourceFilters,
  DatasetSourceIcon,
  getDatasetCategory,
  parseYesNo,
  useDatasetSourceFilter,
} from '../util/datasetSourceCategory';
```

Extend the interface (lines 30-33):

```ts
interface NormalizedRecord extends RecordInstance {
  dataset_source: 'dataset' | 'userdataset';
  is_public?: boolean;
  owner_is_veupathdb_curator?: boolean;
}
```

Keep the `webAppUrl`/`projectId` import (line 19) only if still referenced after Step 2 — the local `SourceIcon` is its last user in this file, so it will likely become unused.

- [ ] **Step 2: Delete the local SourceIcon**

> **Do Step 4 first if you want the file to compile between steps.** The replacement below calls `toSourceInfo`, which Step 4 defines. Steps 2-5 all edit the same component and are only complete together; the compile check is Step 7.

Delete the whole `function SourceIcon(...)` (lines 42-64) — the shared `DatasetSourceIcon` replaces it. Then at its call site (~line 379):

```tsx
if (attribute.name === '__source_icon__') {
  const normalizedRecord = record as NormalizedRecord;
  return (
    <DatasetSourceIcon
      category={getDatasetCategory(toSourceInfo(normalizedRecord))}
    />
  );
}
```

`toSourceInfo` is defined in Step 4. Confirm the surrounding lines match the existing code before editing — the variable may already be named `normalizedRecord`.

- [ ] **Step 3: Set the flag during normalization**

In `normalizeRecords` (~lines 586-596), beside the existing `isPublic` extraction:

```ts
// For UserDatasets, extract is_public attribute
const isPublic =
  sourceType === 'userdataset'
    ? record.attributes.is_public === 'Public'
    : undefined;

const ownerIsVeupathdbCurator =
  sourceType === 'userdataset'
    ? parseYesNo(record.attributes.owner_is_veupathdb_curator)
    : undefined;
```

and in the returned object beside `is_public: isPublic,`:

```ts
      is_public: isPublic,
      owner_is_veupathdb_curator: ownerIsVeupathdbCurator,
```

- [ ] **Step 4: Replace the state and the filter**

Replace the three `useState` (lines 67-69) with:

```tsx
const { visibility, setVisibility } = useDatasetSourceFilter();
```

Add the adapter next to it:

```tsx
const toSourceInfo = useCallback(
  (record: NormalizedRecord) => ({
    isUserDataset: record.dataset_source !== 'dataset',
    isPublic: record.is_public === true,
    ownerIsVeupathdbCurator: record.owner_is_veupathdb_curator === true,
  }),
  []
);
```

Replace the `filteredRecords` memo (lines 250-262):

```tsx
const filteredRecords = useMemo(() => {
  if (!mergedState) return [];
  return mergedState.records.filter(
    (record) => visibility[getDatasetCategory(toSourceInfo(record))]
  );
}, [mergedState, visibility, toSourceInfo]);
```

- [ ] **Step 5: Replace the checkbox block**

Replace the `sourceFilters` JSX (lines 388-422):

```tsx
const sourceFilters = (
  <DatasetSourceFilters
    visibility={visibility}
    setVisibility={setVisibility}
    className="AllDatasets-SourceFilters"
  />
);
```

- [ ] **Step 6: Trim the stylesheet**

In `AllDatasetsAnswerController.scss`, `.AllDatasets-SourceFilters` keeps only its margins:

```scss
.AllDatasets-SourceFilters {
  margin-top: 0.5rem;
  margin-bottom: 1rem;
}
```

Delete `display`, `gap`, `padding`, and the nested `label` rules. If a `display: none` / `&.positioned` pair is still present, delete it too — the DOM-repositioning it supported is gone, and leaving `display: none` would hide the filter bar entirely.

- [ ] **Step 7: Verify it compiles**

```bash
cd packages/sites/genomics-site && npx tsc --noEmit
```

Expected: no errors. If `webAppUrl`/`projectId` are now unused in this file, remove the import.

- [ ] **Step 8: Commit**

```bash
git add packages/sites/genomics-site/webapp/wdkCustomization/js/client/component-wrappers/AllDatasetsAnswerController.tsx \
        packages/sites/genomics-site/webapp/wdkCustomization/js/client/component-wrappers/AllDatasetsAnswerController.scss
git commit -m "Use shared dataset source filter in AllDatasets"
```

---

### Task 5: End-to-end verification

No code changes unless a check fails. This is the gate before the branch is considered done.

**Files:** none modified (unless fixing a failure).

**Interfaces:**

- Consumes: Tasks 1-4.
- Produces: a verified branch.

- [ ] **Step 1: Confirm the attribute's serialized value**

**Already verified 2026-08-07:** the backend returns the lowercase string `"yes"`, and `parseYesNo` handles it. The value may later change to `"Yes"` — that also works, since `parseYesNo` lowercases before comparing.

Re-check only if the word itself changes (e.g. to `"1"` or `"t"`), which would require updating `parseYesNo`. An unrecognized value fails closed with no error, so this is the likeliest cause of "the feature silently does nothing."

- [ ] **Step 2: Verify the whole build compiles**

```bash
cd packages/sites/genomics-site && npx tsc --noEmit
```

- [ ] **Step 3: Verify on `/search/dataset/AllDatasets/result`**

1. All three checkboxes on — a **public curator** dataset shows the **VEuPathDB favicon**, not the Public icon
2. Uncheck "VEuPathDB datasets" → that row disappears
3. Re-check it; uncheck "Public User Datasets" → the curator row **stays**
4. A **private** curator dataset appears under Private User Datasets, with the lock icon
5. Its link still goes to `/record/userdataset/...` and loads
6. Row counts update as boxes are toggled

- [ ] **Step 4: Verify on an internal gene dataset page**

Open a page routed to `InternalGeneDataset` — one whose question has both `datasetCategory` and `datasetSubtype` properties, e.g. `/search/transcript/GenesByRNASeqEvidence`. Repeat checks 1-4 from Step 3.

The filter here is combined (AND) with the free-text search box, so also confirm typing in "Filter Datasets:" still narrows correctly with a source box unchecked.

- [ ] **Step 5: Confirm the two pages agree**

Find one curator-owned public dataset visible on both pages. It must land in the **same category on both** — same icon, controlled by the same checkbox. This is the point of the whole change.

- [ ] **Step 6: Confirm no regression for ordinary datasets**

A curated VEuPathDB dataset and an ordinary public user dataset both behave exactly as before on both pages.

- [ ] **Step 7: Commit any fixes**

Only if Steps 1-6 required changes. Otherwise nothing to commit.

---

## Rollback

Each task is one commit. Task 3 (the fetch fix) is independent of Tasks 1/2/4 (the refactor) and can be kept or reverted separately.

## Known follow-ups (out of scope)

- **`wdk-client`'s Answer table has no slot for custom controls**, which is why AllDatasets overrides `stateProps.records`/`meta` instead of passing a `filterPredicate` the way `CommonResultTable` accepts one. Unifying that would let both pages share the filtering mechanism, not just the logic — but it changes a library shared with other sites.
- **`genomics-site` has no test runner.** The classifier and `parseYesNo` are pure functions and would be cheap to cover if the team adds one.
