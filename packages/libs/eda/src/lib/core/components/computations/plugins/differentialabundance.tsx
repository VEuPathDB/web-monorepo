import { useCollectionVariables, useStudyMetadata } from '../../..';
import { VariableDescriptor } from '../../../types/variable';
import { volcanoPlotVisualization } from '../../visualizations/implementations/VolcanoPlotVisualization';
import { ComputationConfigProps, ComputationPlugin } from '../Types';
import { isEqual, partial } from 'lodash';
import { useConfigChangeHandler, assertComputationWithConfig } from '../Utils';
import * as t from 'io-ts';
import { Computation } from '../../../types/visualization';
import SingleSelect from '@veupathdb/coreui/lib/components/inputs/SingleSelect';
import { useFindEntityAndVariable } from '../../../hooks/workspace';
import { useMemo } from 'react';
import { ComputationStepContainer } from '../ComputationStepContainer';
import VariableTreeDropdown from '../../variableTrees/VariableTreeDropdown';
import { ValuePicker } from '../../visualizations/implementations/ValuePicker';
import { useToggleStarredVariable } from '../../../hooks/starredVariables';
import { Filter } from '../../..';
import { FloatingButton, H6 } from '@veupathdb/coreui';
import { SwapHorizOutlined } from '@material-ui/icons';
import './Plugins.scss';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

const cx = makeClassNameHelper('StepOneConfigurationContainer');

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
    groupA: t.array(t.string),
    groupB: t.array(t.string),
  }),
  t.type({
    variable: VariableDescriptor,
  }),
]);

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const DifferentialAbundanceConfig = t.type({
  collectionVariable: VariableDescriptor,
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
    <>
      <h4 style={{ padding: '15px 0 0 0', marginLeft: 20 }}>
        Data:{' '}
        <span style={{ fontWeight: 300 }}>
          {updatedCollectionVariable ? (
            `${updatedCollectionVariable?.entityDisplayName} > ${updatedCollectionVariable?.displayName}`
          ) : (
            <i>Not selected</i>
          )}
        </span>
      </h4>
      <h4 style={{ padding: 0, marginLeft: 20 }}>
        Comparator Variable:{' '}
        <span style={{ fontWeight: 300 }}>
          {comparatorVariable ? (
            comparatorVariable.variable.displayName
          ) : (
            <i>Not selected</i>
          )}
        </span>
      </h4>
    </>
  );
}

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
    return collections.map((collectionVar) => ({
      value: {
        variableId: collectionVar.id,
        entityId: collectionVar.entityId,
      },
      display:
        collectionVar.entityDisplayName + ' > ' + collectionVar.displayName,
    }));
  }, [collections]);

  const selectedCollectionVar = useMemo(() => {
    if (configuration && 'collectionVariable' in configuration) {
      const selectedItem = collectionVarItems.find((item) =>
        isEqual(item.value, {
          variableId: configuration.collectionVariable.variableId,
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

  const disableSwapGroupValuesButton =
    !configuration?.comparator?.groupA && !configuration?.comparator?.groupB;
  const disableGroupValueSelectors = !configuration?.comparator?.variable;

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
            <div
              className={cx(
                '-InputContainer',
                disableGroupValueSelectors && 'disabled'
              )}
              title={
                disableGroupValueSelectors
                  ? 'Please select a Group Comparison variable first'
                  : ''
              }
            >
              <span>Group A</span>
              <ValuePicker
                allowedValues={selectedComparatorVariable?.variable.vocabulary}
                selectedValues={configuration?.comparator?.groupA}
                disabledValues={configuration?.comparator?.groupB}
                onSelectedValuesChange={(newValues) =>
                  changeConfigHandler('comparator', {
                    variable: configuration?.comparator?.variable ?? undefined,
                    groupA: newValues.length ? newValues : undefined,
                    groupB: configuration?.comparator?.groupB ?? undefined,
                  })
                }
                disabledCheckboxTooltipContent="Values cannot overlap between groups"
                showClearSelectionButton={false}
                disableInput={disableGroupValueSelectors}
              />
              <FloatingButton
                icon={SwapHorizOutlined}
                text=""
                onPress={() =>
                  changeConfigHandler('comparator', {
                    variable: configuration?.comparator?.variable ?? undefined,
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
                {...(!disableGroupValueSelectors
                  ? { tooltip: 'Swap Group A and Group B values' }
                  : {})}
              />
              <span>Group B</span>
              <ValuePicker
                allowedValues={selectedComparatorVariable?.variable.vocabulary}
                selectedValues={configuration?.comparator?.groupB}
                disabledValues={configuration?.comparator?.groupA}
                onSelectedValuesChange={(newValues) =>
                  changeConfigHandler('comparator', {
                    variable: configuration?.comparator?.variable ?? undefined,
                    groupA: configuration?.comparator?.groupA ?? undefined,
                    groupB: newValues.length ? newValues : undefined,
                  })
                }
                disabledCheckboxTooltipContent="Values cannot overlap between groups"
                showClearSelectionButton={false}
                disableInput={disableGroupValueSelectors}
              />
            </div>
          </div>
        </div>
      </div>
    </ComputationStepContainer>
  );
}
