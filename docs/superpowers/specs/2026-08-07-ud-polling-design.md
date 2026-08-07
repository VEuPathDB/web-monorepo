# Design: Replace the User Dataset Refresh button with polling

**Date:** 2026-08-07
**Branch:** ud-polling (based on `main` @ `47efc363fa`)
**Status:** Designed, not implemented

## Context

The Dataset Management detail page shows a VDI dataset's status as it moves through upload → import →
install. Today the only way to see a status change is a manual **Refresh** button, and it has two
reported problems:

1. **Bug 1 — misleading "unchanged" report.** `handleRefresh` awaits the load thunk, then reads
   `this.props` back after a fixed `setTimeout(…, 100)`. When the Redux→render cycle takes longer
   than 100ms the callback compares stale props against the pre-refresh baseline, concludes nothing
   changed, and blinks the "unchanged" indicator on a status that _did_ change.
2. **Bug 2 — Available Searches never appear.** After a dataset installs, the status flips but the
   "Available searches" list stays empty until a full page reload. **This is the originally reported
   user-facing bug**, and it is not a timing problem — see below.

Polling supersedes the button entirely, so this branch removes it rather than repairing it.

### Why bug 2 is not a timing bug

"Available searches" renders only when **both** conditions hold (`DatasetManagement.tsx`,
`getAttributes`):

```ts
!Array.isArray(questions) || !questions.length || !isInstalled ? null : { … }
```

The two operands come from different places:

- `isInstalled` ← `props.userDataset` ← `state.userDatasetDetail` — **refreshed** by the load thunk
- `questions` ← `state.globalData.questions` — **never refreshed**; loaded once by `loadAllStaticData`

`globalData.questions` is derived from `getQuestions()` → `getRecordClasses()`, which is cached twice:
a lodash `memoize` (`ServiceBase.ts:456`) and a persistent store keyed on the URL
(`useCache: true, cacheId: 'records'`). A newly installed dataset's searches only exist in a _fresh_
`/record-types` response, so no amount of dataset-detail refreshing surfaces them. That explains the
reported "click again and they appear": it works only once something else has invalidated that cache,
which is why it is intermittent.

The searches list therefore needs its own refetch, on its own trigger. Polling supplies that trigger
("transitioned to `install: complete`"), which a manual click could not.

## Design

### 1. Polling loop (replaces the Refresh button)

Follow the proven in-repo pattern at
`packages/sites/genomics-site/webapp/wdkCustomization/js/client/controllers/AiGenePublicationAddController.tsx:201-313`:
**recursive `setTimeout`, not `setInterval`** — the next tick is scheduled only after the current one
resolves, so overlapping requests are structurally impossible. Copy its `cancelled`-flag discipline
(checked after every `await`) and its catch-and-retry on transient failures, so a blip does not kill
the loop.

Reuse the existing action `loadUserDatasetDetailWithoutLoadingIndicator` — already wired as a prop.

- **Backoff:** three flat rates, not a smooth ramp — 2s for 5 polls (first ~10s), then 5s for 6 polls
  (to ~40s), then **15s** for every poll thereafter. Fast while the user is most attentive, cheap over
  the long tail of a multi-minute import.
- **`install: ready-for-reinstall`** waits on the VDI reconciler (`vdiConfig.fullRunInterval`, likely
  minutes-to-hours), so its steady-state rate is **60s** rather than 15s.
- **Tab visibility:** pause while `document.hidden`; on resume, poll immediately and reset the backoff
  to the fastest tier — the user just came back, so treat it as a fresh look.
- **No give-up cap** — polls while the page is open. This is only safe _because_ of the visibility
  pause; the two decisions are a package, and dropping the pause means revisiting the cap.

### 2. Stop condition

Status is a composite of three sequential phases (`Service/Model/response-decoders.ts`), each with
its own terminal values. Reuse `isInstalled()` (`DatasetManagement.tsx:294`) for the success case
rather than defining a second notion of installed.

Note `isInstalled()` is **project-scoped** (`installTarget === projectId`). The failure checks must be
scoped the same way, or a failure on another project's install target would stop polling for a
dataset still installing on this one.

|                   | states                                                                                                                                                          |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Keep polling**  | `upload: running` · `import: queued`/`in-progress` · `install: running` · `install: ready-for-reinstall` · no install entry for this project yet · unrecognized |
| **Stop, success** | `install: complete` (via `isInstalled()`)                                                                                                                       |
| **Stop, failure** | `upload: rejected`/`failed` · `import: invalid`/`failed` · `install: failed-validation`/`failed-installation`/`missing-dependency`                              |

`ready-for-reinstall` is deliberately **non-terminal**: its user-facing message says "will be
reinstalled within {interval}. Please check again soon," so stopping there would leave the page
promising an update it had given up on. (The header comment at `UserDatasetStatus.tsx:46` calls it an
error; that comment is stale and contradicts the message the same file renders at line 236.)

Write the terminal set as an **explicit list**, never as `!== 'running'`. `datasetInstallStatus` is a
decoder union; if VDI adds a value later an explicit list fails safe (keeps polling, visibly) while a
negation fails silently (stops polling, looks stuck). Default to **continuing** whenever the shape is
unrecognized or the install entry is missing.

### 3. Polling indicator

A **persistent** element, visible only while polling is active and never alongside a terminal status:
a steady "Checking for updates" line with a brief emphasis (spinner or opacity change) on each tick.

An earlier idea — flash the message for 0.5s per poll — was rejected: at a 15s interval an
appear/disappear message reads as flicker rather than signal, leaves the page looking dead in
between, and gets repeatedly re-announced by screen readers. A persistent element whose content
changes avoids all three.

### 4. Bug 2 — UD-local searches refetch

On the transition into `install: complete`. A single refetch at that moment is sufficient: as soon as
VDI reports the install complete, the dataset id is available to WDK and the backend queries behind
the model data are ready and fast (confirmed by the team, 2026-08-07). No retry or settle delay is
needed — if the refetch returned nothing, that would be a real absence rather than a timing artifact.

- Fetch `/record-types?format=expanded` via `sendRequest(..., { useCache: false })`. Verified at
  `ServiceBase.ts:185`: `useCache: false` skips `_getFromCache` and goes straight to `_fetchJson`,
  bypassing **both** cache layers. Do not call `getRecordClasses()` — that is the memoized path.
- Decode with the existing `questionDecoder` (already used for `searches` at
  `Service/Decoders/RecordClassDecoders.ts:144`).
- Flatten `recordClass.searches` and filter by `properties.userDatasetType` including this dataset's
  type — the same predicate `getAttributes` uses today.
- Store in the **user-datasets** slice (`UserDatasetDetailStoreModule`). `getAttributes` prefers these
  when present, falling back to `globalData.questions` otherwise.

Two alternatives were considered and rejected:

- **Dispatching `questionsLoaded`** to update `globalData` would fix it everywhere and is conceptually
  cleaner, but mutates static data that ~55 files read, mid-session, on a timer. If that is ever
  right, it should be designed deliberately, not inherited from a UD bug fix.
- **A scoped `/record-types/{rc}/searches` call** cannot be targeted: there is no dataset-type →
  record-class mapping anywhere, and `userDatasetType` is an untyped runtime property bag rather than
  a field on the `Question` interface. Finding a dataset's searches requires scanning all questions.

## Files

- `packages/libs/user-datasets/src/lib/Components/Management/DatasetManagement.tsx` — remove the
  Refresh button, `handleRefresh`, `state.refreshing`, `state.statusUnchanged`, `statusUnchangedTimer`
  and the `status-blink` usage; add polling + indicator; prefer the UD-local searches
- `packages/libs/user-datasets/src/lib/Actions/UserDatasetsActions.ts` — action for the searches refetch
- `packages/libs/user-datasets/src/lib/StoreModules/UserDatasetDetailStoreModule.ts` — hold the searches
- `packages/libs/user-datasets/src/lib/Service/` — the uncached record-types fetch
- the `status-blink` CSS rule, now unused

**Structural note:** `DatasetManagement` is a class component with a generic
`S extends DatasetManagementState`; the reference implementation is hooks-based. Extract the loop into
a `useDatasetPolling` hook with a thin wrapper rather than reimplementing it in lifecycle methods. That
also makes the logic testable, which it is not inside the class.

## Scope

Detail page only. `UserDatasetList` also renders `UserDatasetStatus` and
`loadUserDatasetListWithoutLoadingIndicator` exists, but list polling refreshes _all_ datasets in one
request and its stop condition becomes "every dataset terminal" — a different problem, deferred.

## Relationship to PR #1835

PR #1835 (branch `fix-ud-refresh-bug`) fixes bug 1 by reworking `handleRefresh`'s settle logic. This
branch **deletes** `handleRefresh`, so that work is superseded and is not present here — `ud-polling`
branches from `main`, not from `fix-ud-refresh-bug`.

One review comment on #1835 still applies: `NodeJS.Timeout` is the wrong annotation for a browser
timer handle. Browser `setTimeout` returns `number`, and `@types/node` is only ambiently present via
hoisting — the shared `@veupathdb/tsconfig` sets `lib` to dom/dom.iterable/esnext with no
`types: ["node"]`. Use `ReturnType<typeof setTimeout>`, which is correct under both. The polling
timer needs the same treatment.

Worth deciding whether #1835 still merits merging once this lands.

## Verification

Automated coverage is thin: `user-datasets` has exactly one test file
(`Service/utils/rnaseq-rc-data-files.test.ts`, a pure function) and none for this component. The
extracted hook should get unit tests with fake timers — backoff progression, terminal-state stop,
visibility pause/resume, and no overlapping ticks.

End-to-end, against a real VDI import:

1. `npx tsc -p packages/libs/user-datasets/tsconfig.json --noEmit` — clean before and after
2. Upload a dataset; confirm status advances **without interaction**, indicator visible throughout
3. **Confirm Available searches appear on install without a page reload** — this is the reported bug
4. DevTools → Network: confirm the backoff ramp (2s → 5s → 15s), and that polling **stops** on
   `install: complete`
5. Switch tabs mid-import: confirm requests stop while hidden and resume immediately on return
6. Force a failure (e.g. an invalid upload): confirm polling stops and the error status renders
7. Leave a `ready-for-reinstall` dataset open: confirm the 60s ceiling, not 15s

The premise behind step 3 is confirmed rather than assumed: WDK has the dataset id and its model data
ready as soon as VDI reports `install: complete`, so the single refetch is enough (see _Bug 2_ above).
