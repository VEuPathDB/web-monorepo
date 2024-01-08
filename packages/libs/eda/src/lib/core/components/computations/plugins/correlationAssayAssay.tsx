import { useFindEntityAndVariableCollection } from '../../..';
import { VariableCollectionDescriptor } from '../../../types/variable';
import { ComputationConfigProps, ComputationPlugin } from '../Types';
import { capitalize, partial } from 'lodash';
import {
  useConfigChangeHandler,
  assertComputationWithConfig,
  isNotAbsoluteAbundanceVariableCollection,
  partialToCompleteCodec,
} from '../Utils';
import * as t from 'io-ts';
import { Computation } from '../../../types/visualization';
import { ComputationStepContainer } from '../ComputationStepContainer';
import './Plugins.scss';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { H6 } from '@veupathdb/coreui';
import { bipartiteNetworkVisualization } from '../../visualizations/implementations/BipartiteNetworkVisualization';
import { variableCollectionsAreUnique } from '../../../utils/visualization';
import PluginError from '../../visualizations/PluginError';
import { VariableCollectionSelectList } from '../../variableSelectors/VariableCollectionSingleSelect';
import SingleSelect from '@veupathdb/coreui/lib/components/inputs/SingleSelect';
import { IsEnabledInPickerParams } from '../../visualizations/VisualizationTypes';
import { entityTreeToArray } from '../../../utils/study-metadata';

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
    bipartitenetwork: bipartiteNetworkVisualization.withOptions({
      getLegendTitle(config) {
        if (CorrelationAssayAssayConfig.is(config)) {
          return ['absolute correlation coefficient', 'correlation direction'];
        } else {
          return [];
        }
      },
    }), // Must match name in data service and in visualization.tsx
  },
  isEnabledInPicker: isEnabledInPicker,
  studyRequirements:
    'These visualizations are only available for studies with metagenomic data.',
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
            capitalize(correlationMethod)
          ) : (
            <i>Not selected</i>
          )}
        </span>
      </h4>
    </div>
  );
}

const CORRELATION_METHODS = ['spearman', 'pearson'];

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

  assertComputationWithConfig(computation, CorrelationAssayAssayConfig);

  const { configuration } = computation.descriptor;

  const changeConfigHandler = useConfigChangeHandler(
    analysisState,
    computation,
    visualizationId
  );

  return (
    <ComputationStepContainer
      computationStepInfo={{
        stepNumber: 1,
        stepTitle: `Configure ${computationAppOverview.displayName}`,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div className={cx()}>
          <div className={cx('-CorrelationOuterConfigContainer')}>
            <H6>Input Data</H6>
            <div className={cx('-InputContainer')}>
              <span>Data 1</span>
              <VariableCollectionSelectList
                value={configuration.collectionVariable1}
                onSelect={partial(changeConfigHandler, 'collectionVariable1')}
                collectionPredicate={isNotAbsoluteAbundanceVariableCollection}
              />
              <span>Data 2</span>
              <VariableCollectionSelectList
                value={configuration.collectionVariable2}
                onSelect={partial(changeConfigHandler, 'collectionVariable2')}
                collectionPredicate={isNotAbsoluteAbundanceVariableCollection}
              />
            </div>
          </div>
          <div className={cx('-CorrelationOuterConfigContainer')}>
            <H6>Correlation Method</H6>
            <div className={cx('-InputContainer')}>
              <span>Method</span>
              <SingleSelect
                value={configuration.correlationMethod ?? 'Select a method'}
                buttonDisplayContent={
                  configuration.correlationMethod
                    ? capitalize(configuration.correlationMethod)
                    : 'Select a method'
                }
                items={CORRELATION_METHODS.map((method: string) => ({
                  value: method,
                  display: capitalize(method),
                }))}
                onSelect={partial(changeConfigHandler, 'correlationMethod')}
              />
            </div>
          </div>
        </div>
        <div>
          <PluginError
            error={
              !variableCollectionsAreUnique([
                configuration.collectionVariable1,
                configuration.collectionVariable2,
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

// The correlation assay x assay app should only be available
// for studies with metagenomic data.
function isEnabledInPicker({
  studyMetadata,
}: IsEnabledInPickerParams): boolean {
  if (!studyMetadata) return false;

  const entities = entityTreeToArray(studyMetadata.rootEntity);

  // Check that the metagenomic entity exists _and_ that it has
  // at least one collection.
  const hasMetagenomicData = entities.some(
    (entity) => entity.id === 'OBI_0002623' && !!entity.collections?.length
  ); // OBI_0002623 = Metagenomic sequencing assay

  return hasMetagenomicData;
}
