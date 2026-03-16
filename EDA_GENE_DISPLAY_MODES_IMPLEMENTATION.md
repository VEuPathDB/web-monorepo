# EDA Dataset Graphs: Configurable Gene Display Modes

## Overview

This implementation adds configurable gene/item display modes to EDA dataset graphs, making them dataset-agnostic and supporting both highlight and subset filtering modes.

## Context

The current EDA dataset graph implementation (used for phenotype, cellular localization, antibody arrays, etc.) had two architectural issues:

1. **Hardcoded variable ID**: The gene highlight variable ID (`VAR_bdc8e679`) was hardcoded in the frontend, making it work only for one specific EDA study. This violated the principle of model-driven configuration and would break for any dataset with a different gene variable ID.

2. **No subsetting option**: Users could only highlight genes/items in the plots (showing all data with some points highlighted), but could not filter/subset the data to show ONLY the selected items. The EDA data service fully supports filtering, but this capability wasn't exposed through the configuration.

## Solution

This change:
- Makes gene/item display dataset-agnostic by moving the variable ID to the model configuration
- Adds support for two display modes: 'highlight' (show all data with highlighting) or 'subset' (show only specific items)
- Adds support for multiple plot types: scatter plots and bar plots (using existing plotType field)
- Works generically across all EDA dataset types (phenotype, cellular localization, antibody arrays, etc.)
- Maintains backward compatibility with existing highlighting behavior as the default mode

## Database Schema Assumptions

The `apidbtuning.edagenegraph` table has these columns:
- `display_spec_variable_id VARCHAR2(255)` - The EDA variable ID for the gene/item identifier (e.g., 'VAR_bdc8e679')
- `display_mode VARCHAR2(20)` - Either 'highlight' or 'subset'
  - `'highlight'` (default) - Show all data, highlight specific genes/items
  - `'subset'` - Show only specific genes/items, no highlighting

## Implementation Details

### Phase 1: Update SQL Queries

**Files Modified**:
- `Model/lib/wdk/model/records/geneTableQueries.xml`

**Changes**:

Updated the JSON_OBJECT in two queries (EdaPhenotypeGraphs and EdaCellularLocalizationGraphs) to include:

```sql
SELECT dataset_name,
       JSON_ARRAYAGG(
         JSON_OBJECT(
           'plotName' VALUE plot_name,
           'plotType' VALUE plot_type,
           'xAxisEntityId' VALUE x_axis_entity_id,
           'yAxisEntityId' VALUE y_axis_entity_id,
           'xAxisVariableId' VALUE x_axis_variable_id,
           'yAxisVariableId' VALUE y_axis_variable_id,
           'displaySpecVariableId' VALUE display_spec_variable_id,      -- NEW
           'displayMode' VALUE NVL(display_mode, 'highlight'),          -- NEW
           'xMin' VALUE x_min,
           'xMax' VALUE x_max,
           'yMin' VALUE y_min,
           'yMax' VALUE y_max
          )
         ) AS plot_configs_json
FROM apidbtuning.edagenegraph
GROUP BY dataset_name
```

**Key Points**:
- `NVL(display_mode, 'highlight')` ensures NULL values default to 'highlight' mode for backward compatibility
- Both phenotype and cellular localization queries updated identically

### Phase 2: Update Frontend TypeScript Types

**File**: `packages/libs/web-common/src/components/EdaDatasetGraph.tsx`

**Changes**:

1. **Updated PlotConfig type**:
```typescript
const PlotConfig = t.type({
  plotName: t.string,
  plotType: t.string,
  xAxisEntityId: t.string,
  xAxisVariableId: t.string,
  yAxisEntityId: t.string,
  yAxisVariableId: t.string,
  displaySpecVariableId: t.string,                    // NEW
  displayMode: t.union([                              // NEW
    t.literal('highlight'),
    t.literal('subset'),
  ]),
});
```

2. **Updated component rendering logic**:
```typescript
const geneDisplaySpec = graphIds && {
  ids: graphIds,
  variableId: plotConfig.displaySpecVariableId,    // FROM MODEL (was hardcoded)
  entityId: plotConfig.xAxisEntityId,
  traceName: source_id?.toString(),
  mode: plotConfig.displayMode,                    // NEW
};

// Conditional rendering based on plot type
const PlotComponent = plotConfig.plotType === 'bar'
  ? EdaBarPlot
  : EdaScatterPlot;

return (
  <div style={{ width: 500 }}>
    <PlotComponent
      datasetId={dataset_id as string}
      xAxisVariable={xAxisVariable}
      yAxisVariable={yAxisVariable}
      geneDisplaySpec={geneDisplaySpec}
      plotTitle={plotConfig.plotName}
    />
  </div>
);
```

3. **Added EdaBarPlot import**:
```typescript
import { EdaBarPlot } from './eda/EdaBarPlot';
```

### Phase 3: Update EdaScatterPlot Component

**File**: `packages/libs/web-common/src/components/eda/EdaScatterPlot.tsx`

**Changes**:

1. **Renamed and updated interface**:
```typescript
interface GeneDisplaySpec {
  ids: string[];
  variableId: string;
  entityId: string;
  traceName?: string;
  mode: 'highlight' | 'subset';  // NEW
}

interface Props {
  datasetId: string;
  xAxisVariable: VariableDescriptor;
  yAxisVariable: VariableDescriptor;
  geneDisplaySpec?: GeneDisplaySpec;  // Renamed from highlightSpec
  plotTitle?: string;
}
```

2. **Implemented mode-based filtering logic**:
```typescript
// Construct filters array if in subset mode
const filters = geneDisplaySpec?.mode === 'subset' && geneDisplaySpec.ids.length > 0
  ? [
      {
        type: 'stringSet' as const,
        entityId: geneDisplaySpec.entityId,
        variableId: geneDisplaySpec.variableId,
        stringSet: geneDisplaySpec.ids,
      }
    ]
  : [];

const scatterplotDataResponse$ = dataClient.getScatterplot(
  'xyrelationships',
  {
    studyId,
    filters,  // Apply filter only in subset mode
    config: {
      outputEntityId: xAxisVariable.entityId,
      valueSpec: 'raw',
      xAxisVariable,
      yAxisVariable,
      returnPointIds: true,
    },
  }
);

// Get highlight data only if in highlight mode
const highlightDataResponse$ =
  geneDisplaySpec?.mode === 'highlight' && geneDisplaySpec.ids.length > 0
    ? subsettingClient.getTabularData(studyId, geneDisplaySpec.entityId, {
        filters: [
          {
            type: 'stringSet',
            entityId: geneDisplaySpec.entityId,
            variableId: geneDisplaySpec.variableId,
            stringSet: geneDisplaySpec.ids,
          },
        ],
        outputVariableIds: [geneDisplaySpec.variableId],
      })
    : undefined;
```

3. **Pass highlight details only in highlight mode**:
```typescript
return scatterplotResponseToData(
  scatterplotDataResponse,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  'xyrelationships',
  undefined,
  undefined,
  // Pass highlight details only in highlight mode
  geneDisplaySpec?.mode === 'highlight' && highlightIds
    ? highlightedPointsDetails
    : undefined
).dataSetProcess;
```

**Behavior Summary**:

| Mode | Filters | Highlight Data Fetch | Result |
|------|---------|---------------------|--------|
| `'highlight'` | Empty array | Yes, separate fetch | Show all data, highlight specified genes/items |
| `'subset'` | stringSet filter applied | No | Show only specified genes/items, no highlighting |

### Phase 4: Create EdaBarPlot Component

**New File**: `packages/libs/web-common/src/components/eda/EdaBarPlot.tsx`

**Implementation**:

Created a new component following the same pattern as EdaScatterPlot:

```typescript
import Barplot from '@veupathdb/components/lib/plots/Barplot';
import { barplotResponseToData } from '@veupathdb/eda/lib/core/components/visualizations/implementations/BarplotVisualization';

// Same GeneDisplaySpec interface as EdaScatterPlot
interface GeneDisplaySpec {
  ids: string[];
  variableId: string;
  entityId: string;
  traceName?: string;
  mode: 'highlight' | 'subset';
}

function BarPlotAdapter(props: AdapterProps) {
  // Same mode-based filtering logic
  const filters = geneDisplaySpec?.mode === 'subset' && geneDisplaySpec.ids.length > 0
    ? [{ type: 'stringSet' as const, entityId: ..., variableId: ..., stringSet: ... }]
    : [];

  // Call getBarplot instead of getScatterplot
  const barplotDataResponse$ = dataClient.getBarplot(
    'pass',
    {
      studyId,
      filters,
      config: {
        outputEntityId: xAxisVariable.entityId,
        valueSpec: 'count',
        xAxisVariable,
        yAxisVariable,
      },
    }
  );

  // Use barplotResponseToData for transformation
  return barplotResponseToData(
    barplotDataResponse,
    xAxisVar.variable,
    yAxisVar.variable
  );
}
```

**Key Features**:
- Uses `Barplot` component from `@veupathdb/components`
- Calls `dataClient.getBarplot()` with appropriate config
- Applies same mode-based filtering as scatter plots
- Simpler than scatter plot (no separate highlight data fetch for bar plots)

## API Contract Changes

### Frontend to Backend

The frontend now expects these additional fields in the `plot_configs_json` from backend queries:

```typescript
{
  plotName: string;
  plotType: string;  // 'scatter' or 'bar'
  xAxisEntityId: string;
  xAxisVariableId: string;
  yAxisEntityId: string;
  yAxisVariableId: string;
  displaySpecVariableId: string;  // NEW - EDA variable ID for gene/item
  displayMode: 'highlight' | 'subset';  // NEW - display mode
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
}
```

### Frontend to EDA Service

Based on the `displayMode`, the frontend makes different API calls:

**Highlight Mode**:
```typescript
// Main data call with empty filters
dataClient.getScatterplot('xyrelationships', {
  studyId,
  filters: [],  // Empty - fetch all data
  config: { ... }
});

// Separate call to get IDs to highlight
subsettingClient.getTabularData(studyId, entityId, {
  filters: [{
    type: 'stringSet',
    entityId: '...',
    variableId: '...',
    stringSet: ['gene1', 'gene2', ...]
  }],
  outputVariableIds: ['...']
});
```

**Subset Mode**:
```typescript
// Single data call with stringSet filter
dataClient.getScatterplot('xyrelationships', {
  studyId,
  filters: [{
    type: 'stringSet',
    entityId: '...',
    variableId: '...',
    stringSet: ['gene1', 'gene2', ...]
  }],
  config: { ... }
});
// No separate highlight data fetch
```

## Backward Compatibility

✅ SQL query uses `NVL(display_mode, 'highlight')` to default NULL values to 'highlight' mode
✅ Frontend defaults to 'highlight' mode if displayMode is missing from JSON
✅ Frontend gracefully handles missing `displaySpecVariableId` by skipping the gene display feature entirely
✅ No changes to external APIs or existing data structure
✅ Current behavior (all data + highlighting) is preserved as the default mode

## Database Setup Requirements

For each dataset in `apidbtuning.edagenegraph`:

1. **Set `display_spec_variable_id`**:
   - Find the EDA variable ID that represents the gene/item identifier for that dataset
   - Example: `'VAR_bdc8e679'` for the original phenotype dataset
   - This should match a valid variable in the dataset's EDA study

2. **Set `display_mode`** (optional):
   - `'highlight'` - Show all data points, highlight the current gene/item (default)
   - `'subset'` - Show only the current gene/item's data points
   - If NULL or not set, defaults to `'highlight'`

3. **Ensure `plot_type`** is set:
   - `'scatter'` - Renders scatter plots (most common)
   - `'bar'` - Renders bar plots

Example:
```sql
UPDATE apidbtuning.edagenegraph
SET display_spec_variable_id = 'VAR_abc12345',
    display_mode = 'highlight'
WHERE dataset_name = 'DS_my_phenotype_dataset';
```

## Verification Plan

### 1. SQL Query Verification

Run the queries manually to verify JSON output:

```sql
-- Should see displaySpecVariableId and displayMode in the plot_configs_json output
SELECT plot_configs_json
FROM (/* EdaPhenotypeGraphs query */)
WHERE ROWNUM = 1;
```

Expected output should include:
```json
[{
  "plotName": "...",
  "plotType": "scatter",
  "displaySpecVariableId": "VAR_...",
  "displayMode": "highlight",
  ...
}]
```

### 2. Frontend Type Checking

```bash
cd web-monorepo
yarn typecheck  # or equivalent TypeScript compilation check
```

### 3. Runtime Testing

#### Scenario 1: Scatterplot with Highlight Mode
- Configure: `plotType='scatter'`, `display_mode='highlight'`
- Navigate to gene record page with EDA dataset graphs
- Expand the graphs section
- **Expected**:
  - Scatter plots render with ALL data points
  - Current gene/item is highlighted visually
  - Network tab shows `filters: []` in API call
  - Separate subsettingClient call is made

#### Scenario 2: Scatterplot with Subset Mode
- Configure: `plotType='scatter'`, `display_mode='subset'`
- Navigate to gene record page
- **Expected**:
  - Scatter plots show ONLY the specified gene/item (fewer points)
  - No special highlighting applied
  - Network tab shows stringSet filter in API call
  - No separate subsettingClient call

#### Scenario 3: Barplot with Highlight Mode
- Configure: `plotType='bar'`, `display_mode='highlight'`
- Navigate to gene record page
- **Expected**:
  - Bar plots render with ALL data
  - Current gene/item bars are highlighted
  - Network tab shows `filters: []` in barplot API call

#### Scenario 4: Barplot with Subset Mode
- Configure: `plotType='bar'`, `display_mode='subset'`
- Navigate to gene record page
- **Expected**:
  - Bar plots show ONLY the specified gene/item
  - No special highlighting applied
  - Network tab shows stringSet filter in barplot API call

### 4. Integration Testing

- [ ] Test with multiple dataset types (phenotype, cellular localization, antibody arrays)
- [ ] Test with datasets that have different `displaySpecVariableId` values
- [ ] Verify backward compatibility - NULL or missing display_mode defaults to 'highlight'
- [ ] Test both modes ('highlight' and 'subset')
- [ ] Test edge cases:
  - Empty gene/item list (spec should be ignored)
  - Non-existent gene/item IDs
  - Very large gene/item lists
- [ ] Test both plot types (scatter and bar)
- [ ] Verify no console errors or warnings

### 5. Browser DevTools Verification

**Network Tab**:
- Find the EDA data service API calls
- For highlight mode: verify `filters: []` in the request
- For subset mode: verify filters array contains the stringSet filter with gene/item IDs
- Check separate subsettingClient calls are made only in highlight mode
- Verify correct endpoint is called based on plotType:
  - 'scatter' → `getScatterplot` endpoint
  - 'bar' → `getBarplot` endpoint

**Console Tab**:
- No TypeScript errors
- No runtime errors
- No warnings about missing properties

## Files Changed

### Backend
1. `/home/jbrestel/workspaces/dataLoad/project_home/ApiCommonModel/Model/lib/wdk/model/records/geneTableQueries.xml`
   - Updated EdaPhenotypeGraphs query (line 1010-1027)
   - Updated EdaCellularLocalizationGraphs query (line 1102-1119)

### Frontend
1. `/home/jbrestel/workspaces/misc/web-monorepo/packages/libs/web-common/src/components/EdaDatasetGraph.tsx`
   - Updated PlotConfig type
   - Updated rendering logic
   - Added conditional plot type rendering
   - Renamed highlightSpec to geneDisplaySpec

2. `/home/jbrestel/workspaces/misc/web-monorepo/packages/libs/web-common/src/components/eda/EdaScatterPlot.tsx`
   - Renamed HighlightSpec to GeneDisplaySpec
   - Added mode field to interface
   - Implemented mode-based filtering logic

3. `/home/jbrestel/workspaces/misc/web-monorepo/packages/libs/web-common/src/components/eda/EdaBarPlot.tsx` *(NEW)*
   - Created new component for bar plots
   - Implements same GeneDisplaySpec interface
   - Supports both highlight and subset modes

## Notes and Future Enhancements

### Current Implementation
- Mode is set per dataset in the database configuration
- No user-facing toggle controls in this phase
- Either highlight OR subset, not both simultaneously
- Generic implementation works for all EDA dataset types

### Potential Future Enhancements
1. **UI Controls**: Add user-facing toggle to switch between modes dynamically
2. **Validation**: Add database constraint to validate `display_spec_variable_id` matches a valid variable in the dataset
3. **Combined Mode**: Support showing subset with highlighting within that subset
4. **Additional Plot Types**: Extend to other plot types as needed
5. **Performance**: Consider caching or memoization for large datasets

### Technical Decisions
- **Filter type 'stringSet'**: Appropriate for gene/item IDs (categorical data)
- **Mode-based approach**: Simpler UX and implementation than simultaneous highlight + subset
- **Database-driven config**: Maintains separation of concerns, no hardcoded values in frontend
- **Backward compatibility**: Critical for smooth rollout across existing datasets

## Contact

For questions or issues with this implementation, refer to:
- Implementation plan at: `/home/jbrestel/.claude/projects/-home-jbrestel-workspaces-dataLoad-project-home-ApiCommonModel/3cb55100-90c9-4d38-ab21-ebde1fcc368c.jsonl`
- This documentation file

---

**Implementation Date**: 2026-02-06
**Status**: Complete - Ready for Testing
