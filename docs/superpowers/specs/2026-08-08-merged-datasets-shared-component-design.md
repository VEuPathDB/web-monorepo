# Design: shared merged-datasets answer controller for genomics-site and clinepi-site

**Date:** 2026-08-08
**Branch:** all-userdatasets
**Status:** Design approved; not yet implemented

## Context

genomics-site's `/search/dataset/AllDatasets/result` route already renders a unified table merging
`AllDatasets` (recordClass `dataset`) and `AllUserDatasets` (recordClass `userdataset`) results, with:

- attribute harmonization by `displayName` across the two record classes
- a prepended, non-removable source-icon column
- a three-way source-category filter (VEuPathDB / Public User Datasets / Private User Datasets)
- a per-row `primary_key` link that resolves to the correct record class depending on source
- a single download action that fires two parallel CSV downloads (one per question), ignoring the
  filter state

Implementation: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/component-wrappers/AllDatasetsAnswerController.tsx`
(dispatch: `AnswerController.tsx:29-34`, keyed on `recordClass === 'dataset' && question === 'AllDatasets'`),
plus the shared category/icon/filter utility `util/datasetSourceCategory.tsx`.

clinepi-site has no equivalent. In clinepi, "study" and "dataset" have always been the same concept;
the terminology has already been unified to "dataset" (the `ClinEpiStudyAnswerController` /
`StudyAnswerController` naming is legacy and hasn't caught up, but there is no separate "study"
concept distinct from "dataset"). clinepi-site's `AnswerController.jsx` dispatches purely on
`recordClass` (no `question` check), routing all `dataset`-recordClass traffic to
`ClinEpiStudyAnswerController` and all `userdataset` traffic to `UDAnswerController` — two separate,
unmerged pages. clinepi-site currently has zero populated dataset records in its database, so its
`AllDatasets` page today effectively shows only `AllUserDatasets` results plus an empty dataset side;
curated datasets are expected to populate this side in the future.

**What prompted this change.** clinepi-site needs the same unified table, icon column, and filters as
genomics-site. Because the two sites' merge logic, attribute harmonization, category rules, and icon
set are identical, the implementation must be shared rather than duplicated — copying
`AllDatasetsAnswerController.tsx` into clinepi-site would create the same drift risk that
`2026-08-07-dataset-source-filter-design.md` already addressed for the checkbox/category logic.

One piece is **not** identical: in clinepi-site, **both** dataset rows and user-dataset rows link into
the EDA analysis workspace (which embeds the WDK record page), not directly to the WDK record page —
this is clinepi-site's existing `UDAnswerController.jsx` behavior, and it must extend to dataset rows
too once they're populated. genomics-site links both row types directly to their WDK record pages.
This per-site (not per-row-type) difference must be preserved — falling back to a direct WDK record
link for either row type in clinepi-site would be a regression from current/intended behavior.

**Retiring `ClinEpiStudyAnswerController`.** clinepi's current dataset-side view
(`ClinEpiStudyAnswerController`, wrapping `StudyAnswerController.jsx` in `packages/libs/web-common`) is
not a plain WDK table. It renders three separate custom sections — "My datasets", "Community datasets",
"Curated datasets" — each its own `DataGrid` with independent search/filter UI; it applies
permission/prerelease gating (`isPrereleaseStudy`, `withPermissions`) to curated rows; and it has
bespoke cell renderers for `study_categories` (category icons), `disease` (tags), `card_questions`
(search-icon links), and `bulk_download_url` (download link). **None of this is preserved.** This
route's `dataset`-recordClass traffic no longer goes to `ClinEpiStudyAnswerController` at all — it is
fully replaced by the shared merged-table component. Permission/prerelease gating, the three-section
layout, and the custom study columns are explicitly sidelined for now, not ported into the merge. This
is acceptable because clinepi-site has zero populated dataset records today; revisiting
permission-aware rendering is deferred to when curated datasets actually populate this route, and is
out of scope for this change.

**Intended outcome:** one shared component implements the merge, harmonization, filtering, and icon
column; each site supplies a small config object; genomics-site's behavior is unchanged; clinepi-site
gains the same table with all rows linking into the EDA workspace, fully replacing
`ClinEpiStudyAnswerController` for this route. When clinepi-site later populates curated datasets, they
appear in the merged table automatically, with no further code changes (though permission-aware
rendering may need revisiting at that point — noted as a future concern, not solved here).

## Architecture

Move `MergedDatasetsAnswer` and the `datasetSourceCategory` utilities (icons, category classifier,
filter hook/UI — see `2026-08-07-dataset-source-filter-design.md`) into `packages/libs/web-common`,
generalized as a factory:

```typescript
createMergedDatasetsAnswerController(config: MergedDatasetsConfig): ComponentType
```

```typescript
interface MergedDatasetsConfig {
  datasetRecordClassName: string; // 'dataset'
  datasetQuestionName: string; // 'AllDatasets'
  userDatasetRecordClassName: string; // 'userdataset'
  userDatasetQuestionName: string; // 'AllUserDatasets'
  renderPrimaryKeyCellContent: (cellProps: {
    value: unknown;
    attribute: AttributeField;
    record: NormalizedRecord;
    recordClass: RecordClass;
    CellContent: ComponentType<any>;
  }) => ReactNode;
}
```

`renderPrimaryKeyCellContent` mirrors the existing `renderCellContent` prop signature already used by
both `AllDatasetsAnswerController.tsx` and clinepi's `UDAnswerController.jsx` (`{ value, attribute,
record, CellContent }`) — the shared component calls it only for the `primary_key` attribute; all other
attributes keep using the shared component's own default rendering. It is **required**, not an
optional override with a default — every consumer must decide explicitly how a row links out, since a
silent default would be wrong for clinepi.

- **genomics-site**: `AllDatasetsAnswerController.tsx` shrinks to `export const MergedDatasetsAnswer =
createMergedDatasetsAnswerController({ ...config with a WDK RecordLink renderer for both sides... })`.
  No behavior change — this is the same rendering logic as today, just parameterized.
- **clinepi-site**: new `AllDatasetsAnswerController.jsx` (or `.tsx`) calls the same factory.
  `renderPrimaryKeyCellContent` reuses `UDAnswerController.jsx`'s existing EDA-workspace link logic
  (`<Link to={`${makeEdaRoute(record.id[0].value)}/new/details`}>`) for **both** row types — dataset
  rows (currently unpopulated but must resolve correctly once populated) and userdataset rows alike,
  since clinepi-site links everything into the EDA workspace.
  - `AnswerController.jsx`'s existing `if (props.ownProps.recordClass === 'dataset')` branch (currently
    routing unconditionally to `ClinEpiStudyAnswerController`) is replaced with a question-aware check:
    `if (recordClass === 'dataset' && question === 'AllDatasets') return <MergedDatasetsAnswer .../>`.
    `ClinEpiStudyAnswerController` and its import are removed entirely — this route no longer falls
    through to it for any `dataset`-recordClass question, since `AllDatasets` is the only question that
    reaches this component for recordClass `dataset` in practice. `withPermissions` and
    `StudyAnswerController` become unused in this file and are dropped.
  - **No new route registration is needed.** clinepi-site's `routes.jsx` already spreads in the generic
    WDK route `/search/:recordClass/:question/result` (via `ebrcRoutes`, sourced from
    `packages/libs/wdk-client/src/Core/routes.tsx`) without filtering it out, so
    `/search/dataset/AllDatasets/result` already resolves through `AnswerController.jsx` today.
    genomics-site's explicit route entry exists only to set `requiresLogin: false` for guest/SEO access
    — an unrelated concern this change does not need to replicate for clinepi-site.

## Data flow

Unchanged from genomics-site's current implementation, now shared:

1. Fetch record class + question metadata for both record classes in parallel, plus the categories
   ontology (for result-scope attribute filtering).
2. Harmonize attributes by `displayName` across the two record classes; `primary_key` is special-cased
   so links keep rendering correctly regardless of harmonization.
3. Fetch both answers in parallel (`{config}.datasetQuestionName` + `{config}.userDatasetQuestionName`),
   catching failures on the user-dataset side (e.g. unauthenticated) and falling back to an empty
   result set.
4. Normalize both record sets into a common shape keyed by `displayName`, tagging `dataset_source`,
   `is_public`, and `owner_is_veupathdb_curator`.
5. Merge, apply the three-way source-category filter, and render through the site's `DefaultComponent`
   with a prepended icon column.

For clinepi-site today, step 3's dataset-side fetch returns zero rows (empty database) — no
special-casing required. The VEuPathDB filter checkbox renders but toggles nothing until curated
datasets exist.

The one per-site variation is inside `renderCellContent`'s `primary_key` case: instead of always
constructing a `RecordLink`, it calls `config.renderPrimaryKeyCellContent(cellProps)`.

**Download button**: shared, unparameterized. Fires two parallel `wdkService.downloadAnswer` calls
against `config.datasetQuestionName` and `config.userDatasetQuestionName`, ignoring the source-category
filter state — matches genomics-site's existing behavior exactly, now applied to clinepi-site too.

## Error handling and edge cases

- **Unauthenticated users**: user-dataset fetch failure (401/403) is caught and treated as an empty
  result set, as today. All three filter checkboxes still render regardless of auth state.
- **Empty dataset side** (clinepi-site today): no special-casing. Zero `dataset_source: 'dataset'`
  rows naturally result in the VEuPathDB category contributing nothing; the table shows only user
  datasets, matching current live behavior minus the icon/filter UI this change adds.
- **Null attribute values**: unchanged — attributes absent on one side render as `null`, handled by
  the default WDK cell renderer.
- **Sorting on a removed/icon column**: unchanged — existing fallback-to-`primary_key` logic in
  `handleChangeColumns` is shared as-is.
- **Metadata fetch failure**: unchanged pre-existing behavior (logs and renders `Loading`
  indefinitely) — not addressed by this change.

## Testing

Manual verification in-browser for both sites, consistent with this feature's existing lack of an
automated test suite (no test files exist alongside `AllDatasetsAnswerController.tsx` today):

- genomics-site: confirm the page is behavior-identical after the refactor (regression check).
- clinepi-site: confirm the icon column, three filter checkboxes, and correct behavior all appear;
  confirm both dataset and user-dataset rows link into the EDA workspace (not directly to the WDK
  record page); confirm the (currently empty) dataset side contributes no rows without error.

## Files to create/modify

### New files

- `packages/libs/web-common/src/component-wrappers/MergedDatasetsAnswerController.tsx` — the
  `createMergedDatasetsAnswerController` factory, moved from genomics-site's
  `AllDatasetsAnswerController.tsx` and generalized per the config above.
- `packages/libs/web-common/src/component-wrappers/datasetSourceCategory.tsx` — moved as-is from
  genomics-site's `util/datasetSourceCategory.tsx`.
- `packages/sites/clinepi-site/webapp/js/client/component-wrappers/AllDatasetsAnswerController.jsx`
  (or `.tsx`) — clinepi-site's config, including the EDA-workspace `renderPrimaryKeyCellContent` shared
  by both dataset and userdataset rows.

### Modified files

- `packages/sites/genomics-site/webapp/wdkCustomization/js/client/component-wrappers/AllDatasetsAnswerController.tsx`
  — shrinks to a factory call with genomics-site's config.
- `packages/sites/clinepi-site/webapp/js/client/component-wrappers/AnswerController.jsx` — the
  `recordClass === 'dataset'` branch becomes a question-aware check routing to the new
  `MergedDatasetsAnswer` for `question === 'AllDatasets'`; `ClinEpiStudyAnswerController`,
  `StudyAnswerController`, and `withPermissions` are removed from this file as no longer used here.

No changes are needed to either site's `routes.jsx` — the existing generic
`/search/:recordClass/:question/result` route (clinepi-site) and existing explicit route entry
(genomics-site, for its unrelated `requiresLogin: false` override) already cover this path.

## Success criteria

- genomics-site's AllDatasets page is behaviorally unchanged.
- clinepi-site's AllDatasets page shows a merged table with the same icon column and three-way source
  filter as genomics-site, fully replacing `ClinEpiStudyAnswerController`'s three-section
  layout/permission-gated view for this route.
- clinepi-site's dataset and user-dataset rows all link into the EDA workspace, not directly to the
  WDK record page.
- No code changes required when clinepi-site's dataset side becomes populated in the future (aside
  from any future permission-aware rendering work, explicitly deferred by this design).
