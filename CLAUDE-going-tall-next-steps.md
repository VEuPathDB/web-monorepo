# Going Tall: Next Steps for Gene Expression Analysis

## Status Update (2026-02-13): Stale State Fix & UI Tidy

### ✅ Fixed: stale state on rapid dropdown interaction (`EdaNotebookParameter.tsx`)

### ✅ Fixed: `"Loading"` placeholder → `<Loading />` spinner (`ComputeNotebookCell.tsx`)

### ✅ UI: Input Data section labelling tidied (`differentialExpression.tsx`)

- Section heading: "Axis variables" → "Expression Data"
- Variable label: "Expression Data" → "Count type"

---

## Status Update (2026-02-12): WDK Parameter Persistence

### ✅ Completed: Persist EDA analysis state to `eda_analysis_spec`

`EdaNotebookParameter` now persists analysis state to the WDK `eda_analysis_spec` parameter, following the same `useMemo` + `useSetterWithCallback` + `useAnalysisState` pattern used by `EdaSubsetParameter` in production.

**Changes made:**

1. **`EdaNotebookParameter.tsx`** — Rewrote to read `studyId`, `notebookType`, and analysis state from WDK `paramValues` (`eda_dataset_id`, `eda_notebook_type`, `eda_analysis_spec`). Removed hardcoded `queryNotebookList` lookup, `value` prop, and all commented-out persistence code. Added `useSetterWithCallback`-based persistence.

2. **`EdaNotebookQuestionForm.tsx`** — Removed `value={'test'}` prop, dev console.logs, and added safe `!` for `queryName` (guaranteed by plugin routing).

3. **`WdkState` interface** (`EdaNotebookAnalysis.tsx`) — Made all fields required (they're always provided). Updated `NotebookRoute.tsx` (dev route) with dummy values and TODO.

4. **`WdkParamNotebookCell.tsx`** — Added early `return null` guard for nullish `wdkState`, removed unnecessary `?.` operators.

5. **`ComputeNotebookCell.tsx`** — Rewrote `changeConfigHandler` to do all work inside the `setComputations` functional update (avoids stale closure), wrapped in `useCallback`.

6. **`NotebookPresets.tsx`** — Fixed volcano plot threshold display: find DE computation by `descriptor.type` instead of hardcoded `computations[1]` index (broken since PCA was commented out).

### ✅ Fixed: Rapid interaction causes stale state

**Was:** If the user selected a "Reference Group" value and quickly moved to "Comparison Group", the second selection didn't stick.

**Root cause:** The `useMemo` + `useSetterWithCallback` pattern stored state in a `useRef` (no re-render). Child components read render-time props, so the second dropdown handler saw stale `groupA` and overwrote it.

**Fix applied (2026-02-13):** Replaced `useMemo` + `useSetterWithCallback` in `EdaNotebookParameter.tsx` with `useState` for immediate local re-renders, plus a `useEffect` for WDK persistence. `updateParamValue` and `parameters` are held in refs inside the effect to avoid a potential feedback loop from Redux re-renders producing a new `updateParamValue` reference.

---

## Status Update (2026-02-06)

### ✅ Completed: Differential Expression Tall Format Migration

Successfully migrated differential expression plugin from collection-based (wide format, 20,000+ gene columns) to variable-pair-based (tall format with 2 variables).

### 💡 Major Insight: Entity-First Selection

**Key realization:** Since variable IDs are unique within an entity, and we know exactly which variables we need (no user choice), the UX should focus on **entity selection** with automatic variable derivation.

**Instead of:**

- User picks gene identifier variable dropdown ❌
- User picks expression data variable dropdown ❌

**Do this:**

- User picks entity (e.g., "Sense Counts" vs "Antisense Counts") ✅
- Variables auto-selected based on stable IDs (`VEUPATHDB_GENE_ID`, `SEQUENCE_READ_COUNT`) ✅

This dramatically simplifies the UX and aligns perfectly with notebook cell architecture.

**Frontend changes:**

- Extended `DataElementConstraint` type with `allowedVariableIds` field
- Updated constraint predicate to filter variables by stable IDs
- Added `GENE_EXPRESSION_STABLE_IDS` constants
- Replaced `collectionVariable` with `identifierVariable` + `valueVariable`
- Implemented constraint-based variable selection using `InputVariables` component
- Updated `isEnabledInPicker` to check for required gene expression variables

**Files modified:**

1. `packages/libs/eda/src/lib/core/types/visualization.ts`
2. `packages/libs/eda/src/lib/core/utils/data-element-constraints.ts`
3. `packages/libs/eda/src/lib/core/components/computations/Utils.ts`
4. `packages/libs/eda/src/lib/core/components/computations/plugins/differentialExpression.tsx`

**Current state:**

- ✅ Frontend compiles and runs
- ✅ Variable selection UI works correctly with stable ID filtering
- ✅ Entity compatibility enforcement working
- ✅ Backend accepts new configuration format (identifierVariable + valueVariable)
- ✅️ Backend R process has some errors (being fixed separately)
- ✅️ PCA dimensionality reduction temporarily disabled in notebook

### Backend Configuration Format

For reference, the new configuration format accepted by the backend:

```json
{
  "identifierVariable": {
    "entityId": "...",
    "variableId": "VEUPATHDB_GENE_ID"
  },
  "valueVariable": {
    "entityId": "...",
    "variableId": "SEQUENCE_READ_COUNT"  // or NORMALIZED_EXPRESSION
  },
  "comparator": { ... },
  "differentialExpressionMethod": "DESeq",
  "pValueFloor": "1e-200"
}
```

---

## 🔄 Frontend: PCA Dimensionality Reduction Migration

### Current State

PCA is temporarily disabled (commented out in `NotebookPresets.tsx`) because it still uses collections:

```typescript
// TEMPORARILY DISABLED: PCA dimensionality reduction pending tall format migration
// {
//   type: 'compute',
//   title: 'PCA',
//   computationName: 'dimensionalityreduction',
//   computationId: 'pca_1',
//   ...
// }
```

### Migration Requirements

**PCA uses the same gene expression variables as differential expression:**

- ✅ Same stable IDs: `VEUPATHDB_GENE_ID`, `SEQUENCE_READ_COUNT`, `NORMALIZED_EXPRESSION`
- ✅ Same pattern: `identifierVariable` + `valueVariable`
- ✅ Same constraint system can be reused

**Implementation approach:**
Follow the same pattern as differential expression:

1. Update `DimensionalityReductionConfig` codec (replace `collectionVariable`)
2. Add constraints with `allowedVariableIds`
3. Replace `VariableCollectionSingleSelect` with `InputVariables`
4. Update description component
5. Update `isEnabledInPicker`

**File to modify:**

- `packages/libs/eda/src/lib/core/components/computations/plugins/dimensionalityReduction.tsx`

**Estimated effort:** 2-3 hours (similar to differential expression, but simpler - no comparator logic)

---

## 🎨 Major UX Simplification: Entity-First Selection

### Key Insight

**Important background:** Within a given entity, all variable IDs are unique.

Since, at least for DESeq, we know _exactly_ which variable IDs we need:

- `VEUPATHDB_GENE_ID` (identifier)
- `SEQUENCE_READ_COUNT` (value)

...and there's **no user choice** to make about which variables to use, the UX should be dramatically simplified:

### Simplified Approach

**Current (over-engineered) UX:**

```
┌─────────────────────────────────┐
│ Gene Identifier: [Dropdown]     │  ← User picks from filtered variables
│ Expression Data: [Dropdown]     │  ← User picks from filtered variables
└─────────────────────────────────┘
```

**Better (entity-first) UX:**

```
┌─────────────────────────────────┐
│ Entity: [Dropdown]              │  ← User picks entity only
│   • Sense Counts                │
│   • Antisense Counts            │
└─────────────────────────────────┘

Variables automatically selected:
- VEUPATHDB_GENE_ID (from chosen entity)
- SEQUENCE_READ_COUNT (from chosen entity)
```

### Implementation Strategy

1. **Filter entities** to only those containing ALL required variables:

   ```typescript
   const eligibleEntities = entities.filter(
     (entity) =>
       entity.variables.some((v) => v.id === 'VEUPATHDB_GENE_ID') &&
       entity.variables.some((v) => v.id === 'SEQUENCE_READ_COUNT')
   );
   ```

2. **Show entity selector** (simple dropdown or radio buttons):

   - Only show eligible entities
   - If only one eligible entity → auto-select it
   - If multiple → user chooses (e.g., Sense vs Antisense counts)

3. **Auto-select variables** based on entity choice:

   ```typescript
   useEffect(() => {
     if (!selectedEntityId) return;

     const entity = entities.find((e) => e.id === selectedEntityId);
     if (!entity) return;

     // Auto-select variables by stable ID
     const idVar = entity.variables.find((v) => v.id === 'VEUPATHDB_GENE_ID');
     const countVar = entity.variables.find(
       (v) => v.id === 'SEQUENCE_READ_COUNT'
     );

     changeConfigHandler('identifierVariable', {
       entityId: entity.id,
       variableId: idVar.id,
     });
     changeConfigHandler('valueVariable', {
       entityId: entity.id,
       variableId: countVar.id,
     });
   }, [selectedEntityId]);
   ```

4. **Hide InputVariables UI** - Don't show the variable selection dropdowns at all

### When to Use Full InputVariables UI

The `InputVariables` component and constraint system we built are still valuable! Use them when:

- **User has a choice** between multiple compatible variables
- **Future plugins** need to let users pick from multiple normalized variables
- **Optional variables** where user selects from a set of options

For **differential expression and PCA**: No choice needed, so use entity-first selection.

### Benefits

✅ **Simpler UX** - One dropdown instead of two
✅ **Clearer intent** - User understands they're choosing the data source (entity)
✅ **No confusion** - Variables are deterministic, not user-selectable
✅ **Aligns with notebook architecture** - Entity becomes the shared configuration
✅ **Less code** - No need for InputVariables in these specific plugins

### Updated Implementation Plan

**For differential expression plugin:**

1. Add entity selector UI component
2. Filter to entities with required gene expression variables
3. Auto-select variables when entity is chosen
4. Remove InputVariables component (keep the constraint infrastructure for future use)
5. Store `selectedEntityId` in configuration (in addition to the variables)

**Shared code:**

```typescript
// packages/libs/eda/src/lib/core/hooks/geneExpression.ts
export function useGeneExpressionEntitySelection() {
  const entities = useStudyEntities();

  // Filter to entities with all required gene expression variables
  const eligibleEntities = useMemo(
    () =>
      entities.filter(
        (entity) =>
          entity.variables.some(
            (v) => v.id === GENE_EXPRESSION_STABLE_IDS.IDENTIFIER
          ) &&
          entity.variables.some(
            (v) => v.id === GENE_EXPRESSION_STABLE_IDS.COUNT
          )
      ),
    [entities]
  );

  return { eligibleEntities };
}

export function autoSelectGeneExpressionVariables(
  entity: StudyEntity,
  changeConfigHandler: (key: string, value: VariableDescriptor) => void
) {
  const idVar = entity.variables.find(
    (v) => v.id === GENE_EXPRESSION_STABLE_IDS.IDENTIFIER
  );
  const valueVar = entity.variables.find(
    (v) => v.id === GENE_EXPRESSION_STABLE_IDS.COUNT
  );

  if (idVar && valueVar) {
    changeConfigHandler('identifierVariable', {
      entityId: entity.id,
      variableId: idVar.id,
    });
    changeConfigHandler('valueVariable', {
      entityId: entity.id,
      variableId: valueVar.id,
    });
  }
}
```

---

## 🔗 Notebook Cell Communication & Dependencies

### Current Architecture Limitation

**Problem:**

- PCA and DESeq are separate computation cells in the notebook
- Each has its own configuration UI
- No way to share entity/variable selection between them
- Results in duplicate configuration and potential inconsistency

### Ideal User Experience

**Workflow (simplified with entity-first approach):**

1. **Step 1:** Select samples (optional filtering)
2. **Step 2:** Choose entity (NEW cell type)
   - If only one entity with required variables → auto-select and show confirmation
   - If multiple entities → user chooses (sense vs antisense counts)
   - Variables automatically selected based on stable IDs (no user input needed)
3. **Step 3:** PCA visualization
   - Inherits entity from Step 2
   - Variables auto-selected from that entity
   - Computes automatically (if desired)
4. **Step 4:** Configure DESeq2
   - Inherits entity from Step 2
   - Variables auto-selected from that entity
   - User only needs to configure comparator (sample groups)
5. **Step 5:** Volcano plot, results, etc.

**Key simplification:** Step 2 is just entity selection, not variable selection!

### Proposed Architecture Changes

**Note:** the implementation ideas below are very embryonic.

#### A. New Notebook Cell Type: "Entity Selection"

```typescript
// NotebookPresets.tsx
{
  type: 'shared-config',  // NEW cell type
  title: 'Select Gene Expression Data Source',
  helperText: (
    <NumberedHeader
      number={2}
      text='Choose the entity containing gene expression data (e.g., Sense Counts, Antisense Counts). Variables will be selected automatically.'
      color={colors.grey[800]}
    />
  ),
  // Where the UI components are defined remains TBD!
  // Ideally it would be general enough to "code" here in NotebookPresets.tsx

  // Stores entity selection in shared notebook state
  // Variables are derived automatically from entity
  sharedConfigKey: 'geneExpressionEntity',
}
```

**Benefits:**

- Single source of truth for entity selection
- Variables derived automatically (no user choice needed)
- Reused by both PCA and DESeq
- Clear, simple user workflow
- Natural mental model (choose data source, not individual variables)

#### B. Inter-Cell Data Dependencies

**New mechanism needed:**

```typescript
export interface ComputeCellDescriptor
  extends NotebookCellDescriptorBase<'compute'> {
  computationName: string;
  computationId: string;
  hidden?: boolean;

  // NEW: Specify dependencies on shared notebook state
  sharedConfigDependencies?: string[]; // e.g., ['geneExpressionVariables']

  // NEW: Auto-start when dependencies are satisfied
  autoStartWhenReady?: boolean;
}
```

**Usage:**

```typescript
{
  type: 'compute',
  title: 'PCA',
  computationName: 'dimensionalityreduction',
  computationId: 'pca_1',
  sharedConfigDependencies: ['geneExpressionEntity'],
  autoStartWhenReady: true,  // PCA can auto-start
  hidden: true,  // Hide config UI since it derives variables from entity
}

{
  type: 'compute',
  title: 'Setup DESeq2',
  computationName: 'differentialexpression',
  computationId: 'de_1',
  sharedConfigDependencies: ['geneExpressionEntity'],
  autoStartWhenReady: false,  // DESeq needs comparator config
  // Show UI for comparator only
  // Entity shown as read-only/inherited
  // Variables derived automatically
}
```

#### C. Shared Notebook State

**New state management needed:**

```typescript
// Extend AnalysisState or create NotebookSharedState
interface NotebookSharedState {
  geneExpressionEntity?: {
    entityId: string;
    // Variables derived automatically:
    // - identifierVariable: VEUPATHDB_GENE_ID from this entity
    // - valueVariable: SEQUENCE_READ_COUNT or NORMALIZED_EXPRESSION from this entity
  };
  // Future: other shared configurations...
}
```

**Variables derived on-demand:**
When a computation needs variables, it derives them from the shared entity:

```typescript
function deriveGeneExpressionVariables(
  entityId: string,
  entities: StudyEntity[]
): {
  identifierVariable: VariableDescriptor;
  valueVariable: VariableDescriptor;
} {
  const entity = entities.find((e) => e.id === entityId);
  const idVar = entity.variables.find((v) => v.id === 'VEUPATHDB_GENE_ID');
  const valueVar = entity.variables.find(
    (v) => v.id === 'SEQUENCE_READ_COUNT' || v.id === 'NORMALIZED_EXPRESSION'
  );

  return {
    identifierVariable: { entityId, variableId: idVar.id },
    valueVariable: { entityId, variableId: valueVar.id },
  };
}
```

### Implementation Phases

**Phase 1: Basic inter-cell communication** (Medium effort)

- Add shared state mechanism to notebook infrastructure
- Create gene expression config cell type
- Make PCA and DESeq read from shared state

**Phase 2: Auto-start behavior** (Medium effort)

- Implement dependency checking
- Add auto-start flag support
- Handle computation lifecycle properly

**Phase 3: Enhanced UX** (Low effort)

- Show inherited values in read-only mode
- Add "Change data source" button to reconfigure
- Visual indicators for cell dependencies

### Files to Modify

1. **`packages/libs/eda/src/lib/notebook/NotebookPresets.tsx`**

   - Add gene expression config cell
   - Update PCA and DESeq cells with dependencies

2. **`packages/libs/eda/src/lib/notebook/EdaNotebookAnalysis.tsx`** (or similar)

   - Extend state management for shared configs
   - Handle dependency resolution

3. **New file: `packages/libs/eda/src/lib/notebook/cells/GeneExpressionEntityCell.tsx`**

   - Render entity selection UI (simple dropdown)
   - Filter to entities with required gene expression variables
   - Store entity selection in shared state

4. **New file: `packages/libs/eda/src/lib/core/hooks/geneExpression.ts`**

   - `useGeneExpressionEntitySelection()` - filters eligible entities
   - `autoSelectGeneExpressionVariables()` - derives variables from entity
   - Shared logic for both DE and PCA plugins

5. **`packages/libs/eda/src/lib/core/components/computations/plugins/dimensionalityReduction.tsx`**

   - Replace InputVariables with simple entity selector
   - Auto-derive variables from selected entity
   - Read from shared state when in notebook

6. **`packages/libs/eda/src/lib/core/components/computations/plugins/differentialExpression.tsx`**
   - Replace InputVariables with simple entity selector
   - Auto-derive variables from selected entity
   - Read from shared state when in notebook
   - Show entity as read-only when inherited

### Alternative: Simpler Approach (If Full Re-architecture is Too Much)

**Quick win option:**

- Keep current architecture
- Add auto-selection to both plugins separately
- Accept some code duplication for now
- Revisit notebook architecture in future major refactor

**Pros:** Faster to implement, lower risk
**Cons:** Duplicate logic, potential for inconsistency, less optimal UX

---

**Note:** Bob has not read the remainder of the document yet...

## 📋 Migration Checklist

### Backend (Mostly Complete ✅)

- [x] Update differential expression API to accept `identifierVariable` + `valueVariable`
- [x] Query and transform tall format data for DESeq2
- [ ] Fix R process errors (in progress, separate from this doc)

### Frontend: PCA Migration (Priority 1)

- [ ] Update `DimensionalityReductionConfig` to use tall format
- [ ] Reuse `GENE_EXPRESSION_STABLE_IDS` constants
- [ ] Replace collection selection with `InputVariables`
- [ ] Update backend API calls for PCA (backend should already support this)
- [ ] Re-enable PCA in `NotebookPresets.tsx`

### Frontend: Entity-First Selection (Priority 2)

- [ ] Create `useGeneExpressionEntitySelection()` hook
- [ ] Implement entity selector UI component
- [ ] Replace InputVariables in DE plugin with entity selector
- [ ] Auto-derive variables from selected entity
- [ ] Verify behavior with multi-entity datasets (sense/antisense)
- [ ] Apply same pattern to PCA plugin
- [ ] Test with various dataset configurations
- [ ] Keep InputVariables infrastructure for future plugins that need it

### Frontend: Notebook Architecture (Priority 4 - Future)

- [ ] Design shared state mechanism
- [ ] Implement gene expression config cell type
- [ ] Add inter-cell dependency support
- [ ] Update PCA to inherit configuration
- [ ] Update DESeq to inherit configuration
- [ ] Implement auto-start behavior for PCA
- [ ] Add UI indicators for inherited configurations

### Polish (Priority 5)

- [ ] Improve InputVariables styling ("looks a bit ugly")
- [ ] Add tooltips/help text for gene expression variables
- [ ] Test performance with large datasets
- [ ] Update documentation

---

## 🎓 Lessons Learned

### What Went Well

1. **Constraint system extension** - Adding `allowedVariableIds` was clean and reusable
2. **InputVariables infrastructure** - Entity filtering works great, component available for future use
3. **Declarative approach** - Constraints are more maintainable than imperative filtering
4. **Type safety** - io-ts codecs caught issues early
5. **Variable ID uniqueness insight** - Led to major UX simplification (entity-first selection)

### Challenges

1. **Initial over-engineering** - Built full variable selection UI when entity selection would suffice
2. **Notebook architecture** - Cell isolation makes sharing configuration difficult
3. **Mental model** - Took time to realize entity selection is more natural than variable selection

### Future Improvements

1. **Entity-first by default** - When variables are deterministic, let user choose entity only
2. **InputVariables for choice** - Reserve for plugins where user actually has variable choices
3. **Shared computation logic** - Extract common patterns for gene expression plugins
4. **Notebook state management** - Better architecture for cell communication

### Important Note on InputVariables Work

The InputVariables + constraint work is **NOT wasted**! Keep it for:

- Future plugins with multiple normalized variable options
- Cases where users need to choose between compatible variables
- Any scenario where variable selection involves actual user choice
- Reusable infrastructure for complex variable selection scenarios

For DE and PCA specifically: Use entity-first selection since variables are deterministic.

---

## 📞 Coordination Points

**Between frontend and backend (same person!):**

- Backend API changes must match frontend configuration format exactly
- Test both `SEQUENCE_READ_COUNT` and `NORMALIZED_EXPRESSION` paths
- Verify entity filtering works correctly in both layers

**With colleagues:**

- Confirm multi-entity scenarios (sense vs antisense counts)
- Validate UX approach for entity selection
- Get feedback on auto-selection behavior

**Documentation:**

- Update user-facing docs when both frontend and backend are complete
- Add developer notes about tall format architecture
- Document stable variable IDs and their purpose

---

## 🚀 Recommended Sequence

1. **Backend: Fix R Process Errors** (In progress)

   - Complete differential expression backend work
   - Not blocking other frontend tasks

2. **Frontend: Refactor to Entity-First Selection** (Recommended next)

   - Simplify differential expression to use entity selector
   - Create shared hook `useGeneExpressionEntitySelection()`
   - Auto-derive variables from selected entity
   - Remove InputVariables UI (keep infrastructure for future)
   - Estimated: ~3-4 hours

3. **Frontend: PCA Migration** (After entity-first refactor)

   - Apply entity-first pattern from differential expression
   - Reuse shared hook
   - Backend should already support the new format
   - Estimated: ~2-3 hours

4. **Frontend: Notebook Architecture** (Major refactor - Future)
   - Implement entity-based shared state
   - Add inter-cell dependencies
   - Much cleaner with entity-first approach
   - Can be deferred until needed

---

## 📝 Notes

- Differential expression frontend migration is complete and working
- Backend accepts new configuration format (mostly complete, fixing R process errors)
- PCA migration is ready to implement (estimated 2-3 hours)
- Notebook architecture improvements are desirable but not essential
- Auto-selection is a nice-to-have UX enhancement

**Last updated:** 2026-02-06
**Next review:** After PCA migration is complete
