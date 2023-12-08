import {
  useVariableCollections,
  useStudyMetadata,
  useFindEntityAndVariableCollection,
} from '../../..';
import { VariableCollectionDescriptor } from '../../../types/variable';
import { ComputationConfigProps, ComputationPlugin } from '../Types';
import { partial } from 'lodash';
import {
  useConfigChangeHandler,
  assertComputationWithConfig,
  makeVariableCollectionItems,
  findVariableCollectionItemFromDescriptor,
  isNotAbsoluteAbundanceVariableCollection,
  partialToCompleteCodec,
} from '../Utils';
import * as t from 'io-ts';
import { Computation } from '../../../types/visualization';
import SingleSelect from '@veupathdb/coreui/lib/components/inputs/SingleSelect';
import { useMemo } from 'react';
import { ComputationStepContainer } from '../ComputationStepContainer';
import './Plugins.scss';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { H6 } from '@veupathdb/coreui';
import { bipartiteNetworkVisualization } from '../../visualizations/implementations/BipartiteNetworkVisualization';
import { variableCollectionsAreUnique } from '../../../utils/visualization';
import PluginError from '../../visualizations/PluginError';

const cx = makeClassNameHelper('AppStepConfigurationContainer');

/**
 * Correlation
 *
 * The Correlation Assay vs Assay app takes in a two user-selected collections (ex. Species and Pathways) and
 * runs a pairwise correlation of all the member variables of one collection against the other. The result is
 * a correlation coefficient and (soon) a significance value for each pair.
 *
 * Importantly, this is the second of a few correlation-type apps that are coming along in the near future.
 * There will also be a Metadata vs Metadata correlation app. It's possible that
 * this PR should see a little refactoring to make the code a bit nicer.
 */

export type CorrelationAssayAssayConfig = t.TypeOf<
  typeof CorrelationAssayAssayConfig
>;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CorrelationAssayAssayConfig = t.partial({
  collectionVariable1: VariableCollectionDescriptor,
  collectionVariable2: VariableCollectionDescriptor,
  correlationMethod: t.string,
});

const CompleteCorrelationAssayAssayConfig = partialToCompleteCodec(
  CorrelationAssayAssayConfig
);

export const plugin: ComputationPlugin = {
  configurationComponent: CorrelationAssayAssayConfiguration,
  configurationDescriptionComponent:
    CorrelationAssayAssayConfigDescriptionComponent,
  createDefaultConfiguration: () => ({}),
  isConfigurationComplete: (configuration) => {
    return (
      CompleteCorrelationAssayAssayConfig.is(configuration) &&
      variableCollectionsAreUnique([
        configuration.collectionVariable1,
        configuration.collectionVariable2,
      ])
    );
  },
  visualizationPlugins: {
    bipartitenetwork: bipartiteNetworkVisualization, // Must match name in data service and in visualization.tsx
  },
};

// Renders on the thumbnail page to give a summary of the app instance
function CorrelationAssayAssayConfigDescriptionComponent({
  computation,
}: {
  computation: Computation;
}) {
  const findEntityAndVariableCollection = useFindEntityAndVariableCollection();
  assertComputationWithConfig(computation, CorrelationAssayAssayConfig);

  const { collectionVariable1, collectionVariable2, correlationMethod } =
    computation.descriptor.configuration;

  const entityAndCollectionVariableTreeNode1 =
    findEntityAndVariableCollection(collectionVariable1);
  const entityAndCollectionVariableTreeNode2 =
    findEntityAndVariableCollection(collectionVariable2);

  // Data 1 and Data 2 are placeholder labels, we can decide what to call them later.
  return (
    <div className="ConfigDescriptionContainer">
      <h4>
        Data 1:{' '}
        <span>
          {entityAndCollectionVariableTreeNode1 ? (
            `${entityAndCollectionVariableTreeNode1.entity.displayName} > ${entityAndCollectionVariableTreeNode1.variableCollection.displayName}`
          ) : (
            <i>Not selected</i>
          )}
        </span>
      </h4>
      <h4>
        Data 2:{' '}
        <span>
          {entityAndCollectionVariableTreeNode2 ? (
            `${entityAndCollectionVariableTreeNode2.entity.displayName} > ${entityAndCollectionVariableTreeNode2.variableCollection.displayName}`
          ) : (
            <i>Not selected</i>
          )}
        </span>
      </h4>
      <h4>
        Method:{' '}
        <span>
          {correlationMethod ? (
            correlationMethod[0].toUpperCase() + correlationMethod.slice(1)
          ) : (
            <i>Not selected</i>
          )}
        </span>
      </h4>
    </div>
  );
}

// Shows as Step 1 in the full screen visualization page
export function CorrelationAssayAssayConfiguration(
  props: ComputationConfigProps
) {
  const {
    computationAppOverview,
    computation,
    analysisState,
    visualizationId,
  } = props;

  const configuration = computation.descriptor
    .configuration as CorrelationAssayAssayConfig;
  const studyMetadata = useStudyMetadata();

  // For now, set the method to 'spearman'. When we add the next method, we can just add it here (no api change!)
  if (configuration) configuration.correlationMethod = 'spearman';

  // Include known collection variables in this array.
  const collectionDescriptors = useVariableCollections(
    studyMetadata.rootEntity,
    isNotAbsoluteAbundanceVariableCollection
  );
  if (collectionDescriptors.length === 0)
    throw new Error('Could not find any collections for this app.');

  assertComputationWithConfig(computation, CorrelationAssayAssayConfig);

  const changeConfigHandler =
    useConfigChangeHandler<CorrelationAssayAssayConfig>(
      analysisState,
      computation,
      visualizationId
    );

  // this should also make it easy to disable already selected items if we decide wed rather go that route
  const collectionVarItems = makeVariableCollectionItems(
    collectionDescriptors,
    undefined
  );

  const selectedCollectionVar1 = useMemo(() => {
    return findVariableCollectionItemFromDescriptor(
      collectionVarItems,
      configuration?.collectionVariable1
    );
  }, [collectionVarItems, configuration?.collectionVariable1]);

  const selectedCollectionVar2 = useMemo(() => {
    return findVariableCollectionItemFromDescriptor(
      collectionVarItems,
      configuration?.collectionVariable2
    );
  }, [collectionVarItems, configuration?.collectionVariable2]);

  return (
    <ComputationStepContainer
      computationStepInfo={{
        stepNumber: 1,
        stepTitle: `Configure ${computationAppOverview.displayName}`,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div className={cx()}>
          <div className={cx('-CorrelationAssayAssayOuterConfigContainer')}>
            <H6>Input Data</H6>
            <div className={cx('-InputContainer')}>
              <span>Data 1</span>
              <SingleSelect
                value={
                  selectedCollectionVar1
                    ? selectedCollectionVar1.value
                    : 'Select the data'
                }
                buttonDisplayContent={
                  selectedCollectionVar1
                    ? selectedCollectionVar1.display
                    : 'Select the data'
                }
                items={collectionVarItems}
                onSelect={partial(changeConfigHandler, 'collectionVariable1')}
              />
              <span>Data 2</span>
              <SingleSelect
                value={
                  selectedCollectionVar2
                    ? selectedCollectionVar2.value
                    : 'Select the data'
                }
                buttonDisplayContent={
                  selectedCollectionVar2
                    ? selectedCollectionVar2.display
                    : 'Select the data'
                }
                items={collectionVarItems}
                onSelect={partial(changeConfigHandler, 'collectionVariable2')}
              />
            </div>
          </div>
        </div>
        <div>
          <PluginError
            error={
              !variableCollectionsAreUnique([
                selectedCollectionVar1?.value,
                selectedCollectionVar2?.value,
              ])
                ? 'Input data must be unique. Please select different data.'
                : undefined
            }
          />
        </div>
      </div>
    </ComputationStepContainer>
  );
}
