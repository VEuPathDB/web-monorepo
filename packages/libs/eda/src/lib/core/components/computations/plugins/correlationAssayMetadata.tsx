import { StudyEntity, useFindEntityAndVariableCollection } from '../../..';
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
import { entityTreeToArray } from '../../../utils/study-metadata';
import { IsEnabledInPickerParams } from '../../visualizations/VisualizationTypes';
import { ancestorEntitiesForEntityId } from '../../../utils/data-element-constraints';

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
    bipartitenetwork: bipartiteNetworkVisualization.withOptions({
      getLegendTitle(config) {
        if (CorrelationAssayMetadataConfig.is(config)) {
          return 'Absolute correlation coefficient';
        } else {
          return 'Legend';
        }
      },
    }), // Must match name in data service and in visualization.tsx
  },
  isEnabledInPicker: isEnabledInPicker,
  studyRequirements:
    'These visualizations are only available for studies with compatible metadata.',
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

const ASSAY_ENTITIES = [
  'OBI_0002623',
  'EUPATH_0000809',
  'EUPATH_0000813',
  'EUPATH_0000812',
];

// The correlation assay x metadata app is only available for studies
// with appropriate metadata. Specifically, the study
// must have at least one continuous metadata variable that is on a one-to-one path
// from the assay entity.
// See PR #74 in service-eda-compute for the matching logic on the backend.
function isEnabledInPicker({
  studyMetadata,
}: IsEnabledInPickerParams): boolean {
  if (!studyMetadata) return false;

  const entities = entityTreeToArray(studyMetadata.rootEntity);
  // Ensure there are collections in this study. Otherwise, disable app
  const studyHasCollections = !!entities.filter(
    (e): e is StudyEntity & Required<Pick<StudyEntity, 'collections'>> =>
      !!e.collections?.length
  ).length;
  if (!studyHasCollections) return false;

  // Check for appropriate metadata
  // Step 1. Find the first assay node. Doesn't need to be any assay in particular just any mbio assay will do
  const firstAssayEntityIndex = entities.findIndex((entity) =>
    ASSAY_ENTITIES.includes(entity.id)
  );
  if (firstAssayEntityIndex === -1) return false;

  // Step 2. Find all ancestor entites of the assayEntity that are on a one-to-one path with assayEntity.
  // Step 2a. Grab ancestor entities.
  const ancestorEntities = ancestorEntitiesForEntityId(
    entities[firstAssayEntityIndex].id,
    entities
  ).reverse(); // Reverse so that the ancestorEntities[0] is the assay and higher indices are further up the tree.

  // Step 2b. Trim the ancestorEntities so that we only keep those that are on
  // a 1:1 path. Once we find an ancestor that is many to one with its parent, we
  // know we've hit the end of the 1:1 path.
  const lastOneToOneAncestorIndex = ancestorEntities.findIndex(
    (entity) => entity.isManyToOneWithParent
  );
  const oneToOneAncestors = ancestorEntities.slice(
    1, // removing the assay itself
    lastOneToOneAncestorIndex + 1
  );

  // Step 3. Check if there are any continuous variables in the filtered entities
  const hasContinuousVariable = oneToOneAncestors
    .flatMap((entity) => entity.variables)
    .some(
      (variable) =>
        'dataShape' in variable &&
        variable.dataShape === 'continuous' &&
        (variable.type === 'number' || variable.type === 'integer') // Support for dates coming soon! Can remove this line once the backend is ready.
    );

  return hasContinuousVariable;
}
