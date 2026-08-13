# UD Dataset Polling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the User Dataset detail page's manual Refresh button with automatic polling, and make Available Searches appear as soon as a dataset installs.

**Architecture:** A pure backoff/stop-condition module (testable in isolation), wrapped by a `useDatasetPolling` React hook that owns the recursive-`setTimeout` loop, consumed by the existing `DatasetManagement` class component through a thin function wrapper. Separately, an uncached `/record-types` refetch stores UD-specific searches in the user-datasets Redux slice, which `getAttributes` prefers over the cached `globalData.questions`.

**Tech Stack:** TypeScript, React 18 (class + hooks), Redux with a custom `wdkMiddleware` thunk protocol, `jest` + `@testing-library/react` (via `yarn test` from the package directory), `prettier` enforced by lint-staged on commit.

Design spec: `docs/superpowers/specs/2026-08-07-ud-polling-design.md`

## Global Constraints

- Branch: `ud-polling` (already checked out, based on `main` @ `47efc363fa`)
- Backoff is **three flat rates, not a ramp**: 2s for 5 polls, then 5s for 6 polls, then 15s for every poll thereafter. `install: ready-for-reinstall` uses **60s** as its steady-state rate instead of 15s.
- Timer handles are typed `ReturnType<typeof setTimeout>` — **never** `NodeJS.Timeout`. Browser `setTimeout` returns `number`; the `NodeJS` namespace is only ambiently present via hoisting.
- Terminal states are written as **explicit lists**, never as `!== 'running'`. Unrecognized shapes must **keep polling**, never stop.
- Install status checks are **project-scoped** (`installTarget === projectId`).
- Recursive `setTimeout`, never `setInterval` — the next tick is scheduled only after the current one resolves.
- Reference implementation to follow for loop discipline: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/controllers/AiGenePublicationAddController.tsx:201-313`
- Run `npx prettier --write` on touched files before committing, or let the lint-staged hook do it.
- Do **not** dispatch `questionsLoaded` or mutate `globalData`.

---

## File Structure

| File                                                                                        | Responsibility                                                                                                 |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `packages/libs/user-datasets/src/lib/Utils/polling-schedule.ts`                             | **Create.** Pure functions: next interval, and whether a status is terminal. No React, no Redux, no I/O.       |
| `packages/libs/user-datasets/src/lib/Utils/polling-schedule.test.ts`                        | **Create.** Unit tests for the above.                                                                          |
| `packages/libs/user-datasets/src/lib/Hooks/useDatasetPolling.ts`                            | **Create.** The recursive-`setTimeout` loop, visibility handling, cancellation.                                |
| `packages/libs/user-datasets/src/lib/Hooks/useDatasetPolling.test.ts`                       | **Create.** Fake-timer tests for the loop.                                                                     |
| `packages/libs/user-datasets/src/lib/Service/Datasets/getUserDatasetSearches.ts`            | **Create.** Uncached `/record-types` fetch + filter to a dataset type.                                         |
| `packages/libs/user-datasets/src/lib/Actions/UserDatasetsActions.ts`                        | **Modify.** Add `SEARCHES_RECEIVED` action + `loadUserDatasetSearches` thunk.                                  |
| `packages/libs/user-datasets/src/lib/StoreModules/UserDatasetDetailStoreModule.ts`          | **Modify.** Hold `userDatasetSearches` in state.                                                               |
| `packages/libs/user-datasets/src/lib/Components/Management/DatasetManagement.tsx`           | **Modify.** Remove Refresh button + `handleRefresh`; add polling wrapper, indicator, prefer UD-local searches. |
| `packages/libs/user-datasets/src/lib/Components/Management/DatasetManagementController.tsx` | **Modify.** Wire the new action and state through.                                                             |

Tasks 1-3 are independent of 4-6. Task 7 integrates both.

---

### Task 1: Terminal-status predicate

**Files:**

- Create: `packages/libs/user-datasets/src/lib/Utils/polling-schedule.ts`
- Test: `packages/libs/user-datasets/src/lib/Utils/polling-schedule.test.ts`

**Interfaces:**

- Consumes: `DatasetStatusInfo` from `../Service` (already exported from `Service/index.ts`).
- Produces: `getPollingDisposition(status: DatasetStatusInfo | undefined, projectId: string): PollingDisposition` where `type PollingDisposition = 'continue' | 'continue-slow' | 'stop'`. `'continue-slow'` means `ready-for-reinstall`.

- [ ] **Step 1: Write the failing test**

Create `packages/libs/user-datasets/src/lib/Utils/polling-schedule.test.ts`:

```ts
import { DatasetStatusInfo } from '../Service';
import { getPollingDisposition } from './polling-schedule';

const PROJECT = 'PlasmoDB';

function status(overrides: Partial<DatasetStatusInfo>): DatasetStatusInfo {
  return {
    upload: { status: 'success' },
    ...overrides,
  } as DatasetStatusInfo;
}

function install(installStatus: string, target = PROJECT) {
  return [
    {
      installTarget: target,
      meta: { status: 'complete' },
      data: { status: installStatus },
    },
  ] as DatasetStatusInfo['install'];
}

describe('getPollingDisposition', () => {
  it('continues while the upload is running', () => {
    expect(
      getPollingDisposition(status({ upload: { status: 'running' } }), PROJECT)
    ).toBe('continue');
  });

  it.each(['rejected', 'failed'] as const)(
    'stops on terminal upload status %s',
    (s) => {
      expect(
        getPollingDisposition(status({ upload: { status: s } }), PROJECT)
      ).toBe('stop');
    }
  );

  it.each(['queued', 'in-progress'] as const)(
    'continues on non-terminal import status %s',
    (s) => {
      expect(
        getPollingDisposition(status({ import: { status: s } }), PROJECT)
      ).toBe('continue');
    }
  );

  it.each(['invalid', 'failed'] as const)(
    'stops on terminal import status %s',
    (s) => {
      expect(
        getPollingDisposition(status({ import: { status: s } }), PROJECT)
      ).toBe('stop');
    }
  );

  it('continues when import is complete but no install entry exists yet', () => {
    expect(
      getPollingDisposition(
        status({ import: { status: 'complete' }, install: [] }),
        PROJECT
      )
    ).toBe('continue');
  });

  it('continues when the only install entry targets another project', () => {
    expect(
      getPollingDisposition(
        status({
          import: { status: 'complete' },
          install: install('complete', 'ToxoDB'),
        }),
        PROJECT
      )
    ).toBe('continue');
  });

  it('continues while the install is running', () => {
    expect(
      getPollingDisposition(
        status({ import: { status: 'complete' }, install: install('running') }),
        PROJECT
      )
    ).toBe('continue');
  });

  it('stops when the install completes for this project', () => {
    expect(
      getPollingDisposition(
        status({
          import: { status: 'complete' },
          install: install('complete'),
        }),
        PROJECT
      )
    ).toBe('stop');
  });

  it.each([
    'failed-validation',
    'failed-installation',
    'missing-dependency',
  ] as const)('stops on terminal install status %s', (s) => {
    expect(
      getPollingDisposition(
        status({ import: { status: 'complete' }, install: install(s) }),
        PROJECT
      )
    ).toBe('stop');
  });

  it('polls slowly on ready-for-reinstall rather than stopping', () => {
    expect(
      getPollingDisposition(
        status({
          import: { status: 'complete' },
          install: install('ready-for-reinstall'),
        }),
        PROJECT
      )
    ).toBe('continue-slow');
  });

  it('continues on an unrecognized install status rather than stopping', () => {
    expect(
      getPollingDisposition(
        status({
          import: { status: 'complete' },
          install: install('some-future-vdi-status'),
        }),
        PROJECT
      )
    ).toBe('continue');
  });

  it('continues when status is undefined', () => {
    expect(getPollingDisposition(undefined, PROJECT)).toBe('continue');
  });

  it('stops when meta failed even though data is complete', () => {
    expect(
      getPollingDisposition(
        status({
          import: { status: 'complete' },
          install: [
            {
              installTarget: PROJECT,
              meta: { status: 'failed-installation' },
              data: { status: 'complete' },
            },
          ] as DatasetStatusInfo['install'],
        }),
        PROJECT
      )
    ).toBe('stop');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/libs/user-datasets && yarn test --testPathPattern=polling-schedule --watchAll=false`
Expected: FAIL — cannot resolve `./polling-schedule`.

- [ ] **Step 3: Write minimal implementation**

Create `packages/libs/user-datasets/src/lib/Utils/polling-schedule.ts`:

```ts
import { DatasetStatusInfo } from '../Service';

/**
 * What the poller should do next, given a dataset's current status.
 *
 * `continue-slow` is `ready-for-reinstall`: the dataset is waiting on the VDI
 * reconciler's next full run, so there is no point polling at the normal rate.
 */
export type PollingDisposition = 'continue' | 'continue-slow' | 'stop';

// Written as explicit lists rather than `!== 'running'` on purpose. These are
// decoder unions; if VDI adds a value, an unknown status should keep polling
// (visibly wrong, easy to spot) rather than silently stop (looks stuck).
const TERMINAL_UPLOAD = ['rejected', 'failed'];
const TERMINAL_IMPORT = ['invalid', 'failed'];
const TERMINAL_INSTALL = [
  'complete',
  'failed-validation',
  'failed-installation',
  'missing-dependency',
];

export function getPollingDisposition(
  status: DatasetStatusInfo | undefined,
  projectId: string
): PollingDisposition {
  if (status == null) return 'continue';

  const upload = status.upload?.status;
  if (upload != null && TERMINAL_UPLOAD.includes(upload)) return 'stop';
  if (upload !== 'success') return 'continue';

  const importStatus = status.import?.status;
  if (importStatus != null && TERMINAL_IMPORT.includes(importStatus))
    return 'stop';
  if (importStatus !== 'complete') return 'continue';

  const entry = status.install?.find((it) => it.installTarget === projectId);
  if (entry == null) return 'continue';

  // Both sub-entries gate the outcome: a failure in either is terminal, and
  // neither being terminal means the install is still in flight.
  const subStatuses = [entry.meta?.status, entry.data?.status].filter(
    (s): s is string => s != null
  );

  if (subStatuses.some((s) => s !== 'complete' && TERMINAL_INSTALL.includes(s)))
    return 'stop';

  if (subStatuses.some((s) => s === 'ready-for-reinstall'))
    return 'continue-slow';

  if (subStatuses.length > 0 && subStatuses.every((s) => s === 'complete'))
    return 'stop';

  return 'continue';
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/libs/user-datasets && yarn test --testPathPattern=polling-schedule --watchAll=false`
Expected: PASS, all cases.

- [ ] **Step 5: Commit**

```bash
git add packages/libs/user-datasets/src/lib/Utils/polling-schedule.ts packages/libs/user-datasets/src/lib/Utils/polling-schedule.test.ts
git commit -m "Add terminal-status predicate for dataset polling"
```

---

### Task 2: Backoff schedule

**Files:**

- Modify: `packages/libs/user-datasets/src/lib/Utils/polling-schedule.ts`
- Test: `packages/libs/user-datasets/src/lib/Utils/polling-schedule.test.ts`

**Interfaces:**

- Consumes: `PollingDisposition` from Task 1.
- Produces: `getPollingIntervalMs(pollCount: number, disposition: PollingDisposition): number`. `pollCount` is the number of polls **already completed** (0 before the first).

- [ ] **Step 1: Write the failing test**

Append to `polling-schedule.test.ts`:

```ts
import { getPollingIntervalMs } from './polling-schedule';

describe('getPollingIntervalMs', () => {
  it('uses 2s for the first five polls', () => {
    for (const n of [0, 1, 2, 3, 4]) {
      expect(getPollingIntervalMs(n, 'continue')).toBe(2000);
    }
  });

  it('uses 5s for the next six polls', () => {
    for (const n of [5, 6, 7, 8, 9, 10]) {
      expect(getPollingIntervalMs(n, 'continue')).toBe(5000);
    }
  });

  it('settles at 15s thereafter', () => {
    expect(getPollingIntervalMs(11, 'continue')).toBe(15000);
    expect(getPollingIntervalMs(500, 'continue')).toBe(15000);
  });

  it('uses 60s for ready-for-reinstall regardless of tier', () => {
    expect(getPollingIntervalMs(0, 'continue-slow')).toBe(60000);
    expect(getPollingIntervalMs(500, 'continue-slow')).toBe(60000);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/libs/user-datasets && yarn test --testPathPattern=polling-schedule --watchAll=false`
Expected: FAIL — `getPollingIntervalMs` is not exported.

- [ ] **Step 3: Write minimal implementation**

Append to `polling-schedule.ts`:

```ts
/**
 * Three flat rates, not a smooth ramp: fast while the user is most likely
 * watching, then cheap over the long tail of a multi-minute import.
 */
const TIERS = [
  { throughPollCount: 5, intervalMs: 2000 },
  { throughPollCount: 11, intervalMs: 5000 },
];
const STEADY_INTERVAL_MS = 15000;
const REINSTALL_INTERVAL_MS = 60000;

export function getPollingIntervalMs(
  pollCount: number,
  disposition: PollingDisposition
): number {
  if (disposition === 'continue-slow') return REINSTALL_INTERVAL_MS;

  const tier = TIERS.find((t) => pollCount < t.throughPollCount);
  return tier?.intervalMs ?? STEADY_INTERVAL_MS;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/libs/user-datasets && yarn test --testPathPattern=polling-schedule --watchAll=false`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/libs/user-datasets/src/lib/Utils/polling-schedule.ts packages/libs/user-datasets/src/lib/Utils/polling-schedule.test.ts
git commit -m "Add tiered backoff schedule for dataset polling"
```

---

### Task 3: The polling hook

**Files:**

- Create: `packages/libs/user-datasets/src/lib/Hooks/useDatasetPolling.ts`
- Test: `packages/libs/user-datasets/src/lib/Hooks/useDatasetPolling.test.ts`

**Interfaces:**

- Consumes: `getPollingDisposition`, `getPollingIntervalMs`, `PollingDisposition` from Task 1-2.
- Produces:

```ts
interface UseDatasetPollingOptions {
  status: DatasetStatusInfo | undefined;
  projectId: string;
  onPoll: () => Promise<unknown>;
}
function useDatasetPolling(options: UseDatasetPollingOptions): {
  isPolling: boolean;
  isChecking: boolean;
};
```

`isPolling` is true while the loop is live (used to show/hide the indicator). `isChecking` is true only while a request is in flight (used for the per-tick emphasis).

- [ ] **Step 1: Write the failing test**

Create `packages/libs/user-datasets/src/lib/Hooks/useDatasetPolling.test.ts`:

```ts
import { renderHook, act } from '@testing-library/react-hooks';
import { DatasetStatusInfo } from '../Service';
import { useDatasetPolling } from './useDatasetPolling';

const PROJECT = 'PlasmoDB';

const RUNNING = {
  upload: { status: 'success' },
  import: { status: 'in-progress' },
} as DatasetStatusInfo;

const INSTALLED = {
  upload: { status: 'success' },
  import: { status: 'complete' },
  install: [
    {
      installTarget: PROJECT,
      meta: { status: 'complete' },
      data: { status: 'complete' },
    },
  ],
} as DatasetStatusInfo;

describe('useDatasetPolling', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not poll when the status is already terminal', () => {
    const onPoll = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useDatasetPolling({ status: INSTALLED, projectId: PROJECT, onPoll })
    );

    act(() => {
      jest.advanceTimersByTime(60000);
    });

    expect(onPoll).not.toHaveBeenCalled();
    expect(result.current.isPolling).toBe(false);
  });

  it('polls on the 2s tier while non-terminal', async () => {
    const onPoll = jest.fn().mockResolvedValue(undefined);
    renderHook(() =>
      useDatasetPolling({ status: RUNNING, projectId: PROJECT, onPoll })
    );

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
      useDatasetPolling({ status: RUNNING, projectId: PROJECT, onPoll })
    );

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(onPoll).toHaveBeenCalledTimes(1);

    // Time passes, but the first request has not resolved.
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
      useDatasetPolling({ status: RUNNING, projectId: PROJECT, onPoll })
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
      ({ status }) => useDatasetPolling({ status, projectId: PROJECT, onPoll }),
      { initialProps: { status: RUNNING } }
    );

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(onPoll).toHaveBeenCalledTimes(1);

    rerender({ status: INSTALLED });

    await act(async () => {
      jest.advanceTimersByTime(60000);
    });
    expect(onPoll).toHaveBeenCalledTimes(1);
  });

  it('clears its timer on unmount', async () => {
    const onPoll = jest.fn().mockResolvedValue(undefined);
    const { unmount } = renderHook(() =>
      useDatasetPolling({ status: RUNNING, projectId: PROJECT, onPoll })
    );

    unmount();

    await act(async () => {
      jest.advanceTimersByTime(60000);
    });
    expect(onPoll).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/libs/user-datasets && yarn test --testPathPattern=useDatasetPolling --watchAll=false`
Expected: FAIL — cannot resolve `./useDatasetPolling`.

`@testing-library/react-hooks` is already hoisted into the root `node_modules`, so no install step is needed.

- [ ] **Step 3: Write minimal implementation**

Create `packages/libs/user-datasets/src/lib/Hooks/useDatasetPolling.ts`:

```ts
import { useEffect, useRef, useState } from 'react';

import { DatasetStatusInfo } from '../Service';
import {
  getPollingDisposition,
  getPollingIntervalMs,
} from '../Utils/polling-schedule';

interface UseDatasetPollingOptions {
  status: DatasetStatusInfo | undefined;
  projectId: string;
  /** Refreshes the dataset. Rejections are swallowed; the loop retries. */
  onPoll: () => Promise<unknown>;
}

/**
 * Polls for dataset status until it reaches a terminal state.
 *
 * Uses a recursive setTimeout rather than setInterval: the next tick is only
 * scheduled once the current request settles, so requests can never overlap
 * and a slow response cannot stack up a queue of pending polls.
 */
export function useDatasetPolling({
  status,
  projectId,
  onPoll,
}: UseDatasetPollingOptions): { isPolling: boolean; isChecking: boolean } {
  const [isChecking, setIsChecking] = useState(false);

  const disposition = getPollingDisposition(status, projectId);
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

    const schedule = () => {
      timeoutId = setTimeout(
        tick,
        getPollingIntervalMs(pollCount, disposition)
      );
    };

    const tick = async () => {
      if (cancelled) return;
      if (document.hidden) {
        // Nothing to show a hidden tab. Re-check on the same cadence; the
        // visibilitychange listener below fires an immediate poll on return.
        schedule();
        return;
      }

      setIsChecking(true);
      try {
        await onPollRef.current();
      } catch {
        // Transient failure: keep the loop alive and try again next tick.
      }
      if (cancelled) return;
      setIsChecking(false);
      pollCount += 1;
      schedule();
    };

    const onVisibilityChange = () => {
      if (document.hidden || cancelled) return;
      // The user just came back — refresh now and restart the backoff, rather
      // than making them wait out a 15s interval that elapsed off-screen.
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

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/libs/user-datasets && yarn test --testPathPattern=useDatasetPolling --watchAll=false`
Expected: PASS, all six cases.

- [ ] **Step 5: Commit**

```bash
git add packages/libs/user-datasets/src/lib/Hooks/useDatasetPolling.ts packages/libs/user-datasets/src/lib/Hooks/useDatasetPolling.test.ts
git commit -m "Add useDatasetPolling hook with backoff and visibility handling"
```

---

### Task 4: Uncached searches fetch

**Files:**

- Create: `packages/libs/user-datasets/src/lib/Service/Datasets/getUserDatasetSearches.ts`

**Interfaces:**

- Consumes: `WdkService` (`sendRequest`), `questionDecoder` from `@veupathdb/wdk-client/lib/Service/Decoders/RecordClassDecoders`, `Question` from `@veupathdb/wdk-client/lib/Utils/WdkModel`.
- Produces: `getUserDatasetSearches(wdkService: WdkService, userDatasetType: string): Promise<Question[]>`

- [ ] **Step 1: Write the implementation**

There is no unit test for this step: it is a thin wrapper over an HTTP call with no branching logic, and mocking `sendRequest` would only assert that the arguments we just wrote are the arguments we just wrote. It is covered end-to-end in Task 7's manual verification.

Create `packages/libs/user-datasets/src/lib/Service/Datasets/getUserDatasetSearches.ts`:

```ts
import * as Decode from '@veupathdb/wdk-client/lib/Utils/Json';
import { questionDecoder } from '@veupathdb/wdk-client/lib/Service/Decoders/RecordClassDecoders';
import { Question } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { ServiceBase } from '@veupathdb/wdk-client/lib/Service/ServiceBase';

const recordTypeSearchesDecoder = Decode.arrayOf(
  Decode.field('searches', Decode.arrayOf(questionDecoder))
);

/**
 * Fetches the searches available for a user dataset type, deliberately
 * bypassing the record-types cache.
 *
 * `globalData.questions` is loaded once at page load and derived from
 * `getRecordClasses()`, which is memoized *and* backed by a persistent
 * URL-keyed store. A dataset installed during this session therefore has no
 * searches in it, and no dataset-detail refresh can add them. Passing
 * `useCache: false` sends the request straight through `_fetchJson`
 * (see ServiceBase.ts), skipping both layers.
 *
 * Do not "simplify" this to `wdkService.getRecordClasses()` — that is the
 * memoized path this exists to avoid.
 */
export async function getUserDatasetSearches(
  wdkService: ServiceBase,
  userDatasetType: string
): Promise<Question[]> {
  const recordTypes = await wdkService.sendRequest(recordTypeSearchesDecoder, {
    method: 'get',
    path: '/record-types',
    params: { format: 'expanded' },
    useCache: false,
  });

  return recordTypes
    .flatMap((rt) => rt.searches)
    .filter(
      (q) =>
        q.properties != null &&
        'userDatasetType' in q.properties &&
        q.properties.userDatasetType.includes(userDatasetType)
    );
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `npx tsc -p packages/libs/user-datasets/tsconfig.json --noEmit`
Expected: exit 0, no errors.

If `Decode.field` inside `arrayOf` does not typecheck against the response shape, adjust to decode the full record-class objects with `Decode.record({ searches: Decode.arrayOf(questionDecoder) })` — the goal is only to reach `searches`.

- [ ] **Step 3: Commit**

```bash
git add packages/libs/user-datasets/src/lib/Service/Datasets/getUserDatasetSearches.ts
git commit -m "Add uncached record-types fetch for user dataset searches"
```

---

### Task 5: Searches action and reducer

**Files:**

- Modify: `packages/libs/user-datasets/src/lib/Actions/UserDatasetsActions.ts`
- Modify: `packages/libs/user-datasets/src/lib/StoreModules/UserDatasetDetailStoreModule.ts`

**Interfaces:**

- Consumes: `getUserDatasetSearches` from Task 4; `validateVdiCompatibleThunk` from `../Service`.
- Produces:

  - `searchesReceived(searches: Question[]): SearchesReceivedAction` with `SEARCHES_RECEIVED = 'user-datasets/searches-received'`
  - `loadUserDatasetSearches(userDatasetType: string)` — a thunk, wired through `mapDispatchToProps`
  - `State.userDatasetSearches?: Question[]` on the detail store module

- [ ] **Step 1: Add the action creator**

In `UserDatasetsActions.ts`, add near the `METADATA_RECEIVED` block (around line 485), following the shape of the hand-written action creators already in that file:

```ts
//==============================================================================

export const SEARCHES_RECEIVED = 'user-datasets/searches-received';

export interface SearchesReceivedAction {
  type: typeof SEARCHES_RECEIVED;
  payload: {
    searches: Question[];
  };
}

export function searchesReceived(searches: Question[]): SearchesReceivedAction {
  return {
    type: SEARCHES_RECEIVED,
    payload: { searches },
  };
}

/**
 * Loads the searches for a dataset type, bypassing the cached
 * `globalData.questions`. Dispatched when a dataset finishes installing, so
 * its searches can appear without a page reload.
 */
export function loadUserDatasetSearches(userDatasetType: string) {
  return validateVdiCompatibleThunk<SearchesReceivedAction>(({ wdkService }) =>
    getUserDatasetSearches(wdkService, userDatasetType).then(searchesReceived)
  );
}
```

Add to the imports at the top of the file:

```ts
import { Question } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { getUserDatasetSearches } from '../Service/Datasets/getUserDatasetSearches';
```

Add `SearchesReceivedAction` to the exported `Action` union near the top of the file (the union beginning `export type Action =` around line 38).

- [ ] **Step 2: Add the reducer case**

In `UserDatasetDetailStoreModule.ts`:

Add to the imports from `../Actions/UserDatasetsActions`: `SEARCHES_RECEIVED`.
Add `import { Question } from '@veupathdb/wdk-client/lib/Utils/WdkModel';`

Add to `interface State`:

```ts
  /**
   * Searches for this dataset's type, fetched fresh on install. Preferred over
   * the cached globalData.questions, which cannot contain a dataset installed
   * during this session.
   */
  userDatasetSearches?: Question[];
```

Add a case alongside `METADATA_RECEIVED` (around line 174):

```ts
    case SEARCHES_RECEIVED:
      return {
        ...state,
        userDatasetSearches: action.payload.searches,
      };
```

- [ ] **Step 3: Verify it typechecks**

Run: `npx tsc -p packages/libs/user-datasets/tsconfig.json --noEmit`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add packages/libs/user-datasets/src/lib/Actions/UserDatasetsActions.ts packages/libs/user-datasets/src/lib/StoreModules/UserDatasetDetailStoreModule.ts
git commit -m "Add action and reducer for freshly fetched dataset searches"
```

---

### Task 6: Wire searches through the controller

**Files:**

- Modify: `packages/libs/user-datasets/src/lib/Components/Management/DatasetManagementController.tsx`
- Modify: `packages/libs/user-datasets/src/lib/Components/Management/DatasetManagement.tsx`

**Interfaces:**

- Consumes: `loadUserDatasetSearches` (Task 5), `State.userDatasetSearches` (Task 5).
- Produces: two new props on `DatasetManagementProps` —
  `loadUserDatasetSearches: typeof loadUserDatasetSearches` and
  `userDatasetSearches?: Question[]`.

- [ ] **Step 1: Add to the controller's ActionCreators**

In `DatasetManagementController.tsx`, add `loadUserDatasetSearches` to the `ActionCreators` object (around line 45) and to its import from `../../Actions/UserDatasetsActions`.

- [ ] **Step 2: Pass both through to the view**

In `renderView()`, destructure `loadUserDatasetSearches` from `this.props.dispatchProps` and `userDatasetSearches` from `this.props.stateProps`, then add both to the `props: DatasetManagementProps` object literal.

- [ ] **Step 3: Declare the props**

In `DatasetManagement.tsx`, add to `interface DatasetManagementProps`:

```ts
  loadUserDatasetSearches: typeof loadUserDatasetSearches;
  userDatasetSearches?: Question[];
```

with `import { loadUserDatasetSearches } from '../../Actions/UserDatasetsActions';` added to the existing import from that module.

- [ ] **Step 4: Prefer the fresh searches in getAttributes**

In `getAttributes()`, replace the `questions` derivation. The current code is:

```ts
const questions = Object.values(questionMap).filter(
  (q) =>
    q.properties !== undefined &&
    'userDatasetType' in q.properties &&
    q.properties.userDatasetType.includes(userDataset.type.name)
);
```

Replace with:

```ts
// Prefer searches fetched after this dataset installed. questionMap comes
// from globalData, which is loaded once per page and so cannot contain a
// dataset installed during this session.
const questions =
  this.props.userDatasetSearches ??
  Object.values(questionMap).filter(
    (q) =>
      q.properties !== undefined &&
      'userDatasetType' in q.properties &&
      q.properties.userDatasetType.includes(userDataset.type.name)
  );
```

- [ ] **Step 5: Verify it typechecks**

Run: `npx tsc -p packages/libs/user-datasets/tsconfig.json --noEmit`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add packages/libs/user-datasets/src/lib/Components/Management/DatasetManagementController.tsx packages/libs/user-datasets/src/lib/Components/Management/DatasetManagement.tsx
git commit -m "Prefer freshly fetched searches over cached globalData questions"
```

---

### Task 7: Replace the button with polling

**Files:**

- Modify: `packages/libs/user-datasets/src/lib/Components/Management/DatasetManagement.tsx`
- Modify: `packages/libs/user-datasets/src/lib/Components/Management/DatasetManagement.scss:15` (the `.status-blink` rule)

**Interfaces:**

- Consumes: `useDatasetPolling` (Task 3), `loadUserDatasetSearches` (Task 5), the props from Task 6.
- Produces: no new exports. `DatasetManagement` renders a polling indicator in place of the Refresh button.

- [ ] **Step 1: Add the hook wrapper**

`DatasetManagement` is a class component, so it cannot call hooks directly. Add a small function component above the class in `DatasetManagement.tsx`:

```ts
interface DatasetPollingIndicatorProps {
  status: DatasetStatusInfo | undefined;
  projectId: string;
  datasetId: string;
  userDatasetType: string;
  isInstalled: boolean;
  loadUserDatasetDetailWithoutLoadingIndicator: (id: string) => unknown;
  loadUserDatasetSearches: (type: string) => unknown;
}

/**
 * Bridges the polling hook into the surrounding class component, and refetches
 * this dataset type's searches when the install completes — globalData's cached
 * question list cannot contain a dataset installed during this session.
 */
function DatasetPollingIndicator({
  status,
  projectId,
  datasetId,
  userDatasetType,
  isInstalled,
  loadUserDatasetDetailWithoutLoadingIndicator,
  loadUserDatasetSearches,
}: DatasetPollingIndicatorProps) {
  const { isPolling, isChecking } = useDatasetPolling({
    status,
    projectId,
    onPoll: async () => {
      loadUserDatasetDetailWithoutLoadingIndicator(datasetId);
    },
  });

  const wasInstalled = useRef(isInstalled);
  useEffect(() => {
    if (isInstalled && !wasInstalled.current) {
      loadUserDatasetSearches(userDatasetType);
    }
    wasInstalled.current = isInstalled;
  }, [isInstalled, userDatasetType, loadUserDatasetSearches]);

  if (!isPolling) return null;

  return (
    <span
      className="UserDatasetPollingIndicator"
      role="status"
      aria-live="polite"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5ch',
        opacity: isChecking ? 1 : 0.6,
        transition: 'opacity 0.3s',
      }}
    >
      <Icon fa="refresh" /> Checking for updates
    </span>
  );
}
```

Add the imports it needs at the top of the file: `useEffect`, `useRef` from `react`; `useDatasetPolling` from `../../Hooks/useDatasetPolling`; `DatasetStatusInfo` from `../../Service`.

- [ ] **Step 2: Swap the button for the indicator**

In `getAttributes()`, replace the whole `{!isInstalled && (<button className="btn btn-info" onClick={this.handleRefresh} …>)}` block rendered next to `UserDatasetStatus` (around line 360) with:

```tsx
<DatasetPollingIndicator
  status={userDataset.status}
  projectId={this.props.config.projectId}
  datasetId={userDataset.datasetId}
  userDatasetType={userDataset.type.name}
  isInstalled={isInstalled}
  loadUserDatasetDetailWithoutLoadingIndicator={
    this.props.loadUserDatasetDetailWithoutLoadingIndicator
  }
  loadUserDatasetSearches={this.props.loadUserDatasetSearches}
/>
```

Also remove the `status-blink` class from the `<span>` wrapping `UserDatasetStatus`, leaving a plain `<span>`.

- [ ] **Step 3: Delete the dead refresh machinery**

From `DatasetManagement.tsx`, remove:

- the `handleRefresh` method in full
- `this.handleRefresh = this.handleRefresh.bind(this);` from the constructor
- `refreshing` and `statusUnchanged` from `interface DatasetManagementState` and from the constructor's `this.state` initializer
- the `statusUnchangedTimer` field, and `componentWillUnmount` if it now has an empty body
- `Refresh` from the `import { Public, Refresh } from '@material-ui/icons';` line (line 3) — keep `Public`, which is still used

Then remove the `.status-blink` rule at `DatasetManagement.scss:15`.

- [ ] **Step 4: Verify it typechecks and nothing dead remains**

Run: `npx tsc -p packages/libs/user-datasets/tsconfig.json --noEmit`
Expected: exit 0.

Run: `grep -rn "handleRefresh\|statusUnchanged\|status-blink\|refreshing" packages/libs/user-datasets/src`
Expected: no matches.

- [ ] **Step 5: Run the full package test suite**

Run: `cd packages/libs/user-datasets && yarn test --watchAll=false`
Expected: PASS — the Task 1-3 suites plus the pre-existing `rnaseq-rc-data-files` suite.

- [ ] **Step 6: Commit**

```bash
git add packages/libs/user-datasets/src
git commit -m "Replace the Refresh button with automatic status polling"
```

---

### Task 8: End-to-end verification against a real import

**Files:** none — this task is manual verification. Do not mark it complete on the basis of code inspection.

- [ ] **Step 1: Start the site**

Run: `yarn nx start @veupathdb/genomics-site`
Wait for the initial webpack build (slow — several minutes).

- [ ] **Step 2: Upload a dataset and watch it install**

Upload a small dataset and open its detail page. Confirm:

- the status advances through its phases **with no interaction**
- "Checking for updates" is visible throughout, emphasised on each tick
- there is no Refresh button anywhere on the page

- [ ] **Step 3: Confirm the reported bug is fixed**

At the moment the status reaches installed, confirm **Available searches appears without a page reload**. This is the originally reported bug and the reason for this work.

- [ ] **Step 4: Confirm the backoff and the stop**

DevTools → Network, filtered to the dataset detail requests. Confirm the gaps go 2s ×5 → 5s ×6 → 15s, and that **requests stop entirely** once the status is installed.

- [ ] **Step 5: Confirm the visibility pause**

Mid-import, switch to another tab for ~30s, then return. Confirm no requests fire while hidden, one fires immediately on return, and the interval restarts at 2s.

- [ ] **Step 6: Confirm failure handling**

Upload a deliberately invalid dataset. Confirm polling stops on the error status and the error message renders.

- [ ] **Step 7: Commit any fixes**

If any step failed, fix and commit. If all passed, there is nothing to commit — record the results in the PR description instead.

---

## Notes for the implementer

**`status.install` sub-entries.** `meta` is required, `data` optional (`datasetInstallStatusMap` in `Service/Model/response-decoders.ts`). Task 1's predicate treats a failure in either as terminal and requires both present-and-complete to stop for success — matching the existing `isInstalled()` at `DatasetManagement.tsx:294`, which is the behaviour the UI already assumes.

**Why `getPollingDisposition` rather than reusing `isInstalled()`.** `isInstalled()` answers only "is this installed for this project", not "should we keep polling". The two differ on every failure state and on `ready-for-reinstall`. They must agree on success, though — if you change one, check the other.

**`ready-for-reinstall` is not terminal.** Its user-facing message promises "will be reinstalled within {interval}. Please check again soon." Stopping there leaves the page promising an update it has given up on. The stale comment at `UserDatasetStatus.tsx:46` calling it an error contradicts the message that same file renders at line 236; trust the message.

**No give-up cap is deliberate**, and is only safe because of the visibility pause. If the visibility handling is ever removed, revisit the cap — otherwise a forgotten background tab polls forever.
