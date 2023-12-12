import { useFindEntityAndVariableCollection } from '../../..';
import { VariableCollectionDescriptor } from '../../../types/variable';
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
import { ComputationStepContainer } from '../ComputationStepContainer';
import './Plugins.scss';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { H6 } from '@veupathdb/coreui';
import { bipartiteNetworkVisualization } from '../../visualizations/implementations/BipartiteNetworkVisualization';
import { VariableCollectionSelectList } from '../../variableSelectors/VariableCollectionSingleSelect';

const cx = makeClassNameHelper('AppStepConfigurationContainer');

/**
 * Correlation
 *
 * The Correlation Assay vs Metadata app takes in a user-selected collection (ex. Species) and
 * runs a correlation of that data against all appropriate metadata in the study (found by the backend). The result is
 * a correlation coefficient and (soon) a significance value for each (assay member, metadata variable) pair.
 *
 * Importantly, this is the first of a few correlation-type apps that are coming along in the near future.
 * There will also be an Assay vs Assay app and a Metadata vs Metadata correlation app. It's possible that
 * when those roll out we'll be able to do a little refactoring to make the code a bit nicer.
 */

export type CorrelationAssayMetadataConfig = t.TypeOf<
  typeof CorrelationAssayMetadataConfig
>;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CorrelationAssayMetadataConfig = t.partial({
  collectionVariable: VariableCollectionDescriptor,
  correlationMethod: t.string,
});

const CompleteCorrelationAssayMetadataConfig = partialToCompleteCodec(
  CorrelationAssayMetadataConfig
);

export const plugin: ComputationPlugin = {
  configurationComponent: CorrelationAssayMetadataConfiguration,
  configurationDescriptionComponent:
    CorrelationAssayMetadataConfigDescriptionComponent,
  createDefaultConfiguration: () => ({}),
  isConfigurationComplete: CompleteCorrelationAssayMetadataConfig.is,
  visualizationPlugins: {
    bipartitenetwork: bipartiteNetworkVisualization, // Must match name in data service and in visualization.tsx
  },
};

// Renders on the thumbnail page to give a summary of the app instance
function CorrelationAssayMetadataConfigDescriptionComponent({
  computation,
}: {
  computation: Computation;
}) {
  const findEntityAndVariableCollection = useFindEntityAndVariableCollection();
  assertComputationWithConfig(computation, CorrelationAssayMetadataConfig);

  const { collectionVariable, correlationMethod } =
    computation.descriptor.configuration;

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
export function CorrelationAssayMetadataConfiguration(
  props: ComputationConfigProps
) {
  const {
    computationAppOverview,
    computation,
    analysisState,
    visualizationId,
  } = props;

  const configuration = computation.descriptor
    .configuration as CorrelationAssayMetadataConfig;

  assertComputationWithConfig(computation, CorrelationAssayMetadataConfig);

  const changeConfigHandler = useConfigChangeHandler(
    analysisState,
    computation,
    visualizationId
  );

  // For now, set the method to 'spearman'. When we add the next method, we can just add it here (no api change!)
  if (configuration && !configuration.correlationMethod) {
    changeConfigHandler('correlationMethod', 'spearman');
  }

  return (
    <ComputationStepContainer
      computationStepInfo={{
        stepNumber: 1,
        stepTitle: `Configure ${computationAppOverview.displayName}`,
      }}
    >
      <div className={cx()}>
        <div className={cx('-CorrelationAssayMetadataOuterConfigContainer')}>
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
      </div>
    </ComputationStepContainer>
  );
}
