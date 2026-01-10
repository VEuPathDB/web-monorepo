# Entity and Variable Collection Selection for Computation and Visualization

## Overview

This document explains how entities and variable collections are chosen/selected for computation and visualization in the EDA (Exploratory Data Analysis) platform, with a focus on the differential expression feature.

## Architecture: Two-Level Selection System

The codebase implements a **two-tier selection pattern** for differential expression and most other computation plugins:

### Level 1: Variable Collection Selection (`collectionVariable`)

The collection variable represents the assay data (count data for genes/taxa).

- **UI Component**: `VariableCollectionSingleSelect`
- **Data Flow**:
  ```
  User selects in dropdown → onSelect callback → changeConfigHandler →
  Updates configuration property 'collectionVariable' in state
  ```
- **Storage**: Stored as a `VariableCollectionDescriptor` containing:
  ```typescript
  {
    entityId: string;
    collectionId: string;
  }
  ```

### Level 2: Comparator Variable Selection (`comparator.variable`)

The comparator variable is the categorical/continuous variable used to split samples into groups.

- **UI Component**: `VariableTreeDropdown` (wraps `VariableTree`)
- **Data Flow**: Similar to collection selection but updates `comparator.variable` in configuration
- **Storage**: Stored as a `VariableDescriptor` containing:
  ```typescript
  {
    entityId: string;
    variableId: string;
  }
  ```

## Configuration Type Structure

The differential expression configuration schema defines how selections are stored:

```typescript
export const DifferentialExpressionConfig = t.partial({
  collectionVariable: VariableCollectionDescriptor,  // entityId + collectionId
  comparator: Comparator,                             // variable + groupA/groupB
  differentialExpressionMethod: t.string,
  pValueFloor: t.string,
});

// Comparator type
const Comparator = t.intersection([
  t.partial({
    groupA: t.array(LabeledRange),  // Selected values for Group A
    groupB: t.array(LabeledRange),  // Selected values for Group B
  }),
  t.type({
    variable: VariableDescriptor,    // entityId + variableId
  }),
]);
```

**Key Design Principle**: Selections are stored as **minimal descriptors** (just IDs), not full objects. This allows configurations to be serializable and independent of the current study metadata.

## Entity Selection Pattern

**Entities are implicitly selected through their collections:**

### 1. Collection Predicate System

Plugins filter available collections through predicates:

```typescript
// From VariableCollectionSingleSelect
const collections = collectionPredicate
  ? e.collections.filter(collectionPredicate)
  : e.collections;
```

### 2. Common Predicates

From `Utils.ts`:
- `isNotAbsoluteAbundanceVariableCollection()` - Filters out raw count data
- `isTaxonomicVariableCollection()` - Includes only taxonomic collections
- `isFunctionalCollection()` - For pathway/gene collections

### 3. Example from Differential Expression

```typescript
<VariableCollectionSingleSelect
  value={configuration.collectionVariable}
  onSelect={partial(changeConfigHandler, 'collectionVariable')}
  collectionPredicate={(collection) => true}  // No filtering in DE
/>
```

## Lookup Mechanism - Converting Descriptors to Full Objects

The system uses **lookup hooks** that resolve descriptors to full metadata objects:

### `useFindEntityAndVariableCollection()` Hook

```typescript
export function useFindEntityAndVariableCollection(filters?: Filter[]) {
  const entities = useStudyEntities(filters);
  return useCallback(
    (variableCollection?: VariableCollectionDescriptor) => {
      const entAndVarCollection = findEntityAndVariableCollection(
        entities,
        variableCollection
      );
      if (entAndVarCollection == null) return;
      return entAndVarCollection as {
        entity: StudyEntity;
        variableCollection: CollectionVariableTreeNode;
      };
    },
    [entities]
  );
}
```

### `useFindEntityAndVariable()` Hook

```typescript
export function useFindEntityAndVariable(filters?: Filter[]) {
  const entities = useStudyEntities(filters);
  return useCallback(
    (variable?: VariableDescriptor) => {
      const entAndVar = findEntityAndVariable(entities, variable);
      if (entAndVar == null || entAndVar.variable.type === 'category') return;
      return entAndVar as {
        entity: StudyEntity;
        variable: Variable;
      };
    },
    [entities]
  );
}
```

### Underlying Utility Functions

From `study-metadata.ts`:

```typescript
export function findEntityAndVariable(
  entities: Iterable<StudyEntity>,
  variableDescriptor?: VariableDescriptor
): EntityAndVariable | undefined {
  if (variableDescriptor == null) return undefined;
  const entity = find(
    (entity) => entity.id === variableDescriptor.entityId,
    entities
  );
  const variable =
    entity &&
    find(
      (variable) => variable.id === variableDescriptor.variableId,
      entity.variables
    );
  if (entity == null || variable == null) return undefined;
  return { entity, variable };
}
```

## Dynamic Available Options - `useStudyEntities()`

The **base of the selection system** is `useStudyEntities()`:

```typescript
export function useStudyEntities(filters?: Filter[]): StudyEntity[] {
  const { rootEntity } = useStudyMetadata();
  return useMemo((): StudyEntity[] => {
    // If filters provided, augments variable metadata:
    // - Filters vocabulary by selected values
    // - Recalculates ranges for numeric variables
    // - Disables filtered-out categories
    const mappedRootEntity = !filters?.length
      ? rootEntity
      : mapStructure<StudyEntity, StudyEntity>(...);

    return entityTreeToArray(mappedRootEntity);
  }, [filters, rootEntity]);
}
```

**Key Feature**: This hook **filters available options based on current analysis filters**, so:
- Categorical variable options in the ValuePicker are filtered to only show values that exist in the current subset
- Continuous variable bins are recalculated based on filtered data ranges

## VariableCollectionSingleSelect - Collection Selection UI

The component responsible for presenting collection choices to users:

```typescript
export function VariableCollectionSingleSelect(props: Props) {
  const { collectionPredicate, onSelect, value, additionalItemGroups } = props;
  const entities = useStudyEntities();  // Get current entities

  const items = useMemo(() => {
    const collectionItems = entities
      .filter((e) => !!e.collections?.length)
      .map((e) => ({
        label: e.displayName,                    // Entity name as group header
        items: e.collections
          .filter(collectionPredicate || (() => true))
          .map((collection) => ({
            value: `${e.id}:${collection.id}`,  // Encoded descriptor
            display: collection.displayName,
          })),
      }));
    return collectionItems;
  }, [entities, collectionPredicate]);

  // Single option auto-selection
  useEffect(() => {
    if (items.length === 1 && items[0].items.length === 1) {
      const singleItem = items[0].items[0];
      handleSelect(singleItem.value);  // Auto-select if only one option
    }
  }, [items, handleSelect]);
}
```

## Configuration Change Handler - State Management

When users select an entity/collection, the `useConfigChangeHandler` hook orchestrates the update:

```typescript
export function useConfigChangeHandler<ConfigType>(
  analysisState: AnalysisState,
  computation: Computation<ConfigType>,
  visualizationId: string
) {
  return useCallback(
    (propertyName: keyof ConfigType, value: ConfigType[typeof propertyName]) => {
      const { configuration } = computation.descriptor;
      handleConfigurationChanges(
        analysisState,
        computation,
        { ...configuration, [propertyName]: value },  // Merge new value
        visualizationId,
        url,
        history
      );
    },
    [analysisState, computation, history, url, visualizationId]
  );
}
```

**Key Logic**:
1. When config changes, it looks for an existing computation with the new config
2. If found → moves visualization to that computation
3. If not found → creates a new computation instance
4. Cleans up old computations with no visualizations

## Validation - Ensuring Complete Configurations

The `isConfigurationComplete()` function enforces selection requirements:

```typescript
function isCompleteDifferentialExpressionConfig(config: unknown) {
  return (
    CompleteDifferentialExpressionConfig.is(config) &&  // All required fields present
    config.comparator.groupA != null &&                  // Group A selected
    config.comparator.groupB != null                     // Group B selected
  );
}
```

This gates the "Generate Results" button - it only enables when selections are complete.

## Data Flow to Visualization

Once configuration is complete:

```
1. Computation with config stored in state
   ↓
2. VolcanoPlotViz component receives computation
   ↓
3. Extract computationConfiguration = computation.descriptor.configuration
   ↓
4. Build data request params:
   {
     studyId,
     filters,
     config: {},                    // viz-specific config
     computeConfig: computationConfiguration  // Full computation config to backend
   }
   ↓
5. Call: dataClient.getVisualizationData(
      computation.descriptor.type,   // "differentialabundance"
      visualization.descriptor.type, // "volcanoplot"
      params,
      VolcanoPlotResponse
   )
   ↓
6. Backend receives computation config and uses:
   - collectionVariable to identify the count data collection
   - comparator.variable + groupA/groupB to define group split
   - For filtering and computing statistics
```

## Filter Sensitivity - Dynamic Subset Handling

Differential expression handles subset changes intelligently:

```typescript
useEffect(() => {
  if (!configuration.comparator ||
      (!configuration.comparator.groupA && !configuration.comparator.groupB))
    return;

  // If subset changed while configuring:
  if (previousSubset.current && !isEqual(previousSubset.current, newSubset)) {
    // Reset group selections since values might no longer exist
    changeConfigHandler('comparator', {
      variable: configuration.comparator.variable,
      groupA: undefined,  // Clear selections
      groupB: undefined,
    });

    enqueueSnackbar('Reset differential expression group A and B values...');
  }
}, [analysisState.analysis?.descriptor.subset.descriptor, ...]);
```

## Notebook Integration - Guided Analysis Workflows

The platform includes a **notebook system** that provides structured, step-by-step workflows for complex analyses. This system extends the entity/collection selection mechanism with additional features tailored for guided workflows.

### Notebook Cell Architecture

Notebooks are composed of different cell types, with **ComputeCellDescriptor** being the primary type for computations:

```typescript
export interface ComputeCellDescriptor extends NotebookCellDescriptorBase<'compute'> {
  computationName: string;
  computationId: string;
  getAdditionalCollectionPredicate?: (
    projectId?: string
  ) => (variableCollection: CollectionVariableTreeNode) => boolean;
  hidden?: boolean; // Hide cell UI for auto-configured computations
}
```

### Key Notebook Features for Entity/Collection Selection

#### 1. **Project-Specific Collection Filtering**

Notebooks can restrict available collections based on the current project using `getAdditionalCollectionPredicate`:

```typescript
// From wgcnaCorrelationNotebook in NotebookPresets.tsx
{
  type: 'compute',
  computationName: 'correlation',
  computationId: 'correlation_1',
  getAdditionalCollectionPredicate:
    (projectId?: string) =>
    (variableCollection: CollectionVariableTreeNode) => {
      // Keep only plasmo eigengenes for PlasmoDB
      if (projectId === 'PlasmoDB') {
        return variableCollection.id === 'EUPATH_0005051';
      }
      // Keep only host eigengenes for HostDB
      if (projectId === 'HostDB') {
        return variableCollection.id === 'EUPATH_0005050';
      }
      // In portal, return both
      return true;
    },
}
```

This predicate is combined with the computation plugin's base `collectionPredicate` to provide **layered filtering**:

```typescript
// From ComputeNotebookCell.tsx (lines 105-108)
const additionalCollectionPredicate =
  getAdditionalCollectionPredicate &&
  getAdditionalCollectionPredicate(projectId);

// Passed to plugin configuration component (lines 186-187)
<plugin.configurationComponent
  additionalCollectionPredicate={additionalCollectionPredicate}
  // ... other props
/>
```

#### 2. **Hidden Auto-Running Computations**

Notebooks can include hidden computations that auto-configure and run without user interaction:

```typescript
// From differentialExpressionNotebook (lines 101-124)
{
  type: 'compute',
  title: 'PCA',
  computationName: 'dimensionalityreduction',
  computationId: 'pca_1',
  hidden: true, // Hide in UI since config is already known
  cells: [
    {
      type: 'visualization',
      title: 'PCA Plot',
      visualizationName: 'scatterplot',
      visualizationId: 'pca_1',
    },
  ],
}
```

**Auto-execution logic** (from ComputeNotebookCell.tsx lines 112-117):

```typescript
useEffect(() => {
  if (isComputationConfigurationValid && jobStatus === 'no-such-job' && hidden) {
    console.log("creating job");
    createJob(); // Automatically run computation
  }
}, [isComputationConfigurationValid, jobStatus, createJob, hidden]);
```

When a hidden computation is fully configured (e.g., PCA with auto-selected collection), it runs automatically in the background, enabling seamless workflows.

#### 3. **Error Handling for Hidden Computes**

Hidden computations show error dialogs when they fail (lines 119-141):

```typescript
useEffect(() => {
  if (hidden && jobStatus === 'failed') {
    setShowErrorDialog(true);
  }
}, [hidden, jobStatus]);

<Dialog
  open={showErrorDialog}
  onClose={() => setShowErrorDialog(false)}
  title="Computation failed"
>
  <p>
    The background {cell.title + ' ' || ''}computation has failed.
    <strong>Please contact us for assistance.</strong>
  </p>
  <p>After closing this dialog, you may continue with your search.</p>
</Dialog>
```

#### 4. **Custom Configuration Handlers in Notebooks**

Notebooks use a simplified configuration handler instead of the standard `useConfigChangeHandler`:

```typescript
// From ComputeNotebookCell.tsx (lines 58-93)
const changeConfigHandler = (propertyName: string, value?: any) => {
  const updatedConfiguration = {
    ...(computation.descriptor.configuration || {}),
    [propertyName]: value,
  };

  // Check if computation with this config already exists
  const existingComputation =
    analysisState.analysis?.descriptor.computations.find(
      (comp) =>
        isEqual(comp.computationId, computationId) &&
        isEqual(comp.descriptor.configuration, updatedConfiguration)
    );

  if (existingComputation) return; // Don't create duplicate

  // Update computation in state
  analysisState.setComputations((computations) => {
    return computations.map((comp) =>
      comp.computationId === computation.computationId
        ? { ...comp, descriptor: { ...comp.descriptor, configuration: updatedConfiguration } }
        : comp
    );
  });
};
```

This handler is simpler than the workspace version because notebooks:
- Don't navigate between computation routes
- Don't need to manage multiple visualizations per computation
- Use fixed computation IDs defined in the notebook preset

#### 5. **Enhanced VariableCollectionSingleSelect for Notebooks**

The component was enhanced to support notebook workflows (VariableCollectionSingleSelect.tsx):

**String value support** (lines 65-70):
```typescript
const handleSelect = useCallback((value?: string) => {
  if (value == null) { onSelect(); return; }
  if (value.includes(':')) {
    const [entityId, collectionId] = value.split(':');
    onSelect({ entityId, collectionId });
  } else {
    onSelect(value); // Support plain string values
  }
}, [onSelect]);
```

**Single-option placeholder** (lines 104-108):
```typescript
// If only one option, show as text instead of dropdown
return items.length === 1 && items[0].items.length === 1 ? (
  <span style={{ fontWeight: 400, marginRight: 15 }}>
    {items[0].items[0].display}
  </span>
) : (
  <SingleSelect ... />
);
```

### Example: Differential Expression Notebook

The differential expression notebook demonstrates the full notebook selection flow:

```typescript
// From NotebookPresets.tsx
differentialExpressionNotebook: {
  cells: [
    // Step 1: Optional subsetting
    { type: 'subset', title: 'Select samples (optional)' },

    // Step 2: Hidden PCA auto-runs when collection is selected
    {
      type: 'compute',
      computationName: 'dimensionalityreduction',
      computationId: 'pca_1',
      hidden: true,
      cells: [
        { type: 'visualization', visualizationName: 'scatterplot', visualizationId: 'pca_1' }
      ],
    },

    // Step 3: User configures DE - selects collection + comparator variable + groups
    {
      type: 'compute',
      computationName: 'differentialexpression',
      computationId: 'de_1',
      cells: [
        { type: 'visualization', visualizationName: 'volcanoplot', visualizationId: 'volcano_1' }
      ],
    },
  ],
}
```

**Entity/Collection Selection Flow in Notebook**:

1. **PCA computation** (hidden):
   - When page loads, `VariableCollectionSingleSelect` shows available RNA-seq collections
   - If only one collection exists, it's auto-selected (lines 95-100 of VariableCollectionSingleSelect)
   - Configuration becomes valid → auto-runs via `createJob()`
   - PCA results populate scatterplot visualization

2. **DE computation** (visible):
   - User selects same or different collection via `VariableCollectionSingleSelect`
   - User selects comparator variable via `VariableTreeDropdown`
   - User defines Group A and Group B values
   - User clicks "Run Computation"
   - DE results populate volcano plot

### Notebook Configuration Props

The `ComputationConfigProps` interface was extended to support notebook features (Types.ts):

```typescript
export interface ComputationConfigProps extends ComputationProps {
  computation: Computation;
  visualizationId: string;
  addNewComputation: (name: string, configuration: unknown) => void;
  changeConfigHandlerOverride?: (propertyName: string, value: any) => void;
  showStepNumber?: boolean;
  showExpandableHelp?: boolean;
  additionalCollectionPredicate?: (
    variableCollection: CollectionVariableTreeNode
  ) => boolean;
  hideConfigurationComponent?: boolean;
}
```

New props for notebooks:
- **`changeConfigHandlerOverride`**: Custom handler for notebook contexts
- **`showStepNumber`**: Control numbered headers (usually `false` in notebooks)
- **`showExpandableHelp`**: Control help sections (usually `false` to avoid nested expandables)
- **`additionalCollectionPredicate`**: Project-specific collection filtering
- **`hideConfigurationComponent`**: Completely hide config UI for hidden cells

## Pattern Consistency Across Plugins

All computation plugins follow the same selection pattern:

| Plugin | Entity Selection | Collection Selection | Additional | Notebook Support |
|--------|------------------|----------------------|------------|------------------|
| **Abundance** | Via collection | Single collection | Ranking method | ✓ |
| **AlphaDiv** | Via collection | Single collection | Diversity method | ✓ |
| **DifferentiaAbundance** | Via collection + comparator | Single collection | Method, groups | ✓ |
| **DifferentialExpression** | Via collection + comparator | Single collection (RNA-seq counts) | Method, groups, p-value floor | ✓ |
| **DimensionalityReduction** (PCA) | Via collection | Single collection | None | ✓ (often hidden in notebooks) |
| **Correlation** | Via 2 collections | Two collections or collection + metadata | Correlation method | ✓ (WGCNA notebook) |
| **BetaDiv** | Via collection | Single collection | Distance metric | ✓ |

## Study Metadata Context

The entire selection system relies on `StudyMetadata` from context:

```typescript
export interface StudyEntity {
  id: string;
  displayName: string;
  displayNamePlural?: string;
  variables: VariableTreeNode[];
  collections?: CollectionVariableTreeNode[];
  children?: StudyEntity[];
}

export interface CollectionVariableTreeNode extends VariableTreeNode {
  id: string;
  displayName: string;
  // Annotations for classification
  normalizationMethod?: string;
  isCompositional?: boolean;
  isProportion?: boolean;
  member?: string;  // 'taxon' | 'pathway' | 'gene'
}
```

## Summary: Core Design Principles

### Foundational Principles

1. **Descriptors as Addresses**: Selections stored as minimal `{ entityId, variableId/collectionId }` objects, not full data

2. **Lazy Resolution**: Full objects created on-demand via lookup hooks during rendering

3. **Filter-Aware**: Selection options dynamically filter based on current analysis subset

4. **Predicate System**: Collections filtered by type through reusable predicates

5. **Config-Driven**: Computation behavior entirely specified in serializable config objects

6. **Validation Gates**: UI elements disabled until all required selections made

7. **Smart State Management**: Configuration changes intelligently merge visualizations to existing or new computations

### Notebook-Specific Extensions

8. **Layered Filtering**: Combine plugin-level predicates with project-specific predicates for granular collection control

9. **Hidden Auto-Execution**: Computations can auto-run when fully configured, enabling seamless multi-step workflows

10. **Context-Appropriate UI**: Single-option collections display as static text; configuration components can be completely hidden

11. **Custom State Handlers**: Notebooks use simplified configuration handlers without routing logic

12. **Graceful Error Recovery**: Hidden computations surface errors via dialogs while allowing users to continue

This architecture enables **flexible, type-safe, and efficient selection of any entity/collection combination** while maintaining clean separation between selection UI, state management, and computation logic. The notebook extensions allow the same selection mechanism to power both **exploratory analysis** (workspace mode) and **guided workflows** (notebook mode).

## Key Files Referenced

### Core Selection System

- `packages/libs/eda/src/lib/core/components/computations/plugins/differentialExpression.tsx` - Differential expression plugin
- `packages/libs/eda/src/lib/core/components/computations/plugins/dimensionalityReduction.tsx` - PCA/dimensionality reduction plugin
- `packages/libs/eda/src/lib/core/components/variableSelectors/VariableCollectionSingleSelect.tsx` - Collection selector UI
- `packages/libs/eda/src/lib/core/hooks/workspace.ts` - Entity/collection lookup hooks
- `packages/libs/eda/src/lib/core/utils/study-metadata.ts` - Descriptor resolution utilities
- `packages/libs/eda/src/lib/core/utils/computation-utils/Utils.ts` - Config change handlers and predicates
- `packages/libs/eda/src/lib/core/components/computations/Types.ts` - Computation configuration types

### Notebook Integration

- `packages/libs/eda/src/lib/notebook/ComputeNotebookCell.tsx` - Notebook compute cell component with auto-execution
- `packages/libs/eda/src/lib/notebook/NotebookPresets.tsx` - Notebook definitions (DE, WGCNA, etc.)
- `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/questions/EdaNotebookQuestionForm.tsx` - Notebook integration with WDK search
- `packages/sites/genomics-site/webapp/wdkCustomization/js/client/pluginConfig.tsx` - Plugin configuration for genomics site
