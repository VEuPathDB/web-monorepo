# Shared Merged-Datasets Answer Controller Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract genomics-site's merged Dataset+UserDataset answer table into a shared, configurable
component in `packages/libs/web-common`, then wire clinepi-site up to use it, replacing clinepi's
current unmerged `ClinEpiStudyAnswerController` (studies) / `UDAnswerController` (user datasets) split.

**Architecture:** A factory function `createMergedDatasetsAnswerController(config)` in `web-common`
returns a React component that fetches, harmonizes, merges, filters, and renders both a `dataset`-type
and `userdataset`-type WDK answer as one table with a source-icon column and a three-way category
filter. Each site supplies record class/question names and a `renderPrimaryKeyCellContent` function
that resolves how a row's primary-key cell links out. genomics-site's existing implementation moves
into this factory unchanged in behavior; clinepi-site's `AnswerController.jsx` is rewired to use it
instead of `ClinEpiStudyAnswerController`.

**Tech Stack:** React (TSX), WDK client (`@veupathdb/wdk-client`), the monorepo's existing
`@veupathdb/web-common` shared package, Jest (existing test runner for `web-common`, used only if this
plan adds a pure-function unit test — no test suite currently exists for the component being moved).

## Global Constraints

- genomics-site's `/search/dataset/AllDatasets/result` page must be behaviorally unchanged after the
  refactor — same columns, same filters, same icons, same links, same download behavior.
- `renderPrimaryKeyCellContent` is a **required** config field on both sites — no default fallback.
- No new route registrations in either site's `routes.jsx` — the generic WDK route already covers
  clinepi-site, and genomics-site's existing route entry is untouched (it exists only for its unrelated
  `requiresLogin: false` override).
- `ClinEpiStudyAnswerController`, `StudyAnswerController` import, and `withPermissions` wrapping are
  removed from clinepi-site's `AnswerController.jsx` — not preserved, not ported into the merge.
- Do not add automated tests beyond what's specified in tasks below — this feature has none today and
  this plan keeps that consistent except where a task explicitly adds one.

---

## Task 1: Move `datasetSourceCategory` utilities into `web-common`

**Files:**

- Create: `packages/libs/web-common/src/component-wrappers/datasetSourceCategory.tsx`
- Create: `packages/libs/web-common/src/component-wrappers/datasetSourceCategory.scss`
- Modify: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/component-wrappers/AllDatasetsAnswerController.tsx:17-23` (import path only, in this task)
- Modify: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/util/InternalGeneDataset.tsx` (import path only)
- Delete: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/util/datasetSourceCategory.tsx`
- Delete: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/util/datasetSourceCategory.scss`

**Interfaces:**

- Produces: `DatasetCategory`, `DatasetSourceInfo`, `parseYesNo(value: unknown): boolean`,
  `getDatasetCategory(info: DatasetSourceInfo): DatasetCategory`,
  `DatasetSourceIcon({ category }: { category: DatasetCategory })`, `CategoryVisibility`,
  `useDatasetSourceFilter(): { visibility: CategoryVisibility; setVisibility: (category, visible) => void }`,
  `DatasetSourceFilters({ visibility, setVisibility, className? })` — all exported with identical
  signatures to today, used by Task 2 and by the pre-existing `InternalGeneDataset.tsx` consumer.

This is a pure file move — no logic changes. The only edit inside the moved file is the SCSS import
path (`./datasetSourceCategory.scss`, unchanged filename, now colocated) and the `webAppUrl`/`projectId`
import, which changes from the package-scoped `@veupathdb/web-common/lib/config` to the relative
`../config` since the file now lives inside `web-common` itself.

- [ ] **Step 1: Read the current file exactly as it exists today**

Run: `cat packages/sites/genomics-site/webapp/wdkCustomization/js/client/util/datasetSourceCategory.tsx`

Confirm it matches this (already verified in the design doc) — 157 lines, exporting the items listed
above, importing `webAppUrl, projectId` from `@veupathdb/web-common/lib/config`.

- [ ] **Step 2: Create the moved file with the corrected import**

Create `packages/libs/web-common/src/component-wrappers/datasetSourceCategory.tsx` with the exact
contents of the source file, changing only line 4:

```typescript
// before (genomics-site copy):
import { projectId, webAppUrl } from '@veupathdb/web-common/lib/config';

// after (web-common copy):
import { projectId, webAppUrl } from '../config';
```

Everything else — the `DatasetCategory` type, `DatasetSourceInfo` interface, `parseYesNo`,
`getDatasetCategory`, `ICON_STYLE`, `DatasetSourceIcon`, `CATEGORY_CONFIG`, `CategoryVisibility`,
`useDatasetSourceFilter`, `DatasetSourceFilters` — copies verbatim, including all comments.

- [ ] **Step 3: Move the SCSS file verbatim**

Create `packages/libs/web-common/src/component-wrappers/datasetSourceCategory.scss` with the exact
contents of `packages/sites/genomics-site/webapp/wdkCustomization/js/client/util/datasetSourceCategory.scss`
(the `.DatasetSourceFilters` rule block — 23 lines, no changes).

- [ ] **Step 4: Delete the old genomics-site copies**

```bash
rm packages/sites/genomics-site/webapp/wdkCustomization/js/client/util/datasetSourceCategory.tsx
rm packages/sites/genomics-site/webapp/wdkCustomization/js/client/util/datasetSourceCategory.scss
```

- [ ] **Step 5: Update genomics-site's two consumers to import from web-common**

In `packages/sites/genomics-site/webapp/wdkCustomization/js/client/component-wrappers/AllDatasetsAnswerController.tsx`,
change:

```typescript
// before
import {
  DatasetSourceFilters,
  DatasetSourceIcon,
  getDatasetCategory,
  parseYesNo,
  useDatasetSourceFilter,
} from '../util/datasetSourceCategory';

// after
import {
  DatasetSourceFilters,
  DatasetSourceIcon,
  getDatasetCategory,
  parseYesNo,
  useDatasetSourceFilter,
} from '@veupathdb/web-common/lib/component-wrappers/datasetSourceCategory';
```

Find and update `InternalGeneDataset.tsx`'s import the same way:

Run: `grep -n "datasetSourceCategory" packages/sites/genomics-site/webapp/wdkCustomization/js/client/util/InternalGeneDataset.tsx`

Change whatever relative import path is found there to
`@veupathdb/web-common/lib/component-wrappers/datasetSourceCategory`, keeping the same named imports.

- [ ] **Step 6: Build web-common and genomics-site to verify the move compiles**

Run: `npx tsc --noEmit -p packages/libs/web-common`
Expected: no new errors related to `datasetSourceCategory.tsx`.

Run: `npx tsc --noEmit -p packages/sites/genomics-site` (or the site's existing typecheck script from
its `package.json` if `tsc` is not invoked directly there — check with
`cat packages/sites/genomics-site/package.json | grep -A2 '"scripts"'` if the direct `tsc` invocation
fails to find a project config)
Expected: no new errors.

- [ ] **Step 7: Commit**

```bash
git add packages/libs/web-common/src/component-wrappers/datasetSourceCategory.tsx \
        packages/libs/web-common/src/component-wrappers/datasetSourceCategory.scss \
        packages/sites/genomics-site/webapp/wdkCustomization/js/client/component-wrappers/AllDatasetsAnswerController.tsx \
        packages/sites/genomics-site/webapp/wdkCustomization/js/client/util/InternalGeneDataset.tsx
git rm packages/sites/genomics-site/webapp/wdkCustomization/js/client/util/datasetSourceCategory.tsx \
       packages/sites/genomics-site/webapp/wdkCustomization/js/client/util/datasetSourceCategory.scss
git commit -m "Move datasetSourceCategory utilities into web-common"
```

---

## Task 2: Extract `createMergedDatasetsAnswerController` factory into `web-common`

**Files:**

- Create: `packages/libs/web-common/src/component-wrappers/MergedDatasetsAnswerController.tsx`
- Modify: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/component-wrappers/AllDatasetsAnswerController.tsx` (shrink to a factory call)
- Delete: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/component-wrappers/AllDatasetsAnswerController.scss` (styling moves with the component)
- Create: `packages/libs/web-common/src/component-wrappers/MergedDatasetsAnswerController.scss`

**Interfaces:**

- Consumes: everything from Task 1 (`DatasetSourceFilters`, `DatasetSourceIcon`, `getDatasetCategory`,
  `parseYesNo`, `useDatasetSourceFilter`), all now same-directory imports (`./datasetSourceCategory`).
- Produces:

  ```typescript
  interface MergedDatasetsConfig {
    datasetRecordClassName: string;
    datasetQuestionName: string;
    userDatasetRecordClassName: string;
    userDatasetQuestionName: string;
    renderPrimaryKeyCellContent: (cellProps: {
      value: unknown;
      attribute: AttributeField;
      record: NormalizedRecord;
      recordClass: RecordClass;
      CellContent: ComponentType<any>;
    }) => ReactNode;
  }

  function createMergedDatasetsAnswerController(
    config: MergedDatasetsConfig
  ): ComponentType<any>;
  ```

  Task 3 (genomics-site) and Task 4 (clinepi-site) both call this factory.

This task takes the existing 584-line `AllDatasetsAnswerController.tsx` body and turns every hardcoded
`'dataset'` / `'AllDatasets'` / `'userdataset'` / `'AllUserDatasets'` string and the hardcoded
`RecordLink`-based `primary_key` rendering into configuration, while leaving every other line of logic
(harmonization, normalization, filtering, column management, download) untouched.

- [ ] **Step 1: Read the current implementation in full**

Run: `cat packages/sites/genomics-site/webapp/wdkCustomization/js/client/component-wrappers/AllDatasetsAnswerController.tsx`

This is the file being generalized. Every function in it (`harmonizeAttributes`,
`getDefaultVisibleAttributes`, `withDisplayNameAsKey`, `normalizeRecords`, and the `MergedDatasetsAnswer`
component body) moves into the new file with the changes below and nothing else.

- [ ] **Step 2: Create the new factory file**

Create `packages/libs/web-common/src/component-wrappers/MergedDatasetsAnswerController.tsx`. Start from
the full contents of the source file, then apply these specific changes:

Change the imports (relative paths now that this lives in `web-common`, and drop the
`datasetSourceCategory` import since it's same-directory):

```typescript
import React, {
  useMemo,
  useState,
  useCallback,
  ComponentType,
  ReactNode,
} from 'react';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import RecordLink from '@veupathdb/wdk-client/lib/Views/Records/RecordLink';
import { renderAttributeValue } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import {
  AttributeField,
  RecordInstance,
  Question,
  RecordClass,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { preorderSeq } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import {
  isQualifying,
  getId,
} from '@veupathdb/wdk-client/lib/Utils/CategoryUtils';
import {
  DatasetSourceFilters,
  DatasetSourceIcon,
  getDatasetCategory,
  parseYesNo,
  useDatasetSourceFilter,
} from './datasetSourceCategory';

import './MergedDatasetsAnswerController.scss';
```

Add the config interface directly below the existing `MergedState` interface:

```typescript
export interface MergedDatasetsConfig {
  datasetRecordClassName: string;
  datasetQuestionName: string;
  userDatasetRecordClassName: string;
  userDatasetQuestionName: string;
  renderPrimaryKeyCellContent: (cellProps: {
    value: unknown;
    attribute: AttributeField;
    record: NormalizedRecord;
    recordClass: RecordClass;
    CellContent: ComponentType<any>;
  }) => ReactNode;
}
```

Wrap the existing `export function MergedDatasetsAnswer(props: any) { ... }` in a factory, renaming its
every hardcoded `'dataset'` / `'AllDatasets'` / `'userdataset'` / `'AllUserDatasets'` reference to read
from `config`:

```typescript
export function createMergedDatasetsAnswerController(
  config: MergedDatasetsConfig
): ComponentType<any> {
  return function MergedDatasetsAnswer(props: any) {
    // ... identical body to today, with these substitutions:
    //   wdkService.findRecordClass('dataset')      -> wdkService.findRecordClass(config.datasetRecordClassName)
    //   wdkService.findRecordClass('userdataset')  -> wdkService.findRecordClass(config.userDatasetRecordClassName)
    //   wdkService.findQuestion('AllDatasets')     -> wdkService.findQuestion(config.datasetQuestionName)
    //   wdkService.findQuestion('AllUserDatasets') -> wdkService.findQuestion(config.userDatasetQuestionName)
    //   searchName: 'AllDatasets'                  -> searchName: config.datasetQuestionName
    //   searchName: 'AllUserDatasets'               -> searchName: config.userDatasetQuestionName
    //   dataset_source: 'dataset' / 'userdataset' string literals stay as-is (these are the
    //     NormalizedRecord discriminator values, not WDK names — leave every occurrence unchanged)
  };
}
```

In the `renderCellContent` callback inside the returned component, replace the hardcoded `RecordLink`
construction for `primary_key` with a call to `config.renderPrimaryKeyCellContent`:

```typescript
// before
if (
  attribute.name === 'primary_key' &&
  datasetRecordClass &&
  userDatasetRecordClass
) {
  const recordClassToUse =
    (record as NormalizedRecord).dataset_source === 'dataset'
      ? datasetRecordClass
      : userDatasetRecordClass;

  if (value == null) {
    return null;
  }

  return (
    <RecordLink
      recordId={record.id}
      recordClass={recordClassToUse}
      className="wdk-AnswerTable-recordLink"
    >
      {renderAttributeValue(value)}
    </RecordLink>
  );
}

// after
if (
  attribute.name === 'primary_key' &&
  datasetRecordClass &&
  userDatasetRecordClass
) {
  const recordClassToUse =
    (record as NormalizedRecord).dataset_source === 'dataset'
      ? datasetRecordClass
      : userDatasetRecordClass;

  return config.renderPrimaryKeyCellContent({
    value,
    attribute,
    record: record as NormalizedRecord,
    recordClass: recordClassToUse,
    CellContent,
  });
}
```

Note: `renderAttributeValue` and the `RecordLink` import stay in this file's imports because
genomics-site's own `config.renderPrimaryKeyCellContent` implementation (Task 3) still needs them — but
they are no longer used directly inside `MergedDatasetsAnswerController.tsx`'s body once this change is
made. Leave the imports; Task 3's config function is defined in a _different_ file
(`AllDatasetsAnswerController.tsx`) and will import them itself. Remove `RecordLink` and
`renderAttributeValue` from this file's own import list since they become unused here.

Every other line — `harmonizeAttributes`, `getDefaultVisibleAttributes`, `withDisplayNameAsKey`,
`normalizeRecords`, the `handleChangeColumns` logic, the download `handleDownload` if present, the
`sourceIconAttribute`, `allAttributesWithIcon`/`visibleAttributesWithIcon`, and the final
`<DefaultComponent ...>` render — copy verbatim, unchanged.

- [ ] **Step 3: Move the SCSS file**

Create `packages/libs/web-common/src/component-wrappers/MergedDatasetsAnswerController.scss` with the
exact contents of
`packages/sites/genomics-site/webapp/wdkCustomization/js/client/component-wrappers/AllDatasetsAnswerController.scss`
(the `.AllDatasets-SourceFilters` margin rule).

- [ ] **Step 4: Verify the factory file has no leftover hardcoded question/recordClass names**

Run: `grep -n "'AllDatasets'\|'AllUserDatasets'\|'dataset'\|'userdataset'" packages/libs/web-common/src/component-wrappers/MergedDatasetsAnswerController.tsx`

Expected: the only remaining matches are the `dataset_source: 'dataset'` / `dataset_source:
'userdataset'` string literals inside `normalizeRecords` (the internal discriminator, not a WDK
name) and the `sourceType: 'dataset' | 'userdataset'` type annotations. Every `findRecordClass`,
`findQuestion`, and `searchName` reference must have been replaced with a `config.*` reference — if any
remain, go back to Step 2 and fix them.

- [ ] **Step 5: Commit**

```bash
git add packages/libs/web-common/src/component-wrappers/MergedDatasetsAnswerController.tsx \
        packages/libs/web-common/src/component-wrappers/MergedDatasetsAnswerController.scss
git commit -m "Extract createMergedDatasetsAnswerController factory into web-common"
```

(genomics-site's own file is updated in Task 3, not here, so this task's diff is additive-only and
easy to review in isolation.)

---

## Task 3: Wire genomics-site to the shared factory (no behavior change)

**Files:**

- Modify: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/component-wrappers/AllDatasetsAnswerController.tsx` (replace entire body with a factory call)

**Interfaces:**

- Consumes: `createMergedDatasetsAnswerController`, `MergedDatasetsConfig` from
  `@veupathdb/web-common/lib/component-wrappers/MergedDatasetsAnswerController` (Task 2).
- Produces: `export const MergedDatasetsAnswer` — same export name genomics-site's
  `AnswerController.tsx:17,31` already imports, so no change needed there.

- [ ] **Step 1: Replace the file contents**

Replace the entire contents of
`packages/sites/genomics-site/webapp/wdkCustomization/js/client/component-wrappers/AllDatasetsAnswerController.tsx`
with:

```typescript
import React from 'react';
import RecordLink from '@veupathdb/wdk-client/lib/Views/Records/RecordLink';
import { renderAttributeValue } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { createMergedDatasetsAnswerController } from '@veupathdb/web-common/lib/component-wrappers/MergedDatasetsAnswerController';

export const MergedDatasetsAnswer = createMergedDatasetsAnswerController({
  datasetRecordClassName: 'dataset',
  datasetQuestionName: 'AllDatasets',
  userDatasetRecordClassName: 'userdataset',
  userDatasetQuestionName: 'AllUserDatasets',
  renderPrimaryKeyCellContent: ({ value, recordClass, record }) => {
    if (value == null) {
      return null;
    }

    return (
      <RecordLink
        recordId={record.id}
        recordClass={recordClass}
        className="wdk-AnswerTable-recordLink"
      >
        {renderAttributeValue(value)}
      </RecordLink>
    );
  },
});
```

This is deliberately the exact same JSX genomics-site rendered before the refactor (Task 2, Step 2's
"before" block) — only relocated from inline in `renderCellContent` to this config function.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p packages/sites/genomics-site`
Expected: no errors.

- [ ] **Step 3: Manual verification in browser**

Start genomics-site's dev server (check `packages/sites/genomics-site/package.json` for the dev script,
typically `npm run start` or similar from that package directory) and navigate to
`/search/dataset/AllDatasets/result`.

Confirm, compared to the branch's current behavior before this change:

- The icon column still renders (VEuPathDB favicon / public / lock icons).
- All three filter checkboxes still work.
- Clicking a dataset row's primary key still navigates to `/record/dataset/...`.
- Clicking a user dataset row's primary key still navigates to `/record/userdataset/...`.
- The download button still fires two file downloads.
- Sorting and Add/Remove Columns still work without errors.

- [ ] **Step 4: Commit**

```bash
git add packages/sites/genomics-site/webapp/wdkCustomization/js/client/component-wrappers/AllDatasetsAnswerController.tsx
git commit -m "Wire genomics-site AllDatasets to shared merged-datasets factory"
```

---

## Task 4: Wire clinepi-site to the shared factory, retiring `ClinEpiStudyAnswerController`

**Files:**

- Create: `packages/sites/clinepi-site/webapp/js/client/component-wrappers/AllDatasetsAnswerController.jsx`
- Modify: `packages/sites/clinepi-site/webapp/js/client/component-wrappers/AnswerController.jsx`

**Interfaces:**

- Consumes: `createMergedDatasetsAnswerController` from
  `@veupathdb/web-common/lib/component-wrappers/MergedDatasetsAnswerController` (Task 2); `makeEdaRoute`
  from `@veupathdb/web-common/lib/routes` (existing export, used today by `UDAnswerController.jsx:4`);
  `useEda` from `@veupathdb/web-common/lib/config` (existing export, used today by
  `UDAnswerController.jsx:5`); `safeHtml` from `@veupathdb/wdk-client/lib/Utils/ComponentUtils` (used
  today by `UDAnswerController.jsx:3`).
- Produces: `export const MergedDatasetsAnswer` (new export, consumed by `AnswerController.jsx` in the
  same file/task).

- [ ] **Step 1: Create clinepi-site's config file**

Create `packages/sites/clinepi-site/webapp/js/client/component-wrappers/AllDatasetsAnswerController.jsx`:

```javascript
import React from 'react';
import { Link } from 'react-router-dom';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { makeEdaRoute } from '@veupathdb/web-common/lib/routes';
import { useEda } from '@veupathdb/web-common/lib/config';
import { createMergedDatasetsAnswerController } from '@veupathdb/web-common/lib/component-wrappers/MergedDatasetsAnswerController';

export const MergedDatasetsAnswer = createMergedDatasetsAnswerController({
  datasetRecordClassName: 'dataset',
  datasetQuestionName: 'AllDatasets',
  userDatasetRecordClassName: 'userdataset',
  userDatasetQuestionName: 'AllUserDatasets',
  renderPrimaryKeyCellContent: ({
    value,
    record,
    CellContent,
    ...cellProps
  }) => {
    if (!useEda) {
      return <CellContent {...cellProps} record={record} value={value} />;
    }

    return (
      <Link to={`${makeEdaRoute(record.id[0].value)}/new/details`}>
        {safeHtml(value)}
      </Link>
    );
  },
});
```

This mirrors `UDAnswerController.jsx`'s existing `makeRenderCellContent` logic
(`packages/sites/clinepi-site/webapp/js/client/component-wrappers/UDAnswerController.jsx:60-71`)
exactly, applied to both dataset and userdataset rows alike, since `renderPrimaryKeyCellContent` is
only ever called for the `primary_key` attribute regardless of `dataset_source`.

- [ ] **Step 2: Rewrite `AnswerController.jsx`'s dispatch**

Replace the full contents of
`packages/sites/clinepi-site/webapp/js/client/component-wrappers/AnswerController.jsx`:

```javascript
import React from 'react';

import UDAnswerController from './UDAnswerController';
import { MergedDatasetsAnswer } from './AllDatasetsAnswerController';

export default (AnswerController) => (props) => {
  if (
    props.ownProps.recordClass === 'dataset' &&
    props.ownProps.question === 'AllDatasets'
  ) {
    return (
      <MergedDatasetsAnswer {...props} DefaultComponent={AnswerController} />
    );
  }

  if (props.ownProps.recordClass === 'userdataset') {
    return (
      <UDAnswerController {...props} DefaultComponent={AnswerController} />
    );
  }

  return <AnswerController {...props} />;
};
```

This removes the `StudyAnswerController` and `withPermissions` imports and the
`ClinEpiStudyAnswerController` constant entirely — they are no longer referenced anywhere in this file.
Confirm no other file in `clinepi-site` imports `ClinEpiStudyAnswerController` from this module before
treating the removal as safe:

Run: `grep -rn "ClinEpiStudyAnswerController" packages/sites/clinepi-site/`
Expected: no matches outside this file (which no longer defines it).

- [ ] **Step 3: Typecheck / lint**

Run: `npx eslint packages/sites/clinepi-site/webapp/js/client/component-wrappers/AnswerController.jsx packages/sites/clinepi-site/webapp/js/client/component-wrappers/AllDatasetsAnswerController.jsx`
Expected: no errors (this codebase uses `.jsx`, not TypeScript, for these files — there is no `tsc`
step for clinepi-site's plain JSX files).

- [ ] **Step 4: Manual verification in browser**

Start clinepi-site's dev server (check `packages/sites/clinepi-site/package.json` for the dev script)
and navigate to `/search/dataset/AllDatasets/result`.

Confirm:

- The page no longer shows the old three-section "My datasets / Community datasets / Curated datasets"
  layout — it now shows the single merged table with the icon column and three filter checkboxes.
- User dataset rows appear in the table (since clinepi's database has zero populated `dataset` records
  today, only `dataset_source: 'userdataset'` rows should appear).
- Clicking a user dataset row's primary key navigates into the EDA workspace
  (`/.../new/details`), not to a WDK record page.
- The VEuPathDB filter checkbox renders (and toggles nothing, since there are no dataset-side rows).
- Sorting, Add/Remove Columns, and the download button all work without errors.
- Separately, confirm `/search/userdataset/AllUserDatasets/result` (if reachable directly) still works
  via `UDAnswerController` unchanged — this task does not touch that path.

- [ ] **Step 5: Commit**

```bash
git add packages/sites/clinepi-site/webapp/js/client/component-wrappers/AllDatasetsAnswerController.jsx \
        packages/sites/clinepi-site/webapp/js/client/component-wrappers/AnswerController.jsx
git commit -m "Wire clinepi-site AllDatasets to shared merged-datasets factory, retire ClinEpiStudyAnswerController"
```

---

## Task 5: Confirm `StudyAnswerController.jsx` has no other consumers before considering follow-up cleanup

**Files:**

- None modified — this is a verification-only task that determines whether a follow-up cleanup ticket
  is warranted. Do not delete `packages/libs/web-common/src/component-wrappers/StudyAnswerController.jsx`
  itself in this task even if it turns out unused — that file is shared library code and removing it is
  a separate decision outside this plan's scope.

**Interfaces:**

- None — this task produces information, not code.

- [ ] **Step 1: Search for other consumers**

Run: `grep -rln "StudyAnswerController" packages/sites/ packages/libs/ --include="*.jsx" --include="*.tsx" --include="*.js" --include="*.ts"`

- [ ] **Step 2: Record the result**

If the only remaining reference is the file's own definition
(`packages/libs/web-common/src/component-wrappers/StudyAnswerController.jsx`), note this in the commit
message of Task 4 as a comment for future cleanup — no code change. If other sites still import it,
no action needed either way; this task is purely informational and confirms Task 4 did not silently
break another site.

- [ ] **Step 3: No commit for this task**

This task makes no file changes. Skip the commit step.

---

## Self-review notes

- **Spec coverage**: Every design-doc section maps to a task — utilities move (Task 1), factory
  extraction (Task 2), genomics-site rewire (Task 3), clinepi-site rewire + `ClinEpiStudyAnswerController`
  retirement (Task 4). The design doc's explicit "no new route registration" and "permission gating
  sidelined" decisions are reflected as Global Constraints and in Task 4's body, not left implicit.
- **Type consistency**: `MergedDatasetsConfig`'s `renderPrimaryKeyCellContent` signature is identical
  across Task 2 (definition), Task 3 (genomics-site consumption), and Task 4 (clinepi-site consumption).
- **No placeholders**: every step includes literal code, not a description of code to write.
