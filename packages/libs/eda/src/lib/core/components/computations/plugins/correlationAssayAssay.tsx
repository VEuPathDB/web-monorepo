import { useCollectionVariables, useStudyMetadata } from '../../..';
import { VariableCollectionDescriptor } from '../../../types/variable';
import { ComputationConfigProps, ComputationPlugin } from '../Types';
import { isEqual, partial } from 'lodash';
import {
  useConfigChangeHandler,
  assertComputationWithConfig,
  findCollectionVariableTreeNodeFromDescriptor,
  removeAbsoluteAbundanceCollectionVariableTreeNodes,
  makeVariableCollectionItems,
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
export const CorrelationAssayAssayConfig = t.type({
  collectionVariable1: VariableCollectionDescriptor,
  collectionVariable2: VariableCollectionDescriptor,
  correlationMethod: t.string,
});

export function isCorrelationAssayAssayConfig(
  object: any
): object is CorrelationAssayAssayConfig {
  if (!object) {
    return false;
  }
  return (
    'collectionVariable1' in object &&
    'collectionVariable2' in object &&
    'correlationMethod' in object
  );
}

export const plugin: ComputationPlugin = {
  configurationComponent: CorrelationAssayAssayConfiguration,
  configurationDescriptionComponent:
    CorrelationAssayAssayConfigDescriptionComponent,
  createDefaultConfiguration: () => undefined,
  isConfigurationValid: (configuration) => {
    return (
      isCorrelationAssayAssayConfig(configuration) &&
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
  const studyMetadata = useStudyMetadata();
  const collections = useCollectionVariables(studyMetadata.rootEntity);
  assertComputationWithConfig<CorrelationAssayAssayConfig>(
    computation,
    Computation
  );

  const { collectionVariable1, collectionVariable2, correlationMethod } =
    computation.descriptor.configuration;

  const collectionVariableTreeNode1 =
    findCollectionVariableTreeNodeFromDescriptor(
      collections,
      collectionVariable1
    );
  const collectionVariableTreeNode2 =
    findCollectionVariableTreeNodeFromDescriptor(
      collections,
      collectionVariable2
    );

  // Data 1 and Data 2 are placeholder labels, we can decide what to call them later.
  return (
    <div className="ConfigDescriptionContainer">
      <h4>
        Data 1:{' '}
        <span>
          {collectionVariableTreeNode1 ? (
            `${collectionVariableTreeNode1.entityDisplayName} > ${collectionVariableTreeNode1.displayName}`
          ) : (
            <i>Not selected</i>
          )}
        </span>
      </h4>
      <h4>
        Data 2:{' '}
        <span>
          {collectionVariableTreeNode2 ? (
            `${collectionVariableTreeNode2.entityDisplayName} > ${collectionVariableTreeNode2.displayName}`
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
  const collections = useCollectionVariables(studyMetadata.rootEntity);
  if (collections.length === 0)
    throw new Error('Could not find any collections for this app.');

  assertComputationWithConfig<CorrelationAssayAssayConfig>(
    computation,
    Computation
  );

  const changeConfigHandler =
    useConfigChangeHandler<CorrelationAssayAssayConfig>(
      analysisState,
      computation,
      visualizationId
    );

  const keepCollections =
    removeAbsoluteAbundanceCollectionVariableTreeNodes(collections);
  const collectionVarItems = useMemo(
    () => makeVariableCollectionItems(keepCollections, undefined),
    [keepCollections]
  );

  const selectedCollectionVar1 = useMemo(() => {
    if (configuration && 'collectionVariable1' in configuration) {
      const selectedItem = collectionVarItems.find((item) =>
        isEqual(item.value, {
          collectionId: configuration.collectionVariable1.collectionId,
          entityId: configuration.collectionVariable1.entityId,
        })
      );
      return selectedItem;
    }
  }, [collectionVarItems, configuration]);
  const selectedCollectionVar2 = useMemo(() => {
    if (configuration && 'collectionVariable2' in configuration) {
      const selectedItem = collectionVarItems.find((item) =>
        isEqual(item.value, {
          collectionId: configuration.collectionVariable2.collectionId,
          entityId: configuration.collectionVariable2.entityId,
        })
      );
      return selectedItem;
    }
  }, [collectionVarItems, configuration]);

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