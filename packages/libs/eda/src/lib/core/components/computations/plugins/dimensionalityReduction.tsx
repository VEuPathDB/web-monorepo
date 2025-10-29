import { useFindEntityAndVariableCollection } from '../../..';
import { VariableCollectionDescriptor } from '../../../types/variable';
import { scatterplotVisualization } from '../../visualizations/implementations/ScatterplotVisualization';
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
import SingleSelect from '@veupathdb/coreui/lib/components/inputs/SingleSelect';
import { useMemo } from 'react';
import ScatterBetadivSVG from '../../visualizations/implementations/selectorIcons/ScatterBetadivSVG';
import { ComputationStepContainer } from '../ComputationStepContainer';
import './Plugins.scss';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { VariableCollectionSingleSelect } from '../../variableSelectors/VariableCollectionSingleSelect';
import { IsEnabledInPickerParams } from '../../visualizations/VisualizationTypes';
import { entityTreeToArray } from '../../../utils/study-metadata';
import { InputSpec } from '../../visualizations/InputVariables';

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
  } = props;
  assertComputationWithConfig(computation, DimensionalityReductionConfig);
  const configuration = computation.descriptor.configuration;

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

// Beta div's only requirement of the study is that it contains
// at least one collection
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
