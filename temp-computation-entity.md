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

## Pattern Consistency Across Plugins

All computation plugins follow the same selection pattern:

| Plugin | Entity Selection | Collection Selection | Additional |
|--------|------------------|----------------------|------------|
| **Abundance** | Via collection | Single collection | Ranking method |
| **AlphaDiv** | Via collection | Single collection | Diversity method |
| **DifferentiaAbundance** | Via collection + comparator | Single collection | Method, groups |
| **DifferentialExpression** | Via collection + comparator | Single collection (RNA-seq counts) | Method, groups, p-value floor |
| **Correlation** | Via 2 collections | Two collections or collection + metadata | Correlation method |
| **BetaDiv** | Via collection | Single collection | Distance metric |

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

1. **Descriptors as Addresses**: Selections stored as minimal `{ entityId, variableId/collectionId }` objects, not full data

2. **Lazy Resolution**: Full objects created on-demand via lookup hooks during rendering

3. **Filter-Aware**: Selection options dynamically filter based on current analysis subset

4. **Predicate System**: Collections filtered by type through reusable predicates

5. **Config-Driven**: Computation behavior entirely specified in serializable config objects

6. **Validation Gates**: UI elements disabled until all required selections made

7. **Smart State Management**: Configuration changes intelligently merge visualizations to existing or new computations

This architecture enables **flexible, type-safe, and efficient selection of any entity/collection combination** while maintaining clean separation between selection UI, state management, and computation logic.

## Key Files Referenced

- `packages/libs/eda/src/lib/core/components/computations/plugins/differentialExpression.tsx` - Differential expression plugin
- `packages/libs/eda/src/lib/core/components/variableSelectors/VariableCollectionSingleSelect.tsx` - Collection selector UI
- `packages/libs/eda/src/lib/core/hooks/workspace.ts` - Entity/collection lookup hooks
- `packages/libs/eda/src/lib/core/utils/study-metadata.ts` - Descriptor resolution utilities
- `packages/libs/eda/src/lib/core/utils/computation-utils/Utils.ts` - Config change handlers and predicates
