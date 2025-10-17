# ResultTableSummaryViewStoreModule

[Note, this Claude-generated documentation has been 100% checked and enhanced by a human (@bobular).]

This StoreModule manages the complex state and data flow for result table summary views. It orchestrates multiple async operations including user preferences, answer fetching, sorting, column selection, and basket status.

## The "Window" System

### Lifecycle

The module uses `takeEpicInWindow()` to create a **scoped epic lifecycle**:

```typescript
// Line 915-923
export const observe = takeEpicInWindow(
  {
    startActionCreator: openResultTableSummaryView,
    endActionCreator: closeResultTableSummaryView,
    compareStartAndEndActions: (start, end) =>
      start.payload.viewId === end.payload.viewId,
  },
  combineEpics(/* all the epics */)
);
```

**What this means:**

- When `openResultTableSummaryView(viewId, resultType)` is dispatched, all child epics **start listening**
- Each epic operates independently within this "window"
- When `closeResultTableSummaryView(viewId)` is dispatched with matching `viewId`, all epics **stop** and clean up
- Multiple windows can be active simultaneously (different `viewId`s)

### Component Integration

The Controller manages the window lifecycle:

```typescript
// ResultTableSummaryViewController.tsx lines 109-114
useEffect(() => {
  actionCreators.openResultTableSummaryView(resultType);
  return () => {
    actionCreators.closeResultTableSummaryView();
  };
}, [resultType]);
```

**Effect:**

- Component mount → `openResultTableSummaryView` → Epics start
- Component unmount → `closeResultTableSummaryView` → Epics stop
- `resultType` change → Window restarts with new data

**Note:**
`resultType` here really should have been called `resultData` or similar. It is not just the type. It's the data.
Although the data is polymorphic across a few different data object types.

## Action Flow Diagram

### Main Initialization Cascade

```
openResultTableSummaryView(viewId, resultType)  aka 'openRTS'
    │
    ├───────────────────────────────────────────────────────────────┐
    │                                                               │
    ▼                                                               ▼
getFirstPageNumber                                    getRequestResultTypeDetails
    │                                                               │
    │                                                               ▼
    │                                              getFulfillResultTypeDetails
    │                                                       (fetch from WDK)
    │                                                               │
    │                    ┌──────────────────────────────────────────┴───────────────┐
    │                    │                                                          │
    │                    ▼                                                          ▼
    │         getRequestColumnsChoicePreference                    getRequestSortingPreference
    │                    │                                                          │
    │                    ▼                                                          ▼
    │         getFulfillColumnsChoicePreference                    getFulfillSortingPreference
    │          (load from user prefs + validate)                   (load from user prefs + validate)
    │                    │                                                          │
    ├────────────────────┘                                                          │
    │                                                                               │
    ▼                                                                               │
getRequestPageSize                                                                  │
    │                                                                               │
    ▼                                                                               │
getFulfillPageSize                                                                  │
(load from user prefs)                                                              │
    │                                                                               │
    └───────────────────────────────┬───────────────────────────────────────────────┘
                                    │
                    All 8 actions must align before proceeding:
                    ┌───────────────┼──────────────┐
                    │               │              │
        ┌───────────┼───────────────┼──────────────┼───────────────┐
        │           │               │              │               │
        ▼           ▼               ▼              ▼               ▼
   openRTS  fulfillResultTypeDetails viewPageNumber fulfillPageSize fulfillColumnsChoice
        │           │               │              │               │
        └───────────┼───────────────┼──────────────┼───────────────┤
                    │               │              │               │
                    ▼               ▼              ▼               ▼
            fulfillSorting  fulfillGlobalViewFilters  updateInBasketFilter
                    │               │              │
                    └───────────────┼──────────────┘
                                    │
                                    ▼
                            getRequestAnswer
                                    │
                                    ▼
                          getFulfillAnswer
                        (fetch answer from WDK)
                                    │
                                    ▼
                       getRequestRecordsBasketStatus
                                    │
                                    ▼
                      getFulfillRecordsBasketStatus
                          (check basket status)
                                    │
                                    ▼
                            (Initial load complete)
```

### User-Triggered Updates

When users interact with the table (change columns, sorting, page, or filters), specific actions cause the answer to re-fetch:

#### Example: Column Selection Changes

```
User clicks "Add Columns" button in UI
    │
    ▼
Controller dispatches: requestColumnsChoiceUpdate(viewId, searchName, newColumns)
    │
    ▼
Epic: getFulfillColumnsChoiceUpdate
    ├─► setResultTableColumnsPref(...)        // Save to backend
    ├─► wdkService.updateStepProperties(...)  // Update step (if viewing a step)
    │
    ▼
Dispatches: fulfillColumnsChoice(viewId, newColumns, searchName)
    │
    ▼
This is one of the 8 actions getRequestAnswer is watching!
    │
    ▼
getRequestAnswer detects new fulfillColumnsChoice action
    │
    ▼
getFulfillAnswer re-fetches with new columns
    │
    ▼
getRequestRecordsBasketStatus updates basket status for new page
    │
    ▼
Table re-renders with new columns
```

**Other user actions follow similar patterns:**

- **Sorting change** → `requestSortingUpdate` → `fulfillSorting` → triggers `getRequestAnswer`
- **Page change** → `viewPageNumber` → triggers `getRequestAnswer`
- **Page size change** → `requestPageSizeUpdate` → `fulfillPageSize` → triggers `getRequestAnswer`
- **Filter change** → `updateGlobalViewFilters` → `fulfillGlobalViewFilters` → triggers `getRequestAnswer`
- **Basket filter toggle** → `updateInBasketFilter` → triggers `getRequestAnswer`

## The `smrate` Pattern

`smrate` is shorthand for `switchMapRequestActionsToEpic` (defined in ActionCreatorUtils.ts). It's a factory that creates epics which:

1. **Wait for specific actions** - Epics don't fire until ALL required actions have been dispatched at least once
2. **Re-fire on updates** - When any watched action is dispatched again, the epic re-runs
3. **Validate coherence** - Optional `areActionsCoherent` filter ensures actions belong together (same viewId, searchName, etc.)
4. **Check novelty** - Optional `areActionsNew` determines if action combination is actually new
5. **Cancel previous** - Uses `switchMap` so new requests cancel in-flight ones

### Anatomy of an smrate Call

```typescript
smrate(
  [openRTS, fulfillResultTypeDetails, requestColumnsChoicePreference],
  //  ▲ These actions must all be dispatched (at least once)

  getFulfillColumnsChoicePreference,
  //  ▲ This async function runs when all actions are available

  { areActionsCoherent: filterFulfillBySearchName }
  //  ▲ Optional: validate the action combination makes sense
);
```

### Key Options

#### `areActionsCoherent`

Validates that actions "belong together" before firing the epic.

Example (lines 387-393):

```typescript
function filterFulfillBySearchName([
  openAction,
  resultTypeDetailsAction,
  requestAction,
]) {
  const { resultTypeDetails } = resultTypeDetailsAction.payload;
  return (
    openAction.payload.viewId === requestAction.payload.viewId &&
    resultTypeDetails.searchName === requestAction.payload.searchName
  );
}
```

**Without this:** The epic might mix actions from different views/searches.

#### `areActionsNew`

Determines if the action combination is "new enough" to re-run the epic.

Common values:

- `undefined` (default) → Re-run when action tuple changes (deep equality check)
- `stubTrue` (line 1006) → Always re-run, even if actions are identical
- `() => true` (lines 951, 1021, 1030) → Same as `stubTrue` but explicit

**Why `areActionsNew: stubTrue`?**

- Line 1006 (getFulfillAnswer): Always fetch answer, even if params look identical (might need fresh data)
- Line 1021 (basket status): Always check basket status after basket update
- Line 1030 (reset preferences): Always reload after reset

## Critical Action Bottleneck: `requestAnswer`

The most complex epic (lines 990-1003) waits for **8 actions to align**:

```typescript
smrate(
  [
    openRTS, // 1. View opened
    fulfillResultTypeDetails, // 2. Know the search type
    viewPageNumber, // 3. Know which page to fetch
    fulfillPageSize, // 4. Know how many records
    fulfillColumnsChoice, // 5. Know which columns to fetch
    fulfillSorting, // 6. Know the sort order
    fulfillGlobalViewFilters, // 7. Know active filters
    updateInBasketFilter, // 8. Know if filtering by basket
  ],
  getRequestAnswer,
  { areActionsCoherent: filterRequestAnswerActions }
);
```

This ensures the answer request has **all necessary parameters** before firing.

The `filterRequestAnswerActions` function (lines 620-655) validates:

- All actions share the same `viewId`
- `searchName` matches across column/sorting fulfillments
- `recordClassName` matches the filters

## Answer Optimization

`getFulfillAnswer` (lines 657-724) includes a **client-side optimization**:

```typescript
// Lines 673-695
if (
  currentAnswer &&
  isEqual(r.pagination, currentAnswer.meta.pagination) &&
  isEqual(r.columnsConfig.sorting, currentAnswer.meta.sorting) &&
  !isEqual(r.columnsConfig.attributes, currentAnswer.meta.attributes) &&
  difference(r.columnsConfig.attributes, currentAnswer.meta.attributes).length === 0
) {
  // New columns are a SUBSET of current columns
  // → Just filter the existing answer instead of fetching
  const answer: Answer = {
    ...currentAnswer,
    meta: {
      ...currentAnswer.meta,
      attributes: r.columnsConfig.attributes as Answer['meta']['attributes'],
    },
  };
  return fulfillAnswer(/* ... */, answer);
}
```

**When it applies:**

- User **removes** columns (but doesn't add or reorder)
- Same page and sort order
- **Saves a network request**

## Reset to Default Flow

This is triggered by a button shown only when the backend has returned a 500 and the user would be
permanently stuck without some kind of reset columns button. (Since the results table with the column
management button is not shown upon an error.)

The `resetColumnPreferencesToDefault` action (lines 874-913):

1. **Clears backend preferences** via `clearResultTablePreferences()`
2. **Clears step display preferences** if viewing a step
3. **Re-fetches default columns** from backend
4. **Validates** them against current search
5. **Dispatches fulfillColumnsChoice** to trigger answer re-fetch

The reducer (lines 267-277) also clears dialog state to force UI refresh.

## Basket Status Management

Basket status is tracked per-record on the current page:

```typescript
basketStatusArray?: Array<'yes' | 'no' | 'loading'>
```

**Loading states:**

- User clicks "Add/Remove from basket" → Status changes to `'loading'`
- Request completes → Status updates to `'yes'` or `'no'`

**Optimistic updates:**

- Lines 117-129: `getUpdatedBasketStatus()` maps primary keys to array indexes
- Lines 206-219: When `requestUpdateBasket` fires, matching records show `'loading'`
- Lines 767-788: After answer updates, basket status is re-fetched for all visible records

## State Structure

```typescript
type ViewState = {
  resultType?: ResultType; // Step or Answer
  resultTypeDetails?: ResultTypeDetails; // Search metadata
  answer?: Answer; // The actual data
  answerLoading: boolean; // Loading indicator
  errorMessage?: string; // Error to display
  addingStepToBasket: boolean; // Adding all records
  searchName?: string; // For validation
  basketStatusArray?: Array<BasketStatus>; // Per-record basket status
  columnsDialogIsOpen: boolean; // UI state
  columnsDialogSelection?: string[]; // Selected columns in dialog
  columnsDialogSearchString?: string; // Search term in dialog
  columnsDialogExpandedNodes?: string[]; // Expanded tree nodes
  selectedIds?: string[]; // Selected rows
  globalViewFilters: GlobalViewFilters; // Active filters
  inBaskeFilterEnabled: boolean; // Show only basket items
};

type State = IndexedState<ViewState>; // Keyed by viewId
```

The `IndexedState` pattern allows **multiple independent views** to coexist (e.g., basket view + search result view).

## Common Pitfalls

### 1. Forgetting to check searchName

Many epics wait for `fulfillResultTypeDetails` to get the `searchName`, then use it to validate subsequent actions. Without this validation, actions from different searches could mix.

### 2. Not using areActionsNew: stubTrue for side effects

If an epic performs side effects (like fetching data), it should use `areActionsNew: stubTrue` to ensure it runs every time, even if the action tuple looks identical.

### 3. Missing viewId in filter functions

The `areActionsCoherent` functions must check that `viewId` matches across all actions to prevent cross-contamination between views.

## Debugging Tips

### Enable epic logging

The `takeEpicInWindow` function includes console logging (lines 370-402):

```typescript
const logTag = `[${startActionCreator.type} - ${
  endActionCreator.type
} -- ${JSON.stringify(startAction)}]`;
const log = (...args: any[]) => console.log(logTag, '--', ...args);
```

This logs:

- When window starts
- Every action produced by epics in the window
- Errors in the window
- When window ends

### Check action alignment

For the 8-action `requestAnswer` epic, use Redux DevTools to verify all 8 actions have fired and their `viewId`/`searchName` values match.

### Watch for stale closures

Epics capture `state$` at definition time. Always read from `state$.value` inside epic functions, not at closure time.
