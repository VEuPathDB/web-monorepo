# Genomics Site Plugin Configuration

This document explains the genomics-specific plugin configuration. These plugins customize the genomics site with features specific to genomic data analysis and searching.

## Overview

The genomics site plugin configuration:

- Extends EBRC plugins with genomics-specific functionality
- Provides custom forms for genomic searches (BLAST, location-based, etc.)
- Adds specialized result views (genomic view, BLAST view)
- Supports genomics-specific analyses (pathway enrichment, GO enrichment, etc.)

For comprehensive information about the plugin system architecture, see [`@veupathdb/wdk-client/lib/Utils/PLUGIN_SYSTEM.md`](../../../../../../../libs/wdk-client/src/Utils/PLUGIN_SYSTEM.md).

For EBRC shared plugins, see [`@veupathdb/web-common/lib/EBRC_PLUGINS.md`](../../../../../../../libs/web-common/src/EBRC_PLUGINS.md).

---

## Plugin Configuration

Located in: `packages/sites/genomics-site/webapp/wdkCustomization/js/client/pluginConfig.tsx`

---

## Plugins Provided

### Summary Views

#### 1. Popset Sequence Table View

```typescript
{
  type: 'summaryView',
  name: '_default',
  recordClassName: 'popsetSequence',
  component: PopsetResultSummaryViewTableController
}
```

**Purpose**: Custom table view for popset sequence records.

**Matching**: Matches default view for `popsetSequence` record class.

---

#### 2. File Record Table View

```typescript
{
  type: 'summaryView',
  name: '_default',
  recordClassName: 'file',
  component: ResultTableSummaryViewPlugin.withOptions({
    showIdAttributeColumn: false
  })
}
```

**Purpose**: Custom table view for file records with ID column hidden.

**Configuration**: Uses `withOptions` to configure the base plugin.

---

#### 3. Genomic View

```typescript
{
  type: 'summaryView',
  name: 'genomic-view',
  component: GenomeSummaryViewPlugin
}
```

**Purpose**: Provides genomic browser visualization of search results.

**Usage**: Available as a tab in results when configured for a question.

---

#### 4. BLAST View

```typescript
{
  type: 'summaryView',
  name: 'blast-view',
  component: (props) => (
    <Suspense fallback={<Loading />}>
      <BlastSummaryViewPlugin {...props} />
    </Suspense>
  )
}
```

**Purpose**: Specialized view for BLAST search results with alignment visualization.

**Note**: Uses lazy loading for performance optimization.

---

#### 5. Popset Map View (Deprecated)

```typescript
{
  type: 'summaryView',
  name: 'popset-view',
  component: () => (
    <div style={{ margin: '2em', fontSize: '120%', fontWeight: 'bold' }}>
      The Popset Isolate Sequences geographical map is not available...
    </div>
  )
}
```

**Purpose**: Placeholder message for deprecated Google Maps feature.

**Note**: This shows how to gracefully handle removed features.

---

### Question Filters

#### 6. Matched Transcript Filter

```typescript
{
  type: 'questionFilter',
  name: 'matched_transcript_filter_array',
  component: MatchedTranscriptsFilterPlugin
}
```

**Purpose**: Filters gene results to show only specific transcript types.

---

#### 7. Gene Boolean Filter

```typescript
{
  type: 'questionFilter',
  name: 'gene_boolean_filter_array',
  component: MatchedTranscriptsFilterPlugin
}
```

**Purpose**: Boolean filter for gene results (same component as transcript filter).

---

### Question Controllers

#### 8. Internal Gene Dataset Controller

```typescript
{
  type: 'questionController',
  test: isInternalGeneDatasetQuestion,
  component: InternalGeneDataset
}
```

**Matching Logic**:

```typescript
const isInternalGeneDatasetQuestion: ClientPluginRegistryEntry<any>['test'] = ({
  question,
}) =>
  question?.properties?.datasetCategory != null &&
  question?.properties?.datasetSubtype != null;
```

**Purpose**: Controls questions for internal gene datasets.

---

#### 9. Multi-BLAST Controller

```typescript
{
  type: 'questionController',
  test: isMultiBlastQuestion,
  component: (props) => (
    <Suspense fallback={<Loading />}>
      <BlastQuestionController {...props} />
    </Suspense>
  )
}
```

**Purpose**: Specialized controller for multi-BLAST questions.

**Note**: Imported from `@veupathdb/multi-blast` package with lazy loading.

---

### Question Forms

#### 10. EDA Phenotype User Dataset Form

```typescript
{
  type: 'questionForm',
  name: 'GenesByPhenotypeUserDataset',
  component: GenesByEdaSubset
}
```

**Purpose**: Custom form for querying genes by phenotype from user-uploaded datasets.

**Matching**: Exact question name match.

---

#### 11. Genotype Number Form

```typescript
{
  type: 'questionForm',
  name: 'ByGenotypeNumber',
  component: ByGenotypeNumber
}
```

**Purpose**: Form for searching by genotype number.

---

#### 12. Location-Based Search Form

```typescript
{
  type: 'questionForm',
  test: isMutuallyExclusiveParamQuestion,
  component: ByLocationForm
}
```

**Matching Logic**:

```typescript
const isMutuallyExclusiveParamQuestion: ClientPluginRegistryEntry<any>['test'] =
  ({ question }) =>
    question != null &&
    question.urlSegment.endsWith('ByLocation') &&
    hasChromosomeAndSequenceIDXorGroup(question);
```

**Purpose**: Handles questions with mutually exclusive location parameters (chromosome XOR sequence ID).

---

#### 13. Internal Dataset Form

```typescript
{
  type: 'questionForm',
  test: isInternalGeneDatasetQuestion,
  component: InternalGeneDataset
}
```

**Purpose**: Form for internal gene dataset questions (same component used as controller).

---

#### 14. Compound Fold Change Form

```typescript
{
  type: 'questionForm',
  test: ({ question }) =>
    !!question?.queryName?.startsWith('CompoundsByFoldChange'),
  component: CompoundsByFoldChangeForm
}
```

**Purpose**: Specialized form for compound fold change searches.

---

#### 15. Generic Fold Change Form

```typescript
{
  type: 'questionForm',
  test: ({ question }) =>
    question?.queryName === 'GenesByGenericFoldChange' ||
    question?.queryName === 'GenesByRnaSeqFoldChange' ||
    question?.queryName === 'GenesByUserDatasetRnaSeq',
  component: GenericFoldChangeForm
}
```

**Purpose**: Form for various gene fold change searches (generic, RNA-seq, user dataset).

---

#### 16. Multi-BLAST Form

```typescript
{
  type: 'questionForm',
  test: ({ question }) =>
    question != null && question.urlSegment.endsWith('MultiBlast'),
  component: (props) => (
    <Suspense fallback={<Loading />}>
      <BlastForm {...props} />
    </Suspense>
  )
}
```

**Purpose**: Form for multi-BLAST searches with lazy loading.

---

#### 17. Dynamic Spans Form

```typescript
{
  type: 'questionForm',
  name: 'DynSpansBySourceId',
  component: DynSpansBySourceId
}
```

**Purpose**: Form for searching genomic spans by source ID.

---

#### 18. Similarity/BLAST Form

```typescript
{
  type: 'questionForm',
  test: ({ question }) =>
    question?.urlSegment.endsWith('BySimilarity') ||
    question?.urlSegment === 'UnifiedBlast',
  component: BlastQuestionForm
}
```

**Purpose**: Form for similarity searches and unified BLAST.

---

#### 19. Ortholog Pattern Form

```typescript
{
  type: 'questionForm',
  name: 'GenesByOrthologPattern',
  component: GenesByOrthologPattern
}
```

**Purpose**: Form for searching genes by ortholog patterns across species.

---

#### 20. WGCNA Module Form

```typescript
{
  type: 'questionForm',
  test: ({ question }) => question?.queryName === 'GenesByWGCNAModule',
  component: EdaNotebookQuestionForm
}
```

**Purpose**: Form for searching genes by WGCNA (Weighted Gene Co-expression Network Analysis) modules.

---

### Question Form Parameters

#### 21. Transcription Factor Binding Site Parameter

```typescript
{
  type: 'questionFormParameter',
  name: 'tfbs_name',
  searchName: 'GenesByBindingSiteFeature',
  component: GenesByBindingSiteFeature
}
```

**Purpose**: Custom parameter component for transcription factor binding site selection.

**Matching**: Specific parameter name within specific search.

---

#### 22. EDA Analysis Spec Parameter

```typescript
{
  type: 'questionFormParameter',
  name: 'eda_analysis_spec',
  test: isPhenotypeSubsetSearch,
  component: EdaSubsetParameter
}
```

**Matching Logic**:

```typescript
const isPhenotypeSubsetSearch: ClientPluginRegistryEntry<any>['test'] = ({
  question,
}) => question?.queryName === 'GenesByPhenotypeEdaGeneric';
```

**Purpose**: Custom parameter for EDA (Exploratory Data Analysis) subset specifications.

---

#### 23. Genotype Checkbox Parameter

```typescript
{
  type: 'questionFormParameter',
  name: 'genotype',
  searchName: 'ByGenotypeNumber',
  component: ByGenotypeNumberCheckbox
}
```

**Purpose**: Checkbox interface for genotype parameter.

---

#### 24. Organism Parameter

```typescript
{
  type: 'questionFormParameter',
  test: ({ parameter }) => parameter != null && isOrganismParam(parameter),
  component: OrganismParam
}
```

**Purpose**: Enhanced organism selector with preferred organisms support.

**Note**: Imported from `@veupathdb/preferred-organisms` package.

**Matching**: Any parameter identified as an organism parameter by `isOrganismParam` function.

---

### Step Analysis Results

#### 25. Word Enrichment Results

```typescript
{
  type: 'stepAnalysisResult',
  name: 'word-enrichment',
  component: StepAnalysisWordEnrichmentResults
}
```

**Purpose**: Displays word enrichment analysis results.

---

#### 26. Pathway Enrichment Results

```typescript
{
  type: 'stepAnalysisResult',
  name: 'pathway-enrichment',
  component: StepAnalysisPathwayEnrichmentResults
}
```

**Purpose**: Displays pathway enrichment analysis results (e.g., KEGG, Reactome).

---

#### 27. GO Enrichment Results

```typescript
{
  type: 'stepAnalysisResult',
  name: 'go-enrichment',
  component: StepAnalysisGoEnrichmentResults
}
```

**Purpose**: Displays Gene Ontology enrichment analysis results.

---

#### 28. Transcript Length Distribution Results

```typescript
{
  type: 'stepAnalysisResult',
  name: 'transcript-length-dist',
  component: StepAnalysisEupathExternalResult
}
```

**Purpose**: Displays transcript length distribution analysis.

**Note**: Uses EBRC external result component.

---

#### 29. HPI Dataset Gene List Results

```typescript
{
  type: 'stepAnalysisResult',
  name: 'datasetGeneList',
  component: StepAnalysisHpiGeneListResults
}
```

**Purpose**: Displays HPI (Host-Pathogen Interaction) dataset gene list results.

---

### Step Details

#### 30. Location-Based Step Details

```typescript
{
  type: 'stepDetails',
  test: isMutuallyExclusiveParamQuestion,
  component: ByLocationStepDetails
}
```

**Purpose**: Custom step details display for location-based searches.

---

#### 31. EDA Subset Step Details

```typescript
{
  type: 'stepDetails',
  test: isPhenotypeSubsetSearch,
  component: EdaSubsetStepDetails
}
```

**Purpose**: Custom step details for EDA phenotype subset searches.

---

## Common Patterns in This Configuration

### Pattern 1: Lazy-Loaded BLAST Components

BLAST-related components are consistently lazy-loaded for performance:

```typescript
const BlastForm = React.lazy(() => import('./plugins/BlastForm'));
const BlastQuestionController = React.lazy(
  () => import('./plugins/BlastQuestionController')
);
const BlastSummaryViewPlugin = React.lazy(
  () =>
    import(
      '@veupathdb/blast-summary-view/lib/Controllers/BlastSummaryViewController'
    )
);
```

This reduces initial bundle size since BLAST functionality is not always needed.

---

### Pattern 2: Shared Components for Multiple Purposes

Some components serve multiple roles:

```typescript
// Used as both controller and form
{
  type: 'questionController',
  test: isInternalGeneDatasetQuestion,
  component: InternalGeneDataset
},
{
  type: 'questionForm',
  test: isInternalGeneDatasetQuestion,
  component: InternalGeneDataset
}
```

---

### Pattern 3: Test Function Extraction

Complex test logic is extracted as named constants:

```typescript
const isMutuallyExclusiveParamQuestion: ClientPluginRegistryEntry<any>['test'] =
  ({ question }) =>
    question != null &&
    question.urlSegment.endsWith('ByLocation') &&
    hasChromosomeAndSequenceIDXorGroup(question);
```

This improves readability and allows reuse across different plugin types.

---

### Pattern 4: Multiple Question Names in Test

Some forms handle multiple related questions:

```typescript
test: ({ question }) =>
  question?.queryName === 'GenesByGenericFoldChange' ||
  question?.queryName === 'GenesByRnaSeqFoldChange' ||
  question?.queryName === 'GenesByUserDatasetRnaSeq';
```

---

## Plugin Ordering Strategy

The genomics site configuration follows these ordering principles:

1. **Record-class-specific summary views** (popsetSequence, file)
2. **Named summary views** (genomic-view, blast-view, popset-view)
3. **Named question filters** (transcript filter, gene boolean filter)
4. **Question controllers with test functions**
5. **Specific question forms by exact name**
6. **Question forms with test functions**
7. **Specific question form parameters**
8. **Generic question form parameters with test functions**
9. **Step analysis results by name**
10. **Step details with test functions**

This ensures maximum specificity matching before falling back to EBRC and WDK defaults.

---

## Integration with Other Packages

### Multi-BLAST Package

```typescript
import { isMultiBlastQuestion } from '@veupathdb/multi-blast/lib/utils/pluginConfig';
```

The `isMultiBlastQuestion` utility helps identify multi-BLAST questions.

---

### Preferred Organisms Package

```typescript
import {
  OrganismParam,
  isOrganismParam,
} from '@veupathdb/preferred-organisms/lib/components/OrganismParam';
```

Provides enhanced organism selection with preference management.

---

### BLAST Summary View Package

```typescript
import(
  '@veupathdb/blast-summary-view/lib/Controllers/BlastSummaryViewController'
);
```

Provides specialized BLAST result visualization.

---

## Site-Specific Features

### Fold Change Searches

The genomics site includes multiple fold change search forms:

- **CompoundsByFoldChange**: For compound expression changes
- **GenesByGenericFoldChange**: Generic gene expression fold change
- **GenesByRnaSeqFoldChange**: RNA-seq specific fold change
- **GenesByUserDatasetRnaSeq**: User-uploaded RNA-seq data

---

### EDA Integration

Multiple EDA (Exploratory Data Analysis) integrations:

- **GenesByPhenotypeUserDataset**: User dataset phenotype queries
- **EdaSubsetParameter**: Custom EDA subset parameter
- **EdaNotebookQuestionForm**: EDA notebook integration for WGCNA

---

### Genomic Analysis Tools

Specialized analysis result displays:

- **Pathway Enrichment**: KEGG, Reactome pathway analysis
- **GO Enrichment**: Gene Ontology term enrichment
- **Word Enrichment**: Functional annotation word clouds
- **HPI Gene Lists**: Host-pathogen interaction datasets

---

## Extending This Configuration

To add new genomics-specific plugins:

1. **Add more specific plugins before existing ones**
2. **Extract test functions for readability**
3. **Use lazy loading for large components**
4. **Document the purpose and matching criteria**

Example:

```typescript
const isNewAnalysisType: ClientPluginRegistryEntry<any>['test'] =
  ({ question }) => question?.properties?.analysisType === 'myNewType';

{
  type: 'questionForm',
  test: isNewAnalysisType,
  component: MyNewAnalysisForm
}
```

---

## Related Documentation

- **Base Plugin System**: [`@veupathdb/wdk-client/lib/Utils/PLUGIN_SYSTEM.md`](../../../../../../../libs/wdk-client/src/Utils/PLUGIN_SYSTEM.md)
- **EBRC Plugins**: [`@veupathdb/web-common/lib/EBRC_PLUGINS.md`](../../../../../../../libs/web-common/src/EBRC_PLUGINS.md)

---

## Key Component Locations

| Component                                | Location                                                          |
| ---------------------------------------- | ----------------------------------------------------------------- |
| `GenomeSummaryViewPlugin`                | `./controllers/GenomeSummaryViewController`                       |
| `PopsetResultSummaryViewTableController` | `./components/controllers/PopsetResultSummaryViewTableController` |
| `ByGenotypeNumber`                       | `./components/questions/ByGenotypeNumber`                         |
| `ByLocationForm`                         | `./components/questions/ByLocation`                               |
| `GenesByBindingSiteFeature`              | `./components/questions/GenesByBindingSiteFeature`                |
| `GenesByOrthologPattern`                 | `./components/questions/GenesByOrthologPattern`                   |
| `InternalGeneDataset`                    | `./components/questions/InternalGeneDataset`                      |
| `CompoundsByFoldChangeForm`              | `./components/questions/foldChange`                               |
| `StepAnalysisPathwayEnrichmentResults`   | `./components/stepAnalysis/StepAnalysisPathwayEnrichmentResults`  |
| `EdaSubsetParameter`                     | `./components/questions/EdaSubsetParameter`                       |
