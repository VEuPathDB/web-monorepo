import {
  ContinuousVariableDataShape,
  DistributionResponse,
  LabeledRange,
  useStudyMetadata,
} from '../../..';
import { VariableDescriptor } from '../../../types/variable';
import { volcanoPlotVisualization } from '../../visualizations/implementations/VolcanoPlotVisualization';
import { ComputationConfigProps, ComputationPlugin } from '../Types';
import { isEqual } from 'lodash';
import {
  useConfigChangeHandler,
  assertComputationWithConfig,
  partialToCompleteCodec,
  GENE_EXPRESSION_STABLE_IDS,
  GENE_EXPRESSION_VALUE_IDS,
} from '../Utils';
import { Computation } from '../../../types/visualization';
import {
  useDataClient,
  useFindEntityAndVariable,
  useSubsettingClient,
} from '../../../hooks/workspace';
import { ReactNode, useEffect, useMemo, useRef } from 'react';
import { ComputationStepContainer } from '../ComputationStepContainer';
import { ValuePicker } from '../../visualizations/implementations/ValuePicker';
import { useToggleStarredVariable } from '../../../hooks/starredVariables';
import { Filter } from '../../..';
import { FloatingButton, H6 } from '@veupathdb/coreui';
import { SwapHorizOutlined } from '@material-ui/icons';
import './Plugins.scss';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { Tooltip } from '@veupathdb/coreui';
import {
  GetBinRangesProps,
  getBinRanges,
} from '../../../../map/analysis/utils/defaultOverlayConfig';
import { IsEnabledInPickerParams } from '../../visualizations/VisualizationTypes';
import { entityTreeToArray } from '../../../utils/study-metadata';
import { InputVariables } from '../../visualizations/InputVariables';
import { enqueueSnackbar } from 'notistack';
import { useCachedPromise } from '../../../hooks/cachedPromise';
import { DataElementConstraintRecord } from '../../../utils/data-element-constraints';
import { DifferentialExpressionConfig } from '../../../types/apps';

const cx = makeClassNameHelper('AppStepConfigurationContainer');

/**
 * Differential Expression
 *
 * The differential expression app is used to find genes that
 * are more abundant in one group of samples than another. This app takes in a count data variable
 * collection (for example, RNA-Seq count for 20,000 genes for all samples) as well as a way to split the samples
 * into two groups (for example, red hair and green hair). The computation then returns information on how
 * differentially expression each gene is between the two groups. See VolcanoPlotDataPoint
 * for more details. Importantly, the returned data lives outside the variable tree because each returned
 * data point corresponds to a gene.
 *
 * Currently the differential expression app will be implemented with only a volcano visualization. Plans for
 * the future of this app include a lefse diagram, tables of results, adding new computation methods, and
 * strategies to create user-defined collections from the output of the computation.
 */

const CompleteDifferentialExpressionConfig = partialToCompleteCodec(
  DifferentialExpressionConfig
);

// Check to ensure the entirety of the configuration is filled out before enabling the
// Generate Results button.
function isCompleteDifferentialExpressionConfig(config: unknown) {
  if (!CompleteDifferentialExpressionConfig.is(config)) return false;

  if (config.identifierVariable == null) return false;
  if (config.valueVariable == null) return false;
  if (config.comparator?.groupA == null) return false;
  if (config.comparator?.groupB == null) return false;

  // Entity compatibility is enforced by InputVariables + constraints
  // No need for manual validation here

  return true;
}

/**
 * Constraints for gene expression variable selection.
 * Ensures only valid identifier and value variables can be selected,
 * and enforces entity compatibility between them.
 */
const geneExpressionConstraints: DataElementConstraintRecord[] = [
  {
    comparatorVariable: {
      isRequired: true,
      minNumVars: 1,
      maxNumVars: 1,
      description:
        'Select a metadata variable for group comparison. Must be from a parent entity of the expression data.',
    },
    identifierVariable: {
      isRequired: true,
      minNumVars: 1,
      maxNumVars: 1,
      allowedVariableIds: [GENE_EXPRESSION_STABLE_IDS.IDENTIFIER],
      description:
        'Select a gene identifier variable (VEUPATHDB_GENE_ID). Must be on the same entity as the expression data.',
    },
    valueVariable: {
      isRequired: true,
      minNumVars: 1,
      maxNumVars: 1,
      allowedVariableIds: [...GENE_EXPRESSION_VALUE_IDS],
      description:
        'Select expression data: raw counts, sense/antisense counts, or normalized expression. Must be on the same entity as the gene identifier.',
    },
  },
];

/**
 * Dependency order ensures entity compatibility.
 * comparatorVariable must be from the same or ancestor entity of the expression data.
 * identifierVariable and valueVariable must be from the same entity.
 */
const geneExpressionDependencyOrder = [
  ['identifierVariable', 'valueVariable'],
  ['comparatorVariable'],
];

export const plugin: ComputationPlugin = {
  configurationComponent: DifferentialExpressionConfiguration,
  configurationDescriptionComponent:
    DifferentialExpressionConfigDescriptionComponent,
  createDefaultConfiguration: () => ({
    pValueFloor: '1e-200',
    differentialExpressionMethod: Object.keys(
      DIFFERENTIAL_EXPRESSION_METHODS
    )[0],
  }),
  isConfigurationComplete: isCompleteDifferentialExpressionConfig,
  visualizationPlugins: {
    volcanoplot: volcanoPlotVisualization.withOptions({
      pointsDisplayNameSingular: 'gene',
      pointsDisplayNamePlural: 'genes',
      getPlotSubtitle(config) {
        if (
          DifferentialExpressionConfig.is(config) &&
          config.differentialExpressionMethod &&
          config.differentialExpressionMethod in DIFFERENTIAL_EXPRESSION_METHODS
        ) {
          const method =
            DIFFERENTIAL_EXPRESSION_METHODS[
              config.differentialExpressionMethod as DifferentialExpressionMethodKey
            ];
          return (
            <span>
              Differential expression computed using {method.displayName}{' '}
              {method.citation} with default parameters.
            </span>
          );
        }
      },
    }), // Must match name in data service and in visualization.tsx
  },
  isEnabledInPicker: isEnabledInPicker,
  studyRequirements:
    'These visualizations are only available for studies with compatible assay data.',
};

function DifferentialExpressionConfigDescriptionComponent({
  computation,
  filters,
}: {
  computation: Computation;
  filters: Filter[];
}) {
  assertComputationWithConfig(computation, DifferentialExpressionConfig);
  const findEntityAndVariable = useFindEntityAndVariable(filters);
  const { configuration } = computation.descriptor;

  const identifierVariable = configuration.identifierVariable
    ? findEntityAndVariable(configuration.identifierVariable)
    : undefined;

  const valueVariable = configuration.valueVariable
    ? findEntityAndVariable(configuration.valueVariable)
    : undefined;

  const comparatorVariable = configuration.comparator
    ? findEntityAndVariable(configuration.comparator.variable)
    : undefined;

  return (
    <div className="ConfigDescriptionContainer">
      <h4>
        Gene Identifier:{' '}
        <span>
          {identifierVariable ? (
            `${identifierVariable.entity.displayName} > ${identifierVariable.variable.displayName}`
          ) : (
            <i>Not selected</i>
          )}
        </span>
      </h4>
      <h4>
        Expression Data:{' '}
        <span>
          {valueVariable ? (
            `${valueVariable.entity.displayName} > ${valueVariable.variable.displayName}`
          ) : (
            <i>Not selected</i>
          )}
        </span>
      </h4>
      <h4>
        Comparator Variable:{' '}
        <span>
          {comparatorVariable ? (
            comparatorVariable.variable.displayName
          ) : (
            <i>Not selected</i>
          )}
        </span>
      </h4>
    </div>
  );
}

// Method keys must match what the backend expects.
// limma is coming soon.
const DIFFERENTIAL_EXPRESSION_METHODS = {
  DESeq: {
    displayName: 'DESeq2',
    citation: (
      <a href="https://genomebiology.biomedcentral.com/articles/10.1186/s13059-014-0550-8">
        (Love et al., 2014)
      </a>
    ),
  },
} as const satisfies Record<
  string,
  { displayName: string; citation: ReactNode }
>;

type DifferentialExpressionMethodKey =
  keyof typeof DIFFERENTIAL_EXPRESSION_METHODS;

export function DifferentialExpressionConfiguration(
  props: ComputationConfigProps
) {
  const {
    computationAppOverview,
    computation,
    analysisState,
    visualizationId,
    changeConfigHandlerOverride,
    showStepNumber = true,
  } = props;

  const configuration = computation.descriptor
    .configuration as DifferentialExpressionConfig;
  const studyMetadata = useStudyMetadata();
  const dataClient = useDataClient();
  const toggleStarredVariable = useToggleStarredVariable(props.analysisState);
  const filters = analysisState.analysis?.descriptor.subset.descriptor;
  const findEntityAndVariable = useFindEntityAndVariable(filters);
  const subsettingClient = useSubsettingClient();

  assertComputationWithConfig(computation, DifferentialExpressionConfig);

  const workspaceChangeConfigHandler = useConfigChangeHandler(
    analysisState,
    computation,
    visualizationId
  );

  // Depending on context, we might need a different changeConfigHandler. For example,
  // in the notebook.
  const changeConfigHandler =
    changeConfigHandlerOverride ?? workspaceChangeConfigHandler;

  // If the subset changes while we are configuring the app (for example in a notebook),
  // we want to reset the values of the comparator variable because it's
  // possible that in this new subset the values do not exist anymore.
  // This is true for continuous and categorical variables. Continuous
  // variables will have their bins recalculated if they are affected by a filter.
  const previousSubset = useRef(
    analysisState.analysis?.descriptor.subset.descriptor
  );

  useEffect(() => {
    if (
      !configuration.comparator ||
      (!configuration.comparator.groupA && !configuration.comparator.groupB)
    )
      return;
    if (
      previousSubset.current &&
      !isEqual(
        previousSubset.current,
        analysisState.analysis?.descriptor.subset.descriptor
      )
    ) {
      previousSubset.current =
        analysisState.analysis?.descriptor.subset.descriptor;

      // Reset the groupA and groupB values.
      changeConfigHandler('comparator', {
        variable: configuration.comparator.variable,
        groupA: undefined,
        groupB: undefined,
      });

      enqueueSnackbar(
        <span>
          Reset differential expression group A and B values due to changed
          subset.
        </span>,
        { variant: 'info' }
      );
    }
  }, [
    analysisState.analysis?.descriptor.subset.descriptor,
    changeConfigHandler,
    configuration.comparator,
  ]);

  const entities = useMemo(
    () =>
      studyMetadata?.rootEntity
        ? entityTreeToArray(studyMetadata.rootEntity)
        : [],
    [studyMetadata]
  );

  const selectedComparatorVariable = useMemo(() => {
    if (
      configuration &&
      configuration.comparator &&
      'variable' in configuration.comparator
    ) {
      return findEntityAndVariable(configuration.comparator.variable);
    }
  }, [configuration, findEntityAndVariable]);

  // Find any filters that are not specifically on the comparator variable.
  const otherFilters = filters?.filter(
    (f) =>
      f.entityId !== configuration.comparator?.variable.entityId ||
      f.variableId !== configuration.comparator?.variable.variableId
  );

  // Find the selected comparator variable distribution. For cateogrical variables only.
  // Will be used to disable values that have been filtered out of the subset.
  const filteredComparatorVariableDistribution = useCachedPromise<
    DistributionResponse | undefined
  >(async () => {
    if (
      configuration.comparator == null ||
      configuration.comparator.variable == null ||
      selectedComparatorVariable?.variable.dataShape === 'continuous' || // The following is for categorical variables only
      otherFilters == null ||
      otherFilters.length === 0
    ) {
      return;
    }

    const variableDistribution = await subsettingClient.getDistribution(
      studyMetadata.id,
      configuration.comparator.variable.entityId,
      configuration.comparator.variable.variableId,
      {
        valueSpec: 'count',
        filters: otherFilters,
      }
    );

    return variableDistribution;
  }, [configuration.comparator, filters, studyMetadata.id]);

  // If the variable is continuous, ask the backend for a list of bins
  const continuousVariableBins = useCachedPromise(async () => {
    if (
      !ContinuousVariableDataShape.is(
        selectedComparatorVariable?.variable.dataShape
      ) ||
      configuration.comparator == null
    )
      return;

    const binRangeProps: GetBinRangesProps = {
      studyId: studyMetadata.id,
      ...configuration.comparator.variable,
      filters: filters ?? [],
      dataClient,
      binningMethod: 'quantile',
    };
    const bins = await getBinRanges(binRangeProps);
    return bins;
  }, [
    configuration?.comparator,
    filters,
    selectedComparatorVariable,
    studyMetadata.id,
  ]);

  const disableSwapGroupValuesButton =
    !configuration?.comparator?.groupA && !configuration?.comparator?.groupB;
  const disableGroupValueSelectors = !configuration?.comparator?.variable;

  // Create the options for groupA and groupB. Organizing into the LabeledRange[] format
  // here in order to keep the later code clean.
  const groupValueOptions = continuousVariableBins.value
    ? continuousVariableBins.value.map((bin): LabeledRange => {
        return {
          min: bin.binStart,
          max: bin.binEnd,
          label: bin.binLabel,
        };
      })
    : selectedComparatorVariable?.variable.vocabulary?.map(
        (value): LabeledRange => {
          return {
            label: value,
          };
        }
      );

  // Determine any values that were filtered out based on the subset.
  // This is used to disable values in the ValuePicker.
  const disabledVariableValues =
    selectedComparatorVariable?.variable.vocabulary?.filter((value) => {
      // Let all values pass if there was no filteredComparatorVariableDistribution
      if (
        filteredComparatorVariableDistribution.value == null ||
        filteredComparatorVariableDistribution.value.histogram.length === 0
      )
        return false;

      // Disable a variable if it does not appear in filteredComparatorVariableDistribution
      return !filteredComparatorVariableDistribution.value.histogram.some(
        (bin) => bin.binLabel === value
      );
    });

  return (
    <ComputationStepContainer
      computationStepInfo={{
        stepNumber: 1,
        stepTitle: `Configure ${computationAppOverview.displayName}`,
      }}
      showStepNumber={showStepNumber}
    >
      <div className={cx()}>
        <div className={cx('-DiffExpressionOuterConfigContainer')}>
          <H6>Input Data</H6>
          <InputVariables
            inputs={[
              {
                name: 'identifierVariable',
                label: 'Gene Identifier',
                role: 'axis',
                titleOverride: 'Expression Data',
              },
              {
                name: 'valueVariable',
                label: 'Count type',
                role: 'axis',
              },
              {
                name: 'comparatorVariable',
                label: 'Metadata Variable',
                role: 'stratification',
                titleOverride: 'Group Comparison',
              },
            ]}
            entities={entities}
            selectedVariables={{
              identifierVariable: configuration.identifierVariable,
              valueVariable: configuration.valueVariable,
              comparatorVariable: configuration.comparator?.variable,
            }}
            onChange={(vars) => {
              if (
                vars.identifierVariable !== configuration.identifierVariable
              ) {
                changeConfigHandler(
                  'identifierVariable',
                  vars.identifierVariable
                );
              }
              if (vars.valueVariable !== configuration.valueVariable) {
                changeConfigHandler('valueVariable', vars.valueVariable);
              }
              if (
                vars.comparatorVariable !== configuration.comparator?.variable
              ) {
                changeConfigHandler(
                  'comparator',
                  vars.comparatorVariable
                    ? {
                        variable: vars.comparatorVariable as VariableDescriptor,
                      }
                    : undefined
                );
              }
            }}
            constraints={geneExpressionConstraints}
            dataElementDependencyOrder={geneExpressionDependencyOrder}
            starredVariables={
              analysisState.analysis?.descriptor.starredVariables ?? []
            }
            toggleStarredVariable={toggleStarredVariable}
          />
        </div>
        <div className={cx('-DiffExpressionOuterConfigContainer')}>
          <H6>Group Values</H6>
          <div
            className={cx('-DiffExpressionOuterConfigContainerGroupComparison')}
          >
            <Tooltip
              title={
                disableGroupValueSelectors
                  ? 'Please select a Metadata Variable first'
                  : ''
              }
            >
              <div
                className={cx(
                  '-InputContainer',
                  disableGroupValueSelectors && 'disabled'
                )}
              >
                <span>Reference Group</span>
                <ValuePicker
                  allowedValues={
                    !continuousVariableBins.pending
                      ? groupValueOptions?.map((option) => option.label)
                      : undefined
                  }
                  selectedValues={configuration.comparator?.groupA?.map(
                    (entry) => entry.label
                  )}
                  disabledValues={[
                    ...(configuration.comparator?.groupB?.map(
                      (entry) => entry.label
                    ) ?? []), // Remove group B values
                    ...(disabledVariableValues ?? []), // Remove filtered values
                  ]}
                  onSelectedValuesChange={(newValues) => {
                    assertConfigWithComparator(configuration);
                    changeConfigHandler('comparator', {
                      variable: configuration.comparator.variable,
                      groupA: newValues.length
                        ? groupValueOptions?.filter((option) =>
                            newValues.includes(option.label)
                          )
                        : undefined,
                      groupB: configuration.comparator.groupB ?? undefined,
                    });
                  }}
                  disabledCheckboxTooltipContent="Value either already selected in Group B or has no data in the subset"
                  showClearSelectionButton={false}
                  disableInput={disableGroupValueSelectors}
                  isLoading={continuousVariableBins.pending}
                />
                <FloatingButton
                  icon={SwapHorizOutlined}
                  text=""
                  themeRole="primary"
                  onPress={() => {
                    assertConfigWithComparator(configuration);
                    changeConfigHandler('comparator', {
                      variable:
                        configuration?.comparator?.variable ?? undefined,
                      groupA: configuration?.comparator?.groupB ?? undefined,
                      groupB: configuration?.comparator?.groupA ?? undefined,
                    });
                  }}
                  styleOverrides={{
                    container: {
                      padding: 0,
                      margin: '0 5px',
                    },
                  }}
                  disabled={
                    disableGroupValueSelectors || disableSwapGroupValuesButton
                  }
                  /**
                   * For some reason the tooltip content renders when the parent container is in the disabled state.
                   * To prevent such ghastly behavior, let's not pass in the tooltip prop when the parent is disabled.
                   */
                  {...(!disableGroupValueSelectors
                    ? { tooltip: 'Swap Group A and Group B values' }
                    : {})}
                />
                <span>Comparison Group</span>
                <ValuePicker
                  allowedValues={
                    !continuousVariableBins.pending
                      ? groupValueOptions?.map((option) => option.label)
                      : undefined
                  }
                  selectedValues={configuration?.comparator?.groupB?.map(
                    (entry) => entry.label
                  )}
                  disabledValues={[
                    ...(configuration.comparator?.groupA?.map(
                      (entry) => entry.label
                    ) ?? []), // Remove group A values
                    ...(disabledVariableValues ?? []), // Remove filtered values
                  ]}
                  onSelectedValuesChange={(newValues) => {
                    assertConfigWithComparator(configuration);
                    changeConfigHandler('comparator', {
                      variable:
                        configuration?.comparator?.variable ?? undefined,
                      groupA: configuration?.comparator?.groupA ?? undefined,
                      groupB: newValues.length
                        ? groupValueOptions?.filter((option) =>
                            newValues.includes(option.label)
                          )
                        : undefined,
                    });
                  }}
                  disabledCheckboxTooltipContent="Value either already selected in Group A or has no data in the subset"
                  showClearSelectionButton={false}
                  disableInput={disableGroupValueSelectors}
                  isLoading={continuousVariableBins.pending}
                />
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    </ComputationStepContainer>
  );
}

function assertConfigWithComparator(
  configuration: DifferentialExpressionConfig
): asserts configuration is Required<DifferentialExpressionConfig> {
  if (configuration.comparator == null) {
    throw new Error(
      'Unexpected condition: `configuration.comparator.variable` is not defined.'
    );
  }
}

// Differential expression requires that the study
// has at least one collection.
function isEnabledInPicker({
  studyMetadata,
}: IsEnabledInPickerParams): boolean {
  if (!studyMetadata) return false;

  const entities = entityTreeToArray(studyMetadata.rootEntity);

  // Check if we have the required gene expression variables
  const hasIdentifierVariable = entities.some((entity) =>
    entity.variables.some(
      (variable) => variable.id === GENE_EXPRESSION_STABLE_IDS.IDENTIFIER
    )
  );

  const hasValueVariable = entities.some((entity) =>
    entity.variables.some((variable) =>
      GENE_EXPRESSION_VALUE_IDS.includes(variable.id as any)
    )
  );

  return hasIdentifierVariable && hasValueVariable;
}
