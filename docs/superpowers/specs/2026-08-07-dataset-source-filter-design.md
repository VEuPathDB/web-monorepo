# Design: shared dataset-source classifier + VEuPathDB curator recategorization

**Date:** 2026-08-07
**Branch:** handle-veupath-staff-users
**Status:** Design approved; not yet implemented

## Context

Two routes render an identical three-checkbox "data source" filter — VEuPathDB datasets / Public User
Datasets / Private User Datasets:

- `search/transcript/GenesByRNASeqEvidence` (and siblings) → `InternalGeneDataset.tsx`
- `search/dataset/AllDatasets/result` → `AllDatasetsAnswerController.tsx`

The two implementations are near-verbatim copies: same state variable names, same predicate shape,
byte-identical checkbox JSX, duplicated SCSS. They arrived separately — `23d997ebc6` added the filter to the
internal catalog page (see `2026-08-06-userdataset-internal-search-catalog-design.md`), and `4fd28b1491`
("unify All Datasets and All User Datasets") copied it into AllDatasets.

**What prompted this change.** A VEuPathDB _curator_ account owns user datasets that are conceptually
VEuPathDB data. When those datasets are **public**, they belong in the **VEuPathDB Datasets** category, not
Public User Datasets. Implementing that rule against the current code would mean writing it twice and keeping
two copies in sync.

Because the requirement is a **recategorization rule**, the shared unit must be a _classifier_, not merely a
shared checkbox component. Extracting only the UI would leave the rule duplicated — the precise thing this
change exists to prevent.

**Intended outcome:** one function decides a dataset's category; both pages consume it; the curator rule
reaches both simultaneously and cannot drift.

## The rule

```
not a user dataset            → veupathdb
curator AND public            → veupathdb     ← new
public                        → publicUser
otherwise                     → privateUser
```

A **private** curator dataset stays in Private User Datasets. This is deliberate, not a fallthrough: the
category is a conjunction of curator-ness and public-ness. Labelling an unpublished, owner-only dataset as a
"VEuPathDB dataset" would misdescribe it.

Category drives **filtering and the row icon**. It does **not** drive the record link — a curator dataset is
still a `userdataset` record, so its link stays `/record/userdataset/...`. Retargeting to `/record/dataset/`
would 404.

## Backend dependency

A new attribute `owner_is_veupathdb_curator` (yes/no) on the `userdataset` record class, with `results` scope.
Added in the WDK model XML (separate repo), already in place.

Chosen over comparing an owner user_id: the curator account's identity stays server-side, and the client needs
no constant to keep in sync with the database.

**Serialization — verified 2026-08-07 against a live response.** Arrives as the lowercase STRING `"yes"`.
The value may change to `"Yes"`; `parseYesNo` trims and lowercases before comparing, so both work and no code
change is needed if it does. Compare via `parseYesNo`, never against a raw string.

(The sibling attribute `is_public` serializes as `"Public"`/`"Private"` — see the field-rules table in
`2026-08-06-userdataset-internal-search-catalog-design.md`, which documents this class of hazard.)

## Prerequisite bug: non-default attributes fetch empty on AllDatasets

Found while designing this change; reported independently by the user. **Adding any non-default attribute via
the Add/Remove Columns panel produces empty cells.** Pre-existing, and not specific to the new attribute — it
affects non-default dataset and user-dataset attributes alike.

Three facts combine in `AllDatasetsAnswerController.tsx`:

1. **Only defaults are fetched.** `allHarmonizedAttributes` is filtered down to question defaults, and the
   fetch lists are built from that _filtered_ set — so the answer requests ask only for default attributes.
2. **The panel offers everything.** The Add/Remove column list is built from the _unfiltered_
   `allHarmonizedAttributes`, so non-default attributes appear as choices.
3. **Adding a column never refetches.** `handleChangeColumns` only sets displayed columns; the `useWdkService`
   deps array is `[]`, commented "only fetch once on mount".

`normalizeRecords` then assigns `value ?? null`, so the column renders empty with no error and no console
output — the same silent-failure signature described in the predecessor spec.

**Fix:** build the fetch lists from `allHarmonizedAttributes` rather than the defaults-filtered set, fetching
all result-scope attributes up front.

Rejected alternatives: refetch-on-demand (adds refetch, merge, and loading state to a component that
deliberately fetches once — the `[]` deps comment records a prior problem with refetching); or fetching
defaults plus a hardcoded extras list (leaves the general bug in place).

**Independently required regardless of that fix:** `owner_is_veupathdb_curator` must be fetched
**unconditionally**, because the classifier needs it whether or not the user ever displays that column.
Filtering must work with the column hidden. The fix above achieves this incidentally; the implementation must
still pin it explicitly, so a later change to the fetch strategy cannot silently break categorization.

On the internal catalog page the equivalent is one line added to the hardcoded `USERDATASET_REPORT_CONFIG`,
which is not subject to this bug.

## Design

### Shared module

New file: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/util/datasetSourceCategory.tsx`

```ts
export type DatasetCategory = 'veupathdb' | 'publicUser' | 'privateUser';

export interface DatasetSourceInfo {
  isUserDataset: boolean;
  isPublic: boolean;
  ownerIsVeupathdbCurator: boolean;
}

export function getDatasetCategory(info: DatasetSourceInfo): DatasetCategory {
  if (!info.isUserDataset) return 'veupathdb';
  if (info.ownerIsVeupathdbCurator && info.isPublic) return 'veupathdb';
  return info.isPublic ? 'publicUser' : 'privateUser';
}

export function useDatasetSourceFilter(): {
  visibility: Record<DatasetCategory, boolean>;
  setVisibility: (c: DatasetCategory, v: boolean) => void;
};
```

Plus `<DatasetSourceFilters>` — the three checkboxes, driven by a `CATEGORY_CONFIG` list of
`{category, label, icon}` — and `<DatasetSourceIcon category>`, one icon component replacing three of the four
current favicon copies.

Callers test visibility with `visibility[getDatasetCategory(info)]`. There is deliberately no
`isCategoryVisible` helper: one way to ask the question.

**Why a normalized input shape.** `getDatasetCategory` takes `DatasetSourceInfo`, not a raw record. The two
pages disagree on how they store the discriminator — `source: 'datasource' | 'userdataset'` on one,
`dataset_source: 'dataset' | 'userdataset'` on the other. A normalized shape lets each page adapt its own
fields at a single call site while the rule itself exists once.

**Why a keyed visibility record.** Three parallel booleans become
`Record<DatasetCategory, boolean>`, so a future fourth category is one `CATEGORY_CONFIG` entry rather than new
state, a new checkbox, and a new predicate branch in two files.

**Why one module.** The pieces total roughly 120 lines and are always used together. If it grows
substantially, the classifier is the natural first extraction.

### Attribute plumbing

Each page builds `DatasetSourceInfo` at one adapter site:

```ts
// InternalGeneDataset: source === 'datasource'
// AllDatasets:         dataset_source === 'dataset'
isUserDataset:           <page-specific>,
isPublic:                attrs.is_public === 'Public',
ownerIsVeupathdbCurator: parseYesNo(attrs.owner_is_veupathdb_curator),
```

The name keeps the `owner_` prefix at every layer. The attribute describes the dataset's **owner**, not the
dataset — dropping the prefix to `isVeupathdbCurator` would read as "this dataset is a curator" and invites
misreading the rule.

`parseYesNo` confines the string-versus-boolean hazard to one place. It **trims and lowercases before
comparing** — never compare the backend value raw, since the casing is not guaranteed and a case-sensitive
check would fail silently if it ever changed. Anything unrecognized, including `undefined`, is `false`.

**Fail-safe direction.** A missing or unparseable value means _not a curator_, leaving the dataset in
Public/Private User, which is today's behavior. A fetch failure therefore degrades to the status quo rather
than promoting a private dataset into the VEuPathDB bucket.

### Per-page integration

Both pages keep their existing filtering _mechanism_ and share the _logic_.

**`InternalGeneDataset.tsx`** — replace the three `useState` with `useDatasetSourceFilter()`; rebuild
`sourceTypeFilterPredicate` on `getDatasetCategory` plus the adapter, still passed as `filterPredicate` to
`CommonResultTable` (wiring unchanged); replace the checkbox block with `<DatasetSourceFilters>`; replace the
source-icon `renderCell` with `<DatasetSourceIcon>`; add `owner_is_veupathdb_curator` to
`USERDATASET_REPORT_CONFIG`.

**`AllDatasetsAnswerController.tsx`** — the same four swaps, plus the fetch fix. The `__source_icon__` HTML
string becomes `renderToStaticMarkup(<DatasetSourceIcon/>)`, or moves to the existing `renderCellContent`
path — decided on reading the file.

> **Re-read `AllDatasetsAnswerController.tsx` before implementing.** A separate branch removed a
> DOM-injection hack there (the filter bar was rendered and then imperatively relocated with `insertBefore`
> plus a `MutationObserver`). That work has merged; any line references predating it are stale.

The two SCSS files' duplicated `SourceFilters` rules consolidate alongside the shared component.

### Error handling

| Case                              | Behavior                                                        |
| --------------------------------- | --------------------------------------------------------------- |
| Attribute missing or unrecognized | `parseYesNo` → `false` → Public/Private User (today's behavior) |
| `is_public` missing               | Falsy → Private User, matching the existing catch-all           |
| Non-user dataset                  | Short-circuits on `!isUserDataset`; neither attribute is read   |

**Deliberately not handled:** no warning when the attribute is absent across all rows. That is
indistinguishable from "this site has no curator datasets," so a warning would fire constantly where none
exist. Protection against the silent-failure mode comes from the unconditional-fetch guarantee and the
regression test below, not from runtime detection.

## Verification

### Unit — classifier

| `isUserDataset` | `isPublic` | `ownerIsVeupathdbCurator` | expected                                      |
| --------------- | ---------- | ------------------------- | --------------------------------------------- |
| false           | —          | —                         | `veupathdb`                                   |
| true            | true       | true                      | `veupathdb` ← the new rule                    |
| true            | false      | true                      | `privateUser` ← private curator stays private |
| true            | true       | false                     | `publicUser`                                  |
| true            | false      | false                     | `privateUser`                                 |
| true            | true       | attribute `undefined`     | `publicUser` ← fail-safe                      |

Plus `parseYesNo` directly: accepted spellings, `undefined`, and an unexpected value.

### Regression — the fetch bug

Assert the user-dataset fetch list includes a known non-default attribute **and**
`owner_is_veupathdb_curator`. This is the highest-value test here: it catches the failure that presents to a
user as "the feature doesn't work" with nothing in the console.

### Manual — both routes

1. All three checkboxes on: a public curator dataset shows the **VEuPathDB favicon**, not the Public icon.
2. Uncheck "VEuPathDB datasets" → the row disappears. Uncheck "Public User Datasets" instead → it stays.
3. Its link still resolves to `/record/userdataset/...`.
4. A private curator dataset remains under Private User Datasets.
5. Add a non-default user-dataset column → values populate (the reported bug).
6. The same dataset lands in the same category on both pages — the point of the exercise.

Steps 1–4 and 6 require `owner_is_veupathdb_curator` to be returning real data; `parseYesNo` cannot be
finalized before that is confirmed.

## Files

**New**
`packages/sites/genomics-site/webapp/wdkCustomization/js/client/util/datasetSourceCategory.tsx`

**Modified**
`packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/questions/InternalGeneDataset.tsx`
`packages/sites/genomics-site/webapp/wdkCustomization/js/client/component-wrappers/AllDatasetsAnswerController.tsx`
and the corresponding `.scss` files.

**Outside this repo**
`owner_is_veupathdb_curator` on the `userdataset` record class, in the WDK model XML.

## Rejected approaches

**Classifier only, leaving the UI duplicated.** Smallest diff, and it does put the curator rule in one place.
Rejected because the driver is _future_ changes: the next label tweak or category addition would still be a
two-file edit, and the icon markup would remain in four places.

**Also reworking `wdk-client`'s Answer table** so AllDatasets could use a `filterPredicate` prop instead of
overriding `stateProps`/`meta`. This is the right eventual shape, but it changes a library shared with other
sites — too wide a blast radius to couple to this feature. Left as a follow-up.
