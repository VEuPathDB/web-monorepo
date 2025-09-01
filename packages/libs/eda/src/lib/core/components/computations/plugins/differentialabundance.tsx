import {
  ContinuousVariableDataShape,
  DistributionResponse,
  LabeledRange,
  useStudyMetadata,
} from '../../..';
import {
  VariableDescriptor,
  VariableCollectionDescriptor,
} from '../../../types/variable';
import { volcanoPlotVisualization } from '../../visualizations/implementations/VolcanoPlotVisualization';
import { ComputationConfigProps, ComputationPlugin } from '../Types';
import { partial } from 'lodash';
import {
  useConfigChangeHandler,
  assertComputationWithConfig,
  isNotAbsoluteAbundanceVariableCollection,
  partialToCompleteCodec,
} from '../Utils';
import * as t from 'io-ts';
import { Computation } from '../../../types/visualization';
import {
  useDataClient,
  useFindEntityAndVariable,
  useFindEntityAndVariableCollection,
  useSubsettingClient,
} from '../../../hooks/workspace';
import { ReactNode, useMemo } from 'react';
import { ComputationStepContainer } from '../ComputationStepContainer';
import VariableTreeDropdown from '../../variableSelectors/VariableTreeDropdown';
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
import { VariableCollectionSelectList } from '../../variableSelectors/VariableCollectionSingleSelect';
import { IsEnabledInPickerParams } from '../../visualizations/VisualizationTypes';
import { entityTreeToArray } from '../../../utils/study-metadata';
import { useCachedPromise } from '../../../hooks/cachedPromise';

const cx = makeClassNameHelper('AppStepConfigurationContainer');

/**
 * Differential abundance
 *
 * The differential abundance app is used to find taxa, genes, pathways, etc. that
 * are more abundant in one group of samples than another. This app takes in a continuous variable
 * collection (for example, abundance of 100 Species for all samples) as well as a way to split the samples
 * into two groups (for example, red hair and green hair). The computation then returns information on how
 * differentially abundance each item (taxon, gene, etc.) is between the two groups. See VolcanoPlotDataPoint
 * for more details. Importantly, the returned data lives outside the variable tree because each returned
 * data point corresponds to an item (taxon, gene, etc.).
 *
 * Currently the differential abundance app will be implemented with only a volcano visualization. Plans for
 * the future of this app include a lefse diagram, tables of results, adding new computation methods, and
 * strategies to create user-defined collections from the output of the computation.
 */

export type DifferentialAbundanceConfig = t.TypeOf<
  typeof DifferentialAbundanceConfig
>;

const Comparator = t.intersection([
  t.partial({
    groupA: t.array(LabeledRange),
    groupB: t.array(LabeledRange),
  }),
  t.type({
    variable: VariableDescriptor,
  }),
]);

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const DifferentialAbundanceConfig = t.partial({
  collectionVariable: VariableCollectionDescriptor,
  comparator: Comparator,
  differentialAbundanceMethod: t.string,
  pValueFloor: t.string,
});

const CompleteDifferentialAbundanceConfig = partialToCompleteCodec(
  DifferentialAbundanceConfig
);

// Check to ensure the entirety of the configuration is filled out before enabling the
// Generate Results button.
function isCompleteDifferentialAbundanceConfig(config: unknown) {
  return (
    CompleteDifferentialAbundanceConfig.is(config) &&
    config.comparator.groupA != null &&
    config.comparator.groupB != null
  );
}

export const plugin: ComputationPlugin = {
  configurationComponent: DifferentialAbundanceConfiguration,
  configurationDescriptionComponent:
    DifferentialAbundanceConfigDescriptionComponent,
  createDefaultConfiguration: () => ({}),
  isConfigurationComplete: isCompleteDifferentialAbundanceConfig,
  visualizationPlugins: {
    volcanoplot: volcanoPlotVisualization.withOptions({
      getPlotSubtitle(config) {
        if (
          DifferentialAbundanceConfig.is(config) &&
          config.differentialAbundanceMethod &&
          config.differentialAbundanceMethod in
            DIFFERENTIAL_ABUNDANCE_METHOD_CITATIONS
        ) {
          return (
            <span>
              Differential abundance computed using{' '}
              {config.differentialAbundanceMethod}{' '}
              {
                DIFFERENTIAL_ABUNDANCE_METHOD_CITATIONS[
                  config.differentialAbundanceMethod as keyof typeof DIFFERENTIAL_ABUNDANCE_METHOD_CITATIONS
                ]
              }{' '}
              with default parameters.
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

function DifferentialAbundanceConfigDescriptionComponent({
  computation,
  filters,
}: {
  computation: Computation;
  filters: Filter[];
}) {
  const findEntityAndVariableCollection = useFindEntityAndVariableCollection();
  assertComputationWithConfig(computation, DifferentialAbundanceConfig);
  const findEntityAndVariable = useFindEntityAndVariable(filters);
  const { configuration } = computation.descriptor;
  const collectionVariable =
    'collectionVariable' in configuration
      ? configuration.collectionVariable
      : undefined;
  const comparatorVariable = configuration.comparator
    ? findEntityAndVariable(configuration.comparator.variable)
    : undefined;

  const entityAndCollectionVariableTreeNode =
    findEntityAndVariableCollection(collectionVariable);

  return (
    <div className="ConfigDescriptionContainer">
      <h4>
        Data:{' '}
        <span>
          {entityAndCollectionVariableTreeNode ? (
            `${entityAndCollectionVariableTreeNode.entity.displayName} > ${entityAndCollectionVariableTreeNode.variableCollection.displayName}`
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

// Include available methods in this array.
// 10/10/23 - decided to only release Maaslin for the first roll-out. DESeq is still available
// and we're poised to release it in the future.
type DifferentialAbundanceMethodCitations = { Maaslin: ReactNode };
const DIFFERENTIAL_ABUNDANCE_METHOD_CITATIONS: DifferentialAbundanceMethodCitations =
  {
    Maaslin: (
      <a href="https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1009442">
        (Mallick et al., 2021)
      </a>
    ),
  }; // + deseq paper in the future
const DIFFERENTIAL_ABUNDANCE_METHODS = Object.keys(
  DIFFERENTIAL_ABUNDANCE_METHOD_CITATIONS
); // + 'DESeq' in the future

export function DifferentialAbundanceConfiguration(
  props: ComputationConfigProps
) {
  const {
    computationAppOverview,
    computation,
    analysisState,
    visualizationId,
  } = props;

  const configuration = computation.descriptor
    .configuration as DifferentialAbundanceConfig;
  const studyMetadata = useStudyMetadata();
  const dataClient = useDataClient();
  const toggleStarredVariable = useToggleStarredVariable(props.analysisState);
  const filters = analysisState.analysis?.descriptor.subset.descriptor;
  const findEntityAndVariable = useFindEntityAndVariable(filters);
  const subsettingClient = useSubsettingClient();

  assertComputationWithConfig(computation, DifferentialAbundanceConfig);

  const changeConfigHandler = useConfigChangeHandler(
    analysisState,
    computation,
    visualizationId
  );

  // Set the pValueFloor here. May change for other apps.
  // Note this is intentionally different than the default pValueFloor used in the Volcano component. By default
  // that component does not floor the data, but we know we want the diff abund computation to use a floor.
  if (configuration && !configuration.pValueFloor) {
    changeConfigHandler('pValueFloor', '1e-200');
  }

  // Only releasing Maaslin for b66
  if (configuration && !configuration.differentialAbundanceMethod) {
    changeConfigHandler(
      'differentialAbundanceMethod',
      DIFFERENTIAL_ABUNDANCE_METHODS[0]
    );
  }

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
    >
      <div className={cx()}>
        <div className={cx('-DiffAbundanceOuterConfigContainer')}>
          <H6>Input Data</H6>
          <div className={cx('-InputContainer')}>
            <span>Data</span>
            <VariableCollectionSelectList
              value={configuration.collectionVariable}
              onSelect={partial(changeConfigHandler, 'collectionVariable')}
              collectionPredicate={isNotAbsoluteAbundanceVariableCollection}
            />
          </div>
        </div>
        <div className={cx('-DiffAbundanceOuterConfigContainer')}>
          <H6>Group Comparison</H6>
          <div
            className={cx('-DiffAbundanceOuterConfigContainerGroupComparison')}
          >
            <div className={cx('-InputContainer')}>
              <span>Variable</span>
              <VariableTreeDropdown
                showClearSelectionButton={false}
                scope="variableTree"
                showMultiFilterDescendants
                starredVariables={
                  analysisState.analysis?.descriptor.starredVariables
                }
                toggleStarredVariable={toggleStarredVariable}
                entityId={configuration?.comparator?.variable?.entityId}
                variableId={configuration?.comparator?.variable?.variableId}
                variableLinkConfig={{
                  type: 'button',
                  onClick: (variable) => {
                    changeConfigHandler('comparator', {
                      variable: variable as VariableDescriptor,
                    });
                  },
                }}
              />
            </div>
            <Tooltip
              title={
                disableGroupValueSelectors
                  ? 'Please select a Group Comparison variable first'
                  : ''
              }
            >
              <div
                className={cx(
                  '-InputContainer',
                  disableGroupValueSelectors && 'disabled'
                )}
              >
                <span>Group A</span>
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
                <span>Group B</span>
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
                  disabledCheckboxTooltipContent="Values cannot overlap between groups"
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
  configuration: DifferentialAbundanceConfig
): asserts configuration is Required<DifferentialAbundanceConfig> {
  if (configuration.comparator == null) {
    throw new Error(
      'Unexpected condition: `configuration.comparator.variable` is not defined.'
    );
  }
}

// Differential abundance requires that the study
// has at least one collection.
function isEnabledInPicker({
  studyMetadata,
}: IsEnabledInPickerParams): boolean {
  if (!studyMetadata) return false;

  const entities = entityTreeToArray(studyMetadata.rootEntity);
  // Ensure there are collections in this study. Otherwise, disable app
  const studyHasCollections = entities.some(
    (entity) => !!entity.collections?.length
  );

  return studyHasCollections;
}
