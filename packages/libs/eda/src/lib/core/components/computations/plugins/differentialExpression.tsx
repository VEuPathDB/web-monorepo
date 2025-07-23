import {
  ContinuousVariableDataShape,
  LabeledRange,
  usePromise,
  useStudyMetadata,
} from '../../..';
import {
  VariableDescriptor,
  VariableCollectionDescriptor,
} from '../../../types/variable';
import { volcanoPlotVisualization } from '../../visualizations/implementations/VolcanoPlotVisualization';
import { ComputationConfigProps, ComputationPlugin } from '../Types';
import { isEqual, partial } from 'lodash';
import {
  useConfigChangeHandler,
  assertComputationWithConfig,
  partialToCompleteCodec,
} from '../Utils';
import * as t from 'io-ts';
import { Computation } from '../../../types/visualization';
import {
  useDataClient,
  useFindEntityAndVariable,
  useFindEntityAndVariableCollection,
} from '../../../hooks/workspace';
import { ReactNode, useCallback, useEffect, useMemo, useRef } from 'react';
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
import { enqueueSnackbar } from 'notistack';

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

export type DifferentialExpressionConfig = t.TypeOf<
  typeof DifferentialExpressionConfig
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
export const DifferentialExpressionConfig = t.partial({
  collectionVariable: VariableCollectionDescriptor,
  comparator: Comparator,
  differentialExpressionMethod: t.string,
  pValueFloor: t.string,
});

const CompleteDifferentialExpressionConfig = partialToCompleteCodec(
  DifferentialExpressionConfig
);

// Check to ensure the entirety of the configuration is filled out before enabling the
// Generate Results button.
function isCompleteDifferentialExpressionConfig(config: unknown) {
  return (
    CompleteDifferentialExpressionConfig.is(config) &&
    config.comparator.groupA != null &&
    config.comparator.groupB != null
  );
}

export const plugin: ComputationPlugin = {
  configurationComponent: DifferentialExpressionConfiguration,
  configurationDescriptionComponent:
    DifferentialExpressionConfigDescriptionComponent,
  createDefaultConfiguration: () => ({}),
  isConfigurationComplete: isCompleteDifferentialExpressionConfig,
  visualizationPlugins: {
    volcanoplot: volcanoPlotVisualization.withOptions({
      getPlotSubtitle(config) {
        if (
          DifferentialExpressionConfig.is(config) &&
          config.differentialExpressionMethod &&
          config.differentialExpressionMethod in
            DIFFERENTIAL_EXPRESSION_METHOD_CITATIONS
        ) {
          return (
            <span>
              Differential expression computed using{' '}
              {config.differentialExpressionMethod}{' '}
              {
                DIFFERENTIAL_EXPRESSION_METHOD_CITATIONS[
                  config.differentialExpressionMethod as keyof typeof DIFFERENTIAL_EXPRESSION_METHOD_CITATIONS
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

function DifferentialExpressionConfigDescriptionComponent({
  computation,
  filters,
}: {
  computation: Computation;
  filters: Filter[];
}) {
  const findEntityAndVariableCollection = useFindEntityAndVariableCollection();
  assertComputationWithConfig(computation, DifferentialExpressionConfig);
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
type DifferentialExpressionMethodCitations = { DESeq: ReactNode };
const DIFFERENTIAL_EXPRESSION_METHOD_CITATIONS: DifferentialExpressionMethodCitations =
  {
    DESeq: (
      <a href="https://genomebiology.biomedcentral.com/articles/10.1186/s13059-014-0550-8">
        (Love et al., 2014)
      </a>
    ),
  };

const DIFFERENTIAL_EXPRESSION_METHODS = Object.keys(
  DIFFERENTIAL_EXPRESSION_METHOD_CITATIONS
);

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

  // Set the pValueFloor here. May change for other apps.
  // Note this is intentionally different than the default pValueFloor used in the Volcano component. By default
  // that component does not floor the data, but we know we want the diff abund computation to use a floor.
  if (configuration && !configuration.pValueFloor) {
    changeConfigHandler('pValueFloor', '1e-200');
  }

  if (configuration && !configuration.differentialExpressionMethod) {
    changeConfigHandler(
      'differentialExpressionMethod',
      DIFFERENTIAL_EXPRESSION_METHODS[0]
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

  // If the variable is continuous, ask the backend for a list of bins
  const continuousVariableBins = usePromise(
    useCallback(async () => {
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
      dataClient,
      configuration?.comparator,
      filters,
      selectedComparatorVariable,
      studyMetadata.id,
    ])
  );

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
          <div className={cx('-InputContainer')}>
            <span>Data</span>
            <VariableCollectionSelectList
              value={configuration.collectionVariable}
              onSelect={partial(changeConfigHandler, 'collectionVariable')}
              collectionPredicate={(collection) => true}
            />
          </div>
        </div>
        <div className={cx('-DiffExpressionOuterConfigContainer')}>
          <H6>Group Comparison</H6>
          <div
            className={cx('-DiffExpressionOuterConfigContainerGroupComparison')}
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
                  disabledValues={configuration.comparator?.groupB?.map(
                    (entry) => entry.label
                  )}
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
                  disabledCheckboxTooltipContent="Values cannot overlap between groups"
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
                  disabledValues={configuration?.comparator?.groupA?.map(
                    (entry) => entry.label
                  )}
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
  // Ensure there are collections in this study. Otherwise, disable app
  const studyHasCollections = entities.some(
    (entity) => !!entity.collections?.length
  );

  return studyHasCollections;
}
