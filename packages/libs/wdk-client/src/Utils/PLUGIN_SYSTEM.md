# WDK Plugin System

The WDK plugin system provides a flexible, registry-based approach for customizing UI components throughout the application. This document explains the architecture, matching rules, and all available plugin types.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Concepts](#core-concepts)
3. [Type Definitions](#type-definitions)
4. [Matching Algorithm](#matching-algorithm)
5. [Plugin Types Reference](#plugin-types-reference)
6. [Common Patterns](#common-patterns)
7. [Best Practices](#best-practices)

---

## Architecture Overview

### Registry-Based System

The plugin system uses an **array-based registry** where plugins are searched in order with a **first-match-wins** approach. This allows for flexible customization while maintaining predictable behavior.

```typescript
const pluginRegistry: ClientPluginRegistryEntry<any>[] = [
  // More specific plugins first
  { type: 'questionForm', name: 'GenesByLocation', component: CustomForm },

  // Generic fallbacks last
  { type: 'questionForm', component: DefaultQuestionForm },
];
```

### Three-Layer Configuration

1. **Base Layer** (`wdk-client/src/Core/pluginConfig.ts`)

   - Default implementations for questionController, questionForm, questionFormParameter

2. **EBRC Layer** (`web-common/src/pluginConfig.ts`)

   - VEuPathDB-specific plugins (analysis tools, wizards, enhanced forms)

3. **Site Layer** (e.g., `genomics-site/webapp/wdkCustomization/js/client/pluginConfig.tsx`)
   - Site-specific overrides and extensions

### How Plugins Are Injected

Plugins are injected when the application encounters a `<Plugin>` component with a specific context:

```typescript
<Plugin
  context={{
    type: 'questionForm',
    name: 'GenesByLocation',
    searchName: 'GenesByLocation',
    recordClassName: 'gene',
  }}
  defaultComponent={DefaultQuestionForm}
/>
```

The system:

1. Resolves WDK model references (Question, Parameter, RecordClass) asynchronously
2. Searches the registry for the first matching plugin
3. Renders the matching plugin's component
4. Falls back to defaultComponent if no match is found

---

## Core Concepts

### First-Match-Wins

The registry is searched in order, and **the first plugin that matches all criteria is used**. This means:

- More specific plugins should be listed **before** generic fallbacks
- Order matters in your plugin configuration
- You can override base plugins by placing site-specific plugins earlier in the array

### Asynchronous Resolution

Plugin contexts may reference WDK model objects (Questions, Parameters, RecordClasses) that need to be fetched from the service. The system handles this automatically:

- References are resolved asynchronously using `useWdkService` hook
- Loading states are handled automatically
- Errors show NotFound (404) or LoadError components

### Performance Optimization

The composite plugin component is **memoized** using `reselect`'s `defaultMemoize`:

```typescript
export const makeCompositePluginComponent = defaultMemoize(
  makeCompositePluginComponentUncached
);
```

This ensures the plugin registry is only processed once and recreated only when the registry changes.

---

## Type Definitions

### ClientPluginRegistryEntry

```typescript
export interface ClientPluginRegistryEntry<PluginProps> {
  type: PluginType;
  name?: string;
  recordClassName?: string;
  searchName?: string;
  test?: (references: ResolvedPluginReferences) => boolean;
  component: PluginComponent<PluginProps>;
}
```

| Property          | Required | Description                                                |
| ----------------- | -------- | ---------------------------------------------------------- |
| `type`            | ✅ Yes   | The plugin category (see PluginType below)                 |
| `name`            | ❌ No    | Identifier for matching specific named plugins             |
| `recordClassName` | ❌ No    | Record class to match against (e.g., 'gene', 'transcript') |
| `searchName`      | ❌ No    | Question/search name to match against                      |
| `test`            | ❌ No    | Custom function for complex matching logic                 |
| `component`       | ✅ Yes   | React component to render when matched                     |

### PluginType

```typescript
export type PluginType =
  | 'attributeAnalysis'
  | 'questionController'
  | 'questionForm'
  | 'questionFormParameter'
  | 'summaryView'
  | 'stepAnalysisView'
  | 'stepAnalysisForm'
  | 'stepAnalysisResult'
  | 'questionFilter'
  | 'stepBox'
  | 'stepDetails';
```

### PluginEntryContext

```typescript
export interface PluginEntryContext {
  type: PluginType;
  name?: string;
  recordClassName?: string;
  searchName?: string;
  paramName?: string;
}
```

This context is passed to `<Plugin>` components and determines which plugin from the registry should be used.

### ResolvedPluginReferences

```typescript
export interface ResolvedPluginReferences {
  question?: Question;
  parameter?: Parameter;
  recordClass?: RecordClass;
}
```

These references are available to `test` functions for complex matching logic.

---

## Matching Algorithm

Located in `ClientPlugin.tsx` (`isMatchingEntry` function), the algorithm checks these conditions **in order**:

### Step-by-Step Matching

```typescript
function isMatchingEntry<T>(
  entry: ClientPluginRegistryEntry<T>,
  context: PluginEntryContext,
  references: ResolvedPluginReferences
): boolean;
```

1. **Type must match** (required)

   ```typescript
   if (entry.type !== context.type) return false;
   ```

2. **Name must match** (if entry specifies one)

   ```typescript
   if (entry.name && entry.name !== context.name) return false;
   ```

3. **RecordClassName must match** (if both entry and context specify)

   ```typescript
   if (
     entry.recordClassName &&
     context.recordClassName &&
     entry.recordClassName !== context.recordClassName
   )
     return false;
   ```

4. **SearchName must match** (if both entry and context specify)

   ```typescript
   if (
     entry.searchName &&
     context.searchName &&
     entry.searchName !== context.searchName
   )
     return false;
   ```

5. **Test function must return true** (if provided)

   ```typescript
   if (entry.test) return entry.test(references);
   ```

6. **Default: match succeeds** (if no test function)
   ```typescript
   return true;
   ```

### Matching Examples

#### Example 1: Exact Name Match

```typescript
// Plugin entry
{
  type: 'questionForm',
  name: 'GenesByLocation',
  component: CustomLocationForm
}

// Context
{
  type: 'questionForm',
  name: 'GenesByLocation'
}

// ✅ Matches: type and name both match
```

#### Example 2: RecordClassName Match

```typescript
// Plugin entry
{
  type: 'summaryView',
  name: '_default',
  recordClassName: 'gene',
  component: GeneSummaryView
}

// Context
{
  type: 'summaryView',
  name: '_default',
  recordClassName: 'gene'
}

// ✅ Matches: type, name, and recordClassName all match
```

#### Example 3: Test Function Match

```typescript
// Plugin entry
{
  type: 'questionForm',
  test: ({ question }) => question?.properties?.['radio-params'] != null,
  component: RadioParamsForm
}

// Context with resolved question having radio-params property
// ✅ Matches: type matches and test function returns true
```

#### Example 4: Fallback Match

```typescript
// Plugin entry
{
  type: 'questionForm',
  component: DefaultQuestionForm
}

// Any context with type: 'questionForm'
// ✅ Matches: type matches, no other restrictions
```

---

## Plugin Types Reference

### 1. questionController

**Purpose**: Controls the entire question/search form experience and behavior.

**Injected At**: `QuestionController.tsx`

**Context Passed**:

```typescript
{
  type: 'questionController',
  // Typically uses test function, no standard context properties
}
```

**Typical Matching**: Uses `test` function to check question properties

**Example**:

```typescript
{
  type: 'questionController',
  test: ({ question }) =>
    question?.properties?.websiteProperties?.includes('useWizard') ?? false,
  component: QuestionWizardPlugin
}
```

---

### 2. questionForm

**Purpose**: Customizes the form UI that displays question parameters.

**Injected At**: `QuestionController.tsx` (lines 129-141)

**Context Passed**:

```typescript
{
  type: 'questionForm',
  name: searchName,
  searchName: searchName,
  recordClassName: recordClassName
}
```

**Typical Matching**: `name` (exact search name), `searchName`, `recordClassName`, or `test` function

**Default Component**: `DefaultQuestionForm`

**Examples**:

```typescript
// Exact name match
{
  type: 'questionForm',
  name: 'GenesByLocation',
  component: GenesByLocationForm
}

// Custom test function
{
  type: 'questionForm',
  test: ({ question }) => question?.properties?.['radio-params'] != null,
  component: RadioParamsForm
}

// Fallback for all question forms
{
  type: 'questionForm',
  component: DefaultQuestionForm
}
```

---

### 3. questionFormParameter

**Purpose**: Customizes individual parameter input components within a question form.

**Injected At**: `QuestionController.tsx` (lines 219-246)

**Context Passed**:

```typescript
{
  type: 'questionFormParameter',
  name: parameterName,
  paramName: parameterName,
  searchName: questionName,
  recordClassName: recordClassName
}
```

**Typical Matching**: `name` (parameter name), `searchName` (question name), `recordClassName`, or `test` function

**Default Component**: `ParameterComponent`

**Examples**:

```typescript
// Specific parameter in specific search
{
  type: 'questionFormParameter',
  name: 'organism',
  searchName: 'GenesByLocation',
  component: OrganismParameter
}

// Any organism parameter (uses test)
{
  type: 'questionFormParameter',
  test: ({ parameter }) => parameter != null && isOrganismParam(parameter),
  component: OrganismParameter
}
```

---

### 4. summaryView

**Purpose**: Customizes how search results are displayed in different tabs (table view, genomic view, blast view, etc.).

**Injected At**: `ResultPanelController.tsx` (lines 289-306)

**Context Passed**:

```typescript
{
  type: 'summaryView',
  name: plugin.name,           // from question.summaryViewPlugins[]
  recordClassName: recordClassName,
  searchName: searchName
}
```

**Typical Matching**: `name` (display name), `recordClassName`, `searchName`, or `test` function

**Default Component**: `ResultTableSummaryViewPlugin`

**Examples**:

```typescript
// Default table view for specific record class
{
  type: 'summaryView',
  name: '_default',
  recordClassName: 'gene',
  component: GeneTableView
}

// Named view
{
  type: 'summaryView',
  name: 'genomic-view',
  component: GenomicSummaryView
}
```

---

### 5. questionFilter

**Purpose**: Provides filter UI for narrowing down search results (e.g., transcript filter, boolean filter).

**Injected At**: `StepFiltersController.tsx` (lines 27-40)

**Context Passed**:

```typescript
{
  type: 'questionFilter',
  name: filter.name,           // filter ID from question metadata
  searchName: questionName,
  recordClassName: recordClassName
}
```

**Typical Matching**: `name` (filter identifier), `searchName`, `recordClassName`, or `test` function

**Example**:

```typescript
{
  type: 'questionFilter',
  name: 'matched_transcript_filter_array',
  component: MatchedTranscriptsFilterPlugin
}
```

---

### 6. stepDetails

**Purpose**: Customizes the detailed view of a strategy step (showing parameters, datasets, weights, etc.).

**Injected At**: `StepDetails.tsx` (lines 65-74)

**Context Passed**:

```typescript
{
  type: 'stepDetails',
  name: stepType,              // 'leaf', 'combine', 'nested'
  searchName: questionName,
  recordClassName: recordClassName
}
```

**Typical Matching**: `name` (step type), `searchName`, `recordClassName`, or `test` function

**Examples**:

```typescript
// Custom step details for specific question type
{
  type: 'stepDetails',
  test: ({ question }) => question?.urlSegment.endsWith('ByLocation'),
  component: ByLocationStepDetails
}
```

---

### 7. attributeAnalysis

**Purpose**: Provides analysis tools (word clouds, histograms) that appear as clickable buttons in result table column headers.

**Injected At**: `AttributeHeading.tsx` (lines 62-89)

**Context Passed**:

```typescript
{
  type: 'attributeAnalysis',
  name: reporter.type,         // e.g., 'wordCloud', 'histogram'
  recordClassName: recordClassName,
  searchName: searchName
}
```

**Typical Matching**: `name` (reporter type), `recordClassName`, `searchName`, or `test` function

**Examples**:

```typescript
{
  type: 'attributeAnalysis',
  name: 'wordCloud',
  component: WordCloudAnalysisPlugin
}

{
  type: 'attributeAnalysis',
  name: 'histogram',
  component: HistogramAnalysisPlugin
}
```

---

### 8. stepAnalysisView

**Purpose**: Customizes the overall container view for step analyses (holding forms and results).

**Injected At**: `ResultPanelController.tsx` (lines 314-338)

**Context Passed**:

```typescript
{
  type: 'stepAnalysisView',
  name: 'defaultStepAnalysisView'
}
```

**Typical Matching**: `name` or `test` function

**Example**:

```typescript
{
  type: 'stepAnalysisView',
  name: 'defaultStepAnalysisView',
  component: StepAnalysisViewPlugin
}
```

---

### 9. stepAnalysisForm

**Purpose**: Customizes the form for step analysis parameter input (configuring analyses).

**Injected At**: `StepAnalysisSelectors.tsx` (lines 446-452)

**Context Passed**:

```typescript
{
  type: 'stepAnalysisForm',
  name: analysisConfig.analysisName  // e.g., 'otu_abundance', 'word-enrichment'
}
```

**Typical Matching**: `name` (analysis type) or `test` function

**Default Component**: `StepAnalysisDefaultForm`

**Example**:

```typescript
{
  type: 'stepAnalysisForm',
  component: StepAnalysisDefaultForm
}
```

---

### 10. stepAnalysisResult

**Purpose**: Customizes result display for each type of step analysis.

**Injected At**: `StepAnalysisSelectors.tsx` (lines 455-461)

**Context Passed**:

```typescript
{
  type: 'stepAnalysisResult',
  name: analysisConfig.analysisName  // e.g., 'word-enrichment', 'pathway-enrichment'
}
```

**Typical Matching**: `name` (analysis type) or `test` function

**Default Component**: `StepAnalysisDefaultResult`

**Examples**:

```typescript
// Specific analysis result handler
{
  type: 'stepAnalysisResult',
  name: 'word-enrichment',
  component: WordEnrichmentResults
}

// Fallback for unhandled analyses
{
  type: 'stepAnalysisResult',
  component: StepAnalysisDefaultResult
}
```

---

### 11. stepBox

**Note**: Declared in type definitions but not currently used in main codebase.

---

## Common Patterns

### Pattern 1: Fallback Plugins

Plugins with no matching criteria beyond `type` act as fallbacks:

```typescript
{
  type: 'questionForm',
  component: DefaultQuestionForm  // Matches any questionForm
}
```

**Important**: Place fallback plugins **last** in your configuration, after all specific plugins.

---

### Pattern 2: Exact Name Matching

Match a specific named instance:

```typescript
{
  type: 'summaryView',
  name: 'blast-view',
  component: BlastSummaryView
}
```

---

### Pattern 3: Record Class Matching

Customize behavior for specific record types:

```typescript
{
  type: 'summaryView',
  name: '_default',
  recordClassName: 'gene',
  component: GeneSpecificTableView
}
```

---

### Pattern 4: Custom Test Functions

Complex matching logic based on model properties:

```typescript
{
  type: 'questionForm',
  test: ({ question }) => {
    return question != null &&
           question.urlSegment.endsWith('ByLocation') &&
           hasChromosomeAndSequenceIDXorGroup(question);
  },
  component: MutuallyExclusiveParamForm
}
```

**Tip**: Extract test functions as named constants for better readability:

```typescript
const isMutuallyExclusiveParamQuestion: ClientPluginRegistryEntry<any>['test'] =
  ({ question }) => question != null &&
                     question.urlSegment.endsWith('ByLocation') &&
                     hasChromosomeAndSequenceIDXorGroup(question);

{
  type: 'questionForm',
  test: isMutuallyExclusiveParamQuestion,
  component: MutuallyExclusiveParamForm
}
```

---

### Pattern 5: Lazy-Loaded Components

Improve performance by lazy-loading large plugin components:

```typescript
const BlastForm = React.lazy(() => import('./plugins/BlastForm'));

{
  type: 'questionForm',
  name: 'GenesBySimilarity',
  component: (props) => (
    <Suspense fallback={<Loading />}>
      <BlastForm {...props} />
    </Suspense>
  )
}
```

---

### Pattern 6: Component Options/Configuration

Use higher-order functions to configure components:

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

---

## Best Practices

### 1. Order Matters

Place more specific plugins **before** generic fallbacks:

```typescript
const config: ClientPluginRegistryEntry<any>[] = [
  // ✅ Specific plugins first
  {
    type: 'questionForm',
    name: 'GenesByLocation',
    component: CustomLocationForm,
  },
  {
    type: 'questionForm',
    test: ({ question }) => question?.properties?.['radio-params'] != null,
    component: RadioParamsForm,
  },

  // ✅ Generic fallback last
  {
    type: 'questionForm',
    component: DefaultQuestionForm,
  },
];
```

---

### 2. Use Test Functions for Complex Logic

When matching requires checking properties or multiple conditions, use test functions:

```typescript
{
  type: 'questionController',
  test: ({ question }) =>
    question?.properties?.websiteProperties?.includes('useWizard') &&
    question?.properties?.multiStep === true,
  component: MultiStepWizardController
}
```

---

### 3. Extract Test Functions

For readability and reusability, extract test functions:

```typescript
const isInternalGeneDatasetQuestion: ClientPluginRegistryEntry<any>['test'] =
  ({ question }) =>
    question?.properties?.datasetCategory != null &&
    question?.properties?.datasetSubtype != null;

{
  type: 'questionForm',
  test: isInternalGeneDatasetQuestion,
  component: InternalGeneDataset
}
```

---

### 4. Use Lazy Loading for Large Components

Reduce initial bundle size by lazy-loading plugin components:

```typescript
const BlastQuestionController = React.lazy(
  () => import('./plugins/BlastQuestionController')
);

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

---

### 5. Maintain Type Safety

Use TypeScript's type system to ensure plugin prop compatibility:

```typescript
import { QuestionFormProps } from '@veupathdb/wdk-client/lib/Utils/ClientPlugin';

const MyQuestionForm: React.FC<QuestionFormProps> = (props) => {
  // TypeScript ensures props match QuestionFormProps
  return <form>...</form>;
};

{
  type: 'questionForm',
  name: 'MySearch',
  component: MyQuestionForm
}
```

---

### 6. Document Your Plugins

Add comments explaining complex matching logic or unusual configurations:

```typescript
{
  type: 'questionForm',
  // This custom form handles questions with mutually exclusive parameters
  // where users can choose either chromosome OR sequence ID, but not both
  test: isMutuallyExclusiveParamQuestion,
  component: ByLocationForm
}
```

---

### 7. Consistent Naming

Use consistent naming conventions for plugin components:

- Controllers: `*Controller` (e.g., `BlastQuestionController`)
- Forms: `*Form` or `*QuestionForm` (e.g., `GenesByLocationForm`)
- Views: `*View` or `*SummaryView` (e.g., `GenomicSummaryView`)
- Results: `*Results` (e.g., `WordEnrichmentResults`)

---

## Related Documentation

- **EBRC Plugins**: See `packages/libs/web-common/src/EBRC_PLUGINS.md` for VEuPathDB-specific plugins
- **Site Plugins**: See individual site plugin configuration documentation (e.g., `genomics-site/PLUGIN_CONFIG.md`)

---

## Implementation Files

Key files in the plugin system:

| File                                                  | Purpose                                           |
| ----------------------------------------------------- | ------------------------------------------------- |
| `Utils/ClientPlugin.tsx`                              | Type definitions and matching logic               |
| `Controllers/QuestionController.tsx`                  | questionForm and questionFormParameter injection  |
| `Controllers/ResultPanelController.tsx`               | summaryView and stepAnalysisView injection        |
| `Views/Strategy/StepDetails.tsx`                      | stepDetails injection                             |
| `Controllers/StepFiltersController.tsx`               | questionFilter injection                          |
| `Views/ResultTableSummaryView/AttributeHeading.tsx`   | attributeAnalysis injection                       |
| `StoreModules/StepAnalysis/StepAnalysisSelectors.tsx` | stepAnalysisForm and stepAnalysisResult injection |
