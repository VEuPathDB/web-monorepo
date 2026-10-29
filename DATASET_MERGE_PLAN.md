# Plan: Merge Datasets and User Datasets into Single Table

## Overview

Integrate the two separate tables (`/search/dataset/AllDatasets/result` and `/search/userdataset/AllUserDatasets/result`) into a single unified table that displays both Internal/Public Datasets and Private User Datasets together.

## Key Findings from Investigation

### WDK Result Table Architecture

1. **Data Flow**: Route → AnswerController → loadAnswer action → getAnswerJson API call → Answer view
2. **Sorting**: Client-side only using `lodash.orderBy()` - no backend request on sort change
3. **Attribute Requests**: Uses `name` field (not `displayName`) when requesting columns from backend
4. **Merging Feasibility**: ✅ Fully supported - records are just arrays of `RecordInstance` objects

### Current Implementation

- Both routes use standard `AnswerController`
- Each makes separate backend request to WDK
- Sorting happens client-side on fetched records (up to 4000 max)
- No pagination in these tables

## Architecture Approach

### Metadata-Driven Attribute Harmonization

**Key Innovation**: Use `displayName` as the universal key to harmonize attributes across Dataset and UserDataset record types.

**Assumptions**:

- ✅ Backend ensures `displayName` values match for semantically equivalent attributes (being handled in separate backend work)
- ✅ Partial overlap is expected - some attributes exist only for one record type
- ✅ Both record types may have different native attribute `name` values, but matching `displayName` values
- ✅ Non-`internal` attributes from both types form the union of available columns

### Client-Side Merge Strategy

- **Fetch metadata** for both record classes to discover all available attributes
- **Build harmonized attribute map** keyed by `displayName`
- **Two parallel WDK backend requests** (one for each dataset type, using appropriate native attribute names)
- **Normalize records** to use `displayName` as attribute keys
- **Merge normalized records** into single array
- **Leverage existing client-side sorting** (no backend changes needed)
- **Add source type filtering** (Internal/Public vs Private checkboxes)
- **Download strategy**: Single download button triggers two parallel backend downloads (one CSV per dataset type)

### Why This Works

- WDK table components accept any array of `RecordInstance` objects
- Client-side `orderBy()` automatically handles merged arrays
- Existing component wrapper pattern supports this (see preferred organisms filtering)
- Metadata-driven approach is robust to backend attribute name differences
- Add Columns UI driven by harmonized metadata (union of all non-internal attributes)

## Implementation Steps

### 1. Fetch and Harmonize Attribute Metadata

**First step in the custom wrapper**: Discover and harmonize attributes from both record classes.

```typescript
// Fetch record class metadata
const [datasetRecordClass, userDatasetRecordClass] = await Promise.all([
  wdkService.findRecordClass('dataset'),
  wdkService.findRecordClass('userdataset'),
]);

// Build harmonized attribute map (keyed by displayName)
const harmonizedAttributes = harmonizeAttributes(
  datasetRecordClass.attributes,
  userDatasetRecordClass.attributes
);
```

**Harmonization Algorithm**:

```typescript
function harmonizeAttributes(
  datasetAttrs: AttributeField[],
  userDatasetAttrs: AttributeField[]
): HarmonizedAttribute[] {
  const map = new Map<string, HarmonizedAttribute>();

  // Process Dataset attributes (exclude internal)
  datasetAttrs
    .filter((attr) => !attr.isInternal)
    .forEach((attr) => {
      map.set(attr.displayName, {
        displayName: attr.displayName,
        datasetAttrName: attr.name,
        userDatasetAttrName: null,
        metadata: attr, // isSortable, type, help, etc.
      });
    });

  // Process UserDataset attributes (exclude internal)
  userDatasetAttrs
    .filter((attr) => !attr.isInternal)
    .forEach((attr) => {
      if (map.has(attr.displayName)) {
        // Overlapping attribute - add UserDataset's native name
        const existing = map.get(attr.displayName)!;
        existing.userDatasetAttrName = attr.name;
        // Optionally merge metadata (prefer one or merge properties)
      } else {
        // Unique to UserDataset
        map.set(attr.displayName, {
          displayName: attr.displayName,
          datasetAttrName: null,
          userDatasetAttrName: attr.name,
          metadata: attr,
        });
      }
    });

  return Array.from(map.values());
}

interface HarmonizedAttribute {
  displayName: string; // Universal key
  datasetAttrName: string | null; // Native name in Dataset
  userDatasetAttrName: string | null; // Native name in UserDataset
  metadata: AttributeField; // isSortable, type, help, etc.
}
```

### 2. Determine Default Visible Attributes

**Strategy**: Union of both questions' `defaultAttributes`

Each WDK Question defines which attributes should be visible by default via `question.defaultAttributes`. To create a sensible default for the merged view, we take the union of both questions' defaults:

```typescript
function getDefaultVisibleAttributes(
  datasetQuestion: Question,
  userDatasetQuestion: Question,
  datasetRecordClass: RecordClass,
  userDatasetRecordClass: RecordClass,
  harmonizedAttributes: HarmonizedAttribute[]
): string[] {
  // 1. Get each question's defaultAttributes (native names)
  // 2. Resolve to displayNames
  // 3. Union the displayName sets
  // 4. Filter to harmonized attributes only

  const datasetDefaultDisplayNames = datasetQuestion.defaultAttributes
    .map((name) => datasetRecordClass.attributesMap[name]?.displayName)
    .filter(Boolean);

  const userDatasetDefaultDisplayNames = userDatasetQuestion.defaultAttributes
    .map((name) => userDatasetRecordClass.attributesMap[name]?.displayName)
    .filter(Boolean);

  return Array.from(
    new Set([...datasetDefaultDisplayNames, ...userDatasetDefaultDisplayNames])
  );
}
```

**Why this approach:**

- Preserves intent of each question's default column selection
- Users see familiar columns from both dataset types
- Can be overridden by user preferences (standard WDK behavior)

### 3. Request Data with Native Attribute Names

**Build separate attribute lists** for each backend request:

**Important**: We request ALL harmonized attributes (not just defaults) so users can add any column via "Add Columns" UI. The defaults only control initial visibility.

```typescript
// Extract native attribute names for each record type
const datasetAttrNames = harmonizedAttributes
  .map((a) => a.datasetAttrName)
  .filter((name): name is string => name !== null);

const userDatasetAttrNames = harmonizedAttributes
  .map((a) => a.userDatasetAttrName)
  .filter((name): name is string => name !== null);

// Fetch both in parallel with appropriate native names
const [datasetsAnswer, userDatasetsAnswer] = await Promise.all([
  wdkService.getAnswerJson(
    { searchName: 'AllDatasets', searchConfig: { parameters: {} } },
    {
      attributes: datasetAttrNames, // Native Dataset attribute names
      tables: [],
      pagination: { offset: 0, numRecords: 4000 },
      sorting: props.stateProps.displayInfo?.sorting || [],
    }
  ),
  wdkService
    .getAnswerJson(
      { searchName: 'AllUserDatasets', searchConfig: { parameters: {} } },
      {
        attributes: userDatasetAttrNames, // Native UserDataset attribute names
        tables: [],
        pagination: { offset: 0, numRecords: 4000 },
        sorting: props.stateProps.displayInfo?.sorting || [],
      }
    )
    .catch((err) => {
      // Handle unauthenticated users
      console.warn('Failed to fetch user datasets:', err);
      return { records: [], meta: { totalCount: 0 } };
    }),
]);
```

### 4. Normalize Records to Use displayName Keys

**Transform records** so all use `displayName` as attribute keys:

```typescript
function normalizeRecords(
  records: RecordInstance[],
  harmonizedAttrs: HarmonizedAttribute[],
  sourceType: 'dataset' | 'userdataset'
): NormalizedRecord[] {
  return records.map((record) => {
    const normalizedAttributes: Record<string, any> = {};

    harmonizedAttrs.forEach((attr) => {
      // Get the native attribute name for this source type
      const sourceAttrName =
        sourceType === 'dataset'
          ? attr.datasetAttrName
          : attr.userDatasetAttrName;

      // Use displayName as the key in normalized record
      normalizedAttributes[attr.displayName] = sourceAttrName
        ? record.attributes[sourceAttrName]
        : null; // Attribute doesn't exist for this record type
    });

    return {
      ...record,
      attributes: normalizedAttributes,
      dataset_source: sourceType === 'dataset' ? 'public' : 'private',
    };
  });
}

const normalizedDatasets = normalizeRecords(
  datasetsAnswer.records,
  harmonizedAttributes,
  'dataset'
);

const normalizedUserDatasets = normalizeRecords(
  userDatasetsAnswer.records,
  harmonizedAttributes,
  'userdataset'
);
```

### 5. Merge and Filter

**Combine normalized records** and apply source filtering:

```typescript
// Merge
const mergedRecords = [...normalizedDatasets, ...normalizedUserDatasets];

// Filter by source type
const [showPublic, setShowPublic] = useState(true);
const [showPrivate, setShowPrivate] = useState(true);

const filteredRecords = useMemo(() => {
  return mergedRecords.filter((record) => {
    const source = record.dataset_source;
    if (source === 'private' && !showPrivate) return false;
    if (source === 'public' && !showPublic) return false;
    return true;
  });
}, [mergedRecords, showPublic, showPrivate]);
```

### 6. Create Custom AnswerController Wrapper

**File**: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/component-wrappers/AllDatasetsAnswerController.tsx` (new file)

**Full Implementation**:

```typescript
import { useMemo, useState, useEffect } from 'react';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import {
  AttributeField,
  RecordInstance,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';

interface HarmonizedAttribute {
  displayName: string;
  datasetAttrName: string | null;
  userDatasetAttrName: string | null;
  metadata: AttributeField;
}

interface NormalizedRecord extends RecordInstance {
  dataset_source: 'public' | 'private';
}

export function AllDatasetsAnswerController(DefaultComponent) {
  return function MergedDatasetsAnswer(props) {
    const [mergedState, setMergedState] = useState<{
      records: NormalizedRecord[];
      harmonizedAttributes: HarmonizedAttribute[];
      datasetAttrNames: string[];
      userDatasetAttrNames: string[];
      defaultVisibleDisplayNames: string[];
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showPublic, setShowPublic] = useState(true);
    const [showPrivate, setShowPrivate] = useState(true);
    const wdkService = useWdkService();

    useEffect(() => {
      async function fetchAndMerge() {
        setIsLoading(true);

        try {
          // 1. Fetch metadata (record classes and questions)
          const [
            datasetRecordClass,
            userDatasetRecordClass,
            datasetQuestion,
            userDatasetQuestion,
          ] = await Promise.all([
            wdkService.findRecordClass('dataset'),
            wdkService.findRecordClass('userdataset'),
            wdkService.findQuestion('AllDatasets'),
            wdkService.findQuestion('AllUserDatasets'),
          ]);

          // 2. Harmonize attributes by displayName
          const harmonizedAttributes = harmonizeAttributes(
            datasetRecordClass.attributes,
            userDatasetRecordClass.attributes
          );

          // 3. Determine default visible attributes (union of both question defaults)
          const defaultVisibleDisplayNames = getDefaultVisibleAttributes(
            datasetQuestion,
            userDatasetQuestion,
            datasetRecordClass,
            userDatasetRecordClass,
            harmonizedAttributes
          );

          // 4. Build attribute name lists for each request
          // For data fetching, request ALL harmonized attributes (not just defaults)
          const datasetAttrNames = harmonizedAttributes
            .map((a) => a.datasetAttrName)
            .filter((name): name is string => name !== null);

          const userDatasetAttrNames = harmonizedAttributes
            .map((a) => a.userDatasetAttrName)
            .filter((name): name is string => name !== null);

          // 5. Fetch data in parallel
          const reportConfig = {
            tables: [],
            pagination: { offset: 0, numRecords: 4000 },
            sorting: props.stateProps.displayInfo?.sorting || [],
          };

          const [datasetsAnswer, userDatasetsAnswer] = await Promise.all([
            wdkService.getAnswerJson(
              { searchName: 'AllDatasets', searchConfig: { parameters: {} } },
              { ...reportConfig, attributes: datasetAttrNames }
            ),
            wdkService
              .getAnswerJson(
                {
                  searchName: 'AllUserDatasets',
                  searchConfig: { parameters: {} },
                },
                { ...reportConfig, attributes: userDatasetAttrNames }
              )
              .catch((err) => {
                console.warn('Failed to fetch user datasets:', err);
                return { records: [], meta: { totalCount: 0 } };
              }),
          ]);

          // 6. Normalize records
          const normalizedDatasets = normalizeRecords(
            datasetsAnswer.records,
            harmonizedAttributes,
            'dataset'
          );

          const normalizedUserDatasets = normalizeRecords(
            userDatasetsAnswer.records,
            harmonizedAttributes,
            'userdataset'
          );

          // 7. Merge
          const mergedRecords = [
            ...normalizedDatasets,
            ...normalizedUserDatasets,
          ];

          setMergedState({
            records: mergedRecords,
            harmonizedAttributes,
            datasetAttrNames,
            userDatasetAttrNames,
            defaultVisibleDisplayNames,
          });
        } catch (error) {
          console.error('Error fetching/merging datasets:', error);
          // Handle error state
        } finally {
          setIsLoading(false);
        }
      }

      fetchAndMerge();
    }, [wdkService, props.stateProps.displayInfo]);

    // Filter by source type
    const filteredRecords = useMemo(() => {
      if (!mergedState) return [];
      return mergedState.records.filter((record) => {
        const source = record.dataset_source;
        if (source === 'private' && !showPrivate) return false;
        if (source === 'public' && !showPublic) return false;
        return true;
      });
    }, [mergedState, showPublic, showPrivate]);

    // Download handler - triggers two parallel backend downloads
    const handleDownload = useCallback(async () => {
      if (!mergedState) return;

      const downloadConfig = {
        format: 'attributesTabular',
        formatConfig: {
          attachmentType: 'csv',
          pagination: { offset: 0, numRecords: -1 },
          sorting: [],
        },
      };

      // Download both datasets in parallel (regardless of checkbox state)
      // This matches WDK behavior where client-side filters don't affect downloads
      await Promise.all([
        wdkService.downloadAnswer(
          { searchName: 'AllDatasets', searchConfig: { parameters: {} } },
          {
            ...downloadConfig,
            formatConfig: {
              ...downloadConfig.formatConfig,
              attributes: mergedState.datasetAttrNames,
            },
          }
        ),
        wdkService.downloadAnswer(
          { searchName: 'AllUserDatasets', searchConfig: { parameters: {} } },
          {
            ...downloadConfig,
            formatConfig: {
              ...downloadConfig.formatConfig,
              attributes: mergedState.userDatasetAttrNames,
            },
          }
        ),
      ]);
    }, [mergedState, wdkService]);

    if (isLoading || !mergedState) {
      return <Loading />;
    }

    return (
      <>
        <div className="dataset-source-filters">
          <label>
            <input
              type="checkbox"
              checked={showPublic}
              onChange={(e) => setShowPublic(e.target.checked)}
            />
            Show Internal/Public Datasets
          </label>
          <label>
            <input
              type="checkbox"
              checked={showPrivate}
              onChange={(e) => setShowPrivate(e.target.checked)}
            />
            Show Private Datasets
          </label>
          <button onClick={handleDownload}>Download All Datasets (CSV)</button>
        </div>
        <DefaultComponent
          {...props}
          stateProps={{
            ...props.stateProps,
            records: filteredRecords,
            allAttributes: mergedState.harmonizedAttributes.map(
              (a) => a.metadata
            ),
            visibleAttributes: mergedState.harmonizedAttributes
              .filter((a) =>
                mergedState.defaultVisibleDisplayNames.includes(a.displayName)
              )
              .map((a) => a.metadata),
            meta: {
              ...props.stateProps.meta,
              totalCount: filteredRecords.length,
              responseCount: filteredRecords.length,
            },
          }}
        />
      </>
    );
  };
}

// Helper functions

/**
 * Determine default visible attributes by taking union of both question defaults.
 * 1. Get each question's defaultAttributes (native attribute names)
 * 2. Resolve to displayNames using harmonized metadata
 * 3. Union the displayName sets
 * 4. Result is used to set initial visible columns
 */
function getDefaultVisibleAttributes(
  datasetQuestion: Question,
  userDatasetQuestion: Question,
  datasetRecordClass: RecordClass,
  userDatasetRecordClass: RecordClass,
  harmonizedAttributes: HarmonizedAttribute[]
): string[] {
  // Build lookup maps: native name → displayName
  const datasetNameToDisplay = new Map<string, string>();
  datasetRecordClass.attributes.forEach((attr) => {
    datasetNameToDisplay.set(attr.name, attr.displayName);
  });

  const userDatasetNameToDisplay = new Map<string, string>();
  userDatasetRecordClass.attributes.forEach((attr) => {
    userDatasetNameToDisplay.set(attr.name, attr.displayName);
  });

  // Convert default attributes to displayNames
  const datasetDefaultDisplayNames = datasetQuestion.defaultAttributes
    .map((name) => datasetNameToDisplay.get(name))
    .filter((displayName): displayName is string => displayName !== undefined);

  const userDatasetDefaultDisplayNames = userDatasetQuestion.defaultAttributes
    .map((name) => userDatasetNameToDisplay.get(name))
    .filter((displayName): displayName is string => displayName !== undefined);

  // Union of displayNames
  const unionDisplayNames = Array.from(
    new Set([...datasetDefaultDisplayNames, ...userDatasetDefaultDisplayNames])
  );

  // Filter to only those that exist in harmonized attributes
  return unionDisplayNames.filter((displayName) =>
    harmonizedAttributes.some((attr) => attr.displayName === displayName)
  );
}

function harmonizeAttributes(
  datasetAttrs: AttributeField[],
  userDatasetAttrs: AttributeField[]
): HarmonizedAttribute[] {
  const map = new Map<string, HarmonizedAttribute>();

  datasetAttrs
    .filter((attr) => !attr.isInternal)
    .forEach((attr) => {
      map.set(attr.displayName, {
        displayName: attr.displayName,
        datasetAttrName: attr.name,
        userDatasetAttrName: null,
        metadata: attr,
      });
    });

  userDatasetAttrs
    .filter((attr) => !attr.isInternal)
    .forEach((attr) => {
      if (map.has(attr.displayName)) {
        const existing = map.get(attr.displayName)!;
        existing.userDatasetAttrName = attr.name;
      } else {
        map.set(attr.displayName, {
          displayName: attr.displayName,
          datasetAttrName: null,
          userDatasetAttrName: attr.name,
          metadata: attr,
        });
      }
    });

  return Array.from(map.values());
}

function normalizeRecords(
  records: RecordInstance[],
  harmonizedAttrs: HarmonizedAttribute[],
  sourceType: 'dataset' | 'userdataset'
): NormalizedRecord[] {
  return records.map((record) => {
    const normalizedAttributes: Record<string, any> = {};

    harmonizedAttrs.forEach((attr) => {
      const sourceAttrName =
        sourceType === 'dataset'
          ? attr.datasetAttrName
          : attr.userDatasetAttrName;

      normalizedAttributes[attr.displayName] = sourceAttrName
        ? record.attributes[sourceAttrName]
        : null;
    });

    return {
      ...record,
      attributes: normalizedAttributes,
      dataset_source: sourceType === 'dataset' ? 'public' : 'private',
    };
  });
}
```

### 7. Update Add Columns UI

**Override `allAttributes`** to use harmonized metadata:

The wrapper passes `harmonizedAttributes.map(a => a.metadata)` as `allAttributes`, ensuring the Add Columns UI shows the union of all non-internal attributes from both record types.

Users can select attributes that exist for only one record type - those records will show null/empty values for missing attributes.

### 8. Register the Custom Wrapper

**File**: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/component-wrappers/index.ts`

```typescript
export { AllDatasetsAnswerController } from './AllDatasetsAnswerController';
```

**File**: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/routes.jsx`

```javascript
import { AllDatasetsAnswerController } from './component-wrappers';

{
  path: '/search/dataset/AllDatasets/result',
  requiresLogin: false,
  component: makeAnswerControllerRouteComponent({
    recordClass: 'dataset',
    question: 'AllDatasets',
  }, AllDatasetsAnswerController), // ← Add custom wrapper
}
```

### 9. Implement Download Functionality

**Download Strategy**: Single download button triggers two parallel backend downloads (one CSV file per dataset type).

**Key Decision**: Like existing WDK behavior where client-side text filters don't affect downloads, the Public/Private checkboxes will NOT affect downloads. Downloads always return the full result set from both questions.

**Implementation** (already included in wrapper code above):

```typescript
const handleDownload = useCallback(async () => {
  const downloadConfig = {
    format: 'attributesTabular',
    formatConfig: {
      attachmentType: 'csv',
      pagination: { offset: 0, numRecords: -1 }, // All records
      sorting: [],
    },
  };

  // Download both datasets in parallel
  await Promise.all([
    wdkService.downloadAnswer(
      { searchName: 'AllDatasets', searchConfig: { parameters: {} } },
      {
        ...downloadConfig,
        formatConfig: {
          ...downloadConfig.formatConfig,
          attributes: datasetAttrNames,
        },
      }
    ),
    wdkService.downloadAnswer(
      { searchName: 'AllUserDatasets', searchConfig: { parameters: {} } },
      {
        ...downloadConfig,
        formatConfig: {
          ...downloadConfig.formatConfig,
          attributes: userDatasetAttrNames,
        },
      }
    ),
  ]);
}, [mergedState, wdkService]);
```

**Result**:

- User clicks "Download All Datasets (CSV)" button once
- Browser downloads two files:
  - `AllDatasets.csv` (public/internal datasets with proper backend transformations)
  - `AllUserDatasets.csv` (private datasets with proper backend transformations)
- Browser may show "Allow multiple downloads?" permission prompt on first use

**Why This Approach:**

- ✅ Preserves all backend download transformations (link columns → IDs, special formatting, etc.)
- ✅ Consistent with existing WDK behavior (client filters don't affect downloads)
- ✅ No backend changes required
- ✅ Simple to implement and understand
- ✅ Can evolve to single merged file later if needed (via custom backend reporter)

### 9. Handle Edge Cases

**Loading State**:

- Show loading spinner while fetching metadata and data
- Use `useState` to track loading state

**Error Handling**:

- Catch errors from user datasets request (user not logged in)
- Gracefully degrade to showing only public datasets
- Log warnings for debugging

**Empty States**:

- No public datasets: Show message + user datasets only
- No user datasets: Show public datasets only
- Neither: Show "No datasets found" message

**Unauthenticated Users**:

- User datasets request will fail with 401/403
- Catch error and continue with empty user datasets array
- Optionally hide "Show Private Datasets" checkbox for logged-out users
- Download button should still work (will only download public datasets)

**Null Attributes**:

- Some records will have null values for attributes that don't exist for that type
- Table cells should handle null gracefully (show empty or "-")

**Download Edge Cases**:

- Browser may block multiple simultaneous downloads - user may need to allow
- If user has no private datasets, second download may fail gracefully or return empty file
- Provide user feedback while downloads are processing (loading state/spinner)

### 10. Update Navigation/Links

- Keep `/search/dataset/AllDatasets/result` as the main route
- Deprecate `/search/userdataset/AllUserDatasets/result` (or redirect to merged view)
- Update any internal links to point to the unified table

### 11. Testing Checklist

**Functionality**:

- [ ] Both dataset types load and display correctly
- [ ] Source type filtering works (checkboxes toggle visibility)
- [ ] Sorting works correctly on merged results
- [ ] Column headers show correct displayNames (from harmonized metadata)
- [ ] Record details/links work for both types
- [ ] Add Columns UI shows union of all attributes
- [ ] Null values handled gracefully for attributes that don't exist for a record type
- [ ] Download button triggers two parallel downloads
- [ ] Download returns full result sets (ignores checkbox filters)
- [ ] Downloaded CSV files have proper backend transformations applied

**User States**:

- [ ] Logged in user with private datasets
- [ ] Logged in user without private datasets
- [ ] Unauthenticated user (should see public datasets only)

**Edge Cases**:

- [ ] No public datasets available
- [ ] No private datasets available
- [ ] Neither dataset type available
- [ ] Network errors on one or both requests
- [ ] Attributes unique to one record type (some records show null)

**Performance**:

- [ ] Parallel fetching works (not sequential)
- [ ] No unnecessary re-fetching on component updates
- [ ] Sorting performance acceptable with merged dataset
- [ ] Metadata fetching doesn't noticeably delay initial load

**Metadata Harmonization**:

- [ ] Verify displayName matching works correctly
- [ ] Verify non-internal attributes are included
- [ ] Verify internal attributes are excluded
- [ ] Test with attributes unique to each record type

## Technical Details

### Attribute Harmonization Example

**Dataset attributes:**

```javascript
[
  { name: 'dataset_id', displayName: 'Dataset ID', isInternal: false },
  { name: 'dataset_name', displayName: 'Name', isInternal: false },
  { name: 'organism', displayName: 'Organism', isInternal: false },
  { name: 'build_number', displayName: 'Build', isInternal: true }, // excluded
];
```

**UserDataset attributes:**

```javascript
[
  { name: 'user_dataset_id', displayName: 'Dataset ID', isInternal: false },
  { name: 'name', displayName: 'Name', isInternal: false },
  { name: 'owner', displayName: 'Owner', isInternal: false },
  { name: 'created_time', displayName: 'Created', isInternal: false },
];
```

**Harmonized result:**

```javascript
[
  {
    displayName: 'Dataset ID',
    datasetAttrName: 'dataset_id',
    userDatasetAttrName: 'user_dataset_id',
    metadata: { ... }  // from Dataset or UserDataset
  },
  {
    displayName: 'Name',
    datasetAttrName: 'dataset_name',
    userDatasetAttrName: 'name',
    metadata: { ... }
  },
  {
    displayName: 'Organism',
    datasetAttrName: 'organism',
    userDatasetAttrName: null,  // Only in Dataset
    metadata: { ... }
  },
  {
    displayName: 'Owner',
    datasetAttrName: null,  // Only in UserDataset
    userDatasetAttrName: 'owner',
    metadata: { ... }
  },
  {
    displayName: 'Created',
    datasetAttrName: null,
    userDatasetAttrName: 'created_time',
    metadata: { ... }
  }
  // 'Build' excluded (isInternal: true)
]
```

### Request Pattern with Native Names

```typescript
// Dataset request uses native Dataset attribute names
wdkService.getAnswerJson(
  { searchName: 'AllDatasets', ... },
  { attributes: ['dataset_id', 'dataset_name', 'organism'], ... }
)

// UserDataset request uses native UserDataset attribute names
wdkService.getAnswerJson(
  { searchName: 'AllUserDatasets', ... },
  { attributes: ['user_dataset_id', 'name', 'owner', 'created_time'], ... }
)
```

### Record Normalization Example

**Raw Dataset record:**

```javascript
{
  attributes: {
    dataset_id: 'DS001',
    dataset_name: 'My Dataset',
    organism: 'Plasmodium'
  }
}
```

**Normalized Dataset record:**

```javascript
{
  attributes: {
    'Dataset ID': 'DS001',
    'Name': 'My Dataset',
    'Organism': 'Plasmodium',
    'Owner': null,      // Doesn't exist for Dataset
    'Created': null     // Doesn't exist for Dataset
  },
  dataset_source: 'public'
}
```

**Raw UserDataset record:**

```javascript
{
  attributes: {
    user_dataset_id: 'UD001',
    name: 'My Upload',
    owner: 'user@example.com',
    created_time: '2025-01-15'
  }
}
```

**Normalized UserDataset record:**

```javascript
{
  attributes: {
    'Dataset ID': 'UD001',
    'Name': 'My Upload',
    'Organism': null,   // Doesn't exist for UserDataset
    'Owner': 'user@example.com',
    'Created': '2025-01-15'
  },
  dataset_source: 'private'
}
```

### Sorting Behavior

- User clicks column header → `changeSorting()` action → Redux state update
- Component re-renders → `useMemo()` recalculates → `orderBy(normalizedRecords, ...)`
- Sorting uses `displayName` keys (e.g., 'Name', 'Dataset ID')
- No backend request triggered
- Works seamlessly with merged arrays
- Null values sorted appropriately (typically to end)

## Files to Create/Modify

### New Files

- `packages/sites/genomics-site/webapp/wdkCustomization/js/client/component-wrappers/AllDatasetsAnswerController.tsx`

### Modified Files

- `packages/sites/genomics-site/webapp/wdkCustomization/js/client/component-wrappers/index.ts` - Export new wrapper
- `packages/sites/genomics-site/webapp/wdkCustomization/js/client/routes.jsx` - Register wrapper for route

### Optional Files (if needed)

- CSS for filter checkbox styling
- Shared types file if TypeScript interfaces need to be reused

## Key Assumptions

1. ✅ **Backend ensures displayName harmony**: Semantically equivalent attributes have matching `displayName` values (being handled in separate backend work)
2. ✅ **Partial overlap is acceptable**: Some attributes exist for only one record type
3. ✅ **Non-internal attributes only**: `isInternal` flag correctly identifies internal attributes to exclude
4. ✅ **Client-side sorting is sufficient**: No pagination means all records fit in memory
5. ✅ **Null values are acceptable**: Table can display null/empty for missing attributes

## Questions to Resolve

1. **Filter UI/UX**:

   - Checkboxes vs radio buttons vs dropdown vs tabs?
   - Default filter state (both on? just public?)
   - Where to position filter controls (above table? in header?)

2. **Unauthenticated Users**:

   - Hide Private filter entirely?
   - Show grayed out with tooltip?
   - Show with login prompt?

3. **Error Messaging**:

   - What message to show if public datasets fail to load?
   - What message for private datasets failure?
   - Silent fail vs user notification?

4. **Source Indicator**:

   - Add a visual indicator in the table (icon/badge)?
   - Add a dedicated "Source" column?
   - Only show in tooltip/details?

5. **Null Value Display**:

   - How to display null values for missing attributes?
   - Show "-" or empty cell or "N/A"?

6. **Metadata Conflicts**:
   - If same displayName has different metadata (isSortable, type) between record classes, which wins?
   - Merge properties or prefer one?

## Success Criteria

✅ Single table displays both public and private datasets
✅ Sorting works correctly across merged results (including null values)
✅ Filtering by source type works
✅ Unauthenticated users see public datasets only
✅ Add Columns UI shows union of all non-internal attributes
✅ Records gracefully handle null values for missing attributes
✅ Performance is acceptable (< 3s load time including metadata fetch)
✅ All existing dataset functionality preserved
✅ displayName-based harmonization works correctly

## Risks & Mitigations

**Risk**: displayName values don't match between semantically equivalent attributes
**Mitigation**: Backend team ensures displayName harmony (prerequisite)

**Risk**: Metadata conflicts (same displayName, different isSortable/type)
**Mitigation**: Define merge strategy (prefer one, merge properties, or log warning)

**Risk**: Performance degradation with metadata fetching
**Mitigation**: Metadata is fetched once and cached; minimal overhead

**Risk**: User datasets request fails for authenticated users
**Mitigation**: Catch error and continue with public datasets only; log warning

**Risk**: Breaking existing links/bookmarks
**Mitigation**: Keep same route path `/search/dataset/AllDatasets/result`

**Risk**: Null values cause sorting/rendering issues
**Mitigation**: Test thoroughly; ensure table and sorting handle nulls gracefully

## Future Enhancements

- Backend WDK question that unions both result sets (cleaner but requires backend changes)
- Pagination support if dataset count exceeds 4000
- Search/filter within merged results
- Export functionality for merged dataset
- Saved filter preferences (remember checkbox state)
- Visual indicators for attributes that are null (tooltip explaining why)
- Caching of harmonized metadata to avoid re-fetching
