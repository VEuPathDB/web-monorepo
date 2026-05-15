# Plan: Persist Organism Param Selection to Backend Preferences

## Context

The genomics site's question pages include search forms with organism parameters (rendered by `OrganismParam`). Currently, a user's organism param selection is already saved to **localStorage** (via the `globalParamMapping` mechanism in the existing `QuestionController` wrapper) so it persists across different question pages within a session and device. However, this is lost on new devices or when localStorage is cleared.

The goal is to add **backend preference storage** so the last-selected organism param value is saved server-side on every form submission and restored on every question load, providing cross-device, cross-session persistence.

---

## Existing Infrastructure to Reuse

### What already exists

- **`packages/sites/genomics-site/webapp/wdkCustomization/js/client/component-wrappers/QuestionController.tsx`**: Already wraps `QuestionController`, detects the organism param, and sets `globalParamMapping = { [orgParamName]: 'globalOrgnamismParamValue' }` so the organism value is saved/restored via localStorage across question pages.
- **`updateLastParamValues` + `paramValueStore`** in `QuestionStoreModule.ts:935`: On submit, param values (including the organism param) are saved to localStorage under both the search-specific key and the global key.
- **`fetchInitialParams`** in `QuestionStoreModule.ts:1069`: Priority order is: step params → `initialParamData` → `prepopulateWithLastParamValues`/localStorage → defaults.
- **`wdkService.patchScopedUserPreferences(scope, updates)`** in `UserPreferencesService.ts`: Backend API call to persist project-scoped preferences.
- **`state.globalData.preferences`** (Redux): Preferences are loaded at app startup and stored in Redux (`GlobalData.ts:36`). Access via `useSelector`.
- **`isOrganismParam()`** exported from `OrganismParam.tsx`: Detects whether a parameter is an organism param.

### Existing backend preference key (DO NOT conflict with)

- `ORGANISM_PREFERENCE_KEY = 'organism_preference'` at scope `'project'`: Stores the user's _preferred organisms list_ (for tree filtering). This is separate from the form selection we're saving.

---

## Implementation Plan

### Step 1 — Add a new preference key constant

**File**: `packages/libs/preferred-organisms/src/lib/utils/preferredOrganisms.ts`

Add near the existing `ORGANISM_PREFERENCE_KEY` export:

```typescript
export const ORGANISM_PARAM_PREF_KEY = 'organism_param_pref';
```

This key is used at `ORGANISM_PREFERENCE_SCOPE` (`'project'`) scope. It is intentionally distinct from `ORGANISM_PREFERENCE_KEY` to avoid overwriting the preferred-organisms list.

---

### Step 2 — New store module: save organism param value on submit

**File**: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/storeModules/OrganismParamPreference.ts` _(new file)_

```typescript
import { EMPTY } from 'rxjs';
import { filter, mergeMapTo, tap } from 'rxjs/operators';

import { submitQuestion } from '@veupathdb/wdk-client/lib/Actions/QuestionActions';
import { EpicDependencies } from '@veupathdb/wdk-client/lib/Core/Store';
import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';
import { Action } from '@veupathdb/wdk-client/lib/Actions';
import { ActionsObservable, StateObservable } from 'redux-observable';

import { isOrganismParam } from '@veupathdb/preferred-organisms/lib/components/OrganismParam';
import {
  ORGANISM_PREFERENCE_SCOPE,
  ORGANISM_PARAM_PREF_KEY,
} from '@veupathdb/preferred-organisms/lib/utils/preferredOrganisms';

export const key = 'organismParamPreference';

export function reduce(state = {}) {
  return state;
}

export function observe(
  action$: ActionsObservable<Action>,
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
) {
  return action$.pipe(
    filter(submitQuestion.isOfType),
    tap((action) => {
      const questionState =
        state$.value['question']?.questions[action.payload.searchName];
      if (!questionState) return;

      const organismParam =
        questionState.question.parameters.find(isOrganismParam);
      if (!organismParam) return;

      const value = questionState.paramValues[organismParam.name];
      if (!value) return;

      wdkService.patchScopedUserPreferences(ORGANISM_PREFERENCE_SCOPE, {
        [ORGANISM_PARAM_PREF_KEY]: value,
      });
    }),
    mergeMapTo(EMPTY)
  );
}
```

This epic fires-and-forgets (returns `EMPTY` so it emits no actions), saving the backend preference as a side effect on every submission of a question that contains an organism param.

---

### Step 3 — Register the new store module

**File**: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/wrapStoreModules.js`

Add import and include in the exported object:

```js
import * as organismParamPreference from './storeModules/OrganismParamPreference';

export default flowRight(
  // ...existing...
  (storeModules) => ({
    ...storeModules,
    // ...existing modules...
    organismParamPreference, // ADD THIS
  })
);
```

---

### Step 4 — Restore preference on question load (extend QuestionController wrapper)

**File**: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/component-wrappers/QuestionController.tsx`

Extend the existing wrapper to also read the backend preference and inject it as `initialParamData`:

```typescript
import { useSelector } from 'react-redux';
import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';
import {
  ORGANISM_PREFERENCE_SCOPE,
  ORGANISM_PARAM_PREF_KEY,
} from '@veupathdb/preferred-organisms/lib/utils/preferredOrganisms';

// Inside WrappedQuestionController (after existing question/organismParam logic):

// Read saved organism value from backend preferences (already in Redux at app startup)
const savedOrganismValue = useSelector(
  (state: RootState) =>
    state.globalData?.preferences?.[ORGANISM_PREFERENCE_SCOPE]?.[
      ORGANISM_PARAM_PREF_KEY
    ]
);

// Only inject for new strategy creation — not when editing an existing step
const shouldInject =
  props.submissionMetadata?.type === 'create-strategy' &&
  savedOrganismValue != null &&
  organismParam != null &&
  !props.initialParamData?.[organismParam.name]; // don't override if caller provides a value

const initialParamData = useMemo(() => {
  if (shouldInject) {
    return {
      ...props.initialParamData,
      [organismParam!.name]: savedOrganismValue!,
    };
  }
  return props.initialParamData;
}, [shouldInject, props.initialParamData, organismParam, savedOrganismValue]);

// (existing guard — already present)
if (question == null) return null;

return (
  <WrappedComponent
    {...props}
    globalParamMapping={globalParamMapping}
    initialParamData={initialParamData}
  />
);
```

**Key behavior notes:**

- `initialParamData` has higher priority than `prepopulateWithLastParamValues`/localStorage in `fetchInitialParams`, so the backend preference wins when present.
- When `initialParamData` is non-empty, `loadQuestion` calls `wdkService.getQuestionGivenParameters` to refresh dependent params — correct behavior for restoring an organism selection.
- Preferences are in Redux state by the time the question wrapper renders (loaded at startup by `loadAllStaticData`); the existing `if (question == null) return null` guard ensures the component doesn't mount before the question API call returns.

---

## Data Flow Summary

**On submit:**

1. User submits question form → `submitQuestion` action dispatched
2. `observeQuestionSubmit` epic (WDK core) runs → saves to localStorage via `updateLastParamValues`
3. **NEW** `OrganismParamPreference` epic also runs → saves organism param value to `project['organism_param_pref']` via backend PATCH

**On next question load (any question with an organism param):**

1. User navigates to question page → genomics-site `QuestionController` wrapper renders
2. Wrapper fetches question via `useWdkServiceWithRefresh`; returns `null` until ready
3. **NEW**: `useSelector` reads `state.globalData.preferences.project['organism_param_pref']`
4. Wrapper passes it as `initialParamData = { [orgParamName]: savedValue }`
5. WDK core dispatches `updateActiveQuestion` with this `initialParamData`
6. `loadQuestion` uses the preference value (takes priority over localStorage/defaults)
7. WDK calls `getQuestionGivenParameters` with the saved organisms → dependent params refresh

---

## Critical Files

| File                                                                                                       | Change                                          |
| ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `packages/libs/preferred-organisms/src/lib/utils/preferredOrganisms.ts`                                    | Add `ORGANISM_PARAM_PREF_KEY` export            |
| `packages/sites/genomics-site/webapp/wdkCustomization/js/client/storeModules/OrganismParamPreference.ts`   | **New file**: save-on-submit epic               |
| `packages/sites/genomics-site/webapp/wdkCustomization/js/client/wrapStoreModules.js`                       | Register new store module                       |
| `packages/sites/genomics-site/webapp/wdkCustomization/js/client/component-wrappers/QuestionController.tsx` | Inject backend preference as `initialParamData` |

---

## Verification

1. **TypeScript**: Run `nx run genomics-site:typecheck` and `nx run preferred-organisms:typecheck`.
2. **Save test**: Open a question form with an organism param, select some organisms, submit. Confirm `PATCH /users/current/preferences/project` fires with `{ organism_param_pref: "<value>" }` in the Network tab.
3. **Restore test**: After saving, navigate to a different question page (or a fresh browser session on the same account) that has an organism param. Verify the organisms are pre-populated.
4. **Edit-step guard**: Edit an existing strategy step and verify the organism value comes from the step, not the preference.
5. **No-preference case**: For a fresh account with no saved preference, verify the question loads correctly with default organism selections.
