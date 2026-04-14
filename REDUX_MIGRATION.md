# Migrating to Modern Redux (Redux Toolkit)

## Table of Contents

1. [Overview](#1-overview)
2. [Current Architecture Inventory](#2-current-architecture-inventory)
3. [Step 1 — Switch to `configureStore`](#3-step-1--switch-to-configurestore)
4. [Step 2 — Convert StoreModules to `createSlice`](#4-step-2--convert-storemodules-to-createslice)
5. [Step 3 — Async Strategy: Three Paths](#5-step-3--async-strategy-three-paths)
   - [Path A: Keep Epics, Modernize Everything Else](#path-a-conservative-keep-epics-modernize-everything-else)
   - [Path B: Replace Simple Epics with `createAsyncThunk`](#path-b-recommended-for-new-features-replace-simple-epics-with-createasyncthunk)
   - [Path C: Replace `redux-observable` with `createListenerMiddleware`](#path-c-long-term-replace-redux-observable-with-createlistenermiddleware)
6. [Step 4 — Migrate `connect()` to Hooks](#6-step-4--migrate-connect-to-hooks)
7. [Step 5 — TypeScript Improvements](#7-step-5--typescript-improvements)
8. [Service Injection for `createAsyncThunk`](#8-service-injection-for-createasyncthunk)
9. [Migration Order and Prioritization](#9-migration-order-and-prioritization)
10. [Relationship to the Next.js Migration](#10-relationship-to-the-nextjs-migration)

---

## 1. Overview

This document describes how to migrate the Redux state management in `wdk-client` from its current hand-rolled patterns to [Redux Toolkit (RTK)](https://redux-toolkit.js.org/). It is a companion to `NEXT_MIGRATION.md`, which defers Redux modernization as out of scope for an initial Next.js port. This document picks up that thread.

**Why modernize?**

- **Boilerplate elimination.** The current codebase has ~4,848 lines of action files and ~7,033 lines of reducer files — a large fraction of which is structural scaffolding rather than domain logic. RTK collapses action constants, action creators, and reducers into a single `createSlice` call.
- **Immer.** RTK bundles [Immer](https://immerjs.github.io/immer/), which allows reducers to be written with direct mutations (e.g. `state.counts = action.payload`) without losing immutability. No more `{ ...state, counts: action.payload }`.
- **TypeScript inference.** The current pattern requires `InferAction<typeof actionCreator>` everywhere. RTK infers action payload types from `createSlice` and `createAsyncThunk` automatically.
- **Built-in DevTools.** `configureStore` automatically wires up Redux DevTools, eliminating the manual `window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__` dance in `Core/Store.ts`.
- **Prerequisite for the Next.js end-state.** `NEXT_MIGRATION.md §7` describes domain logic moving to React hooks / TanStack Query backed by server components. That is only achievable once the `redux-observable` machinery is dismantled.

**Key principle: everything is incremental.** Old and new code coexist safely. A module converted to RTK dispatches actions that the legacy `connect()` components can still read. A `connect()` controller can read state from a `createSlice` reducer without modification. No big-bang rewrite is required.

---

## 2. Current Architecture Inventory

| Concern | Current owner | Current pattern | RTK replacement |
|---|---|---|---|
| Store creation | `Core/Store.ts` | `createStore` + `applyMiddleware` + manual DevTools compose | `configureStore` |
| Action creators | `Actions/*.ts` (28 files) | `makeActionCreator()` utility | `createSlice.actions` (auto-generated) |
| Reducers | `StoreModules/*.ts` (30 modules) | `switch` statement per module | `createSlice.reducers` (Immer-enabled) |
| Async side effects | `StoreModules/*.ts` observe exports | `redux-observable` epics with `mrate`/`crate`/`srate` helpers | `createAsyncThunk` or `createListenerMiddleware` |
| Custom thunk layer | `Core/WdkMiddleware.ts` | Handles thunk functions, promises, arrays before `next()` | Can stay as-is or be retired once `createAsyncThunk` covers the same cases |
| Service injection | Epic middleware `dependencies` option | `EpicDependencies` (`wdkService`, `transitioner`, `paramValueStore`) | `configureStore` `thunk.extraArgument` |
| Component binding | `Controllers/*.tsx` (33 files) | `react-redux` `connect()` with `mapStateToProps`/`mapDispatchToProps` | `useSelector` + `useDispatch` hooks |
| DevTools | `Core/Store.ts:64-69` | Manual `window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__` | Auto-configured by `configureStore` |

**What does _not_ need to change immediately:**

- `redux-observable` and RxJS can remain for the duration of the migration. They plug into `configureStore` as additional middleware.
- `WdkMiddleware` can remain as a custom middleware. It is passed to `configureStore` the same way it is currently passed to `applyMiddleware`.
- The `StoreModule` type and `createWdkStore` function can be kept as a thin compatibility shim while modules are migrated one at a time.

---

## 3. Step 1 — Switch to `configureStore`

This is the highest-leverage, lowest-risk change: a one-file edit to `Core/Store.ts` that makes all subsequent steps possible.

### Before (`Core/Store.ts`)

```typescript
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { combineEpics, createEpicMiddleware } from 'redux-observable';

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: Function;
  }
}

export function createWdkStore(storeModules, dependencies, additionalMiddleware = []) {
  const rootReducer = makeRootReducer(storeModules);
  const rootEpic = makeRootEpic(storeModules);
  const epicMiddleware = createEpicMiddleware({ dependencies });

  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ name: 'WDKClient' })
    : compose;

  const enhancer = composeEnhancers(
    applyMiddleware(
      ...additionalMiddleware,
      wdkMiddleware(dependencies),
      epicMiddleware
    )
  );

  const store = createStore(rootReducer, enhancer);
  epicMiddleware.run(rootEpic);
  return store;
}
```

### After

```typescript
import { configureStore } from '@reduxjs/toolkit';
import { combineEpics, createEpicMiddleware } from 'redux-observable';

export function createWdkStore(storeModules, dependencies, additionalMiddleware = []) {
  const rootReducer = makeRootReducer(storeModules);
  const rootEpic = makeRootEpic(storeModules);
  const epicMiddleware = createEpicMiddleware({ dependencies });

  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        // Inject wdkService etc. so createAsyncThunk can access it via thunkAPI.extra
        thunk: { extraArgument: dependencies },
        // Disable the serialization check — WdkService instances are not serializable
        serializableCheck: false,
      })
        .prepend(...additionalMiddleware)
        .concat(wdkMiddleware(dependencies), epicMiddleware),
    devTools: { name: 'WDKClient' },
  });

  epicMiddleware.run(rootEpic);
  return store;
}
```

**What this gains immediately:**

- `window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__` is gone; `configureStore` handles DevTools automatically.
- All existing `StoreModule` reducers and epics continue to work with zero changes.
- `dependencies` is now available as `thunkAPI.extra` inside any future `createAsyncThunk` call (Step 3, Path B).
- RTK's development-mode mutation check will catch accidental state mutations in existing reducers — a useful safety net.

**Install RTK:**

```bash
yarn workspace @veupathdb/wdk-client add @reduxjs/toolkit
```

RTK lists `redux` and `immer` as dependencies so it will manage those version pins.

---

## 4. Step 2 — Convert StoreModules to `createSlice`

Each `StoreModule` has three exports: `key` (string), `reduce` (reducer function), and optionally `observe` (epic). This maps directly to a `createSlice`:

| StoreModule | `createSlice` |
|---|---|
| `key` | `name` |
| `reduce` (switch statement) | `reducers` / `extraReducers` (Immer-enabled) |
| `observe` (epic) | stays in the same file, unchanged |

The action files collapse into the slice. `makeActionCreator` is replaced by the auto-generated `slice.actions` object. The naming convention (`requestX` / `fulfillX` / `cancelX`) is preserved via slice action names.

### Before: Two files, ~100 lines of scaffolding

**`Actions/BasketActions.ts`** (abbreviated):

```typescript
import { makeActionCreator, InferAction } from '../Utils/ActionCreatorUtils';

export const requestBasketCounts = makeActionCreator('requestBasketCounts');

export const fulfillBasketCounts = makeActionCreator(
  'fulfillBasketCounts',
  (counts: Record<string, number>) => ({ counts })
);

export const requestUpdateBasket = makeActionCreator(
  'requestUpdateBasket',
  (operation: BasketPatchIdsOperation, recordClassName: string, primaryKeys: Array<PrimaryKey>) =>
    ({ operation, recordClassName, primaryKeys })
);

export const fulfillUpdateBasket = makeActionCreator(
  'fulfillUpdateBasket',
  (operation: BasketPatchIdsOperation, recordClassName: string, primaryKeys: Array<PrimaryKey>) =>
    ({ operation, recordClassName, primaryKeys })
);

// ... 8 more action creators ...

export type Action = InferAction<
  | typeof requestBasketCounts
  | typeof fulfillBasketCounts
  | typeof requestUpdateBasket
  | typeof fulfillUpdateBasket
  // ... union of all 12 action creators
>;
```

**`StoreModules/BasketStoreModule.ts`** (reducer portion):

```typescript
export const key = 'basket';

export type State = {
  counts?: Record<string, number>;
};

const initialState: State = {};

export function reduce(state: State = initialState, action: Action): State {
  switch (action.type) {
    case fulfillBasketCounts.type:
      return { counts: action.payload.counts };
    default:
      return state;
  }
}
```

### After: One file, all scaffolding gone

**`StoreModules/BasketStoreModule.ts`** (combined):

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PrimaryKey } from '../Utils/WdkModel';
import { BasketPatchIdsOperation } from '../Service/Mixins/BasketsService';

export type State = {
  counts?: Record<string, number>;
};

const basketSlice = createSlice({
  name: 'basket',  // was: key = 'basket'
  initialState: {} as State,
  reducers: {
    requestBasketCounts: () => {},  // no state change; fires epic
    fulfillBasketCounts(state, action: PayloadAction<{ counts: Record<string, number> }>) {
      state.counts = action.payload.counts;  // Immer: direct mutation is safe
    },
    requestUpdateBasket: {
      reducer: () => {},
      prepare: (operation: BasketPatchIdsOperation, recordClassName: string, primaryKeys: Array<PrimaryKey>) =>
        ({ payload: { operation, recordClassName, primaryKeys } }),
    },
    fulfillUpdateBasket: {
      reducer: () => {},
      prepare: (operation: BasketPatchIdsOperation, recordClassName: string, primaryKeys: Array<PrimaryKey>) =>
        ({ payload: { operation, recordClassName, primaryKeys } }),
    },
    // ... remaining actions
  },
});

export const key = basketSlice.name;
export const reduce = basketSlice.reducer;
export const {
  requestBasketCounts,
  fulfillBasketCounts,
  requestUpdateBasket,
  fulfillUpdateBasket,
  // ...
} = basketSlice.actions;

// observe (epics) stays exactly as before — no changes needed
export { observe } from './BasketEpics';  // or inline below
```

The `BasketActions.ts` file is deleted. Import sites that previously imported from `BasketActions` now import from `BasketStoreModule` (or from wherever the slice lives). This is a find-and-replace.

**Migration path for actions referenced across modules:** Action creators from one slice are sometimes dispatched from another module's epic. This still works — export the action creators from the slice and import them wherever they are needed, exactly as before.

---

## 5. Step 3 — Async Strategy: Three Paths

The `redux-observable` epics are the most complex part of the migration. The right path depends on how much investment is available and how complex the individual module is.

### Path A (conservative): Keep epics, modernize everything else

Convert `StoreModules` to slices and delete `Actions/` files as described in Step 2, but leave all `observe` epics completely unchanged. Use `extraReducers` in the slice to handle actions dispatched by epics:

```typescript
const basketSlice = createSlice({
  name: 'basket',
  initialState: {} as State,
  reducers: {
    requestBasketCounts: () => {},
  },
  extraReducers: (builder) => {
    // fulfillBasketCounts comes from the existing epic — wire it up here
    builder.addCase(fulfillBasketCounts, (state, action) => {
      state.counts = action.payload.counts;
    });
  },
});
```

The epics still dispatch `fulfillBasketCounts()` using the same action creator. The slice reducer handles it via `extraReducers`. This pattern allows the epic to remain unchanged while the reducer and action files are cleaned up.

**Best for:** Modules with complex RxJS orchestration (debounce, race conditions, cancellation chains). Specifically: `QuestionStoreModule`, `StrategyStoreModule`, `StrategyWorkspaceStoreModule`.

### Path B (recommended for new features): Replace simple epics with `createAsyncThunk`

Many epics follow a simple pattern: receive one action, call `wdkService`, dispatch a fulfill action. These map directly to `createAsyncThunk`:

**Before** (epic pattern from `BasketStoreModule`):

```typescript
async function getFulfillBasketCounts(
  _: unknown,
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof fulfillBasketCounts>> {
  const counts = await wdkService.getBasketCounts();
  return fulfillBasketCounts(counts);
}

export const observe = combineEpics(
  srate([requestBasketCounts], getFulfillBasketCounts, { areActionsNew: () => true }),
  // ...
);
```

**After** (`createAsyncThunk` with injected service):

```typescript
import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AppThunkConfig } from '../Core/Store';  // see Step 8

export const fetchBasketCounts = createAsyncThunk<
  Record<string, number>,  // return type
  void,                     // argument type
  AppThunkConfig
>(
  'basket/fetchCounts',
  async (_, { extra: { wdkService } }) => {
    return wdkService.getBasketCounts();
  }
);
```

The slice uses `extraReducers` to handle the thunk's lifecycle actions:

```typescript
const basketSlice = createSlice({
  name: 'basket',
  initialState: {} as State,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchBasketCounts.fulfilled, (state, action) => {
      state.counts = action.payload;
    });
    // .addCase(fetchBasketCounts.pending, ...) if loading state is needed
    // .addCase(fetchBasketCounts.rejected, ...) for error state
  },
});
```

Components dispatch `fetchBasketCounts()` instead of `requestBasketCounts()`. The epic for this operation is removed.

**Best for:** Modules with simple request/fulfill patterns (no debounce, no cancellation, no chaining). `BasketStoreModule` (basket counts, update basket), `FavoritesListStoreModule`, `PublicStrategyStoreModule`.

**Note on RTK Query:** RTK Query is designed for REST APIs with predictable URLs. The WDK service is a stateful, typed object with complex multi-step operations. RTK Query is not a good fit here. `createAsyncThunk` backed by `wdkService` is the right level of abstraction.

### Path C (long-term): Replace `redux-observable` with `createListenerMiddleware`

RTK's `createListenerMiddleware` is the native replacement for sagas and observables — it handles reactive patterns (run logic in response to actions, with cancellation, debounce, and access to the store) without RxJS.

**Before** (observable epic with `switchMap`):

```typescript
// BasketStoreModule
srate([requestBasketCounts], getFulfillBasketCounts, { areActionsNew: () => true })
// srate = switchMapRequestActionsToEpic: cancels in-flight request on new dispatch
```

**After** (`createListenerMiddleware`):

```typescript
import { createListenerMiddleware } from '@reduxjs/toolkit';

export const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  actionCreator: requestBasketCounts,
  effect: async (action, listenerApi) => {
    listenerApi.cancelActiveListeners();  // equivalent to switchMap cancellation
    const { wdkService } = listenerApi.extra as EpicDependencies;
    const counts = await wdkService.getBasketCounts();
    listenerApi.dispatch(fulfillBasketCounts(counts));
  },
});
```

Add to the store:

```typescript
configureStore({
  middleware: (getDefault) =>
    getDefault().prepend(listenerMiddleware.middleware),
});
```

**Best for:** This path eliminates `redux-observable` and RxJS as dependencies entirely. It should be pursued module-by-module after Path B has been applied to the simpler modules. The complex orchestration in `QuestionStoreModule` and `StrategyWorkspaceStoreModule` will require careful translation.

This is also the path that enables the Next.js end-state described in `NEXT_MIGRATION.md §7`: once the observable machinery is gone, it is straightforward to move data-fetching logic into React hooks backed by TanStack Query or server components.

---

## 6. Step 4 — Migrate `connect()` to Hooks

The 33 `Controllers/` files use `react-redux`'s `connect()` HOC. These can be migrated to `useSelector` / `useDispatch` independently of any slice migrations. The hooks work with both legacy and RTK-modernized state.

### Before (`Controllers/BasketController.tsx`):

```typescript
import { connect } from 'react-redux';
import { RootState } from '../Core/State/Types';

interface MappedProps {
  basketCounts?: Array<{ recordClass: RecordClass; count: number }>;
}

function BasketController({ basketCounts, dispatch }: DispatchProps & MappedProps) {
  useEffect(() => {
    dispatch(requestBasketCounts());
  }, []);
  // ...
}

function mapStateToProps(state: RootState): MappedProps {
  const { counts } = state.basket;
  const { recordClasses } = state.globalData;
  if (counts == null || recordClasses == null) return {};
  const basketCounts = recordClasses
    .map((recordClass) => ({ recordClass, count: counts[recordClass.urlSegment] }))
    .filter(({ count }) => count > 0);
  return { basketCounts };
}

export default connect(mapStateToProps)(wrappable(BasketController));
```

### After:

```typescript
import { useAppSelector, useAppDispatch } from '../Core/storeHooks';

function BasketController() {
  const dispatch = useAppDispatch();
  const basketCounts = useAppSelector((state) => {
    const { counts } = state.basket;
    const { recordClasses } = state.globalData;
    if (counts == null || recordClasses == null) return undefined;
    return recordClasses
      .map((recordClass) => ({ recordClass, count: counts[recordClass.urlSegment] }))
      .filter(({ count }) => count > 0);
  });

  useEffect(() => {
    dispatch(requestBasketCounts());
  }, [dispatch]);
  // ...
}

export default wrappable(BasketController);
```

The `mapStateToProps` function body moves inline into `useAppSelector`. The `MappedProps` and `DispatchProps` interfaces are deleted — types are inferred from the selector return and dispatch type.

**Create pre-typed hooks once** in `Core/storeHooks.ts`:

```typescript
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './Store';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

Export `RootState` and `AppDispatch` from `Core/Store.ts`:

```typescript
// Add at the bottom of Core/Store.ts after createWdkStore
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

Note: since `createWdkStore` is called at runtime, `RootState` must be derived from the actual store instance. This works because TypeScript evaluates `ReturnType` at compile time against the type of the `store` variable.

---

## 7. Step 5 — TypeScript Improvements

### Current pain points

The `makeActionCreator` utility requires explicit union types to be maintained in each action file:

```typescript
// Must be manually updated every time an action is added or removed
export type Action = InferAction<
  | typeof requestUpdateBasket
  | typeof fulfillUpdateBasket
  | typeof cancelRequestUpdateBasket
  // ... 9 more entries
>;
```

`StoreModule` reducers then accept this union:

```typescript
export function reduce(state: State = initialState, action: Action): State {
  switch (action.type) {
    case fulfillBasketCounts.type:
      return { counts: action.payload.counts };  // payload type inferred from union
    default:
      return state;
  }
}
```

### After `createSlice`

Types are fully inferred. No union types, no `InferAction<>`, no manual `type` property:

```typescript
const basketSlice = createSlice({
  name: 'basket',
  initialState: {} as State,
  reducers: {
    fulfillBasketCounts(state, action: PayloadAction<{ counts: Record<string, number> }>) {
      state.counts = action.payload.counts;  // TypeScript knows payload.counts exists
    },
  },
});

// Action creator type is inferred:
// basketSlice.actions.fulfillBasketCounts: ActionCreatorWithPayload<{ counts: Record<string, number> }>
```

### Store-level types

```typescript
// Core/Store.ts
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Core/storeHooks.ts  
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

`useAppSelector` now infers `state` as `RootState` without any annotation:

```typescript
// Before:
const counts = useSelector((state: RootState) => state.basket.counts);

// After:
const counts = useAppSelector((state) => state.basket.counts);  // RootState inferred
```

---

## 8. Service Injection for `createAsyncThunk`

The WDK service, transitioner, and param value store are injected into epics via `EpicDependencies`. When migrating async operations to `createAsyncThunk` (Path B), these dependencies must be available inside the thunk.

RTK provides this via `configureStore`'s `thunk.extraArgument`. Wire it up in `createWdkStore`:

```typescript
// Core/Store.ts
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: { extraArgument: dependencies },  // EpicDependencies injected here
      serializableCheck: false,  // WdkService is not serializable
    }).concat(wdkMiddleware(dependencies), epicMiddleware),
  devTools: { name: 'WDKClient' },
});
```

Define a typed thunk config once, then reuse it in every `createAsyncThunk`:

```typescript
// Core/Store.ts — add after store creation
export type AppThunkConfig = {
  state: RootState;
  dispatch: AppDispatch;
  extra: EpicDependencies;
};
```

Use it in async thunks:

```typescript
import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AppThunkConfig } from '../Core/Store';

export const fetchBasketCounts = createAsyncThunk<
  Record<string, number>,  // fulfilled payload type
  void,                     // argument type (none)
  AppThunkConfig
>(
  'basket/fetchCounts',
  async (_, { extra: { wdkService } }) => {
    return wdkService.getBasketCounts();
  }
);
```

This is the RTK equivalent of the epic pattern where `EpicDependencies` is destructured from the third argument.

---

## 9. Migration Order and Prioritization

No module blocks any other. Migrate in any order; the table below is a suggested sequence from simplest to most complex.

| Module | Complexity | Async ops | Notes |
|---|---|---|---|
| `NotificationStoreModule` | Low | None | Pure reducer, no epics — ideal first slice |
| `RouterStoreModule` | Low | None | Handles router state updates |
| `SiteMapStoreModule` | Low | Single fetch | Simple Path B candidate |
| `UserPasswordChangeStoreModule` | Low | Single fetch | Simple Path B candidate |
| `UserProfileStoreModule` | Medium | 2–3 fetches | Simple request/fulfill chains |
| `BasketStoreModule` | Medium | 5 operations | Good Path B example; `saveBasketToStrategy` is complex (use Path A for that one) |
| `FavoritesListStoreModule` | Medium | 3–4 operations | Simple CRUD via WDK service |
| `ResultTableSummaryViewStoreModule` | Medium-High | Many | Depends on record class state |
| `RecordStoreModule` | High | Multiple parallel | Attribute loading, table loading |
| `QuestionStoreModule` | Very High | Complex orchestration | 34KB; defer until epics are well understood; likely Path A then C |
| `StrategyStoreModule` | Very High | Complex orchestration | 26KB; defer |
| `StrategyWorkspaceStoreModule` | Very High | Complex orchestration | 19KB; defer |

**Rule of thumb:** If a module's `observe` export uses only `mrate`/`srate`/`crate` with single-step request→fulfill patterns, it is a Path B candidate. If it uses `debounceTime`, chained `mergeMap`, or multi-step promise chains within a single epic, treat it as Path A (keep the epic) and defer Path C.

---

## 10. Relationship to the Next.js Migration

RTK migration and the Next.js migration are independent tracks. Neither requires the other. However, they reinforce each other:

**RTK makes Next.js easier:**

- `createSlice` reducers are pure functions with no framework entanglement. They can be used in Next.js `'use client'` components identically to how they are used today.
- `createAsyncThunk` patterns translate directly to React Query — the `queryFn` in a `useQuery` call looks identical to a thunk's async function.
- Once `redux-observable` is removed (Path C), the `wdkService` call sites are plain async functions that can be called from anywhere: thunks, server components, or React Query fetchers.

**The Next.js end-state from `NEXT_MIGRATION.md §7`:**

`NEXT_MIGRATION.md` describes data fetching eventually moving to server components and React Query. That transition is only practical once the RxJS observable machinery is gone — you cannot run an RxJS `BehaviorSubject`-based epic in a Next.js server component. Completing RTK migration (particularly Path C) is the prerequisite.

For the initial Next.js port (`NEXT_MIGRATION.md §3`, SSR strategy: start client-rendered), Redux works as-is inside `'use client'` components. The Redux `<Provider>` moves into the `Providers.tsx` client wrapper described in the Next.js migration document. No RTK migration is required to start the Next.js migration — but completing it will make the eventual "eliminate Redux for data fetching" goal achievable.

**Summary of dependencies:**

```
Next.js initial port (SPA-equivalent)  →  no Redux changes required
RTK migration (Steps 1–4)              →  can happen now, independent of Next.js
Next.js SSR for data pages             →  possible with or without RTK
Eliminate Redux for data fetching      →  requires RTK Path C (no more observables)
```
