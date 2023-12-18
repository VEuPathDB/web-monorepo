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
import { useFlattenedFields } from '../../variableSelectors/hooks';
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

// Decide if the app is available for this study. The correlation assay x metadata
// app is only available for studies with appropriate metadata. Specifically, the study
// must have at least one continuous metadata variable that is on a one-to-one path
// from the assay entity.
// See PR #74 in service-eda-compute for the matching logic on the backend.
// @ANN you are here trying to figure out how to replicate logic.
function isEnabledInPicker({
  studyMetadata,
}: IsEnabledInPickerParams): boolean {
  if (!studyMetadata) return false;
  const entities = entityTreeToArray(studyMetadata.rootEntity);

  // Step 1. Find the first assay node. Doesn't need to be any one in particular just any assay will do
  // @ts-ignore
  const firstAssayEntityIndex = entities.findIndex(
    (entity) => entity.id === 'OBI_0002623' || entity.id === 'EUPATH_0000809'
  );

  // Step 2. Find all ancestor entites of the assayEntity that are on a one-to-one path with assayEntity.
  // figure out order, then find the last one that says one-to-one, then chop off array there
  // entity array starts at participant. Want to go backwards
  // @ts-ignore
  const ancestorEntities = ancestorEntitiesForEntityId(
    entities[firstAssayEntityIndex].id,
    entities
  ).reverse();

  // find index of the first entity that is not 1-1
  // @ts-ignore
  const lastOneToOneAncestorIndex =
    ancestorEntities.findIndex((entity) => entity.isManyToOneWithParent) + 1;

  // Step 3. Check if there are any continuous variables in the filtered entities
  const filteredMetadataVariables = ancestorEntities.flatMap(
    (entity) => entity.variables
  );

  // @ts-ignore
  const hasContinuousVariable = !!filteredMetadataVariables.find(
    (variable) => variable.dataShape && variable.dataShape === 'continuous'
  );

  // ann you just found a new mbio error which is screwing up validation on the site
  // could also validate by using subsetting tab
  // why oh why error?

  // @ts-ignore
  return true; // Metagenomic sequencing assay
}
