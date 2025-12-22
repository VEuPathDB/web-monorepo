import { StudyEntity, useFindEntityAndVariableCollection, useStudyEntities } from '../../..';
import { VariableCollectionDescriptor } from '../../../types/variable';
import { scatterplotVisualization } from '../../visualizations/implementations/ScatterplotVisualization';
import { ComputationConfigProps, ComputationPlugin } from '../Types';
import {
  useConfigChangeHandler,
  assertComputationWithConfig,
  isNotAbsoluteAbundanceVariableCollection,
  partialToCompleteCodec,
} from '../Utils';
import * as t from 'io-ts';
import { Computation } from '../../../types/visualization';
import ScatterBetadivSVG from '../../visualizations/implementations/selectorIcons/ScatterBetadivSVG';
import { ComputationStepContainer } from '../ComputationStepContainer';
import './Plugins.scss';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { VariableCollectionSingleSelect } from '../../variableSelectors/VariableCollectionSingleSelect';
import { IsEnabledInPickerParams } from '../../visualizations/VisualizationTypes';
import { entityTreeToArray } from '../../../utils/study-metadata';
import { useEffect, useMemo, useState } from 'react';
import { ItemGroup } from '@veupathdb/coreui/lib/components/inputs/SingleSelect';
import { Item } from '@veupathdb/coreui/lib/components/inputs/checkboxes/CheckboxList';

const cx = makeClassNameHelper('AppStepConfigurationContainer');

export type DimensionalityReductionConfig = t.TypeOf<
  typeof DimensionalityReductionConfig
>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const DimensionalityReductionConfig = t.partial({
  collectionVariable: VariableCollectionDescriptor,
});

const CompleteDimensionalityReductionConfig = partialToCompleteCodec(
  DimensionalityReductionConfig
);

export const plugin: ComputationPlugin = {
  configurationComponent: DimensionalityReductionConfiguration,
  configurationDescriptionComponent:
    DimensionalityReductionConfigDescriptionComponent,
  createDefaultConfiguration: () => ({}),
  isConfigurationComplete: CompleteDimensionalityReductionConfig.is,
  visualizationPlugins: {
    scatterplot: scatterplotVisualization
      .withOptions({
        getComputedXAxisDetails(config) {
          if (
            DimensionalityReductionConfig.is(config) &&
            config.collectionVariable
          ) {
            return {
              entityId: config.collectionVariable.entityId,
              placeholderDisplayName: 'PCA Axis 1',
              variableId: 'PC1',
            };
          }
        },
        getComputedYAxisDetails(config) {
          if (
            DimensionalityReductionConfig.is(config) &&
            config.collectionVariable
          ) {
            return {
              entityId: config.collectionVariable.entityId,
              placeholderDisplayName: 'PCA Axis 2',
              variableId: 'PC2',
            };
          }
        },
        hideShowMissingnessToggle: true,
        hideTrendlines: true,
        hideFacetInputs: true,
        hideLogScale: true,
        returnPointIds: false,
        sendComputedVariablesInRequest: true,
      })
      .withSelectorIcon(ScatterBetadivSVG),
  },
  isEnabledInPicker: isEnabledInPicker,
  studyRequirements:
    'These visualizations are only available for studies with compatible assay data.',
};

function DimensionalityReductionConfigDescriptionComponent({
  computation,
}: {
  computation: Computation;
}) {
  const findEntityAndVariableCollection = useFindEntityAndVariableCollection();
  assertComputationWithConfig(computation, DimensionalityReductionConfig);
  const { configuration } = computation.descriptor;
  const collectionVariable =
    'collectionVariable' in configuration
      ? configuration.collectionVariable
      : undefined;
  const updatedCollectionVariable =
    findEntityAndVariableCollection(collectionVariable);

  return (
    <div className="ConfigDescriptionContainer">
      <h4>
        Data:{' '}
        <span>
          {updatedCollectionVariable ? (
            `${updatedCollectionVariable.entity.displayName} > ${updatedCollectionVariable.variableCollection.displayName}`
          ) : (
            <i>Not selected</i>
          )}
        </span>
      </h4>
    </div>
  );
}

export function DimensionalityReductionConfiguration(
  props: ComputationConfigProps
) {
  const {
    computationAppOverview,
    computation,
    analysisState,
    visualizationId,
    changeConfigHandlerOverride,
    showStepNumber = true,
    hideConfigurationComponent = false,
  } = props;
  assertComputationWithConfig(computation, DimensionalityReductionConfig);
  const configuration = computation.descriptor.configuration;

  const workspaceChangeConfigHandler = useConfigChangeHandler(
    analysisState,
    computation,
    visualizationId
  );

  const changeConfigHandler = changeConfigHandlerOverride
    ? changeConfigHandlerOverride
    : workspaceChangeConfigHandler;

  const entities = useStudyEntities();
  const collectionsInStudy = useMemo(() => {
      const collectionItems = entities
        .filter(
          (e): e is StudyEntity & Required<Pick<StudyEntity, 'collections'>> =>
            !!e.collections?.length
        )
        .map((e): ItemGroup<string> => {
          // const collections = collectionPredicate
          //   ? e.collections.filter(collectionPredicate)
          //   : e.collections;
          const collections = e.collections;
          return {
            label: e.displayName,
            items: collections.map(
              (collection): Item<string> => ({
                value: `${e.id}:${collection.id}`,
                display: collection.displayName ?? collection.id,
              })
            ),
          };
        })
        .filter((itemGroup) => itemGroup.items.length > 0); // Remove entites that had all their collections fail the collection predicate.
      return collectionItems;
    }, [entities]);

    console.log('collectionsInStudy', collectionsInStudy);
  
  // This computation only has one input. If there is only one option for the input (one collection),
  // then we can set it automaticaly. 
  // With only one collection, it may be useful to hide the entire configuration component (differential expression notebook)
  useEffect(() => {
    // If there is only one collection variable, set it automatically
    // TEMPORARY - until we have the right data, just pretend we only have one by 
    // using the first collection
    // if (collectionsInStudy.length === 1) {
      console.log('only one collection group');
      changeConfigHandler('collectionVariable', {
        entityId: collectionsInStudy[0].items[0].value.split(':')[0],
        collectionId: collectionsInStudy[0].items[0].value.split(':')[1],
      });
    // }
  }, [collectionsInStudy, changeConfigHandler]);
    

  return hideConfigurationComponent ? (
    null
  ) : (
    <ComputationStepContainer
      computationStepInfo={{
        stepNumber: 1,
        stepTitle: `Configure ${computationAppOverview.displayName}`,
      }}
      showStepNumber={showStepNumber}
    >
      <div className={cx()}>
        <div className={cx('-InputContainer')}>
          <span>Data</span>
          <VariableCollectionSingleSelect
            value={configuration.collectionVariable}
            onSelect={(value) => {
              if (typeof value === 'string') return;
              changeConfigHandler('collectionVariable', value);
            }}
            collectionPredicate={isNotAbsoluteAbundanceVariableCollection}
          />
        </div>
      </div>
    </ComputationStepContainer>
  );
}

// Dimensionality reduction's only requirement of the study is that it contains
// at least one collection.
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
