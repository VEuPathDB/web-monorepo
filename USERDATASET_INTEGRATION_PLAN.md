# UserDataset Integration Plan for InternalGeneDataset.tsx

## Context

### What is InternalGeneDataset.tsx?

The `InternalGeneDataset.tsx` component implements a two-level question architecture:

- **Internal Questions** (stub/catalog layer): Don't execute queries themselves, but show available datasets
- **Real Questions** (execution layer): Actual parameterized searches pre-configured with specific dataset IDs

### Current State

- Component displays a catalog of **DataSource records** (recently upgraded from Dataset records)
- DataSources come from backend/workflow system
- Backend provides:
  - Dataset metadata (name, organism, publications, etc.)
  - References table linking to real questions
  - Structured data populating `DatasourceRecord` and `InternalQuestionRecord`

### New Requirement: UserDatasets

- **UserDatasets** are user-provided data (not from workflow)
- Conceptually similar to DataSource/Dataset but with differences
- Need to support querying UserDatasets alongside DataSources

---

## Key Architecture Components (Current Implementation)

### Data Flow

1. Internal question identified by `datasetCategory` and `datasetSubtype` properties
2. Queries **"DatasourcesByCategory"** to get available datasets
3. Each dataset has a `References` table listing valid real questions
4. Ontology tree provides category metadata (Differential Expression, Fold Change, etc.)
5. Buttons generated dynamically for each valid dataset-category-question combination

### Key Data Structures

**InternalQuestionRecord** (lines 64-70):

```typescript
{
  target_name: string,    // Real question name
  dataset_id: string,
  target_type: string,
  dataset_name: string,
  record_type: string
}
```

**Note**: Name is confusing - this represents the _real_ questions that can be used with a dataset, not the internal question itself. Extracted from dataset's References table.

**DatasourceRecord** (lines 72-82):

```typescript
{
  dataset_name: string,
  display_name: string,
  organism_prefix: string,
  dataset_id: string,
  summary: string,
  build_number_introduced: string,
  publications: LinkAttributeValue[],
  searches: string,        // Computed: space-separated category abbreviations
  isPreferred: boolean     // Based on organism preferences
}
```

This is the UI representation of a dataset row in the table.

### Backend Query

Currently queries: **"DatasourcesByCategory"** question with `dataset_category` parameter (lines 570-598)

---

## Critical Questions to Answer Before Implementation

### 1. UserDataset Backend Integration

- Does a UserDataset have a similar References table structure?
- Is there a parallel question like "UserDatasetsByCategory"?
- Or do UserDatasets need to be fetched via a different WDK mechanism entirely?

### 2. UserDataset Metadata Differences

- What fields will UserDatasets have vs. DataSources?
  - Will publications field apply?
  - Will build_number_introduced apply?
  - Any UserDataset-specific fields needed?
- Will UserDatasets have the same category-based organization?

### 3. Question Associations

- Will UserDatasets link to _existing_ real questions, or new UserDataset-specific questions?
- How will the References/question mapping work?
- Will the naming pattern be similar: `GenesBy_{DataType}_{DatasetName}_{SearchCategory}`?

### 4. Display Requirements

- Should UserDatasets appear in the same table as DataSources, or separately?
- Any visual distinction needed (badge, icon, different styling)?
- Should there be a toggle to show/hide UserDatasets?

### 5. Filtering/Preferences

- Should organism preferences apply to UserDatasets?
- Any UserDataset-specific filtering needed?
- Should the "NEW" badge logic apply to UserDatasets?

### 6. Permissions/Ownership

- Are UserDatasets user-specific or shared?
- Any access control considerations?
- Should the UI show ownership information?

---

## Component File Location

`packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/questions/InternalGeneDataset.tsx`

---

## Next Steps

1. Answer the critical questions above
2. Explore UserDataset backend API/WDK structure
3. Design data structure changes needed
4. Plan UI changes (table columns, visual distinctions)
5. Implement backend integration
6. Test with real UserDataset data

---

## Detailed Architecture Analysis

### Complete Data Flow (Current)

**Phase 1: Initialization** (lines 103-138)

- Extract Redux state: questions, ontology, recordClasses, preferredOrganisms
- Get internal question metadata via `getTableQuestionMetadata()`

**Phase 2: Data Loading** (lines 140-182)

```typescript
useWdkService(async (wdkService) => {
  1. getAnswerJson() → Queries "DatasourcesByCategory"
  2. getInternalQuestions() → Extracts question references
  3. getDisplayCategoryMetadata() → Processes ontology tree
  4. getDatasourceRecords() → Transforms into UI-ready records
})
```

**Phase 3: Processing Internal Questions** (lines 599-641)

- Function: `getInternalQuestions()`
- Extracts question references from References table
- Filters by `target_type === 'question'` and matching `record_type`

**Phase 4: Category Metadata from Ontology** (lines 724-799)

- Function: `getDisplayCategoryMetadata()`
- Traverses ontology tree to find category nodes
- Builds mapping: `questionNamesByDatasetAndCategory`
- Extracts display metadata: `displayCategoriesByName`

**Phase 5: Transform to UI Records** (lines 643-722)

- Function: `getDatasourceRecords()`
- Converts dataset records to table rows
- Computes `searches` field (available category abbreviations)
- Adds `isPreferred` based on organism preferences

### Button Generation (lines 382-426)

```typescript
renderCell: (cellProps) => {
  displayCategoryOrder.map((categoryName) => {
    const categorySearchName = getCategorySearchName(
      questionNamesByDatasetAndCategory,
      datasetName,
      categoryName
    );

    if (categorySearchName) {
      return (
        <Link to={`${internalSearchName}#${categorySearchName}`}>
          {displayCategoriesByName[categoryName].shortDisplayName}
        </Link>
      );
    }
  });
};
```

### Key Integration Points

- **WDK Service**: `useWdkService` hook for async data fetching
- **Plugin System**: Component registered via `pluginConfig.tsx`
- **Preferred Organisms**: `@veupathdb/preferred-organisms` package
- **Ontology Tree**: Category metadata and question organization

---

## Design Patterns Used

1. **Two-Level Question Architecture**: Separation of catalog vs. execution
2. **Ontology-Driven UI**: Categories from tree structure, not hardcoded
3. **Dataset-Question References via Database**: Dynamic associations
4. **URL Hash for State Management**: Direct linking and navigation
5. **Preferred Organisms Integration**: User-specific filtering
6. **Lazy Tab Loading**: Performance optimization
7. **Show One/Show All Toggle**: Focus on selected dataset
8. **Beta Feature Indicators**: Experimental feature flagging

---

## Date

2026-07-18 (Updated: 2026-07-19)

## Status

Backend structure confirmed - ready for Phase 1 implementation

## Scope: Phase 1 vs Phase 2

**Phase 1 (This Iteration):**

- Display UserDatasets alongside DataSources in table
- Source type icons and filtering
- Button generation with parameterized URLs
- Basic metadata (display name, summary, organism, attribution)
- **NO Publications** for UserDatasets

**Phase 2 (Future):**

- Add Publications table support for UserDatasets
- Additional features TBD

---

## Architecture Decision: Separate Processing Functions

**Decision**: UserDatasets and DataSources will have **separate processing functions** rather than forcing them into the same backend API structure.

**Rationale**:

- **Maintainability**: Each data source owns its structure
- **Robustness**: Avoids brittle coupling between two different sources
- **Separation of concerns**: Frontend explicitly handles differences
- **Flexibility**: Backend can evolve UD structure independently

**Implementation**:

- `getDatasourceRecords()` - processes DataSource responses (References table)
- `getUserDatasetRecords()` - processes UserDataset responses (ExploreWdkSearches table)
- Both return normalized `DatasourceRecord[]` shape
- Merge normalized results client-side

---

## UserDataset Backend Structure (CONFIRMED)

### Required Attributes

```javascript
"attributes": {
  "dataset_id": "EDAUD_53f554ec6a",                           // Primary key (also used as dataset_name)
  "display_name": "My RNA Seq Experiment",                     // User-friendly display text
  "organism_prefix": "<i>Plasmodium falciparum</i> 3D7",      // Formatted organism (HTML)
  "organism": "Plasmodium falciparum 3D7",                    // Clean organism for preference matching
  "summary": "RNA sequencing analysis of...",                  // Description for tooltip
  "short_attribution": "User et al 2024",                      // Appended to display_name
  "is_public": true                                            // Public vs private indicator
}
```

**Notes:**

- `dataset_id` is the **only primary key** - no separate `dataset_name` field
- `organism` attribute **replaces Version table** for preference filtering
- `build_number_introduced` **not needed** for UserDatasets
- `description` **not needed** (unused in current code)

### Required Tables

#### ExploreWdkSearches Table

UserDatasets provide an `ExploreWdkSearches` table (parallel to DataSources' `References` table):

```javascript
"ExploreWdkSearches": [
  {
    "question_name": "GeneQuestions.GenesByRnaSeqUserDataset",  // Generic question with namespace
    "dataset_id_param": "rna_seq_dataset",                       // Parameter name for this question
    "dataset_id": "EDAUD_53f554ec6a",                           // Actual dataset ID (with EDAUD_ prefix)
    "record_type": "TranscriptRecordClasses.TranscriptRecordClass",
    "url": "",          // Not used by frontend
    "description": "",  // Not used by frontend
    "order": ""         // Not used by frontend
  }
  // One object per available search type (e.g., Fold Change, Diff Expr)
  // dataset_id duplicated in each (it's the primary key)
]
```

#### Publications Table

**NOT INCLUDED IN PHASE 1** - Will be added in Phase 2.

For Phase 1, UserDatasets will have:

- `publications: []` (empty array) in the normalized record structure
- No publication links shown in tooltips

### Key Differences from DataSources References Table

| Aspect               | DataSources (References)                          | UserDatasets (ExploreWdkSearches)                           |
| -------------------- | ------------------------------------------------- | ----------------------------------------------------------- |
| **Table Name**       | `References`                                      | `ExploreWdkSearches`                                        |
| **Question Field**   | `target_name`                                     | `question_name`                                             |
| **Question Pattern** | Dataset-specific: `GenesByRnaSeq_RSRC123_DiffExp` | Generic: `GenesByRnaSeqUserDataset`                         |
| **Parameters**       | None (baked into question name)                   | `dataset_id_param` + `dataset_id`                           |
| **URL Pattern**      | `#GenesByRnaSeq_RSRC123_DiffExp`                  | `#GenesByRnaSeqUserDataset?param.rna_seq_dataset=EDAUD_123` |

### Processing Approach

1. **Extract questions from table** - similar to `getInternalQuestions()` but from ExploreWdkSearches
2. **Strip namespace** - `GeneQuestions.GenesByRnaSeqUserDataset` → `GenesByRnaSeqUserDataset`
3. **Map to categories via ontology** - same as DataSources
4. **Build parameterized URLs** - append `?param.{dataset_id_param}={dataset_id}`

---

## Requirements Summary (ANSWERED)

### 1. UserDataset Backend Integration ✓

- **Yes**, UserDatasets have a similar References table structure
- **Yes**, there is a parallel question: `"UserDatasetsByCategory"`
- UserDatasets are WDK records, accessed the same way as DataSources

### 2. UserDataset Metadata ✓

- **Conceptually similar** to DataSources but with different backend structure
- Required semantic fields (exact attribute names TBD):
  - `publications`: Optional (can be empty or have values)
  - `short_attribution`: Yes, UserDatasets have this
  - `build_number_introduced`: **No** - won't be used for UserDatasets (no "NEW" badge)
  - `is_public`: **Yes** - UserDatasets include this field
  - `organism_prefix`: Backend provides appropriate value ("Unspecified" for phenotype UDs)
  - Note: `organism_prefix` should really be named `organism_formatted` (contains HTML)
- **Same categories**: Both dataset categories (RNA-Seq, Phenotype) AND search categories (Fold Change, Diff Expr)
- **Version table**: Required - provides clean organism string for preference matching (not HTML formatted)

### 3. Question Associations ✓

- UserDatasets link to **shared generic questions**
- Pattern: `"GenesByUserDataset_{SearchCategory}"` (e.g., `"GenesByUserDataset_DifferentialExpression"`)
- UserDataset ID passed as **parameter** to the question
- References table contains generic question names (not dataset-specific)

### 4. Display Requirements ✓

- **Mixed in same table** - UserDatasets and DataSources appear together
- **New source type column** (icon-only, first column):
  - Internal datasets: Site logo/favicon
  - Public UserDatasets: Globe icon
  - Private UserDatasets: Lock icon
- **Filter checkboxes** at top of table:
  - Serve dual purpose: filtering + legend
  - Three checkboxes with icon + label
  - All checked by default

### 5. Filtering/Preferences ✓

- **Organism preferences** apply conditionally:
  - If `organism_prefix` is specific organism → apply preferences
  - If `organism_prefix` is "Multiple organisms" or "Unspecified" → always show
- Applies to both DataSources and UserDatasets

### 6. Permissions/Ownership ✓

- **Backend handles permissions**: Only returns UserDatasets the user should see
- `is_public` field indicates public vs private
- No frontend permission logic needed

---

## Field Usage Analysis

### Fields Actually Used in Display

**Critical Fields (MUST have):**

1. `dataset_name` - Identifier for linking to questions
2. `display_name` - Display text
3. `organism_prefix` - Organism info (can be HTML)
4. `dataset_id` - Unique ID for record linking
5. `summary` - Description for tooltip
6. `short_attribution` - Appended to display name

**Tables (MUST have):**

1. `References` (DataSources) / `ExploreWdkSearches` (UserDatasets) - Links to search questions (CRITICAL)
2. `Publications` - Can be empty array
3. ~~`Version`~~ - No longer needed! UserDatasets use `organism` attribute instead

**Optional/Conditional:**

- `build_number_introduced` - Only for DataSources (for "NEW" badge)
- `is_public` - Only for UserDatasets (for icon type)
- `description` - Fetched but never used, can omit

**Computed Fields (don't provide):**

- `searches` - Derived from category metadata
- `isPreferred` - Computed from Version table

### DataSource vs UserDataset Field Mapping

| Field                     | DataSource                 | UserDataset                 |
| ------------------------- | -------------------------- | --------------------------- |
| `dataset_name`            | ✓                          | ✓                           |
| `display_name`            | ✓                          | ✓                           |
| `organism_prefix`         | ✓                          | ✓ (can be "Unspecified")    |
| `dataset_id`              | ✓                          | ✓ (format: UUID)            |
| `summary`                 | ✓                          | ✓                           |
| `build_number_introduced` | ✓                          | ✗ (skip)                    |
| `short_attribution`       | ✓                          | ✓                           |
| `publications`            | ✓                          | ✓ (can be empty)            |
| `is_public`               | ✗                          | ✓ (boolean)                 |
| `source`                  | ✓ (computed: 'datasource') | ✓ (computed: 'userdataset') |

---

## Implementation Plan

### Phase 1: Update Type Definitions

**File**: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/questions/InternalGeneDataset.tsx`

**Task 1.1**: Extend `DatasourceRecord` type (around line 72)

```typescript
type DatasourceRecord = {
  dataset_name: string;
  display_name: string;
  organism_prefix: string;
  dataset_id: string;
  summary: string;
  build_number_introduced: string;
  publications: LinkAttributeValue[];
  searches: string;
  isPreferred: boolean;
  source: 'datasource' | 'userdataset'; // NEW
  is_public?: boolean; // NEW - only for userdatasets
};
```

---

### Phase 2: Add State for Source Type Filtering

**Task 2.1**: Add filter state (after line 191)

```typescript
const [showDataSources, setShowDataSources] = useState(true);
const [showPublicUserDatasets, setShowPublicUserDatasets] = useState(true);
const [showPrivateUserDatasets, setShowPrivateUserDatasets] = useState(true);
```

---

### Phase 3: Fetch UserDatasets from Backend

**Task 3.1**: Modify `useWdkService` hook (around lines 140-182)

- Fetch both DataSources and UserDatasets in parallel using `Promise.all()`
- Query: `"UserDatasetsByCategory"` (TBD exact name) with `dataset_category` parameter
- Create separate REPORT_CONFIG for UserDatasets

```typescript
const USERDATASET_REPORT_CONFIG = {
  attributes: [
    'dataset_id',
    'display_name',
    'organism_prefix',
    'organism',
    'summary',
    'short_attribution',
    'is_public',
  ],
  tables: ['ExploreWdkSearches'], // No Publications in Phase 1
  pagination: { offset: 0, numRecords: -1 },
};

const [datasourceAnswer, userdatasetAnswer] = await Promise.all([
  wdkService.getAnswerJson(
    getAnswerSpec(datasetCategory, 'DatasourcesByCategory'),
    DATASOURCE_REPORT_CONFIG // Existing config
  ),
  wdkService.getAnswerJson(
    getAnswerSpec(datasetCategory, 'UserDatasetsByCategory'),
    USERDATASET_REPORT_CONFIG // New config for UserDatasets
  ),
]);
```

**Task 3.2**: Create `getUserDatasetInternalQuestions()` function (parallel to `getInternalQuestions()`)

- Extracts questions from `ExploreWdkSearches` table instead of `References`
- Returns array of UserDataset question records

```typescript
interface UserDatasetQuestionRecord {
  question_name: string; // e.g., "GeneQuestions.GenesByRnaSeqUserDataset"
  dataset_id_param: string; // e.g., "rna_seq_dataset"
  dataset_id: string; // e.g., "EDAUD_53f554ec6a"
  record_type: string; // e.g., "TranscriptRecordClasses.TranscriptRecordClass"
  dataset_name: string; // From parent record attributes
}

function getUserDatasetInternalQuestions(
  records: UserDatasetRecord[]
): UserDatasetQuestionRecord[] {
  return records.flatMap((record) => {
    const exploreSearches = record.tables?.ExploreWdkSearches;

    if (!Array.isArray(exploreSearches)) {
      throw new Error(
        `ExploreWdkSearches table missing for UserDataset ${record.id}`
      );
    }

    return exploreSearches.map((search) => ({
      question_name: search.question_name,
      dataset_id_param: search.dataset_id_param,
      dataset_id: search.dataset_id,
      record_type: search.record_type,
      dataset_name: record.attributes.dataset_name,
    }));
  });
}
```

**Task 3.3**: Create `getUserDatasetRecords()` function (parallel to `getDatasourceRecords()`)

- Maps UserDataset response fields to normalized `DatasourceRecord[]` shape
- Returns records with `source: 'userdataset'`
- Extracts `is_public` field for icon determination
- Sets `build_number_introduced` to empty string (no NEW badge for UDs)
- Uses ExploreWdkSearches instead of References
- **Uses `dataset_id` as `dataset_name`** (UserDatasets have no separate dataset_name)
- Uses `organism` attribute for preference filtering (no Version table)

```typescript
function getUserDatasetRecords(
  records: UserDatasetRecord[],
  internalQuestions: UserDatasetQuestionRecord[],
  questionNamesByDatasetAndCategory: Record<string, Record<string, string>>,
  displayCategoryOrder: string[],
  displayCategoriesByName: Record<string, DisplayCategory>,
  preferredOrganisms: OrganismPreference,
  buildNumber: string
): DatasourceRecord[] {
  // Key differences from getDatasourceRecords:
  // 1. dataset_name = dataset_id (no separate name field)
  // 2. Use organism attribute for isPreferred (not Version table)
  // 3. Extract is_public attribute
  // 4. Set source: 'userdataset'
  // 5. Set build_number_introduced to empty string
  // 6. Set publications to empty array (Phase 1 - no Publications table)
  // 7. Store dataset_id_param for URL generation (varies by category)
}
```

**Task 3.4**: Keep existing `getDatasourceRecords()` function (lines 643-722)

- Add `source: 'datasource'` to returned records
- Otherwise unchanged

**Task 3.5**: Merge normalized record arrays

```typescript
const datasourceRecords = getDatasourceRecords(
  datasourceAnswer.records,
  datasourceInternalQuestions,
  questionNamesByDatasetAndCategory,
  displayCategoryOrder,
  displayCategoriesByName,
  preferredOrganisms,
  buildNumber
);

const userdatasetRecords = getUserDatasetRecords(
  userdatasetAnswer.records,
  userdatasetInternalQuestions,
  questionNamesByDatasetAndCategory,
  displayCategoryOrder,
  displayCategoriesByName,
  preferredOrganisms,
  buildNumber
);

const allRecords = [...datasourceRecords, ...userdatasetRecords];
```

---

### Phase 4: Update Button URL Generation

**Task 4.1**: Update `DatasourceRecord` type to include parameter info

```typescript
type DatasourceRecord = {
  // ... existing fields ...
  source: 'datasource' | 'userdataset';
  is_public?: boolean;
  dataset_id_param?: string; // NEW - only for UserDatasets (e.g., "rna_seq_dataset")
};
```

**Task 4.2**: Create new helper function `getCategorySearchUrl()`

```typescript
function getCategorySearchUrl(
  questionName: string,
  datasetId: string,
  source: 'datasource' | 'userdataset',
  datasetIdParam: string | undefined, // Parameter name for UserDatasets
  internalSearchName: string
): string {
  const baseUrl = `${internalSearchName}#${questionName}`;
  if (source === 'userdataset' && datasetIdParam) {
    // dataset_id already includes EDAUD_ prefix from backend
    return `${baseUrl}?param.${datasetIdParam}=${datasetId}`;
  }
  return baseUrl;
}
```

**Task 4.3**: Update button Link generation (lines 389-410)

- Use new helper to generate URLs
- Pass `source`, `dataset_id`, and `dataset_id_param` from row data

```typescript
renderCell: ({ row }) => {
  const { dataset_name, dataset_id, source, dataset_id_param } = row;
  return displayCategoryOrder.map((categoryName) => {
    const questionName = getCategorySearchName(
      questionNamesByDatasetAndCategory,
      dataset_name,
      categoryName
    );
    if (questionName) {
      const url = getCategorySearchUrl(
        questionName,
        dataset_id,
        source,
        dataset_id_param, // NEW - parameter name for UserDatasets
        internalSearchName
      );
      return (
        <Link key={categoryName} to={url}>
          {displayCategoriesByName[categoryName].shortDisplayName}
        </Link>
      );
    }
  });
};
```

---

### Phase 5: Add Source Type Column with Icons

**Task 5.1**: Add new column definition (as first column, before Organism)

```typescript
{
  key: 'source',
  name: '',  // No header text
  width: '50px',
  sortable: false,
  renderCell: ({ row }) => {
    if (row.source === 'datasource') {
      return <SiteLogo alt="Internal Dataset" />;
    } else if (row.is_public) {
      return <GlobeIcon alt="Public User Dataset" />;
    } else {
      return <LockIcon alt="Private User Dataset" />;
    }
  }
}
```

**Task 5.2**: Implement/find icons

- Research site logo/favicon path (user will provide if needed)
- Implement or import Globe icon component
- Implement or import Lock icon component
- Ensure consistent sizing (e.g., 20x20px or 24x24px)

---

### Phase 6: Add Filter Checkboxes UI

**Task 6.1**: Add filter checkbox section (before table, around line 260)

```typescript
<div className="wdk-InternalGeneDatasetForm__SourceFilters">
  <label>
    <input
      type="checkbox"
      checked={showDataSources}
      onChange={(e) => setShowDataSources(e.target.checked)}
    />
    <SiteLogo /> Internal Datasets
  </label>
  <label>
    <input
      type="checkbox"
      checked={showPublicUserDatasets}
      onChange={(e) => setShowPublicUserDatasets(e.target.checked)}
    />
    <GlobeIcon /> Public User Datasets
  </label>
  <label>
    <input
      type="checkbox"
      checked={showPrivateUserDatasets}
      onChange={(e) => setShowPrivateUserDatasets(e.target.checked)}
    />
    <LockIcon /> Private User Datasets
  </label>
</div>
```

**Task 6.2**: Implement source type filtering

- Update `getFilteredDatasourceRecords()` (lines 550-568) or create wrapper
- Apply filters based on checkbox state

```typescript
const sourceFilteredRecords = allRecords.filter((record) => {
  if (record.source === 'datasource') {
    return showDataSources;
  } else if (record.is_public) {
    return showPublicUserDatasets;
  } else {
    return showPrivateUserDatasets;
  }
});

// Then apply existing organism and other filters
const filteredRecords = getFilteredDatasourceRecords(
  sourceFilteredRecords
  /* other params */
);
```

---

### Phase 7: Update Organism Preference Filtering

**Task 7.1**: Modify organism filtering logic (around line 565)

```typescript
const isPreferredDataset = (record) => {
  // Always show multi-organism or unspecified datasets
  if (
    record.organism_prefix === 'Multiple organisms' ||
    record.organism_prefix === 'Unspecified'
  ) {
    return true;
  }

  // Apply existing organism preference filtering
  return existingIsPreferredLogic(record);
};
```

---

### Phase 8: Handle Dataset Record Links

**Task 8.1**: Update dataset record page links (around line 372)

```typescript
const recordUrl =
  row.source === 'datasource'
    ? `/record/dataset/${dataset_id}`
    : `/record/userdataset/EDAUD_${dataset_id}`;

<Link to={recordUrl}>{safeHtml(display_name)}</Link>;
```

---

### Phase 9: Update Styling

**Task 9.1**: Add SCSS for new UI elements

- File: `InternalGeneDataset.scss`
- Add styles for:
  - `.wdk-InternalGeneDatasetForm__SourceFilters` (filter checkbox section)
  - Source type column (narrow width, centered icons)
  - Icon sizing and alignment
  - Filter checkbox layout and spacing

**Example SCSS**:

```scss
.wdk-InternalGeneDatasetForm__SourceFilters {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  padding: 0.5rem;

  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;

    input[type='checkbox'] {
      margin-right: 0.25rem;
    }

    svg,
    img {
      width: 20px;
      height: 20px;
    }
  }
}

// Source column icon styling
.source-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  svg,
  img {
    width: 20px;
    height: 20px;
  }
}
```

---

### Phase 10: Testing & Edge Cases

**Task 10.1**: Test scenarios

- Page with only DataSources (no UserDatasets)
- Page with only UserDatasets (no DataSources)
- Mixed datasets
- All filter combinations (8 total: 2^3)
- Organism preference filtering with multi-organism datasets
- Button clicks for both source types (verify URL parameters)
- Dataset record page links for both types
- Empty states and warnings

**Task 10.2**: Handle empty states

- No datasets match category
- No datasets match filters
- Update warning messages (e.g., OrganismPreferencesWarning)

---

### Phase 11: Documentation & Cleanup

**Task 11.1**: Update this planning document with:

- Final implementation decisions
- Any deviations from plan
- Technical debt or future improvements

**Task 11.2**: Code comments

- Document the source type filtering logic
- Explain UserDataset parameter passing pattern
- Note any complex transformations

---

## Key Technical Details

### WDK Questions

- **DataSources**: `"DatasourcesByCategory"`
- **UserDatasets**: `"UserDatasetsByCategory"`
- Both use same `dataset_category` parameter

### UserDataset ID Formats

- **VDI ID**: Plain UUID (e.g., `abc123def456`)
- **WDK Record ID**: Prefixed with `EDAUD_` (e.g., `EDAUD_abc123def456`)
- Use `EDAUD_` prefix for:
  - Record page URLs: `/record/userdataset/EDAUD_{id}`
  - Question parameters: `?param.dataset_id=EDAUD_{id}`

### Question URL Patterns

- **DataSources**: `{internalSearchName}#{datasetSpecificQuestionName}`
  - Example: `GenesByRnaSeq#GenesByRnaSeq_RSRC123_DifferentialExpression`
- **UserDatasets**: `{internalSearchName}#{genericQuestionName}?param.dataset_id={wdkId}`
  - Example: `GenesByRnaSeq#GenesByUserDataset_DifferentialExpression?param.dataset_id=EDAUD_abc123`

### Generic Questions

- Pattern: `GenesByUserDataset_{SearchCategory}`
- Examples:
  - `GenesByUserDataset_DifferentialExpression`
  - `GenesByUserDataset_FoldChange`
  - `GenesByUserDataset_WGCNA`

### Categories

- **Dataset Categories**: RNA-Seq, Phenotype, etc. (determines which internal question page)
- **Search Categories**: Fold Change, Differential Expression, etc. (determines button types)
- UserDatasets use same categories as DataSources for both

### Organism Prefix Special Values

- Specific organism: `<i>Eimeria media</i> PL19_A22` (HTML formatted)
- Multi-organism: `Multiple organisms`
- Unknown organism: `Unspecified`
- Multi-organism and Unspecified datasets bypass organism preference filtering

---

## Dependencies/Unknowns

### Backend Structure - CONFIRMED ✓

1. ✓ **ExploreWdkSearches table** - Confirmed structure with question_name, dataset_id_param, dataset_id, record_type
2. ✓ **Generic questions** - Question names are generic (e.g., GenesByRnaSeqUserDataset), not dataset-specific
3. ✓ **Parameter passing** - Uses dataset_id_param field to specify which parameter name
4. ✓ **dataset_id format** - Already includes EDAUD\_ prefix in response
5. ✓ **One row per search type** - Multiple rows with duplicated dataset_id (it's the PK)

### Still To Confirm with Backend

1. **UserDatasetsByCategory question name** - Exact WDK question name
2. **REPORT_CONFIG for UserDatasets** - Which attributes and tables to request
3. **Attribute field names** - Exact names for display_name, organism_prefix, summary, etc.
4. **is_public field location** - Which attribute contains this boolean
5. **Version table structure** - Confirm organism field exists for preference filtering
6. **Publications table structure** - Confirm same structure as DataSources

### To Resolve (Frontend)

1. **Site logo/favicon path** - User will provide
2. **Icon library** - Determine if globe/lock icons exist or need creation
3. ~~**Parameter name**~~ - ✓ Confirmed: parameter names vary per question type (dataset_id_param field)

### Design Decisions Made

- ✓ **Separate processing functions** - Not forcing UDs into same backend API as DataSources
- ✓ **Client-side normalization** - Two functions return common `DatasourceRecord` shape
- ✓ **Backend independence** - UD structure can evolve without affecting DataSource code
- ✓ **Version table required** - Provides clean organism strings for matching (not HTML formatted)
