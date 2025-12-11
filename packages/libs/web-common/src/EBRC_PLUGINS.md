# EBRC Plugin Configuration

This document explains the VEuPathDB-specific plugins provided by the `web-common` package. These plugins extend the base WDK system with features shared across all VEuPathDB/EBRC sites.

## Overview

The `web-common` package provides a middle layer of plugins that:

- Add VEuPathDB-specific functionality (wizards, analysis tools)
- Provide enhanced default behaviors for questions and forms
- Support microbiome and epidemiology-specific analyses
- Enhance the default WDK components with EBRC styling and features

For comprehensive information about the plugin system architecture, see [`@veupathdb/wdk-client/lib/Utils/PLUGIN_SYSTEM.md`](../../wdk-client/src/Utils/PLUGIN_SYSTEM.md).

---

## Plugin Configuration

Located in: `packages/libs/web-common/src/pluginConfig.ts`

### Import Path

```typescript
import ebrcPluginConfig from '@veupathdb/web-common/lib/pluginConfig';
```

---

## Plugins Provided

### 1. Analysis Plugins

#### Word Cloud Analysis

```typescript
{
  type: 'attributeAnalysis',
  name: 'wordCloud',
  component: WordCloudAnalysisPlugin
}
```

**Purpose**: Generates word cloud visualizations from text attributes in result tables.

**Usage**: Appears as a clickable icon in result table column headers for text columns.

---

#### Histogram Analysis

```typescript
{
  type: 'attributeAnalysis',
  name: 'histogram',
  component: HistogramAnalysisPlugin
}
```

**Purpose**: Generates histogram visualizations from numeric attributes in result tables.

**Usage**: Appears as a clickable icon in result table column headers for numeric columns.

---

### 2. Step Analysis View

```typescript
{
  type: 'stepAnalysisView',
  name: 'defaultStepAnalysisView',
  component: StepAnalysisViewPlugin
}
```

**Purpose**: Provides the default container for step analysis forms and results.

**Usage**: Used throughout the application when displaying step analyses.

---

### 3. Summary View

```typescript
{
  type: 'summaryView',
  name: '_default',
  component: ResultTableSummaryViewPlugin
}
```

**Purpose**: Provides the default table view for search results across all record types.

**Usage**: Acts as a fallback when no record-class-specific summary view is defined.

**Note**: Sites may override this for specific record classes by defining plugins with `recordClassName` specified.

---

### 4. Question Controller - Wizard

```typescript
{
  type: 'questionController',
  test: ({ question }) =>
    question?.properties?.websiteProperties?.includes('useWizard') ?? false,
  component: QuestionWizardPlugin
}
```

**Purpose**: Enables multi-step wizard UI for questions tagged with the `useWizard` property.

**Matching Logic**: Checks if `'useWizard'` is present in the question's `websiteProperties` array.

**Usage**: Questions configured in WDK model with `useWizard` website property will automatically use this wizard interface.

**Example Questions**: Complex searches that benefit from step-by-step guidance.

---

### 5. Question Form - Radio Parameters

```typescript
{
  type: 'questionForm',
  test: ({ question }) => question?.properties?.['radio-params'] != null,
  component: RadioParams
}
```

**Purpose**: Provides enhanced UI for questions with radio button parameter groups.

**Matching Logic**: Checks if the question has a `radio-params` property defined.

**Usage**: Questions with grouped radio button parameters use this custom form layout.

---

### 6. Question Form - EBRC Default

```typescript
{
  type: 'questionForm',
  component: EbrcDefaultQuestionForm
}
```

**Purpose**: Provides the EBRC-styled default question form with VEuPathDB-specific enhancements.

**Usage**: Acts as the fallback for all question forms that don't have more specific plugins.

**Enhancements over base WDK**:

- EBRC-specific styling
- Enhanced parameter layout
- VEuPathDB branding elements

---

### 7. Step Analysis Form - Default

```typescript
{
  type: 'stepAnalysisForm',
  component: StepAnalysisDefaultForm
}
```

**Purpose**: Provides the default form for configuring step analyses.

**Usage**: Used for all step analyses unless overridden by more specific plugins.

---

### 8. Step Analysis Results - Microbiome Analyses

EBRC provides specialized result handlers for microbiome analyses:

#### OTU Abundance

```typescript
{
  type: 'stepAnalysisResult',
  name: 'otu_abundance',
  component: StepAnalysisEupathExternalResult
}
```

**Purpose**: Displays OTU (Operational Taxonomic Unit) abundance analysis results.

---

#### Alpha Diversity

```typescript
{
  type: 'stepAnalysisResult',
  name: 'alpha_diversity',
  component: StepAnalysisEupathExternalResult
}
```

**Purpose**: Displays alpha diversity analysis results (within-sample diversity).

---

#### Beta Diversity

```typescript
{
  type: 'stepAnalysisResult',
  name: 'beta_diversity',
  component: StepAnalysisEupathExternalResult
}
```

**Purpose**: Displays beta diversity analysis results (between-sample diversity).

---

#### Differential Abundance

```typescript
{
  type: 'stepAnalysisResult',
  name: 'differential_abundance',
  component: StepAnalysisEupathExternalResult
}
```

**Purpose**: Displays differential abundance analysis results between groups.

---

#### Correlation Analysis

```typescript
{
  type: 'stepAnalysisResult',
  name: 'correlation_app',
  component: StepAnalysisEupathExternalResult
}
```

**Purpose**: Displays correlation analysis results.

---

### 9. Step Analysis Results - ClinEpi Analyses

Specialized result handlers for ClinEpi (Clinical Epidemiology) analyses:

#### Person Graph Analysis

```typescript
{
  type: 'stepAnalysisResult',
  name: 'person-graph-analysis',
  component: StepAnalysisEupathExternalResult
}
```

**Purpose**: Displays person graph analysis for epidemiological data.

---

#### Light Trap Plots

```typescript
{
  type: 'stepAnalysisResult',
  name: 'light-trap-plots',
  component: StepAnalysisEupathExternalResult
}
```

**Purpose**: Displays light trap data visualizations.

---

#### Contingency Tables

```typescript
{
  type: 'stepAnalysisResult',
  name: 'clinepi-cont-table',
  component: StepAnalysisEupathExternalResult
}
```

**Purpose**: Displays contingency table analysis results for epidemiological data.

---

#### Event Distribution

```typescript
{
  type: 'stepAnalysisResult',
  name: 'clinepi-event-dist',
  component: StepAnalysisEupathExternalResult
}
```

**Purpose**: Displays event distribution analysis for temporal epidemiological data.

---

#### Statistical Summaries

```typescript
{
  type: 'stepAnalysisResult',
  name: 'clinepi-summaries',
  component: StepAnalysisEupathExternalResult
}
```

**Purpose**: Displays statistical summary tables for epidemiological data.

---

### 10. Step Analysis Results - Default

```typescript
{
  type: 'stepAnalysisResult',
  component: StepAnalysisDefaultResult
}
```

**Purpose**: Provides fallback display for step analysis results without specific handlers.

**Usage**: Catches any step analysis result types not handled by more specific plugins.

**Important**: This fallback should always be listed **last** in the plugin configuration.

---

## Common Patterns

### StepAnalysisEupathExternalResult Component

Many step analysis results use the `StepAnalysisEupathExternalResult` component. This component:

- Displays results from external analysis tools
- Handles iframe embedding of external applications
- Provides consistent styling for external result displays
- Manages loading states and error handling

---

## Plugin Ordering

The EBRC plugin configuration follows best practices for plugin ordering:

1. **Specific analysis plugins first** (word cloud, histogram)
2. **Conditional plugins with test functions** (wizard, radio params)
3. **Default/fallback plugins last** (default question form, default step analysis result)

This ensures more specific plugins are matched before generic fallbacks.

---

## Usage in Sites

Sites should include the EBRC plugin configuration as part of their composite plugin registry:

```typescript
import ebrcPluginConfig from '@veupathdb/web-common/lib/pluginConfig';
import wdkPluginConfig from '@veupathdb/wdk-client/lib/Core/pluginConfig';

const sitePluginConfig: ClientPluginRegistryEntry<any>[] = [
  // Site-specific plugins first (highest precedence)
  ...siteSpecificPlugins,

  // EBRC shared plugins (medium precedence)
  ...ebrcPluginConfig,

  // WDK base plugins last (lowest precedence)
  ...wdkPluginConfig,
];
```

This layering allows sites to override EBRC defaults while still benefiting from EBRC enhancements over base WDK.

### Sites Without Custom Plugin Configs

**Note**: Not all sites need custom plugin configurations. **clinepi-site** and **mbio-site** do not have `pluginConfig` files and do not pass custom plugins to `initialize()`. These sites rely entirely on the EBRC and WDK default plugins, which is perfectly fine for sites without specialized customization needs.

Sites that **do** have custom plugin configs:

- **genomics-site**: Extensive genomics-specific customizations (BLAST, fold change, pathway enrichment, etc.)
- **ortho-site**: Phyletic pattern and BLAST customizations

---

## Extending EBRC Plugins

Sites can override EBRC plugins by defining more specific versions:

### Example: Custom Summary View for Genes

```typescript
// In site-specific config
const sitePlugins = [
  // Override EBRC default for gene records
  {
    type: 'summaryView',
    name: '_default',
    recordClassName: 'gene',
    component: CustomGeneSummaryView,
  },

  // Include EBRC plugins after site-specific overrides
  ...ebrcPluginConfig,
];
```

Because the site-specific plugin with `recordClassName: 'gene'` comes first, it will match before the EBRC default `summaryView`.

---

## Related Documentation

- **Base Plugin System**: [`@veupathdb/wdk-client/lib/Utils/PLUGIN_SYSTEM.md`](../../wdk-client/src/Utils/PLUGIN_SYSTEM.md)
- **Site-Specific Plugins**: See individual site plugin documentation (e.g., `genomics-site/PLUGIN_CONFIG.md`)

---

## Key Components

| Component                          | Location                                         | Purpose                          |
| ---------------------------------- | ------------------------------------------------ | -------------------------------- |
| `WordCloudAnalysisPlugin`          | Imported from `@veupathdb/wdk-client`            | Word cloud visualizations        |
| `HistogramAnalysisPlugin`          | Imported from `@veupathdb/wdk-client`            | Histogram visualizations         |
| `StepAnalysisViewPlugin`           | Imported from `@veupathdb/wdk-client`            | Step analysis container          |
| `ResultTableSummaryViewPlugin`     | Imported from `@veupathdb/wdk-client`            | Default table view               |
| `StepAnalysisDefaultForm`          | Imported from `@veupathdb/wdk-client`            | Default analysis form            |
| `StepAnalysisDefaultResult`        | Imported from `@veupathdb/wdk-client`            | Default analysis result          |
| `StepAnalysisEupathExternalResult` | `./plugins/StepAnalysisEupathExternalResult`     | External analysis result display |
| `EbrcDefaultQuestionForm`          | `./components/questions/EbrcDefaultQuestionForm` | EBRC question form               |
| `RadioParams`                      | `./plugins/RadioParams`                          | Radio parameter form             |
| `QuestionWizardPlugin`             | `./plugins/QuestionWizardPlugin`                 | Wizard controller                |
