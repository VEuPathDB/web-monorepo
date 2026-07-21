# UserDataset Integration Plan for InternalGeneDataset.tsx

## Status

**Phase 1 Implementation** - Backend structure fully confirmed, ready to implement

**Date**: 2026-07-19

---

## Overview

Integrate UserDatasets (user-uploaded data) alongside DataSources (curated data) in the InternalGeneDataset component. Display both in a unified table with source type filtering and appropriate visual distinctions.

**Component**: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/questions/InternalGeneDataset.tsx`

---

## Phase 1 Scope

**Includes:**

- Display UserDatasets and DataSources in same table
- Source type icons (Internal/Public UD/Private UD) and filtering
- Button generation with parameterized URLs
- Basic metadata display

**Excludes (Phase 2):**

- Publications table for UserDatasets

---

## Architecture Decisions

### Separate Processing Functions

UserDatasets and DataSources use **separate processing functions** for maintainability and flexibility:

- `getDatasourceRecords()` - Processes DataSource responses (References table)
- `getUserDatasetRecords()` - Processes UserDataset responses (ExploreWebsiteSearches table)
- Both return normalized `DatasourceRecord[]` shape
- Merge results client-side

### Key Differences: DataSources vs UserDatasets

| Aspect            | DataSources                                              | UserDatasets                                                    |
| ----------------- | -------------------------------------------------------- | --------------------------------------------------------------- |
| **Backend Table** | `References`                                             | `ExploreWebsiteSearches`                                        |
| **Questions**     | Dataset-specific (e.g., `GenesByRnaSeq_RSRC123_DiffExp`) | Generic (e.g., `GenesByRNASeqUserDataset`)                      |
| **URL Pattern**   | `#GenesByRnaSeq_RSRC123_DiffExp`                         | `#GenesByRNASeqUserDataset?param.rna_seq_dataset=5BM5MtFs0l0YZ` |
| **Parameters**    | None (baked into question name)                          | Dataset ID passed as parameter                                  |
| **Primary Key**   | `dataset_name` + `dataset_id`                            | Only `dataset_id` (used for both)                               |

---

## Backend Structure (CONFIRMED)

### WDK Endpoint

```
POST /service/record-types/userdataset/searches/UserDatasetsByCategory/reports/standard
```

### Request Configuration

```typescript
const USERDATASET_REPORT_CONFIG = {
  attributes: [
    'name', // Maps to displayName in response
    'ref_organism_formatted', // HTML formatted organism
    'dataset_id', // Primary key with EDAUD_ prefix
    'summary',
    'is_public', // STRING: "Private" or "Public"
    'primary_contact_name',
    'ref_organism', // Clean string for filtering
  ],
  tables: ['ExploreWebsiteSearches'],
  pagination: { offset: 0, numRecords: -1 },
};
```

### Response Structure

```json
{
  "records": [
    {
      "displayName": "test",
      "attributes": {
        "name": "test",
        "ref_organism_formatted": "<i>Plasmodium falciparum</i> 3D7",
        "dataset_id": "EDAUD_5BM5MtFs0l0YZ",
        "summary": "test",
        "is_public": "Private",
        "primary_contact_name": "",
        "ref_organism": "Plasmodium falciparum 3D7"
      },
      "tables": {
        "ExploreWebsiteSearches": [
          {
            "question_name": "GenesByRNASeqUserDataset",
            "dataset_id_param": "rna_seq_dataset",
            "dataset_id": "EDAUD_5BM5MtFs0l0YZ",
            "record_type": "TranscriptRecordClasses.TranscriptRecordClass"
          }
        ]
      }
    }
  ]
}
```

### Critical Backend Details

1. **`is_public`**: STRING (`"Private"`/`"Public"`) - must convert to boolean
2. **Table name**: `ExploreWebsiteSearches` (not `ExploreWdkSearches`)
3. **`question_name`**: No namespace prefix in response
4. **`dataset_id`**: Has `EDAUD_` prefix everywhere
5. **Question params**: Strip `EDAUD_` prefix when building parameter URLs

---

## Field Mapping

### UserDataset → DatasourceRecord

```typescript
{
  dataset_name: record.attributes.dataset_id,  // Use dataset_id as name
  display_name: record.displayName + " (" + record.attributes.primary_contact_name + ")",
  organism_prefix: record.attributes.ref_organism_formatted,
  dataset_id: record.attributes.dataset_id,
  summary: record.attributes.summary,
  build_number_introduced: "",  // Empty for UserDatasets
  publications: [],             // Empty in Phase 1
  searches: /* computed from categories */,
  isPreferred: /* check ref_organism against preferences */,
  source: 'userdataset',
  is_public: record.attributes.is_public === 'Public',  // Convert string to boolean
  dataset_id_param: /* varies by search category */
}
```

---

## Implementation Tasks

### Phase 1: Type Definitions

**File**: `InternalGeneDataset.tsx` (line ~72)

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
  is_public?: boolean; // NEW
  dataset_id_param?: string; // NEW
};
```

---

### Phase 2: Filter State

**File**: `InternalGeneDataset.tsx` (after line ~191)

```typescript
const [showDataSources, setShowDataSources] = useState(true);
const [showPublicUserDatasets, setShowPublicUserDatasets] = useState(true);
const [showPrivateUserDatasets, setShowPrivateUserDatasets] = useState(true);
```

---

### Phase 3: Backend Integration

#### Task 3.1: Parallel WDK Queries

```typescript
const [datasourceAnswer, userdatasetAnswer] = await Promise.all([
  wdkService.getAnswerJson(
    getAnswerSpec(datasetCategory, 'DatasourcesByCategory'),
    DATASOURCE_REPORT_CONFIG
  ),
  wdkService.getAnswerJson(
    getAnswerSpec(datasetCategory, 'UserDatasetsByCategory'),
    USERDATASET_REPORT_CONFIG
  ),
]);
```

#### Task 3.2: Extract UserDataset Questions

```typescript
interface UserDatasetQuestionRecord {
  question_name: string;
  dataset_id_param: string;
  dataset_id: string;
  record_type: string;
  dataset_name: string;
}

function getUserDatasetInternalQuestions(
  records: UserDatasetRecord[]
): UserDatasetQuestionRecord[] {
  return records.flatMap((record) => {
    const exploreSearches = record.tables?.ExploreWebsiteSearches;
    if (!Array.isArray(exploreSearches)) {
      throw new Error(`ExploreWebsiteSearches table missing for UserDataset`);
    }
    return exploreSearches.map((search) => ({
      question_name: search.question_name,
      dataset_id_param: search.dataset_id_param,
      dataset_id: search.dataset_id,
      record_type: search.record_type,
      dataset_name: record.attributes.dataset_id, // Use dataset_id as name
    }));
  });
}
```

#### Task 3.3: Create getUserDatasetRecords()

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
  // Process similar to getDatasourceRecords but:
  // 1. dataset_name = dataset_id
  // 2. Use ref_organism for isPreferred (not Version table)
  // 3. Convert is_public string to boolean
  // 4. Set source: 'userdataset'
  // 5. Set build_number_introduced to empty
  // 6. Set publications to empty array
  // 7. Store dataset_id_param for URL generation
}
```

#### Task 3.4: Merge Records

```typescript
const allRecords = [...datasourceRecords, ...userdatasetRecords];
```

---

### Phase 4: Button URL Generation

#### Task 4.1: URL Helper Function

```typescript
function getCategorySearchUrl(
  questionName: string,
  datasetId: string,
  source: 'datasource' | 'userdataset',
  datasetIdParam: string | undefined,
  internalSearchName: string
): string {
  const baseUrl = `${internalSearchName}#${questionName}`;
  if (source === 'userdataset' && datasetIdParam) {
    // CRITICAL: Strip EDAUD_ prefix for question parameters
    const paramValue = datasetId.replace(/^EDAUD_/, '');
    return `${baseUrl}?param.${datasetIdParam}=${paramValue}`;
  }
  return baseUrl;
}
```

#### Task 4.2: Update Button Rendering

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
        dataset_id_param,
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

### Phase 5: Source Type Column

#### Task 5.1: Import Required Icons

```typescript
import { projectId } from '@veupathdb/web-common/lib/config';
import LockIcon from '@material-ui/icons/Lock';
import PublicIcon from '@material-ui/icons/Public';
```

#### Task 5.2: Column Definition (first column)

```typescript
{
  key: 'source',
  name: '',
  width: '50px',
  sortable: false,
  renderCell: ({ row }) => {
    if (row.source === 'datasource') {
      return (
        <img
          src={`/images/${projectId}/favicon.jpg`}
          alt="Internal Dataset"
          style={{ width: '20px', height: '20px', objectFit: 'contain' }}
        />
      );
    } else if (row.is_public) {
      return <PublicIcon style={{ width: '20px', height: '20px' }} />;
    } else {
      return <LockIcon style={{ width: '20px', height: '20px' }} />;
    }
  }
}
```

#### Icon Implementation Notes

- **Internal Dataset**: Site favicon at `/images/${projectId}/favicon.jpg` (e.g., PlasmoDB, ToxoDB)
- **Public User Dataset**: `PublicIcon` from `@material-ui/icons/Public` (globe icon)
- **Private User Dataset**: `LockIcon` from `@material-ui/icons/Lock`
- All sized consistently to 20x20px

---

### Phase 6: Filter Checkboxes

#### Task 6.1: Checkbox UI (before table, ~line 260)

```typescript
<div className="wdk-InternalGeneDatasetForm__SourceFilters">
  <label>
    <input
      type="checkbox"
      checked={showDataSources}
      onChange={(e) => setShowDataSources(e.target.checked)}
    />
    <img
      src={`/images/${projectId}/favicon.jpg`}
      alt="Internal Dataset"
      style={{ width: '20px', height: '20px', objectFit: 'contain' }}
    /> Internal Datasets
  </label>
  <label>
    <input
      type="checkbox"
      checked={showPublicUserDatasets}
      onChange={(e) => setShowPublicUserDatasets(e.target.checked)}
    />
    <PublicIcon style={{ width: '20px', height: '20px' }} /> Public User Datasets
  </label>
  <label>
    <input
      type="checkbox"
      checked={showPrivateUserDatasets}
      onChange={(e) => setShowPrivateUserDatasets(e.target.checked)}
    />
    <LockIcon style={{ width: '20px', height: '20px' }} /> Private User Datasets
  </label>
</div>
```

#### Task 6.2: Filtering Logic

```typescript
const sourceFilteredRecords = allRecords.filter((record) => {
  if (record.source === 'datasource') return showDataSources;
  else if (record.is_public) return showPublicUserDatasets;
  else return showPrivateUserDatasets;
});

const filteredRecords = getFilteredDatasourceRecords(
  sourceFilteredRecords
  /* other params */
);
```

---

### Phase 7: Organism Filtering

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

### Phase 8: Record Links

```typescript
const recordUrl =
  row.source === 'datasource'
    ? `/record/dataset/${dataset_id}`
    : `/record/userdataset/${dataset_id}`; // Already has EDAUD_ prefix

<Link to={recordUrl}>{safeHtml(display_name)}</Link>;
```

---

### Phase 9: Styling

**File**: `InternalGeneDataset.scss`

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

    svg,
    img {
      width: 20px;
      height: 20px;
    }
  }
}
```

---

### Phase 10: Testing

- Page with only DataSources
- Page with only UserDatasets
- Mixed datasets
- All 8 filter combinations (2^3)
- Organism preference filtering
- Button URL parameters (verify EDAUD\_ stripped)
- Record page links
- Empty states

---

## Critical Implementation Notes

### ID Format Handling

- **Backend provides**: `EDAUD_5BM5MtFs0l0YZ` everywhere
- **Record page URLs**: Use as-is → `/record/userdataset/EDAUD_5BM5MtFs0l0YZ`
- **Question parameters**: Strip prefix → `?param.rna_seq_dataset=5BM5MtFs0l0YZ`

### String vs Boolean Conversion

```typescript
// Backend returns string
"is_public": "Private"  // or "Public"

// Convert to boolean
is_public: record.attributes.is_public === 'Public'
```

### Table Name

Use `ExploreWebsiteSearches` (not `ExploreWdkSearches`)

### Question Names

Backend returns without namespace prefix:

- Just `"GenesByRNASeqUserDataset"`
- Not `"GeneQuestions.GenesByRNASeqUserDataset"`

---

## Testing Curl Command

```bash
curl -X POST 'https://plasmodb.org/plasmo/service/record-types/userdataset/searches/UserDatasetsByCategory/reports/standard' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{
    "searchConfig": {
      "parameters": { "dataset_category": "RNASeq" }
    },
    "reportConfig": {
      "attributes": ["name", "ref_organism_formatted", "dataset_id", "summary", "is_public", "primary_contact_name", "ref_organism"],
      "tables": ["ExploreWebsiteSearches"],
      "pagination": { "offset": 0, "numRecords": 10 }
    }
  }'
```
