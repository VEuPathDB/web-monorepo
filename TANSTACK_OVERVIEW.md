# TanStack as a Full Solution

## What TanStack Covers

**TanStack Router** — a full router, not just a fetching tool:
- File-based or code-based route definitions
- Type-safe route params and search params (this is its headline feature — search params are typed first-class state, not stringly-typed query strings)
- Route **loaders** that fetch data before the route renders (like Remix's loader pattern)
- Nested layouts, pending states, not-found handling
- Would replace React Router v5 in this codebase

**TanStack Query** — server state management:
- Fetching, caching, background refresh, deduplication
- `useQuery` / `useMutation` / `useInfiniteQuery`
- Cancellation via `AbortSignal` — when a query key changes or a component unmounts, it passes a signal to your fetch function and cancels the in-flight request. You opt in by forwarding the signal: `fetch(url, { signal })`
- Dependent queries (run query B only after query A resolves)
- Optimistic updates with rollback on mutation failure

**TanStack Store** — a signals-based reactive store (newer, less mature):
- Framework-agnostic reactive primitive
- Positioned as a lighter Redux replacement for pure client state
- Not yet widely adopted

---

## Where It Doesn't Reach

**Complex async orchestration.** TanStack Query's cancellation model is *passive* — it cancels when a key changes or a consumer unmounts. `redux-observable`'s `switchMap`/`concatMap`/`mergeMap` model is *active* — it lets you express "cancel the previous request when a new action arrives regardless of component lifecycle", or "buffer N actions then process them sequentially", or "race two async operations and take whichever finishes first". For this codebase's `QuestionStoreModule` and `StrategyWorkspaceStoreModule`, that active orchestration carries real domain logic that TanStack Query doesn't model.

**Client-only UI state.** TanStack Query is explicitly scoped to *server state* — data that lives on the server and is cached locally. The Redux state in this codebase that is purely client-side (open/closed panels, active tab, form field values mid-edit, the strategy workspace's undo stack) has no natural home in TanStack Query. You'd still want something — RTK slices, Zustand, Jotai — for that.

---

## The Realistic Picture for This Codebase

A full TanStack migration would look like:

| Current | TanStack replacement | Remaining gap |
|---|---|---|
| React Router v5 | TanStack Router | Route auth middleware (need to port `requiresLogin` logic) |
| Simple epics (`getFulfillBasketCounts`, etc.) | TanStack Query `useQuery` | None — direct replacement |
| `WdkService` calls in epics | `queryFn` in `useQuery` / `mutationFn` in `useMutation` | None |
| Cancellation via `switchMap` | `AbortSignal` forwarded to `wdkService` | Passive only; complex races still need orchestration |
| Complex epics (`QuestionStoreModule`) | Unclear — partial fit | Orchestration logic needs a home |
| Redux client UI state | RTK slices, Zustand, or Jotai | Not covered by TanStack |

The typical recommendation in the React ecosystem right now is: **TanStack Query for server state + something lightweight (Zustand, Jotai, or RTK slices) for client state**, and TanStack Router if you want the type-safe search params story. That combination covers roughly 80–90% of what Redux + redux-observable does in this codebase, with the complex orchestration cases being the remaining hard part.

For this monorepo specifically, TanStack Query + TanStack Router would likely eliminate most of the `StoreModules` entirely — the basket, favorites, user profile, record fetching modules are all essentially "fetch this, cache it, invalidate on mutation." The strategy workspace and question form modules are the ones that would require the most careful thought.
