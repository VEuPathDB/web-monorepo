import {
  ContinuousVariableDataShape,
  LabeledRange,
  useCollectionVariables,
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
import { useConfigChangeHandler, assertComputationWithConfig } from '../Utils';
import * as t from 'io-ts';
import { Computation } from '../../../types/visualization';
import SingleSelect from '@veupathdb/coreui/lib/components/inputs/SingleSelect';
import {
  useDataClient,
  useFindEntityAndVariable,
} from '../../../hooks/workspace';
import { useCallback, useMemo } from 'react';
import { ComputationStepContainer } from '../ComputationStepContainer';
import VariableTreeDropdown from '../../variableTrees/VariableTreeDropdown';
import { ValuePicker } from '../../visualizations/implementations/ValuePicker';
import { useToggleStarredVariable } from '../../../hooks/starredVariables';
import { Filter } from '../../..';
import { FloatingButton, H6 } from '@veupathdb/coreui';
import { SwapHorizOutlined } from '@material-ui/icons';
import './Plugins.scss';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { Tooltip } from '@material-ui/core';
import {
  GetBinRangesProps,
  getBinRanges,
} from '../../../../map/analysis/utils/defaultOverlayConfig';

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
export const DifferentialAbundanceConfig = t.type({
  collectionVariable: VariableCollectionDescriptor,
  comparator: Comparator,
  differentialAbundanceMethod: t.string,
});

// Check to ensure the entirety of the configuration is filled out before enabling the
// Generate Results button.
function isCompleteDifferentialAbundanceConfig(config: unknown) {
  return (DifferentialAbundanceConfig.is(config) &&
    config.comparator.groupA &&
    config.comparator.groupB) as boolean;
}

export const plugin: ComputationPlugin = {
  configurationComponent: DifferentialAbundanceConfiguration,
  configurationDescriptionComponent:
    DifferentialAbundanceConfigDescriptionComponent,
  createDefaultConfiguration: () => undefined,
  isConfigurationValid: isCompleteDifferentialAbundanceConfig,
  visualizationPlugins: {
    volcanoplot: volcanoPlotVisualization, // Must match name in data service and in visualization.tsx
  },
};

function DifferentialAbundanceConfigDescriptionComponent({
  computation,
  filters,
}: {
  computation: Computation;
  filters: Filter[];
}) {
  const studyMetadata = useStudyMetadata();
  const collections = useCollectionVariables(studyMetadata.rootEntity);
  assertComputationWithConfig<DifferentialAbundanceConfig>(
    computation,
    Computation
  );
  const findEntityAndVariable = useFindEntityAndVariable(filters);
  const { configuration } = computation.descriptor;
  const collectionVariable =
    'collectionVariable' in configuration
      ? configuration.collectionVariable
      : undefined;
  const comparatorVariable =
    'comparator' in configuration
      ? findEntityAndVariable(configuration.comparator.variable)
      : undefined;

  const updatedCollectionVariable = collections.find((collectionVar) =>
    isEqual(
      {
        variableId: collectionVar.id,
        entityId: collectionVar.entityId,
      },
      collectionVariable
    )
  );

  return (
    <div className="ConfigDescriptionContainer">
      <h4>
        Data:{' '}
        <span>
          {updatedCollectionVariable ? (
            `${updatedCollectionVariable?.entityDisplayName} > ${updatedCollectionVariable?.displayName}`
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
// TODO do we need the display names different to these internal strings?
const DIFFERENTIAL_ABUNDANCE_METHODS = ['DESeq', 'Maaslin'];

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

  // For now, set the method to DESeq2. When we add the next method, we can just add it here (no api change!)
  if (configuration) configuration.differentialAbundanceMethod = 'DESeq';

  // Include known collection variables in this array.
  const collections = useCollectionVariables(studyMetadata.rootEntity);
  if (collections.length === 0)
    throw new Error('Could not find any collections for this app.');

  assertComputationWithConfig<DifferentialAbundanceConfig>(
    computation,
    Computation
  );

  const changeConfigHandler =
    useConfigChangeHandler<DifferentialAbundanceConfig>(
      analysisState,
      computation,
      visualizationId
    );

  const collectionVarItems = useMemo(() => {
    return collections
      .filter((collectionVar) => {
        return collectionVar.normalizationMethod
          ? !collectionVar.isProportion &&
              collectionVar.normalizationMethod === 'NULL' &&
              !collectionVar.displayName?.includes('pathway')
          : true;
      })
      .map((collectionVar) => ({
        value: {
          variableId: collectionVar.id,
          entityId: collectionVar.entityId,
        },
        display:
          collectionVar.entityDisplayName + ' > ' + collectionVar.displayName,
      }));
  }, [collections]);

  // TODO presumably to keep the saved analyses from breaking, we need to maintain support for a variableId
  const selectedCollectionVar = useMemo(() => {
    if (configuration && 'collectionVariable' in configuration) {
      const selectedItem = collectionVarItems.find((item) =>
        isEqual(item.value, {
          variableId: configuration.collectionVariable.collectionId,
          entityId: configuration.collectionVariable.entityId,
        })
      );
      return selectedItem;
    }
  }, [collectionVarItems, configuration]);

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
        )
      )
        return;

      const binRangeProps: GetBinRangesProps = {
        studyId: studyMetadata.id,
        ...configuration.comparator?.variable,
        filters: filters ?? [],
        dataClient,
        binningMethod: 'quantile',
      };
      const bins = await getBinRanges(binRangeProps);
      return bins;
    }, [
      dataClient,
      configuration?.comparator?.variable,
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

  const differentialAbundanceMethod = useMemo(() => {
    if (configuration && 'differentialAbundanceMethod' in configuration) {
      return configuration.differentialAbundanceMethod;
    }
  }, [configuration]);

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
            <SingleSelect
              value={
                selectedCollectionVar
                  ? selectedCollectionVar.value
                  : 'Select the data'
              }
              buttonDisplayContent={
                selectedCollectionVar
                  ? selectedCollectionVar.display
                  : 'Select the data'
              }
              items={collectionVarItems}
              onSelect={partial(changeConfigHandler, 'collectionVariable')}
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
                  selectedValues={configuration?.comparator?.groupA?.map(
                    (entry) => entry.label
                  )}
                  disabledValues={configuration?.comparator?.groupB?.map(
                    (entry) => entry.label
                  )}
                  onSelectedValuesChange={(newValues) => {
                    changeConfigHandler('comparator', {
                      variable:
                        configuration?.comparator?.variable ?? undefined,
                      groupA: newValues.length
                        ? groupValueOptions?.filter((option) =>
                            newValues.includes(option.label)
                          )
                        : undefined,
                      groupB: configuration?.comparator?.groupB ?? undefined,
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
                  onPress={() =>
                    changeConfigHandler('comparator', {
                      variable:
                        configuration?.comparator?.variable ?? undefined,
                      groupA: configuration?.comparator?.groupB ?? undefined,
                      groupB: configuration?.comparator?.groupA ?? undefined,
                    })
                  }
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
                  onSelectedValuesChange={(newValues) =>
                    changeConfigHandler('comparator', {
                      variable:
                        configuration?.comparator?.variable ?? undefined,
                      groupA: configuration?.comparator?.groupA ?? undefined,
                      groupB: newValues.length
                        ? groupValueOptions?.filter((option) =>
                            newValues.includes(option.label)
                          )
                        : undefined,
                    })
                  }
                  disabledCheckboxTooltipContent="Values cannot overlap between groups"
                  showClearSelectionButton={false}
                  disableInput={disableGroupValueSelectors}
                  isLoading={continuousVariableBins.pending}
                />
              </div>
            </Tooltip>
          </div>
        </div>

        <div className={cx('-InputContainer')}>
          <span>Method</span>
          <SingleSelect
            value={differentialAbundanceMethod ?? 'Select a method'}
            buttonDisplayContent={
              differentialAbundanceMethod ?? 'Select a method'
            }
            onSelect={partial(
              changeConfigHandler,
              'differentialAbundanceMethod'
            )}
            items={DIFFERENTIAL_ABUNDANCE_METHODS.map((method) => ({
              value: method,
              display: method,
            }))}
          />
        </div>
      </div>
    </ComputationStepContainer>
  );
}
